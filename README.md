# Antisocial Audio website

This is the code for [antisocialaudio.co.uk](https://antisocialaudio.co.uk): one-to-one online bass music production lessons with Solomon Rose aka Silkie, live Zoom workshops, and DJ bookings.

It replaces the old WordPress site. The pages are built with [Astro](https://astro.build), which turns the files in this folder into plain, fast web pages, and they are hosted on Cloudflare's free plan. There is no WordPress, no plugins and no database, so there is no admin area to keep updated and patched.

## What's on the site

| Address | What it is |
| --- | --- |
| `/` | Home: the two paths (1:1 lessons and workshops), prices, about Silkie, a few FAQs |
| `/book/` | The booking page: free consultation, single lessons, 5- and 10-hour packs, the workshop |
| `/workshops/` | The Dubstep Bass Masterclass on Zoom |
| `/dj-bookings/` | DJ bookings, with an enquiry form that emails you |
| `/faq/` | Questions and answers |
| `/terms/`, `/privacy/` | Terms and privacy notice |

## Changing things

Most of what you will want to change lives in two files, `src/data/site.ts` and `src/data/faq.ts`. Change something once there and every page that shows it updates.

| To change | Open this file | And edit |
| --- | --- | --- |
| Lesson price or pack discounts | `src/data/site.ts` | `hourlyRate` and `packages` |
| Booking links (Cal.com, Stripe) | `src/data/site.ts` | `booking` |
| Ways to pay (card, PayPal, pay later) | `src/data/site.ts` | `payments` |
| Workshop name, price or next date | `src/data/site.ts` | `workshop` |
| The review quote | `src/data/site.ts` | `review` |
| The YouTube video on the home page | `src/data/site.ts` | `video` |
| Labels, years, YouTube channel | `src/data/site.ts` | `site` |
| FAQ questions and answers | `src/data/faq.ts` | the list of `q` (question) and `a` (answer) |
| Wording on one page | `src/pages/` | the file named after the page, e.g. `workshops.astro` |
| Colours and fonts | `src/styles/global.css` | the values at the top (best left to a developer) |
| Redirects from old addresses | `public/_redirects` | see [Old addresses](#old-addresses-from-the-wordpress-site) |
| Security and caching settings | `public/_headers` | see [Security settings](#security-settings) |

Text in these files sits between quote marks, like `'Live on Zoom'`. Keep the quote marks and the comma at the end of the line, and only change the words between them.

### Prices

Lessons are worked out from one number, `hourlyRate` (currently `25`, meaning £25 an hour). The pack prices are calculated from it and each pack's discount, so they always add up: 5 hours at 5% off is £118.75 and 10 hours at 10% off is £225.00. Change `hourlyRate` or a `discount` (`0.05` means 5%) and every price on the site updates.

The FAQ answer "What are your rates?" is built from the same numbers, so it updates too.

### Booking links

Each booking button on the site reads its link from `booking` in `src/data/site.ts`, which has one line per thing people can book:

```ts
  consult: null,
  lesson: null,
  pack5: null,
  pack10: null,
  workshop: null,
```

`consult` is the free 30-minute consultation, `lesson` a single hour, `pack5` and `pack10` the packs, and `workshop` the masterclass. `null` means "no link yet". While a link is missing, its buttons go to the matching part of the `/book/` page, which says online booking for that option opens soon. When you have the Cal.com (or Stripe payment) link, put it in quote marks in place of `null`:

```ts
  consult: 'https://cal.com/your-name/consultation',
```

Just below it, `legacyBookingUrl` can point at an old booking page to use meanwhile. It only helps if the old WordPress site is kept running at a different address (for example `old.antisocialaudio.co.uk`): the old address on `antisocialaudio.co.uk` redirects to `/book/` once the domain moves to this site, so the `/book/` page ignores any link on its own domain. Leave it as `null` otherwise.

### Ways to pay

`payments` in `src/data/site.ts` says which ways to pay are offered at checkout: `card`, `paypal` and `payLater` (buy now, pay later). The FAQ, the home page and the "Ways to pay" part of `/book/` follow it. They are all `true` for now; once checkout is set up, change any that are not offered to `false`.

### The next workshop date

Set `nextDate` inside `workshop` to the date in year-month-day form, in quote marks. For example, 16 November 2026 would be `nextDate: '2026-11-16',`. The site then shows the date wherever the workshop appears, with a button to book it (on the home page, the workshops page and `/book/`). Until then they say the next date will be announced soon and show no booking button, even if the workshop's booking link is set. After the workshop, set the next date, or put `null` back (no quote marks) if there isn't one yet. (The site checks the date when it is built, so a date that has passed disappears the next time the site is published.)

### The FAQ

Each question in `src/data/faq.ts` looks like this:

```ts
  {
    q: 'Which DAWs are covered?',
    a: 'Solomon Rose aka Silkie specialises in ...',
  },
```

They appear on the FAQ page in the order they are listed. The information Google reads from the FAQ page is built from the same list, so it never goes out of date.

The home page shows three of these questions, picked by their exact wording in `src/pages/index.astro` (the line starting `<FaqList only=`). If you reword one of those three in `faq.ts`, change it there too: otherwise the build stops with a message naming the question it could not find.

## Seeing your changes before they go live

You need [Node.js](https://nodejs.org) version 22.12 or newer (the "LTS" download is fine). Then, in a terminal, in this folder:

1. `npm install` (first time only) downloads Astro.
2. `npm run dev` starts a preview. Open http://localhost:4321 in your browser. Pages update as you save files. Press Ctrl+C in the terminal to stop it.
3. `npm run build` builds the finished site into the `dist` folder, exactly as Cloudflare will. If it finishes with "Complete!" the site is ready to publish. `npm run preview` then shows that finished version.

The redirects, the security settings and the DJ enquiry form are handled by Cloudflare, so they only work on the live site or a Cloudflare preview, not in `npm run dev`. (A developer can try the form locally with `npx wrangler dev`; see `docs/enquiry-form.md`.)

## How the site goes live

The code lives on GitHub and Cloudflare is connected to it. When a change reaches the production branch (usually `main`), Cloudflare builds the site and publishes it within a minute or two. Nothing needs uploading by hand.

The site runs as a **Cloudflare Worker with static assets** (set up in `wrangler.jsonc`) rather than classic Cloudflare Pages. The pages themselves are served exactly as Pages would serve them, free and unlimited; the only difference is a small script in `functions/` that receives the DJ enquiry form and emails it to you, which Pages cannot do.

Cloudflare build settings (Workers & Pages > the project > Settings > Build):

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Output folder | `dist` (already set in `wrangler.jsonc`, nothing to enter) |
| Node.js version | 22.12 or newer. Cloudflare's build machines already use a newer one by default; to pin it, add a build variable `NODE_VERSION` = `22`. |

Settings the DJ enquiry form needs (none of them live in the code, so no addresses or secrets are in this repository). The full step-by-step setup for the form, with a table of what to do if it fails, is in [`docs/enquiry-form.md`](docs/enquiry-form.md).

| Name | Where | What |
| --- | --- | --- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Settings > Build > Variables and secrets | Turnstile site key. Shows the spam check on the form. |
| `TURNSTILE_SECRET_KEY` | Settings > Variables and Secrets (type: Secret) | Turnstile secret key. Lets the Worker check the spam check. |
| `ENQUIRY_TO` | Settings > Variables and Secrets | Where enquiries go: your Gmail address, verified in Email Routing |
| `ENQUIRY_FROM` | Settings > Variables and Secrets | The sender: any address ending `@antisocialaudio.co.uk` |

If the form is ever removed, the same `dist` folder can run on plain Cloudflare Pages instead: build command `npm run build`, output directory `dist`, `NODE_VERSION` = `22`. The `_redirects` and `_headers` files work the same way there.

## Launch checklist

Work through these in order. Steps 1 to 3 can be done while the old site is still live; nobody sees the new site until step 4.

### 1. Get the content ready

- [ ] **Booking links.** Set up Cal.com (free): one event type each for the free 30-minute consultation, a 1-hour lesson, the 5-hour pack, the 10-hour pack and the workshop. Connect Stripe in Cal.com for card payments (PayPal can follow later). Paste each link into `booking` in `src/data/site.ts`.
  **Do this before step 4.** Until a link is set, that option cannot be booked online: its button leads to `/book/`, which says online booking opens soon. (The old WordPress booking page, `/music-productibook-now/`, disappears when the domain moves, and its address then redirects to `/book/`. See [Booking links](#booking-links) if you want to keep the old site running at another address meanwhile.)
- [ ] **Ways to pay.** Once checkout works, check which of card, PayPal and buy now, pay later it really offers, and set `payments` in `src/data/site.ts` to match.
- [ ] Set the next workshop date (`workshop.nextDate`) if one is planned, and the YouTube video ID (`video.youtubeId`, the part after `watch?v=` in the video's address) if you want the video to play on the page.
- [ ] Paste your current Terms from WordPress into `src/pages/terms.astro`, and finish the draft privacy notice in `src/pages/privacy.astro` (fill in each part marked TODO, including the contact email).
- [ ] Look for any other placeholders: every one is marked `TODO` in the files under `src/`. Each says what it needs. Nothing on the site was made up, so these are the gaps only you can fill.
- [ ] From WordPress, save the logo files and any photos you want to keep, and make a full backup (Hostinger's backup tool, plus Tools > Export in WordPress).

### 2. Check the old addresses

- [ ] In WordPress, list every page, product and event address: Pages > All Pages, Products > All Products and your events list (hover over a title to see its address).
- [ ] Compare them with `public/_redirects`. Three entries are confirmed; the rest are educated guesses from the old menu and WordPress defaults. Delete guesses that never existed, and add a line for any old address that is missing. See [Old addresses](#old-addresses-from-the-wordpress-site).

### 3. Set up Cloudflare

- [ ] Create a free Cloudflare account. Add a domain: `antisocialaudio.co.uk`, Free plan. Cloudflare copies your current DNS records; check the list looks complete, especially any `MX` and `TXT` records used for email.
- [ ] Note the two nameservers Cloudflare gives you for the domain (they look like `name.ns.cloudflare.com`).
- [ ] Create the site: Workers & Pages > Create > Import a repository, pick this GitHub repository, and enter the build settings in [How the site goes live](#how-the-site-goes-live). When it finishes, open the `….workers.dev` address Cloudflare gives you and click through every page. (That test address is hidden from Google automatically.)
- [ ] Turnstile (the spam check on the DJ form): Turnstile > Add widget, hostname `antisocialaudio.co.uk` (add the `….workers.dev` address as a second hostname if you want to try the form there), mode Managed. Put the site key and secret key into the Worker's settings as shown in [How the site goes live](#how-the-site-goes-live), then redeploy.

### 4. Move the domain to Cloudflare (at Hostinger)

- [ ] In Hostinger's hPanel: Domains > `antisocialaudio.co.uk` > DNS / Nameservers > Change nameservers. Choose custom nameservers and enter Cloudflare's two. The domain stays registered with Hostinger (keep renewing it there); only the nameservers change.
- [ ] Wait for Cloudflare to show the domain as Active. This is usually within a few hours and can take up to 24.
- [ ] In Cloudflare, go to DNS > Records and delete the old `A`, `AAAA` or `CNAME` records for `antisocialaudio.co.uk` and `www` (the ones copied from Hostinger that point at the old site). Leave the `MX` and `TXT` records alone. Cloudflare will not attach the Worker to a name that still has one of those records, and the old site goes offline as soon as they are deleted, so do the next step straight away.
- [ ] In the Worker: Settings > Domains & Routes > Add > Custom domain: add `antisocialaudio.co.uk`, then add `www.antisocialaudio.co.uk` too.
- [ ] Send `www` to the main address: Rules > Redirect Rules > create one from the "Redirect from WWW to root" template.
- [ ] SSL/TLS > Edge Certificates: turn on Always Use HTTPS.

### 5. Email to Gmail (Cloudflare Email Routing, free)

- [ ] If you have any mailboxes at Hostinger, save what you need from them first: once Email Routing is on, mail to the domain goes to Gmail instead.
- [ ] Compute > Email Service > Email Routing > Onboard Domain, and choose `antisocialaudio.co.uk`. Let Cloudflare add the `MX` and `TXT` records it suggests.
- [ ] Email Routing > Destination Addresses: add your Gmail address and click the link Cloudflare emails you to confirm it.
- [ ] Email Routing > your domain > Routing Rules > Create routing rule: create the address(es) you want people to write to at `@antisocialaudio.co.uk` and forward each to Gmail.
- [ ] Send a test email from another account and check it arrives.
- [ ] In the Worker's settings, set `ENQUIRY_TO` to your Gmail address (the one you just confirmed) and `ENQUIRY_FROM` to an address at `@antisocialaudio.co.uk`. The DJ enquiry form can send email from now on. (The same steps, with more detail, are in `docs/enquiry-form.md`.)
- [ ] Note: Email Routing only receives. Replies from Gmail come from your Gmail address unless you later set up Gmail's "Send mail as" with an outgoing mail service.

### 6. After launch

- [ ] Click through every page on your phone and on a computer, and press each booking button.
- [ ] Send yourself a DJ enquiry from `/dj-bookings/`. It should arrive in Gmail, and pressing Reply should answer the person who sent it.
- [ ] Try a few old addresses, for example `antisocialaudio.co.uk/events/`, `/music-productibook-now/` and `/packages/`. Each should land on its new page. (In a terminal, `curl -I https://antisocialaudio.co.uk/events/` should show `301` and `location: /workshops/`.)
- [ ] Turn on Cloudflare Web Analytics (the Web Analytics page in the dashboard > Add a site). The privacy notice already says the site uses it, and the security settings already allow it.
- [ ] Add the site to [Google Search Console](https://search.google.com/search-console) and submit the sitemap, `https://antisocialaudio.co.uk/sitemap-index.xml`. Over the next few weeks, check its Pages report for "Not found (404)" addresses and add a redirect for any old address that shows up.
- [ ] Once everything has worked for a couple of weeks, cancel the Hostinger hosting plan. Keep the domain.

## Old addresses from the WordPress site

`public/_redirects` sends visitors and Google from old WordPress addresses to the new pages, for example `/events/` to `/workshops/`. Each line is `old-address new-address 301`; 301 means "moved for good", which tells Google to pass the old page's ranking to the new one.

Cloudflare treats `/events` and `/events/` as different addresses, so each old page has two lines. The file explains which entries are confirmed and which are guesses. Lines ending in `*` catch everything under an address (every old shop product goes to `/book/`) and must stay at the bottom of the file.

## Security settings

`public/_headers` tells browsers how to treat the site. In short:

- **Content-Security-Policy** lists the only places the site may load things from: the site itself, Cloudflare Turnstile, Cloudflare Web Analytics and the privacy-enhanced YouTube player. Anything else is blocked, and no other site can show ours inside a frame.
- **Referrer-Policy, X-Content-Type-Options, Permissions-Policy** and the rest are standard protections. The Permissions-Policy switches off camera, microphone, location and other browser features the site never uses.
- **Cache-Control** lets browsers keep the fonts and the built CSS and JavaScript for a year, so repeat visits are fast. Astro gives each built file a new name whenever it changes, so nobody gets a stale copy.

**Why the policy allows scripts written into the page (`'unsafe-inline'`).** Astro writes a few small scripts straight into the pages, such as the one that checks the DJ form as it is filled in. The strictest policies allow such a script only by its exact fingerprint, but the fingerprint changes whenever the code is edited, so a hand-written list would quietly break the form after the next change. The policy therefore allows scripts written into the page, while still blocking scripts from anywhere except the site itself and the two Cloudflare services. The site never shows anything a visitor types back on a page (the enquiry form only emails it), so the remaining risk is small. A developer can tighten this later with Astro's built-in Content Security Policy option, which works out the fingerprints automatically on every build.

**If you add something from another service inside a page** (for example a Cal.com booking calendar embedded in the page, a Stripe checkout or a SoundCloud player), it will be blocked until its address is added to the policy in `public/_headers`. A payment form shown inside a page also needs `payment=()` taken out of the `Permissions-Policy` line, or card wallets such as Apple Pay and Google Pay will not appear in it. Plain links to Cal.com, Stripe, PayPal, Zoom or YouTube need no change. If something on a page stops working after a change like that, the browser's developer console will show a message starting "Refused to load" or "Refused to frame", naming the address to add.

## Where everything is (for whoever helps you)

| Path | What it holds |
| --- | --- |
| `src/data/` | All facts: prices, booking links, workshop, review, FAQ |
| `src/pages/` | One file per page |
| `src/components/` | Shared pieces: header, footer, logo, FAQ list, enquiry form, video, tutor credentials, numbered steps, the brand wave, and the booking button on `/book/` |
| `src/layouts/Base.astro` | The page frame every page uses: title, description, search-engine tags |
| `src/styles/global.css` | Brand colours, Poppins and shared styles. The site is dark only. |
| `public/` | Files published as they are: fonts, favicon, `_redirects`, `_headers`, `robots.txt` |
| `functions/` | The Worker script that emails DJ enquiries |
| `docs/enquiry-form.md` | Step-by-step setup for the DJ enquiry form (Email Routing, Turnstile, Worker settings) |
| `wrangler.jsonc` | Cloudflare settings for the Worker |
| `CLAUDE.md` | House rules for AI assistants working on the site |

The Poppins font is included under the SIL Open Font License (`public/fonts/OFL.txt`).
