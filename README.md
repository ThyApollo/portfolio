# Apollo, Portfolio

A single-page developer portfolio. Static site, plain HTML, CSS, and JavaScript.
No build step, no dependencies, no framework.

Converted from the Apollo design comp: the tool-specific wrappers
(`<x-dc>`, `<helmet>`, `<x-import>` image slots, `support.js`, the `DCLogic`
component) were stripped out, `style-hover` attributes became real CSS `:hover`
rules, the `{{ accent }}` token was resolved to `#A9C7D9`, and the image-slot
system was replaced with standard `<img>` tags and styled placeholder panels.

## Structure

```
.
├── index.html      # markup
├── style.css       # all styles (accent lives in :root as --accent)
├── script.js       # scroll effects, count-up stats, magnetic CTAs, mail handler
└── assets/
    ├── hero-panther.png     # hero background
    ├── contact-panther.png  # contact background
    └── jungle.png           # statement-section texture
```

## Run locally

It's static, so just open `index.html`, or serve it (nicer, avoids any
file:// quirks):

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Customizing

- **Accent color**, change `--accent` in [`style.css`](style.css) (`:root`).
  The comp's sanctioned options were `#A9C7D9` (blue, current), `#D9A441`
  (gold), and `#7FA98E` (green).
- **Project images**, the three "Selected work" cards and the About portrait
  are styled placeholder panels (`.slot`). Replace each placeholder `<div>` in
  [`index.html`](index.html) with an `<img>` (e.g. `assets/project-one.png`).
- **Copy / links**, text, the `hello@apollo.dev` mailto, and the GitHub/
  LinkedIn/X footer links are all plain HTML in `index.html`.

## Deploy (free)

Any of these host a static site for free. Pick one.

### GitHub Pages
1. Push this folder to a GitHub repo.
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a
   branch**, branch `main`, folder `/ (root)`, Save.
3. Live at `https://<username>.github.io/<repo>/` within a minute.

### Netlify
- Drag-and-drop this folder onto <https://app.netlify.com/drop>, **or** connect
  the GitHub repo. No build command; publish directory is the repo root.

### Cloudflare Pages
- Pages → Create → connect the repo. Framework preset **None**, build command
  empty, output directory `/`.

### Vercel
- Import the repo at <https://vercel.com/new>. It auto-detects a static site,
  no build command needed. (Vercel is only the "cleanest" choice when a project
  is Next.js; for this static build all four are equally simple.)
