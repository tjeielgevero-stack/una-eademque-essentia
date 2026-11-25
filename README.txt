PROJECT MOON VARIANT BUILDER — CATALOGUE DATA REFACTOR

FILES

- index.html — page structure; loads data.js before script.js.
- style.css — visual design, responsive layout, and existing animations.
- data.js — editable Synergy, Suit, and Gift catalogue data, plus an empty E.G.O Weapon catalogue.
- script.js — page behavior, search/filter logic, character questions, and animations behavior.

EDITING CATALOGUES

Update the relevant arrays and records in data.js:
- L_CORP_ABNORMALITIES and OUTSIDE_L_CORP_ABNORMALITIES control the two Synergy paths.
- EGO_RECORDS contains the documented Suit and Gift associations.
- EGO_SUIT_CATALOGUE and EGO_GIFT_CATALOGUE are derived automatically from EGO_RECORDS.
- L_CORP_WEAPON_SOURCES maps every Lobotomy Corporation E.G.O Weapon to its source Abnormality; L_CORP_EGO_WEAPON_CATALOGUE is derived from it.
- DERIVED_WEAPON_SOURCES maps Limbus Company E.G.O from non-L-Corp. Abnormalities to their source; DERIVED_EGO_WEAPON_CATALOGUE is derived from it. Add new lines there as more sources are confirmed.
- The E.G.O Weapon field shows the L Corp. list on the refined Lobotomy path and the derived list on the Abnormality-derived path, and still allows custom text.
- Archive cards now show a WEAPON line and a USE WEAPON button when a weapon is mapped to that Abnormality.

DEPLOYMENT

Upload all four files (index.html, style.css, data.js, and script.js) together to the same Cloudflare Pages directory. Do not omit data.js: script.js relies on the catalogue constants it defines.

NOTES

The existing CSS animation and responsive layout rules are retained. The fourth slot is a generic user-editable E.G.O Weapon placeholder.

E.G.O PATHS (three)

1. Uses refined Lobotomy E.G.O. equipment - L Corp. facility Abnormalities; 65 L Corp. weapons, suits, gifts.
2. Uses Abnormality-derived E.G.O. - E.G.O. like Hohenheim's AEDD or Gubo's Fell Bullet (DERIVED_EGO_WEAPON_CATALOGUE / DERIVED_WEAPON_SOURCES).
3. Uses Abnormality E.G.O. (Sinner-issued) - what the Sinners use. It has ONE field and ONE search catalogue: all Limbus Company E.G.O. (SINNER_EGO_WEAPON_CATALOGUE, built from LIMBUS_EGO_NAMES). No synergy, suit, weapon, or gift fields; those belong to paths 1 and 2 only.
Paths are chosen by egoPathOf() in script.js.
