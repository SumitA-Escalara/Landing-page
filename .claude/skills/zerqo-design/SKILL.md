---
name: zerqo-design
description: Design system and build rules for the Zerqo landing page (vanilla HTML/CSS/JS). Load before writing or editing any Zerqo page markup, styles, section, component, or animation — and before choosing colors, type, spacing, or motion. Triggers on "Zerqo", "landing page", "hero", "section", "design the site".
---

# Zerqo Landing Page — Design System

Zerqo is an AI-guided learning platform. Tagline: **"Learn with Direction."**
The page must feel like a **premium ed-tech product**, not a template: calm, confident,
tactile, with interactive proof of the product instead of stock-photo promises.

## References (what we borrow, what we don't)

| Source | Steal this | Don't steal |
|---|---|---|
| brilliant.org | Playful interactive widgets that *teach* in-page; friendly geometric illustration; generous whitespace | Their exact palette/mascot feel |
| quizlet.com | Crisp card metaphors, hard-edged clarity, strong CTA hierarchy | Dense dashboard chrome |
| studyfetch.com | Dark "AI product" surfaces, gradient glow accents, feature-grid rhythm | Cluttered badge spam |
| sanalabs.com | Restraint. Editorial type scale, huge headings, tons of air, enterprise polish | Their coldness — Zerqo is warmer |

Synthesis: **Brilliant's warm editorial calm + StudyFetch's pastel-block playfulness.**

### The look, precisely (from reference screenshots)
- Ground is **warm cream** `#FAF8F4`, cards white or deeper cream. Pure white is a card, never the page.
- Headings are a **SERIF** (Fraunces), with an *italic* word used as the emphasis device —
  "Learning that *adapts to you*", "Built to make you *think*". One italic per headline, max.
- Body is small, muted, sans (Inter) — deliberately quieter than the headline.
- **Pastel blocks** carry the visual weight: mint, lime, lavender, peach, sky, butter.
  Large rounded panels (24-32px radius) holding product mockups.
- CTAs are **solid near-black pills**; secondary is a white pill with a hairline border.
- Rhythm is **alternating image/text rows**, not endless card grids.
- **Hand-drawn line doodles** (thin 1.5px strokes) and curved arrows in the margins.
- Exactly one or two **dark bands** for contrast (stats + footer).

## Non-negotiables

1. **Vanilla only.** `index.html`, `css/`, `js/`. No frameworks, no build step, no Tailwind CDN.
2. **LIGHT-FIRST.** Warm cream ground (never pure white), dark band used only as *contrast punctuation*. Dark theme is an optional swap via `[data-theme="dark"]`. Every color is a token.
3. **Every section earns its place.** If a section is just a headline + 3 icons, cut it or make it interactive.
4. **Motion is reveal-on-scroll + micro-interaction only.** Never autoplaying carousels, never bouncing.
5. **Mobile is a real design**, not a squashed desktop. Test 375 / 768 / 1440.
6. **Accessibility is part of "premium":** visible focus rings, 4.5:1 body contrast, `prefers-reduced-motion`, semantic landmarks, alt text.

## Tokens (`css/tokens.css` — single source of truth)

```css
:root{
  /* ink & surface — dark first */
  --bg:#08090C; --surface:#0F1116; --surface-2:#161923; --line:#232734;
  --text:#F2F4F8; --text-2:#A2A9BA; --text-3:#6D7488;
  /* brand */
  --brand:#6C5CE7;      /* violet — primary action */
  --brand-2:#00D2A8;    /* mint — progress, success, "you got it" */
  --accent:#FFB443;     /* amber — streaks, highlights, sparingly */
  --glow:radial-gradient(60% 60% at 50% 0%, rgba(108,92,231,.35), transparent 70%);
  /* type */
  --font-display:"Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-body:"Inter", ui-sans-serif, system-ui, sans-serif;
  /* fluid scale */
  --t-hero:clamp(2.75rem,1.6rem + 5.2vw,5.5rem);
  --t-h2:clamp(2rem,1.3rem + 3vw,3.5rem);
  --t-h3:clamp(1.25rem,1.1rem + .8vw,1.75rem);
  --t-body:clamp(1rem,.97rem + .2vw,1.125rem);
  --t-small:.875rem;
  /* space — 4px base, 8px rhythm */
  --s-1:.25rem; --s-2:.5rem; --s-3:.75rem; --s-4:1rem; --s-6:1.5rem;
  --s-8:2rem; --s-12:3rem; --s-16:4rem; --s-24:6rem; --s-32:8rem;
  --section-y:clamp(4rem,10vw,8rem);
  /* form */
  --r-sm:8px; --r-md:14px; --r-lg:22px; --r-pill:999px;
  --shadow:0 20px 60px -20px rgba(0,0,0,.7);
  --ring:0 0 0 3px rgba(108,92,231,.45);
  --ease:cubic-bezier(.22,1,.36,1); --dur:.5s;
  --container:1200px; --container-narrow:760px;
}
```

Rules: never hardcode a hex or px spacing in a component — add a token.
Gradients only on: hero glow, CTA band, one accent per section max.

## Type rules
- Display font for h1/h2 and stat numerals only. Body font everywhere else.
- Headline `letter-spacing:-.03em`, `line-height:1.05`. Body `line-height:1.65`, max `68ch`.
- One h1 per page. Never center a paragraph longer than 2 lines.
- Eyebrow label: `--t-small`, uppercase, `letter-spacing:.12em`, `--text-3`.

## Layout
- `.container{max-width:var(--container);margin-inline:auto;padding-inline:clamp(1rem,4vw,2rem)}`
- 12-col CSS grid, `gap:var(--s-6)`. Break the grid deliberately once (bento or offset feature) — not everywhere.
- Alternate section rhythm: full-bleed dark → contained surface → full-bleed dark. Avoid 5 identical stacked bands.
- Breakpoints: `480 / 768 / 1024 / 1280`. Mobile-first `min-width` queries.

## Components
- **Button**: pill, `--brand` fill, weight 600, 14px/28px padding. Hover: `translateY(-2px)` + brand glow shadow. Secondary = 1px `--line` border on transparent. Ghost = text + arrow that slides 4px on hover.
- **Card**: `--surface-2`, 1px `--line`, `--r-lg`. Hover: border lifts to `--brand` at 40% + `--shadow`. Optional cursor-tracking gradient spotlight via CSS vars set in JS.
- **Nav**: fixed, transparent → `backdrop-filter:blur(14px)` + `--surface` at 80% after 24px scroll. Mobile: full-screen overlay, staggered link reveal.
- **Section header**: eyebrow → h2 → one-line sub, left-aligned by default.

## Motion
- Reveal: `opacity 0→1`, `translateY(24px→0)`, `--dur` `--ease`, stagger 60–80ms, via `IntersectionObserver` (threshold .15, once).
- Micro: hover lifts, magnetic CTA, animated counters, progress bars filling on view.
- Hero may have one ambient element (grid, aurora, orbiting nodes) — CSS/canvas, capped at 60fps, paused off-screen.
- Wrap all of it: `@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`

## Page structure (v1)
1. Nav
2. Hero — headline, sub, dual CTA, live interactive demo (a real Zerqo question card the visitor can answer), trust strip
3. Logo/credibility marquee
4. Problem → "Learn with Direction" narrative
5. How it works — 3 steps, scroll-linked
6. Features — bento grid, one hero tile + supporting tiles
7. Interactive proof — mini learning path / adaptive quiz
8. Stats band — animated counters
9. Testimonials
10. Pricing
11. FAQ — accordion
12. Final CTA band
13. Footer

Copy comes from the Zerqo content reference — **use its real copy, never lorem ipsum**.
If the copy isn't available yet, write on-brand placeholder and flag it in the response.

## File layout
```
index.html
css/  tokens.css  base.css  components.css  sections.css  responsive.css
js/   main.js  reveal.js  nav.js  demo.js
assets/ (svg, inline where small)
```

## Definition of done for any section
- Uses only tokens · responsive at 375/768/1440 · keyboard reachable with visible focus
- Reveal animation wired · reduced-motion safe · no layout shift · real copy
