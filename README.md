# Harper Partners

Marketing landing page for **Harper Partners** — the 70/30 revenue-share
partner program for small personal & auto brokerages.

> Send us the commercial business you can't write, keep 30% of the commission,
> and we'll send personal-lines referrals back to you.

Built with Next.js 16 + React 19 + Tailwind CSS v4, using Harper's "ember"
design system (ported verbatim from `harper-kb/harper-marketplace`).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start   # serves the production build on $PORT (default 3000)
```

The site is fully static — `npm run build` requires no environment variables,
database, or network access.

## Pages & sections

Single landing page (`src/app/page.tsx`):

1. **Hero** — deep-blue `hero-prestige` with the two-way pitch + promise row
2. **Proof band** — hardcoded stats (70/30, $1–2K/mo, 558 brokerages)
3. **How It Works** — `band-arc` white band with STEP 01/02/03 step-cards
4. **Two-way band** — deep-blue band with a partner-payout preview card + benefits list
5. **FAQ** — editorial hairline-ruled Q&A (licensing, no-poach, lines, payout, cost)
6. **Final CTA** — deep-blue band with a static "Become a partner" form

## Design system

`src/app/globals.css` is the Harper ember design system, kept byte-identical to
the marketplace. Shared chrome (`site-header`, `site-footer`,
`announcement-banner`) mirrors the marketplace markup and classes. Fonts:
Plus Jakarta Sans + Playfair Display via `next/font`, plus Material Symbols.

## Deploy

Any Node host that runs `npm run build && npm start` works (Railway, Vercel,
etc.). No env vars required. This repo does not include deploy config.

## Legal

Commission-share arrangements are available to appropriately licensed partners
only. Unlicensed sources may receive flat per-referral fees where permitted by
law. Nothing in this site is an offer of insurance.
