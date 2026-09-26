# Agentic — Ghost theme for Agentic Healthcare

A custom, Stripe-inspired Ghost theme for [peterphua.ca](https://peterphua.ca), a blog on AI agents, clinical operations and the Canadian health system.

![Ghost 6 compatible](https://img.shields.io/badge/Ghost-6.x-635bff) ![gscan](https://img.shields.io/badge/gscan-passing-0fbf7f)

## Design

| Element | What it does |
|---|---|
| **Flowing gradient hero** | A WebGL shader renders a slow, Stripe-style mesh gradient behind a diagonal cut. It falls back to a CSS gradient, pauses when offscreen and respects `prefers-reduced-motion`. |
| **Agent console** | An animated "agent run" showing three looping clinic workflows (referral intake, pre-visit history, lab triage). All data is fictional. |
| **Generated cover art** | Posts without a feature image get a unique gradient, grid and ECG-trace SVG seeded by the post slug, so every post has distinct art with no images to upload. |
| **Editorial essay list** | A featured essay card followed by hairline rows (date · title · excerpt · thumb) instead of a grid of cards. |
| **Thesis grid** | Four tiles summarising the blog's core arguments, linked to the posts behind them. |
| **Reading experience** | 680px measure, a gradient reading-progress bar, and all-bold paragraphs automatically restyled as "claim" callouts. Underlines render as highlighter marks and lists get accent-coloured markers. |
| **Members** | Hero and footer subscribe forms (Ghost Portal / `data-members-form`) with loading, success and error states. |
| **Dark mode** | Light (default), Dark or Auto, selectable in Ghost Admin. |

Typography is Inter (with `cv05 cv08 cv11 ss03` features) and JetBrains Mono. It also respects Ghost's custom-font settings (`--gh-font-body` / `--gh-font-heading`).

## Brand assets

`assets/brand/` contains the logo mark, an **A** whose crossbar is a heartbeat trace, on a Stripe-palette mesh gradient.

| File | Use |
|---|---|
| `mark.svg` / `mark-512.png` | Square, full-bleed mark (safe for circular crops) |
| `linkedin-profile-800.png` | LinkedIn / X profile photo |
| `favicon.svg`, `favicon-32.png`, `favicon-512.png` | Rounded-square favicon; upload `favicon-512.png` as the Ghost **Publication icon** |
| `apple-touch-icon.png` | iOS home-screen icon |

## Theme settings (Ghost Admin → Settings → Design & branding)

- **Color scheme:** Light / Dark / Auto
- **Homepage:** hero headline, hero subhead, toggles for the agent console and the thesis grid

## Structure

```
default.hbs          layout (fonts, nav, footer, scripts)
home.hbs             homepage: hero, essays, thesis grid, author
index.hbs            paginated archive
post.hbs / page.hbs  article templates
tag.hbs / author.hbs taxonomy archives
error.hbs            404 / errors
partials/            header, footer, subscribe form, agent console, post row/feature, avatar
assets/css/screen.css  design tokens + all styles (no build step)
assets/js/main.js      gradient shader, console, generated art, progress, nav
```

## Local development

```bash
npm i -g ghost-cli
mkdir ghost-local && cd ghost-local && ghost install local   # needs Node 22.23+ or 24
ln -s /path/to/agentic-healthcare-theme content/themes/agentic
ghost restart
```

Then activate **agentic** under Settings → Design. Edits to `.hbs`, CSS and JS show up on reload (restart Ghost after changing `package.json`).

## Validate & package

```bash
npm test        # gscan
npm run zip     # → dist/agentic.zip
```

## Deployment

**Manual:** Ghost Admin → Settings → Design & branding → Change theme → Upload theme → `dist/agentic.zip` → Activate.

**Automatic (GitHub Actions):** every push to `main` validates the theme with gscan and deploys it via [`TryGhost/action-deploy-theme`](https://github.com/TryGhost/action-deploy-theme). To enable:

1. Ghost Admin → Settings → Integrations → **Add custom integration** ("GitHub theme deploy").
2. In this repo → Settings → Secrets and variables → Actions, add:
   - `GHOST_ADMIN_API_URL`: `https://agentic-healthcare.ghost.io`
   - `GHOST_ADMIN_API_KEY`: the integration's Admin API key

Without those secrets the workflow still runs gscan and skips the deploy.
