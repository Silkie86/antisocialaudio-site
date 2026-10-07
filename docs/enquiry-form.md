# DJ booking enquiry form: setup

The form on `/dj-bookings/` emails each enquiry straight to you. Nothing is stored on the website. It costs nothing on Cloudflare's free plans.

This page is for Solomon (or whoever sets up the Cloudflare account). It takes about 30 minutes, once.

## How it works

1. Someone fills in the form on `/dj-bookings/` (`src/components/EnquiryForm.astro`).
2. A Cloudflare **Turnstile** box checks they are a person, not a bot. There is also a hidden "honeypot" field that only bots fill in.
3. The form sends the enquiry to `/api/enquiry` (`functions/api/enquiry.js`). That code checks every field, asks Cloudflare whether the Turnstile check was genuine, then emails you the enquiry as plain text.
4. The email comes from an `@antisocialaudio.co.uk` address, and its **Reply-To** is the person who sent the enquiry, so pressing Reply in your inbox answers them directly.

If the visitor has JavaScript switched off, the form still posts normally and the page shows "sent" or "not sent" afterwards. The Turnstile check itself needs JavaScript, though.

## Important: the site is a Cloudflare Worker, not Cloudflare Pages

The email is sent with Cloudflare's `send_email` binding. **Cloudflare Pages Functions cannot use that binding** (it is not in the list of bindings Pages supports). So the site is set up as a **Cloudflare Worker with static assets** instead:

- Every page, image and font is a static asset. Cloudflare serves those free and without limit.
- Only the form's address (`/api/*`) runs code. That counts towards the Workers free plan's daily request allowance, which a booking form is very unlikely to reach.
- The settings are in `wrangler.jsonc` at the top of the repository.

If you already made a Cloudflare **Pages** project for this site, make the Worker below instead and move the domain over to it (step 5). On Pages, the form only answers "not working just now".

## Before you start

- `antisocialaudio.co.uk` must use **Cloudflare DNS**. Email Routing needs it.
- Decide which inbox should receive enquiries, for example your own personal address. In these steps it is called **your inbox**.
- **Check whether anything already receives email at `@antisocialaudio.co.uk`** (for example a mailbox from an old web host). Turning on Email Routing points the domain's email (its MX records) at Cloudflare. If you do use an existing mailbox on the domain, sort that out first, or ask before going ahead.

## Step 1: Turn on Email Routing for the domain

1. In the Cloudflare dashboard, go to **Compute > Email Service > Email Routing**.
2. Select **Onboard Domain** and choose `antisocialaudio.co.uk`.
3. Let Cloudflare add the DNS records it suggests (MX records, an SPF record and a DKIM record). They usually work within 5 to 15 minutes.

## Step 2: Verify your inbox as a destination address

The website can only email addresses you have verified. Sending to a verified address is free on every plan, even with only Email Routing set up.

1. Go to **Compute > Email Service > Email Routing > Destination Addresses**.
2. Type in **your inbox** address and submit it.
3. Open the email Cloudflare sends to that address and select **Verify email address**.

## Step 3: Make a Turnstile widget (the spam check)

1. In the dashboard, go to **Turnstile** and select **Add widget**.
2. **Widget name**: `Antisocial Audio DJ enquiries` (anything you like).
3. **Hostname management**: add `antisocialaudio.co.uk` (and `www.antisocialaudio.co.uk` if the site is also served there).
4. **Widget mode**: **Managed**.
5. Select **Create**. Copy the **site key** and the **secret key** somewhere safe for the next steps.

## Step 4: Create the Worker from the GitHub repository

1. Go to **Workers & Pages**, select **Create application**, then **Get started** next to **Import a repository**.
2. Choose your Git account and this site's repository.
3. Keep the Worker's name as **`antisocialaudio-site`** (the `name` in `wrangler.jsonc`).
4. **Build command**: `npm run build`. **Deploy command**: `npx wrangler deploy` (the default).
5. Before the first deploy, or straight after it, add the **build variable** the page needs. Go to the Worker's **Settings > Build > Variables and secrets** and add:

   | Name | Value |
   | --- | --- |
   | `PUBLIC_TURNSTILE_SITE_KEY` | the Turnstile **site key** from step 3 |

   It is a *build* variable because it is written into the page when the site is built. After adding or changing it, start a new build (push a commit, or retry the latest build). Pressing Deploy after saving a variable does not rebuild the page.

## Step 5: Add the runtime settings, then the domain

1. In the Worker, go to **Settings > Variables and Secrets** and select **Add** for each of these:

   | Name | Type | Value |
   | --- | --- | --- |
   | `ENQUIRY_TO` | Text | **your inbox** (the address you verified in step 2) |
   | `ENQUIRY_FROM` | Text | an address on the domain, for example `website@antisocialaudio.co.uk`. It doesn't need to be a real mailbox. |
   | `TURNSTILE_SECRET_KEY` | **Secret** | the Turnstile **secret key** from step 3 |

   Deploy when the dashboard asks. `wrangler.jsonc` has `"keep_vars": true`, so later deploys from GitHub leave these settings alone.
2. To put the site on your domain, go to **Settings > Domains & Routes > Add > Custom Domain** and enter `antisocialaudio.co.uk` (and `www.antisocialaudio.co.uk` if you use it). Cloudflare can't do this while the name still has a CNAME record pointing somewhere else, such as the old WordPress host, so remove that record when you are ready to switch over.

## The email binding

Nothing to do here: it is already in `wrangler.jsonc`:

```jsonc
"send_email": [{ "name": "EMAIL" }]
```

That lets the code send to any destination address you have verified. To lock it to just your inbox, change it to:

```jsonc
"send_email": [{ "name": "EMAIL", "destination_address": "<your inbox>" }]
```

(That puts the address in the repository, which is why it is not done by default.)

## Check it works

1. Open `https://antisocialaudio.co.uk/dj-bookings/`, fill in the form and send it.
2. You should see "Thanks, we have your enquiry", and the email should arrive in your inbox within a minute, from "Antisocial Audio website", with the subject `DJ booking enquiry: <event name>`. Check spam the first time.
3. Press Reply: it should be addressed to the person who filled in the form.

If it fails, the Worker's **Logs** in the dashboard say why. The code logs the reason, never the enquiry itself.

| What the visitor sees | What the log says | Fix |
| --- | --- | --- |
| "The enquiry form is not working just now" | `not set up: no send_email binding called EMAIL` | The site is running on Pages, or `wrangler.jsonc` was changed. Deploy it as the Worker (step 4). |
| "The enquiry form is not working just now" | `ENQUIRY_TO is missing` or `ENQUIRY_FROM is missing` | Add the variable in step 5 and deploy. |
| "It could not be delivered just now" | `email not sent: E_SENDER_NOT_VERIFIED` | `ENQUIRY_FROM` must be on `antisocialaudio.co.uk`, and Email Routing must be on for that domain (step 1). |
| "It could not be delivered just now" | another `email not sent` error | Usually `ENQUIRY_TO` is not a verified destination address (step 2). |
| "We could not confirm you are human" | `Turnstile rejected the token` | The site key (build variable) and secret key (runtime secret) must come from the same widget, and the widget's hostnames must include the domain. |
| "We could not confirm you are human", and no spam check box on the form | `no usable Turnstile token` | `TURNSTILE_SECRET_KEY` is set but the site was built without `PUBLIC_TURNSTILE_SITE_KEY`. Add the build variable (step 4) and start a new build. |

Until `TURNSTILE_SECRET_KEY` is set, the code skips the Turnstile check, so only the honeypot stops bots (the log says so on every enquiry). Set it before you link to the page, together with the build variable from step 4: a site built without `PUBLIC_TURNSTILE_SITE_KEY` shows no spam check box on the form.

## Testing on your own computer (optional)

1. `npm run build`, then `npx wrangler dev`.
2. Put local settings in a file called `.dev.vars` (it is git-ignored, never commit it). Cloudflare's test keys always pass:

   ```
   ENQUIRY_TO=you@example.com
   ENQUIRY_FROM=website@antisocialaudio.co.uk
   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
   ```

   and build with the matching test site key: `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA npm run build`.
3. Locally, `wrangler dev` does not send real email. It prints the email and saves a copy to a local file.

## Cloudflare documentation used

- Pages Functions bindings (no `send_email`): https://developers.cloudflare.com/pages/functions/bindings/
- Email Service, sending from Workers (`send_email` binding, `env.EMAIL.send()`, error codes, `EmailMessage`): https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- Send binding restrictions (`destination_address`, `allowed_destination_addresses`, `allowed_sender_addresses`): https://developers.cloudflare.com/email-service/configuration/send-bindings/
- Email Routing addresses (verifying destinations; free sends to verified addresses on any plan): https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/
- Turning on Email Routing (dashboard path, DNS records): https://developers.cloudflare.com/email-service/get-started/route-emails/
- Email Service pricing: https://developers.cloudflare.com/email-service/platform/pricing/
- Local development of email sending: https://developers.cloudflare.com/email-service/local-development/sending/
- The older Email Routing page (now leads to Email Service): https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/
- Workers static assets: https://developers.cloudflare.com/workers/static-assets/
- Static assets billing (asset requests free and unlimited): https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- Routing with a Worker script and `run_worker_first`: https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
- HTML handling (trailing slashes): https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/
- Wrangler configuration (`keep_vars`, `send_email`, `assets`): https://developers.cloudflare.com/workers/wrangler/configuration/
- Workers Builds (import a repository) and build variables: https://developers.cloudflare.com/workers/ci-cd/builds/ and https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
- Worker variables and secrets: https://developers.cloudflare.com/workers/configuration/environment-variables/
- Custom domains for Workers: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Turnstile: creating a widget: https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/
- Turnstile: client-side rendering: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- Turnstile: server-side validation (siteverify): https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Turnstile: test keys: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
