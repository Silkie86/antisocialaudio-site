# Antisocial Audio site: working notes for Claude

Static site for antisocialaudio.co.uk, built with Astro and hosted as a Cloudflare Worker with static assets (`wrangler.jsonc`; deploy with `npx wrangler deploy`). The pages are static; the only server code is `functions/` (the DJ enquiry form's `/api/enquiry`, which emails via the `send_email` binding, so it cannot run on Cloudflare Pages). Form setup: `docs/enquiry-form.md`. Redirects and security headers: `public/_redirects`, `public/_headers`.

## Rules
- Keep outside code to a minimum. Dependencies are `astro` and `@astrojs/sitemap` only. No CSS frameworks, UI libraries, icon packs or jQuery.
- Brand: colours and type live as tokens in `src/styles/global.css` (ink #070707, green #006223, yellow #E6B900, Poppins). Use the tokens; never hard-code another colour. The site is dark-only.
- Poppins is self-hosted from `public/fonts/` (latin subset, OFL licence). Do not load Google Fonts.
- Facts (prices, booking links, services, DAWs, workshop and its next date via `nextWorkshop()`, payment methods, review) live in `src/data/site.ts`; FAQ text in `src/data/faq.ts` (its services, rates and DAW answers are built from site.ts). Price helpers live in `src/data/pricing.ts`: `packageRows` (each pack with its total, per-hour rate, saving, `off` percentage, `name` and `sub` label), `cheapest`, `maxDiscountPct`, `packSizes` ("5- or 10-hour"). Pages read from there; never retype a price or discount in a page or in faq.ts, and take any list of services or DAWs from `services`/`daws`.
- Package prices are computed from `hourlyRate` and each discount, rounded to the penny in `packagePrice()`: 1 h £25, 5 h £118.75, 10 h £225.00.
- Do not invent facts about Silkie, dates, prices, reviews or credentials. Leave a clearly marked placeholder instead.
- Shared styles: `.wrap`, `.sec`, `.sec-head`, `.kick`, `.lbl` (quiet uppercase label), `.spk`, `.btn` (+ `--yellow`, `--ghost`, `--block`), `.pill` (+ `--solid`), `.card` (+ `--green`, `--yellow`), `.chips` (+ `--dim`), `.ico` (yellow icon tile), `.flag` ("Best value"), `.notice` (+ `.i` icon), `.page-hero` (inner-page hero: glow, h1 size) with `.lede`, `.prose`, `.visually-hidden`. Page-only styles go in that page's `<style>` block (Astro scopes them).
- Shared components in `src/components/`: reuse them rather than pasting copies. `Wave` (brand wave; pass a class for spacing), `Steps` (numbered timeline), `Credentials` (tutor block; `dj={false}` hides the DJ line), `BookAction` (what shows under each option on /book/: booking button, old booking page or "opens soon"), `ConsultCard`, `FaqList` (`only` keeps the given order and fails the build on an unknown question), `Review`, `VideoPoster` (YouTube poster that loads the player only when clicked; links to the channel until `video.youtubeId` is set), `EnquiryForm` (DJ form; its limits and messages match `functions/api/enquiry.js`), `Logo` (placeholder text wordmark). The homepage sections are in `src/components/home/`.
- Workshop booking buttons only appear when `nextWorkshop()` returns a date, on every page.
- Developer notes in `.astro` templates are `{/* TODO … */}` comments, never `<!-- -->`, so they stay out of the public HTML.
- Every page uses `src/layouts/Base.astro` and passes `title` and `description`. The one exception is the homepage, which passes no `title` so it gets the site's own title rather than "X | Antisocial Audio".
- No JavaScript unless a feature needs it; when it does, keep it small and inline in the component.
- Must work from 360px to 1280px+ with no horizontal scroll, visible focus states, and `prefers-reduced-motion` respected.

## Commands
- `npm run dev` to preview locally, `npm run build` to build into `dist/`. `npx wrangler dev` (after a build) runs the Worker and the enquiry form locally.
- There is no type-check script: `astro check` needs packages this project does not add, so `npm run build` is the check.
