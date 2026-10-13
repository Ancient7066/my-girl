# For Aashi, from Vikram

A quiet, self-contained twilight journey built with Vite, React, TypeScript, Three.js, React Three Fiber, and Drei. The scenes use procedural geometry and CSS. The page does not load remote fonts, models, images, or scripts. It also includes a CSS version of the same journey for WebGL-off and low-power devices.

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The production site is written to `dist/`.

## Edit the words

All on-screen copy is in [`src/content.ts`](src/content.ts). Update the recipient and sender names, star notes, flower messages, grounding prompts, memory placeholders, choice collections, letter, and closing message there. The memory cards are deliberately placeholders. Replace the text only with memories you know are real. The letter is marked `VIKRAM: EDIT HERE`.

## Deploy as static files

Build the site, then publish the `dist/` directory. For Netlify or Vercel, use `npm run build` as the build command and `dist` as the output directory. For GitHub Pages, publish the same `dist/` output from a Pages workflow or static hosting action. The relative Vite base path supports project subpaths.

## Controls and privacy

Sound starts off and is created locally with Web Audio after the sound button is pressed. Quiet mode turns off sound, motion, and most particles. Progress and preferences are stored in local storage when available; if browser storage is unavailable, the page still works for the current visit. No reply is requested.
