# AI_HANDOFF_START_HERE — Game Info Beta V8

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct Light Sanctum URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- `main/beta` remains the long-lived browser-validation area.
- Production `game-info/` does not exist yet.
- Root production menu remains untouched.
- V8 is the current browser-validation target and is NOT SEALED.

## Product concept
Entry/display name: **也許有用的資訊**.

Current planned entries:
1. 光之聖所祈禱經驗表 — implemented.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

## Preserved data/table contract
The Light Sanctum page remains a five-column single-sheet table:
- 等級
- 升下一級 EXP
- 累積 EXP
- 每次祈禱 EXP
- 解鎖內容

Unlock content is derived from adjacent-level changes in `slotCount` and `presetCount`; no gameplay/data rule changed in V8.

## Why V8 exists
V7/V7-R1 revealed a design mistake: most smoke/refraction work was applied to the **whole page background**, while the table itself stayed visually close to the prior glass sheet. Increasing page-wide smoke made the page noisier without materially improving the table material.

User feedback after V7-R1:
- page-wide turbulence smoke is not desired;
- table layout/content is already clean;
- the high-quality glass effect must belong to the table itself, not the whole page background;
- saved image should follow the same accepted material direction.

## V8 — Table Glass Material Rebuild
### Page background
- Removes V7 page-wide turbulence smoke from presentation.
- Returns to a quiet cyan/lilac neutral gradient with only very low-contrast ambient light.
- The background is intentionally subordinate to the table.

### Main table material
- `data-section` is now the primary optical material.
- Added `table-glass-v8.svg`, a static optical texture used only inside the table.
- The table combines:
  - translucent glass fill;
  - directional specular highlight;
  - cyan/violet chromatic edge;
  - subtle internal warped optical bands;
  - backdrop blur/saturation;
  - continuous rows with hairline separators.
- The table remains one single glass sheet; individual rows are not cards.
- No continuous animation or WebGL loop.

### Unlock marker
- No left milestone line.
- No whole-row milestone tint.
- Unlock content keeps a small restrained emissive point.

### PNG export
- Added `v8-export.js` as a Beta override for the save/share button.
- It intercepts the V7 export handler in capture phase.
- PNG background is quiet/neutral rather than smoke-heavy.
- PNG uses the same `table-glass-v8.svg` optical texture inside the table.
- Export keeps the same five-column layout and unlock glow markers.

## V8 files
- `index.html` — V8 badge/cache and loads V8 assets.
- `style.css` — preserved V6 base layout/data sheet.
- `v7.css` — still loaded as historical override base, but V8 overrides page smoke/table material.
- `v8.css` — V8 table-material and background corrections.
- `table-glass-v8.svg` — static optical texture inside the table.
- `script.js` — preserved data/render logic.
- `v8-export.js` — V8 PNG export override.
- `data/catalog.json` — navigation catalog.
- `data/light-sanctum-pray-exp.json` — structured Light Sanctum data.

## Light Sanctum data authority
Source:
- `light-sanctum-pray/runtime/sanctuary-gameplay-data.js`
- Source schema: `MapleStoryM.SanctuaryGameplayWebData.P121`
- Snapshot reference: `75ab1b24b94e9ddf9d12545e4ab75c5b408a04ad`

Derived values remain unchanged:
- EXP to next level = next `needPoint` - current `needPoint`.
- CharacterCoin per Pray = `upgradeCostAmount0 × slotCount`.
- EXP per Pray = `gainPoint + gainPointPerCoin × CharacterCoin cost`.
- Unlock content = adjacent-level delta of `slotCount` / `presetCount` plus max-level state.

## Hard rules
- Keep data separate from UI.
- Preserve stable `?page=<id>` URLs.
- Do not blindly promote Beta-only governance/debug files.
- Do not introduce continuous high-cost animation solely for glass effects.
- Table material, not page background, is now the V8 visual priority.
- Production promotion remains blocked until Browser Acceptance PASS.

## Browser acceptance gate for V8
Check:
1. Whole-page background is quiet and no longer looks like smoke/noise.
2. Main table itself clearly reads as a distinct optical glass material.
3. Optical color/refraction should stay inside the table and not overwhelm text.
4. Five-column readability remains unchanged on desktop.
5. Phone portrait and landscape remain readable.
6. Unlock point is visible but not distracting.
7. Saved PNG should visually follow the same quiet-background / glass-table direction.
8. Dark mode.
9. Browser Back/Forward.
10. Static-view phone temperature/battery behavior.

## Promotion rule
After Browser Acceptance PASS:
- create `feature/game-info-release` from current `main`;
- fold accepted Beta V8 material into clean production files;
- do not blindly copy historical override layers (`v7.css`, Beta-only handoff, etc.);
- add official main-menu entry;
- update README / CI / release notes as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.
