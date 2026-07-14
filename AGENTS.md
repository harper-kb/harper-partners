<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## About this project

`harper-partners` is a **static marketing landing page** for Harper's 70/30
revenue-share partner program. It reuses the Harper "ember" design system
verbatim from `harper-kb/harper-marketplace` (`src/app/globals.css` is
byte-identical), but has **no auth and no database**:

- No `@clerk/nextjs`, no `ClerkProvider`.
- No `postgres` / DB-backed pages. All content is static; stats are hardcoded.
- `npm run build` needs no env vars, DB, or network.

Keep design parity with the marketplace when editing shared chrome
(`site-header`, `site-footer`, `announcement-banner`, `globals.css`, fonts).
