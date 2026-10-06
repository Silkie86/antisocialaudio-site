# Antisocial Audio site: working notes for Claude

Static site for antisocialaudio.co.uk, built with Astro and hosted on Cloudflare Pages.

## Rules
- Keep outside code to a minimum. Dependencies are `astro` and `@astrojs/sitemap` only. No CSS frameworks, UI libraries, icon packs or jQuery.
- Brand: colours and type live as tokens in `src/styles/global.css` (ink #070707, green #006223, yellow #E6B900, Poppins). Use the tokens; never hard-code another colour. The site is dark-only.
- Poppins is self-hosted from `public/fonts/` (latin subset, OFL licence). Do not load Google Fonts.
- Facts (prices, booking links, services, DAWs, workshop, review) live in `src/data/site.ts`; FAQ text in `src/data/faq.ts`. Pages read from there; never retype a price in a page.
- Package prices are computed from `hourlyRate` and each discount: 1 h £25, 5 h £118.75, 10 h £225.00.
- Do not invent facts about Silkie, dates, prices, reviews or credentials. Leave a clearly marked placeholder instead.
- Shared styles: `.wrap`, `.sec`, `.sec-head`, `.kick`, `.spk`, `.btn` (+ `--yellow`, `--ghost`, `--block`), `.pill`, `.card` (+ `--green`, `--yellow`), `.chips`, `.prose`. Page-only styles go in that page's `<style>` block (Astro scopes them).
- Every page uses `src/layouts/Base.astro` and passes `title` and `description`.
- No JavaScript unless a feature needs it; when it does, keep it small and inline in the component.
- Must work from 360px to 1280px+ with no horizontal scroll, visible focus states, and `prefers-reduced-motion` respected.

## Commands
- `npm run dev` to preview locally, `npm run build` to build into `dist/`.
