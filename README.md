# Una Eademque Essentia — Project Moon Character Archive

An unofficial, community-made Project Moon character and Mirror World variant builder. U.E.E Rebuilt is the v2.0.0 major desktop rebuild: it uses an independent desktop entry point, a new guided Character Creator, and a separate Character Archive. The website continues to use its own frontend.

## Website character creation
The website continues to use its original browser-based creator and archive. It remains separate from the desktop application.

## U.E.E Rebuilt Desktop v2.0.0
- Independent desktop frontend at `desktop/index.html`; the website landing page is not bundled into the desktop app.
- Completely new five-section guided Character Creator.
- Completely new Character Archive with search, sorting, record preview, editing, copying, and deletion.
- The rebuilt archive uses the separate `uee_rebuilt_character_archive_v1` local-storage namespace. Older website and desktop records are not automatically imported.
- Preserved desktop modules: Settings, 20 visual effects, accessibility and performance controls, custom background, ambient music and interface sounds, Lore Book, Mirror Arena simulator, Multiplayer Arena, Mirror Observatory, and the hidden Sephrus gate.

## Personalization and settings
- Custom accent color, local background image, original ambient soundtrack, interface sounds, and 20 optional visual effects.
- Accessibility and performance controls: reduce motion, low-performance mode, high contrast, larger text, and compact layout.
- Creator preferences: show or hide question hints, confirm before deletion, remember the last creation mode, and choose how saved records are sorted.
- Archive preferences include default sorting. Personal settings and saved characters remain on the user's device.

## Multiplayer
- Shared-room battles, 1v1, 2v2, and free-for-all modes.
- Improved parry response windows and three-step QTE regression coverage.

## Files
- `index.html` — website entry point and browser-based experience.
- `style.css` — responsive design, personalization, accessibility, and visual effects.
- `script.js` — website creator flow, dossier formatter, archive, and preference storage.
- `multiplayer.js` — multiplayer interface.
- `multiplayer/src/index.js` — Cloudflare Worker game logic.
- `multiplayer/smoke-test.mjs` — multiplayer integration smoke tests.
- `data.js` and `lore-book.js` — character references and lore content.
- `service-worker.js` — offline app shell and cache updates.
- `desktop/` — independent U.E.E Rebuilt desktop frontend, new Creator and Archive, preserved desktop modules, and desktop smoke checks.
- `src-tauri/` — Tauri desktop application and updater configuration.

## Deployment
The website deploys from the repository's `main` branch through Cloudflare Pages. The desktop Windows installer is built from `desktop/index.html` through Tauri. The new Character Archive uses its own local-storage namespace and does not automatically import older records.

This is an unofficial fan-made project and is not affiliated with or endorsed by Project Moon.
