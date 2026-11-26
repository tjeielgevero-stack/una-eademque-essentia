PROJECT MOON CHARACTER ARCHIVE — DESIGN & CATALOGUE NOTES

FILES

- index.html — page structure, welcome notice, Settings dialog, and image placement.
- style.css — responsive archive design, color picker, and motion.
- data.js — editable character and catalogue data.
- script.js — conditional questions, catalogue search/filter interactions, randomizer, summary export, and custom color persistence.
- assets/archive-clerk.webp — original unofficial homepage illustration.

CUSTOM COLOR SETTINGS

Visitors can open SETTINGS in the header. The 2D square adjusts saturation horizontally and brightness vertically; the rainbow slider changes hue. The selected accent is applied immediately and saved in the current browser.

EDITING CATALOGUES

Update the relevant arrays and records in data.js:
- L_CORP_ABNORMALITIES and OUTSIDE_L_CORP_ABNORMALITIES control the two Synergy paths.
- EGO_RECORDS contains documented Suit and Gift associations.
- L_CORP_WEAPON_SOURCES maps the corresponding equipment catalogue to source Abnormalities.
- DERIVED_WEAPON_SOURCES maps derived catalogue entries to their source where confirmed.
- LIMBUS_EGO_NAMES supplies the separate searchable archive.

DEPLOYMENT

Upload index.html, style.css, data.js, script.js, and the assets folder together to the same Cloudflare Pages directory. Do not omit data.js: script.js relies on the catalogue constants it defines. Keep the image at assets/archive-clerk.webp.

The builder is intended for general original characters and Mirror World variants. Character names are supplied by the user when creating a record; no individual character is hard-coded as the website's default subject.

This is an unofficial fan-made project and is not affiliated with or endorsed by Project Moon.
