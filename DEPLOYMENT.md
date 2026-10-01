# Vercel deployment

Use one Vercel project per repository, build command `pnpm run build`, output directory `dist`. Each subproject's single build produces `index.html`, `index.js` and `spa.js`, plus shared chunks. No separate deployment is needed for standalone and single-spa modes.

| Repository | Domain | Local dev port |
| --- | --- | --- |
| platform-orchestrator | tass.suderman.pro | 3000 |
| tass-suderman-portfolio-react | portfolio.tass.suderman.pro | 7455 |
| shades-and-waves | shades-n-waves.tass.suderman.pro | 7456 |
| midi-mix-dash | midi-mix-dash.tass.suderman.pro | 7457 |

Run `pnpm install --frozen-lockfile` then `pnpm dev` in each repo. Open http://localhost:3000 for the shell; the other ports serve standalone apps. Portfolio is at `/`, Shades n Waves at `/shades-n-waves`, and MIDI Mix Dash at `/midi-mix-dash`. The shell selects its localhost import map during development and the subdomain import map in production.

Production subproject builds use their own absolute domain as the asset base so images, examples and downloads resolve correctly inside the shell. For local production previews, set `VITE_ASSET_BASE_URL=http://localhost:<port>/` before building and preview on the same port. For Vercel preview deployments, set this variable to that app's stable preview origin and override the corresponding shell import map URL (`src/importMap.json`) to use that origin. A preview with the default base will use production assets.

`vercel.json` serves existing files first, falls back to `index.html` for client routes, and enables cross-origin loading for subproject assets. The stable `spa.js` entry is revalidated; shared chunks retain content hashes. Configure each custom domain in Vercel and its DNS records before using the production shell. Leave deployment protection off for public app assets so the shell can import them.

References: [Vercel Vite deployments](https://vercel.com/docs/frameworks/frontend/vite), [Vercel headers configuration](https://vercel.com/docs/project-configuration/vercel-json), [Vite production asset base](https://vite.dev/guide/build).
