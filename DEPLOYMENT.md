# Vercel deployment

Use one Vercel project per repository, build command `pnpm run build`, output directory `dist`. Each subproject's single build produces `index.html`, `index.js` and `spa.js`, plus shared chunks. No separate deployment is needed for standalone and single-spa modes.

| Repository | Domain | Local dev port |
| --- | --- | --- |
| platform-orchestrator | tass.suderman.pro | 3000 |
| tass-suderman-portfolio-react | portfolio.tass.suderman.pro | 7455 |
| shades-and-waves | shades-n-waves.tass.suderman.pro | 7456 |
| midi-mix-dash | midi-mix-dash.tass.suderman.pro | 7457 |

Run `pnpm install --frozen-lockfile` then `pnpm dev` in each repo. Open http://localhost:3000 for the shell; the other ports serve standalone apps. Portfolio is at `/`, Shades n Waves at `/shades-n-waves`, and MIDI Mix Dash at `/midi-mix-dash`. The shell selects its localhost import map during development and the subdomain import map in production.

Subproject builds use relative module and asset URLs so standalone apps work on custom domains, Vercel preview URLs, and localhost without rebuilding. Imported chunks and portfolio images resolve against their own app modules when embedded. Public-file requests (Shades examples and MIDI downloads) also resolve against their app modules; an optional absolute `VITE_ASSET_BASE_URL` overrides those requests only while mounted through single-spa. Standalone mode ignores that override. For a local production preview, build normally and preview on the app's port. To embed preview deployments, update the shell's `src/importMap.json` entries to those deployments' `/spa.js` URLs.

`vercel.json` serves existing files first, falls back to `index.html` for client routes, and enables cross-origin loading for subproject assets. The stable `spa.js` entry is revalidated; shared chunks retain content hashes. Configure each custom domain in Vercel and its DNS records before using the production shell. Leave deployment protection off for public app assets so the shell can import them.

References: [Vercel Vite deployments](https://vercel.com/docs/frameworks/frontend/vite), [Vercel headers configuration](https://vercel.com/docs/project-configuration/vercel-json), [Vite production asset base](https://vite.dev/guide/build).
