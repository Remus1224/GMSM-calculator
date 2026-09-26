# AI_HANDOFF_START_HERE — Game Info Beta V2

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development policy: `main/beta` is the long-lived research / browser-validation area; a feature branch is only required later for Beta → Production promotion.
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct first-page URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` still does **not** exist.
- Root production menu is intentionally untouched.
- V1 browser review found layout/style direction issues; V2 responds to that feedback and is **NOT SEALED** yet.

## Product concept
Entry/display name: **也許有用的資訊**.

This is a data / reference center rather than another simulator. It hosts game tables, thresholds, growth requirements and other evidence-backed static information.

Planned entries:
1. 光之聖所祈禱經驗表 — implemented.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

## V2 visual direction
User feedback on V1:
- Glass styling did not sufficiently match the main site.
- Desktop and phone should both use simple one-row-per-entry / one-row-per-level presentation.
- Avoid oversized mobile cards.
- Glass effect should feel more premium than the existing Genesis Liberation calculator.

V2 changes:
- Home catalog changed from large cards to compact glass rows.
- Light Sanctum summary changed from four separate cards to one compact summary strip.
- Desktop and phone now share the same row-based level structure.
- Mobile no longer replaces rows with large per-level cards.
- Milestone rows remain compact and use a subtle accent.
- Glass material uses higher translucency, stronger edge highlights, interior reflection, background color transmission, blur and saturation.
- Layout remains intentionally minimal.

## V2 table image export
The Light Sanctum page now includes:
- `儲存 / 分享表格圖片`

Implementation policy:
- No screenshot permission and no server are required.
- The page programmatically redraws the data to a dedicated high-resolution Canvas.
- Canvas exports a PNG independent of the user's screen width.
- On devices supporting Web Share with files, the PNG is passed to the system share sheet.
- Otherwise the PNG is downloaded through an object URL.
- Web browsers cannot silently write directly to the phone photo library; the user must confirm via the system share/download UI.
- No third-party DOM screenshot library is used.

## Architecture
Files:
- `index.html` — standalone Beta shell; noindex/nofollow.
- `style.css` — responsive glass UI.
- `script.js` — query routing, theme handling, data rendering and PNG export.
- `data/catalog.json` — navigation catalog.
- `data/light-sanctum-pray-exp.json` — first structured game-data page.
- `AI_HANDOFF_START_HERE.md` — this handoff.

Rules:
- Keep data separate from UI.
- Prefer JSON updates for game-data revisions rather than hard-coding numbers in HTML.
- Each ready page should have a stable `?page=<id>` URL.
- Do not blindly copy Beta governance/debug files into production.

## Light Sanctum data authority
Source:
- `light-sanctum-pray/runtime/sanctuary-gameplay-data.js`
- Source schema: `MapleStoryM.SanctuaryGameplayWebData.P121`
- Snapshot reference used for V1/V2 data extraction: `75ab1b24b94e9ddf9d12545e4ab75c5b408a04ad`

Direct fields retained:
- `level`
- `needPoint`
- `gainPoint`
- `gainPointPerCoin`
- `slotCount`
- `presetCount`
- `upgradeCostAmount0`

UI-derived values:
- EXP to next level = next `needPoint` - current `needPoint`.
- CharacterCoin per Pray = `upgradeCostAmount0 × slotCount`.
- EXP per Pray = `gainPoint + gainPointPerCoin × CharacterCoin cost`.

Known cumulative EXP thresholds:
- Lv1 0
- Lv2 50
- Lv3 150
- Lv4 750
- Lv5 1,550
- Lv6 2,550
- Lv7 3,750
- Lv8 5,050
- Lv9 6,450
- Lv10 7,950
- Lv11 9,450
- Lv12 11,450
- Lv13 13,450
- Lv14 15,450
- Lv15 17,450

Milestones:
- Lv1: 1 slot, Preset 1 / 2.
- Lv3: slot 2.
- Lv7: slot 3.
- Lv11: slot 4 + Preset 3.
- Lv15: slot 5 + max level.

## Browser acceptance gate
V2 requires user browser testing before any production promotion.

Required checks:
1. Desktop row layout and glass quality.
2. Phone portrait row layout and legibility.
3. Phone landscape layout.
4. Dark mode.
5. `儲存 / 分享表格圖片` on desktop.
6. `儲存 / 分享表格圖片` on phone and whether the share sheet can save/share the PNG.
7. Browser Back/Forward between information home and detail page.

## Promotion rule
Do not copy the entire Beta directory into production.

After Browser Acceptance PASS:
- create `feature/game-info-release` from current `main`;
- selectively promote user-facing `index.html`, `style.css`, `script.js`, and `data/`;
- set production cache-bust strings;
- add the official main-menu entry;
- update README / CI / release notes as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.

## Next step
User Browser Acceptance for Beta V2 and any visual/export corrections.
