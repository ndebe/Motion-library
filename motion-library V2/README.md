# Motion Library

A personal, growing collection of UI animations — grouped by **where they act**
(pictures, buttons, links, nav…), **tagged** by target/trigger/type, browsable in
a live gallery, and ready to copy into any project.

Snippet files are the source of truth; a zero-dependency build script generates a
searchable catalog (`index.json`) and a live gallery (`gallery.html`) on top of them.

## Quick start

```bash
node scripts/build.mjs        # or: npm run build
open gallery.html             # browse, preview, copy
```

No dependencies are required to build or run.

## How it's organized

```
effects/<category>/<effect-id>/
  effect.json     # metadata (title, category, target, trigger, type, tags, source…)
  vanilla.css     # resting state + reduced-motion fallback
  vanilla.js      # Web Animations API implementation (the canonical version)
  gsap.js         # optional GSAP + ScrollTrigger port
  react.jsx       # optional React / Framer Motion port
  css-only.css    # for effects that need no JS
  demo.html       # self-contained live preview (used by the gallery)
```

Each effect lives in a **category folder** (where it acts) and is **tagged** in its
`effect.json` along four axes so you can find it any way you think:

- `target` — image, button, link, list, nav, text, heading, section, page
- `trigger` — load, scroll, hover, click, in-view, loop
- `type` — reveal, wipe, fade, parallax, magnetic, stagger, marquee, hover, loop, smooth-scroll
- `tags` — free keywords (clip-path, blur, 3d, lerp, …)

## Tech approach

Every effect ships a **vanilla** version (CSS + Web Animations API) as the
canonical, dependency-free source of truth. Optional **GSAP** and **React/Framer
Motion** ports are added per effect where useful. Two standing rules:

1. Every effect has at least the vanilla version.
2. Every effect respects `prefers-reduced-motion`.

## Finding effects

- **Visually:** open `gallery.html`, filter by category, search by tag/target, copy the stack you want.
- **Programmatically:** query `index.json` (e.g. find everything tagged `clip-path`, or all `buttons`).

## Adding a new effect

1. Copy `_template/` into `effects/<category>/<your-id>/`.
2. Fill in `effect.json` and the implementation files.
3. Add a `demo.html` (link your `vanilla.css` / `vanilla.js`).
4. Run `node scripts/build.mjs` to regenerate the catalog and gallery.

## Seeded effects

Three are **verified** against vanschneider.com (`clip-path-wipe`, `scroll-reveal`,
`sticky-tint`); the rest are common, reusable portfolio patterns
(`magnetic`, `underline-wipe`, `hover-image-trail`, `smooth-scroll`, `marquee`,
`stagger-reveal`).

## License

Personal reference repo. Add a license before sharing publicly if needed.
