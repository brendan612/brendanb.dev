# brendanb.dev

Personal website built with Astro + Bun.

## Stack

- Astro 7
- Bun runtime/package manager
- Astro Content Collections for project content
- React island for lightweight homepage interactivity
- CSS Modules + global design tokens

## Pages

- `/` homepage portfolio
- `/projects` project listing
- `/projects/[slug]` project detail pages
- `/about`
- `/contact`

## Commands

```sh
bun install
bun run dev
bun run check
bun run build
bun run preview
```

## Content

Project entries live in `src/content/projects/*.md`.

## Design

Palette and typography live in `src/styles/tokens.css`. The background cursor trail
lives in `src/components/site/CursorTrail.astro`; it runs only for mouse input,
respects reduced motion, and stops animating when the trail fades.
