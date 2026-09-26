# AI_HANDOFF_START_HERE — Game Info Beta V1

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development policy: `main/beta` is the long-lived research / browser-validation area; a feature branch is only required later for Beta → Production promotion.
- New Beta root: `beta/game-info/`
- Public Beta URL after GitHub Pages deploys: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct first-page URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` does **not** exist yet and must not be created until user Browser Acceptance PASS.
- Root production menu is intentionally untouched in V1.

## Product concept
Entry/display name: **也許有用的資訊**.

This is a data / reference center rather than another simulator. It should host game tables, thresholds, growth requirements and other evidence-backed static information.

Planned entries:
1. 光之聖所祈禱經驗表 — V1 implemented.
2. 海洛斯的封印標準 — placeholder / coming soon.
3. 星座核心需求表 — placeholder / coming soon.
4. 六轉核心需求表 — placeholder / coming soon.

## V1 architecture
Files:
- `index.html` — standalone Beta shell; noindex/nofollow.
- `style.css` — responsive glass UI following the main site's light/dark visual language.
- `script.js` — query-string routing, theme handling, catalog rendering and data-table rendering.
- `data/catalog.json` — navigation catalog; future entries should be added here.
- `data/light-sanctum-pray-exp.json` — first structured game-data page.

Rules:
- Keep data separate from UI.
- Prefer JSON updates for game-data revisions rather than hard-coding numbers in HTML.
- Each ready page should have a stable `?page=<id>` URL for mobile sharing/testing.
- Beta-only governance/debug/handoff files must not be blindly copied into future production.

## Light Sanctum data authority
Source:
- `light-sanctum-pray/runtime/sanctuary-gameplay-data.js`
- Source schema: `MapleStoryM.SanctuaryGameplayWebData.P121`
- Snapshot reference commit used for V1 data extraction: `75ab1b24b94e9ddf9d12545e4ab75c5b408a04ad`

Direct fields retained in the JSON:
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

Known level thresholds copied from the existing formal simulator data:
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

Milestones shown in V1:
- Lv1: 1 slot, Preset 1 / 2.
- Lv3: slot 2.
- Lv7: slot 3.
- Lv11: slot 4 + Preset 3.
- Lv15: slot 5 + max level.

## Responsive behavior
Desktop/tablet:
- Full data table.
- Summary cards for max level, total EXP, max slots and max Presets.

Phone:
- Table is replaced with vertically stacked per-level cards.
- Top navigation compresses to a single back button + centered title + theme button.
- User should explicitly browser-test narrow portrait and landscape layouts.

## Browser acceptance gate
V1 is **NOT SEALED** yet.

Required user checks:
1. Open the Beta URL on desktop and phone.
2. Confirm the information-home cards look correct.
3. Open 光之聖所祈禱經驗表 and verify the numbers / labels visually.
4. Check phone portrait layout, especially Lv cards and summary cards.
5. Check dark mode.
6. Confirm browser Back/Forward works after entering/leaving the data page.

Only after Browser Acceptance PASS should production promotion be planned.

## Future promotion rule
Do not copy the entire Beta directory into production.

At promotion time:
- create `feature/game-info-release` (or equivalent) from current `main`;
- selectively promote user-facing `index.html`, `style.css`, `script.js`, and `data/`;
- set production cache-bust strings;
- add the official main-menu entry;
- update README / CI / release notes only as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.

## Next step
User Browser Acceptance for Beta V1, followed by layout/data corrections if any.
