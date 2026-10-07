/**
 * DJ booking enquiry endpoint: POST /api/enquiry
 *
 * Receives the form on /dj-bookings/ (src/components/EnquiryForm.astro), checks it, verifies Cloudflare
 * Turnstile, then emails the enquiry to the owner through Cloudflare Email Routing. Nothing is stored.
 *
 * It runs inside the site's Cloudflare Worker (functions/worker.js, configured in wrangler.jsonc).
 * It is a Worker rather than a Pages Function because Pages Functions cannot use the send_email binding.
 * Setup steps for the owner: docs/enquiry-form.md
 *
 * Environment (Cloudflare dashboard > the Worker > Settings > Variables and Secrets):
 *   EMAIL                 send_email binding, declared in wrangler.jsonc
 *   ENQUIRY_TO            where enquiries go: a verified Email Routing destination address
 *   ENQUIRY_FROM          the sender: any address @antisocialaudio.co.uk (the Email Routing domain)
 *   TURNSTILE_SECRET_KEY  Turnstile secret key (store it as a Secret). If unset, the Turnstile check is
 *                         skipped and only the honeypot protects the form, so set it before launch.
 *
 * Replies:
 *   fetch() callers that send "Accept: application/json" get JSON: { ok: true } or { ok: false, error, fields? }.
 *   A plain HTML form post (no JavaScript) gets a 303 redirect back to the page, to #enquiry-sent or
 *   #enquiry-error, which the page reveals with CSS. User input is never echoed back in any reply.
 *
 * No npm packages: the email is plain text, sent with the binding's send() API, with a hand-built MIME
 * fallback for runtimes that only accept the older EmailMessage form.
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
// The form's worst case at its field limits, URL-encoded, is about 52 KB: a 5,000-character message alone can be
// up to 45 KB at 9 bytes a character (Chinese, Japanese or Korean text, say). 64 KB leaves room for that.
const MAX_BODY_BYTES = 64 * 1024;
const SENDER_NAME = 'Antisocial Audio website';
const FALLBACK_PAGE = '/dj-bookings/';

/** The form's fields, their limits and the message shown when one is missing or wrong. Keep in step with EnquiryForm.astro. */
const FIELDS = {
  name: { max: 100, required: true, error: 'Please enter your name.' },
  email: { max: 254, required: true, error: 'Please enter a valid email address, like name@example.com.' },
  event: { max: 150, required: true, error: 'Please enter the name of the event.' },
  date: { max: 10, required: false, error: 'Please choose a date between today and five years from now, or leave it blank.' },
  location: { max: 200, required: true, error: 'Please tell us where the event is.' },
  message: { max: 5000, required: true, multiline: true, error: 'Please tell us a little about the event.' },
};

const ERRORS = {
  method: 'Please send the form with POST.',
  origin: 'This form can only be sent from the Antisocial Audio website.',
  length: 'Your enquiry was empty or too long. Please shorten your message and try again.',
  type: 'Please send the form as a standard web form.',
  fields: 'Please check the highlighted fields and try again.',
  verify: 'We could not confirm you are human. Please complete the spam check and send again.',
  setup: 'The enquiry form is not working just now. Please try again later.',
  send: 'It could not be delivered just now. Please try again in a few minutes.',
};

// The HTML specification's rule for a valid email address, plus a dot in the domain. ASCII only, so it is
// always safe to put in an email header.
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Handle one request to /api/enquiry.
 * @param {Request} request
 * @param {Record<string, any>} env
 * @returns {Promise<Response>}
 */
export async function handleEnquiry(request, env = {}) {
  const url = new URL(request.url);
  const wantsJson = (request.headers.get('Accept') || '').includes('application/json');
  const backTo = returnPath(request, url);

  // Replies in the shape the caller understands: JSON for fetch(), a redirect for a plain form post.
  const reply = (status, body) => {
    if (wantsJson || status === 405) return json(status, body);
    return redirect(`${backTo}#${body.ok ? 'enquiry-sent' : 'enquiry-error'}`);
  };

  if (request.method !== 'POST') return reply(405, { ok: false, error: ERRORS.method });

  // Browsers send Origin on POST. A different origin means another site is posting here.
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return reply(403, { ok: false, error: ERRORS.origin });

  // Refuse a body that says it is too big, then read at most MAX_BODY_BYTES whatever it says.
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) return reply(413, { ok: false, error: ERRORS.length });
  const bytes = await readLimited(request, MAX_BODY_BYTES).catch(() => null);
  if (!bytes) return reply(413, { ok: false, error: ERRORS.length });
  if (bytes.byteLength === 0) return reply(400, { ok: false, error: ERRORS.length });

  const data = await parseBody(request.headers.get('Content-Type') || '', bytes).catch(() => null);
  if (!data) return reply(415, { ok: false, error: ERRORS.type });

  // Honeypot: people never see this field, so anything in it came from a bot. Pretend it worked.
  if (cleanLine(data.get('website'))) return reply(200, { ok: true });

  const { values, fields } = validate(data);
  if (Object.keys(fields).length > 0) return reply(400, { ok: false, error: ERRORS.fields, fields });

  if (env.TURNSTILE_SECRET_KEY) {
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const human = await verifyTurnstile(String(data.get('cf-turnstile-response') || ''), env.TURNSTILE_SECRET_KEY, ip);
    if (!human) return reply(400, { ok: false, error: ERRORS.verify });
  } else {
    console.warn('enquiry: TURNSTILE_SECRET_KEY is not set, so the Turnstile check was skipped.');
  }

  const setupProblem = checkSetup(env);
  if (setupProblem) {
    console.error(`enquiry: not set up: ${setupProblem}. See docs/enquiry-form.md.`);
    return reply(500, { ok: false, error: ERRORS.setup });
  }

  try {
    await sendEnquiryEmail(env, values, new URL(backTo, url.origin).href);
  } catch (err) {
    // Log the reason, never the enquiry itself.
    console.error('enquiry: email not sent:', err && err.code ? err.code : '', err && err.message ? err.message : String(err));
    return reply(502, { ok: false, error: ERRORS.send });
  }

  return reply(200, { ok: true });
}

/**
 * Cloudflare Pages Functions entry point, kept so this file still answers clearly if the site is ever
 * deployed on Pages. Pages cannot give it the send_email binding, so there it replies with the setup error.
 * @param {{ request: Request, env: Record<string, any> }} context
 */
export const onRequest = (context) => handleEnquiry(context.request, context.env);

/* ---------- Reading and checking the form ---------- */

/**
 * Read the request body, giving up as soon as it passes `limit` bytes.
 * Returns the bytes, or null when the body is too big.
 */
async function readLimited(request, limit) {
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

/** Turn a urlencoded, multipart or JSON body into something with get(name). Null for any other type. */
async function parseBody(contentType, bytes) {
  const type = contentType.toLowerCase();
  if (type.startsWith('application/x-www-form-urlencoded')) {
    return new URLSearchParams(new TextDecoder().decode(bytes));
  }
  if (type.startsWith('multipart/form-data')) {
    // The boundary is in the Content-Type header, so keep it as sent.
    return await new Response(bytes, { headers: { 'Content-Type': contentType } }).formData();
  }
  if (type.startsWith('application/json')) {
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
    return { get: (name) => (Object.hasOwn(body, name) ? body[name] : null) };
  }
  return null;
}

/** Check every field. Returns the cleaned values and a map of field name to error message. */
function validate(data) {
  /** @type {Record<string, string>} */
  const values = {};
  /** @type {Record<string, string>} */
  const fields = {};

  for (const [name, rule] of Object.entries(FIELDS)) {
    const raw = data.get(name);
    const value = rule.multiline ? cleanText(raw) : cleanLine(raw);
    values[name] = value;
    if (!value) {
      if (rule.required) fields[name] = rule.error;
    } else if (value.length > rule.max) {
      fields[name] = name === 'date' ? rule.error : `Please keep this under ${rule.max.toLocaleString('en-GB')} characters.`;
    }
  }

  if (values.email && !fields.email && !EMAIL_RE.test(values.email)) fields.email = FIELDS.email.error;
  if (values.date && !fields.date && !isUsableDate(values.date)) fields.date = FIELDS.date.error;

  return { values, fields };
}

/** A single-line value: text only, control characters and line breaks turned into spaces, trimmed. */
function cleanLine(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** A multi-line value: line breaks kept (as \n), other control characters removed, trimmed. */
function cleanText(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFC')
    .replace(/\r\n?|[\u2028\u2029]/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

/**
 * A real calendar date as YYYY-MM-DD, not before yesterday (so time zones never reject today), within 5 years.
 * The form's own limit (today to five years ahead, in the visitor's time zone) always falls inside this range.
 */
function isUsableDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [y, m, d] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return false;
  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  return date.getTime() >= now - 2 * day && date.getTime() <= now + 5 * 366 * day;
}

/* ---------- Turnstile ---------- */

/** Ask Cloudflare whether the Turnstile token is genuine. Any failure counts as "not verified". */
async function verifyTurnstile(token, secret, ip) {
  if (!token || token.length > 2048) {
    console.warn(
      'enquiry: no usable Turnstile token in the form, so it was refused. If the form shows no spam check, the site was built without PUBLIC_TURNSTILE_SITE_KEY.',
    );
    return false;
  }
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body });
    if (!res.ok) {
      console.error(`enquiry: Turnstile check failed with HTTP ${res.status}`);
      return false;
    }
    const outcome = await res.json();
    if (outcome && outcome.success === true) return true;
    console.warn('enquiry: Turnstile rejected the token:', (outcome && outcome['error-codes']) || []);
    return false;
  } catch (err) {
    console.error('enquiry: could not reach Turnstile:', err && err.message ? err.message : String(err));
    return false;
  }
}

/* ---------- Email ---------- */

/** Returns a short description of what is missing, or '' when everything needed to send is there. */
function checkSetup(env) {
  if (!env.EMAIL || typeof env.EMAIL.send !== 'function') return 'no send_email binding called EMAIL (it only exists on Workers, not Pages)';
  if (!EMAIL_RE.test(String(env.ENQUIRY_TO || ''))) return 'ENQUIRY_TO is missing or not an email address';
  if (!EMAIL_RE.test(String(env.ENQUIRY_FROM || ''))) return 'ENQUIRY_FROM is missing or not an email address';
  return '';
}

/**
 * The sender's name as it goes in the Reply-To header. Characters that mean something in an address header
 * (quotes, angle brackets, commas, colons and so on) are turned into spaces, so however the name is written
 * into the header it can never add another address. The email body keeps the name exactly as typed.
 */
function displayName(name) {
  return name.replace(/[()<>[\]:;@\\,."]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

/** Email the enquiry to the owner as plain text, with Reply-To set to the person who sent it. */
async function sendEnquiryEmail(env, enquiry, pageUrl) {
  const subject = `DJ booking enquiry: ${enquiry.event}`;
  const text = enquiryText(enquiry, pageUrl);
  const replyName = displayName(enquiry.name);

  try {
    // Email Service's send() API: https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
    await env.EMAIL.send({
      from: { email: env.ENQUIRY_FROM, name: SENDER_NAME },
      to: env.ENQUIRY_TO,
      replyTo: replyName ? { email: enquiry.email, name: replyName } : { email: enquiry.email },
      subject,
      text,
    });
    return;
  } catch (err) {
    // Errors with a code (E_SENDER_NOT_VERIFIED and so on) mean the API understood the message and refused it.
    if (err && typeof err.code === 'string') throw err;
    // A runtime that only knows the older EmailMessage form rejects a plain object with a TypeError before
    // sending anything. Only then is it safe to try again in that form; anything else is a real failure.
    if (!(err instanceof TypeError)) throw err;
    console.warn('enquiry: send() with a message object failed, trying EmailMessage:', err.message);
  }

  const { EmailMessage } = await import('cloudflare:email');
  const raw = buildMime({
    from: env.ENQUIRY_FROM,
    fromName: SENDER_NAME,
    to: env.ENQUIRY_TO,
    replyTo: enquiry.email,
    replyToName: replyName,
    subject,
    text,
  });
  await env.EMAIL.send(new EmailMessage(env.ENQUIRY_FROM, env.ENQUIRY_TO, raw));
}

/** The email body. Plain text, so nothing the sender typed can be rendered as HTML. */
function enquiryText(e, pageUrl) {
  const date = e.date
    ? new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(`${e.date}T12:00:00Z`),
      )
    : 'Not given';
  const sent = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date());
  return [
    'New DJ booking enquiry from the Antisocial Audio website.',
    '',
    `Name:      ${e.name}`,
    `Email:     ${e.email}`,
    `Event:     ${e.event}`,
    `Date:      ${date}`,
    `Location:  ${e.location}`,
    '',
    'Message:',
    e.message,
    '',
    '--',
    `Reply to this email to answer ${e.name} directly.`,
    `Sent ${sent} (UK time) from ${pageUrl}`,
  ].join('\n');
}

/**
 * A minimal RFC 5322 message for the EmailMessage fallback: plain text in UTF-8, base64 encoded.
 * Header text goes through RFC 2047 encoded-words, so names and subjects can contain any character.
 */
function buildMime({ from, fromName, to, replyTo, replyToName, subject, text }) {
  const domain = from.split('@')[1];
  const headers = [
    `From: ${encodedWords(fromName)} <${from}>`,
    `To: <${to}>`,
    replyToName ? `Reply-To: ${encodedWords(replyToName)} <${replyTo}>` : `Reply-To: <${replyTo}>`,
    `Subject: ${encodedWords(subject)}`,
    `Date: ${new Date().toUTCString().replace(/GMT$/, '+0000')}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ];
  const body = base64(text.replace(/\n/g, '\r\n')).replace(/.{1,76}/g, '$&\r\n');
  return `${headers.join('\r\n')}\r\n\r\n${body}`;
}

/** RFC 2047 "B" encoded-words of at most 45 bytes each (never splitting a character), folded onto new lines. */
function encodedWords(value) {
  const encoder = new TextEncoder();
  const words = [];
  let chunk = '';
  for (const char of value) {
    if (encoder.encode(chunk + char).length > 45) {
      words.push(chunk);
      chunk = '';
    }
    chunk += char;
  }
  if (chunk) words.push(chunk);
  return words.map((w) => `=?UTF-8?B?${base64(w)}?=`).join('\r\n ');
}

/** Base64 of a string's UTF-8 bytes. */
function base64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/* ---------- Responses ---------- */

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...(status === 405 ? { Allow: 'POST' } : {}),
    },
  });
}

function redirect(location) {
  return new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store' } });
}

/**
 * The page to send a plain form post back to: the page it came from on this site, otherwise /dj-bookings/.
 * A path starting with "//" (or "/\", which URL parsing turns into "//") would make the relative redirect
 * leave the site (//other.example/), so those fall back to /dj-bookings/ too.
 */
function returnPath(request, url) {
  try {
    const referer = new URL(request.headers.get('Referer') || '');
    const path = referer.pathname;
    if (referer.origin === url.origin && !path.startsWith('//') && !path.startsWith('/api/')) return path;
  } catch {
    // No referer, or not a URL.
  }
  return FALLBACK_PAGE;
}
