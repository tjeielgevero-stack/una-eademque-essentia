# Una Eademque Essentia — Project Moon Character Archive

An unofficial, community-made Project Moon character and Mirror World variant builder. Desktop v1.0.1 is a minor maintenance release correcting the archive change record, aligning desktop version labels and installer links, and refreshing the offline cache. It follows the v1.0.0 super-massive release.

## Character creation
- Simple, Advanced, Complex, and one-page Laziness creation modes.
- Conditional questions, custom answers, randomization, and standardized copyable dossiers.
- Expanded personality, upbringing, reputation, professional specialty, and fictional combat-approach choices.
- Saved character archive with search across names, titles, and dossier text, creation-mode filters, and sorting.

## Personalization and settings
- Custom accent color, local background image, original ambient soundtrack, interface sounds, and 20 optional visual effects.
- Accessibility and performance controls: reduce motion, low-performance mode, high contrast, larger text, and compact layout.
- Creator preferences: show or hide question hints, confirm before deletion, remember the last creation mode, and choose how saved records are sorted.
- Archive preferences include default sorting. Personal settings and saved characters remain on the user's device.

## Multiplayer
- Shared-room battles, 1v1, 2v2, and free-for-all modes.
- Improved parry response windows and three-step QTE regression coverage.

## Files
- `index.html` — page structure, creator screens, archive, and Settings.
- `style.css` — responsive design, personalization, accessibility, and visual effects.
- `script.js` — creator flow, dossier formatter, archive, and preference storage.
- `multiplayer.js` — multiplayer interface.
- `multiplayer/src/index.js` — Cloudflare Worker game logic.
- `multiplayer/smoke-test.mjs` — multiplayer integration smoke tests.
- `data.js` and `lore-book.js` — character references and lore content.
- `service-worker.js` — offline app shell and cache updates.
- `src-tauri/` — Tauri desktop application and updater configuration.

## Deployment
The website deploys from the repository's `main` branch through Cloudflare Pages. The desktop Windows installer is built from the same shared application source, with desktop-only features retained.

This is an unofficial fan-made project and is not affiliated with or endorsed by Project Moon.
