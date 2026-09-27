# AI_HANDOFF_START_HERE — Game Info Beta V7

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development policy: `main/beta` is the long-lived research / browser-validation area; a feature branch is only required later for Beta → Production promotion.
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct Light Sanctum URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` still does **not** exist.
- Root production menu remains intentionally untouched.
- V1～V6 were browser-reviewed. V7 is the current visual-validation target and is **NOT SEALED** yet.

## Product concept
Entry/display name: **也許有用的資訊**.

This is a data/reference center rather than another simulator. Planned entries:
1. 光之聖所祈禱經驗表 — implemented.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

## V7 feedback basis
User feedback on V6:
- Five-column table is now clean and should remain.
- V6 background still looked like fixed-shaped color diffusion rather than actual smoke.
- V6 left-side milestone line on Lv.1 / 3 / 7 / 11 / 15 looked like a selection indicator and should be removed.
- Unlock text should visually harmonize better with the numeric data while remaining tertiary.

## V7 changes
### Real static smoke texture
- Added `smoke-v7.svg`.
- Smoke is generated from static SVG `feTurbulence` / `feDisplacementMap` / blur filters rather than CSS radial-gradient blobs.
- Multiple irregular cyan / violet / rose smoke bodies use different noise seeds and scales.
- No SVG animation, CSS animation, WebGL loop or continuously updating shader is used.
- `v7.css` replaces the V6 radial smoke pseudo-element with the static turbulence image.
- Mobile uses a lower-opacity smoke field and no continuous processing.

### Milestone presentation
- Removed the left vertical milestone indicator from special levels.
- Removed milestone-specific whole-row background emphasis.
- Only `解鎖內容` receives a small iridescent dot when the level has a meaningful unlock/change.
- This avoids making Lv.1 / 3 / 7 / 11 / 15 look selected.

### Unlock typography
- `解鎖內容` remains the tertiary information tier.
- Font size/weight were raised slightly so it visually belongs to the table rather than looking like debug annotation.
- It remains lighter than Lv./numeric data.
- Desktop target: 11px / weight 560.
- Mobile target: 9.5px / weight 550.

## Preserved V6 structure
V7 intentionally does **not** rewrite the V6 data/runtime logic.

The main table remains five columns:
- 等級
- 升下一級 EXP
- 累積 EXP
- 每次祈禱 EXP
- 解鎖內容

Unlock content is still derived automatically from adjacent-level changes in `slotCount` and `presetCount`:
- Lv.1: initial slot/preset state.
- Slot increase: `第 N 個欄位`.
- Preset increase: `第 N 組預設`.
- Final level: `滿等`.
- No change: `—`.

The V5/V6 single Optical Liquid Glass sheet remains the table architecture.

## V7 implementation files
- `index.html` — loads V6 base CSS + V7 visual override; displays V7 beta badge.
- `style.css` — preserved V6 base layout and single-sheet implementation.
- `v7.css` — V7 smoke/milestone/typography overrides only.
- `smoke-v7.svg` — static turbulence smoke texture.
- `script.js` — preserved V6 data/render/export logic.
- `data/catalog.json` — navigation catalog.
- `data/light-sanctum-pray-exp.json` — structured Light Sanctum data.
- `AI_HANDOFF_START_HERE.md` — this handoff.

## Light Sanctum data authority
Source:
- `light-sanctum-pray/runtime/sanctuary-gameplay-data.js`
- Source schema: `MapleStoryM.SanctuaryGameplayWebData.P121`
- Snapshot reference: `75ab1b24b94e9ddf9d12545e4ab75c5b408a04ad`

Derived values remain:
- EXP to next level = next `needPoint` - current `needPoint`.
- CharacterCoin per Pray = `upgradeCostAmount0 × slotCount`.
- EXP per Pray = `gainPoint + gainPointPerCoin × CharacterCoin cost`.
- Unlock content = adjacent-level delta of `slotCount` / `presetCount` plus max-level state.

## Hard rules
- Keep data separate from UI.
- Preserve stable `?page=<id>` URLs.
- Do not blindly copy Beta governance/debug files into production.
- Do not introduce continuous high-cost animation purely for glass/smoke effects.
- Production promotion remains blocked until Browser Acceptance PASS.
- V7 is a visual override layer so V6 core data logic remains easy to compare and roll back.

## Browser acceptance gate for V7
Check:
1. Desktop background should read as irregular smoke/clouds, not radial light blobs.
2. Phone portrait smoke should remain visible but not overpower text.
3. Smoke should look static and not cause obvious battery/thermal load while idle.
4. No left selection-like line should remain on Lv.1 / 3 / 7 / 11 / 15.
5. Unlock iridescent dot should be enough to identify special levels without coloring the whole row.
6. Unlock text should feel integrated with the table but remain less prominent than numeric data.
7. Five-column single-sheet layout must remain unchanged.
8. Dark mode.
9. `儲存 / 分享表格圖片` remains functional; PNG still uses V6 five-column export until live V7 visual direction is accepted.
10. Browser Back/Forward.

## Promotion rule
After Browser Acceptance PASS:
- create `feature/game-info-release` from current `main`;
- selectively promote user-facing files only;
- fold accepted V7 override rules into the production stylesheet rather than blindly copying Beta governance files;
- add official main-menu entry;
- update README / CI / release notes as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.
