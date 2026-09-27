# AI_HANDOFF_START_HERE — Game Info Beta V9

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct Light Sanctum URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- `main/beta` is the long-lived browser-validation area.
- Production `game-info/` does not exist yet.
- Root production menu remains untouched.
- V9 is the current browser-validation target and is NOT SEALED.

## Product concept
Entry/display name: **也許有用的資訊**.

Planned entries:
1. 光之聖所祈禱經驗表 — implemented.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

## Stable table/data contract
The Light Sanctum page remains a five-column single-sheet table:
- 等級
- 升下一級 EXP
- 累積 EXP
- 每次祈禱 EXP
- 解鎖內容

Unlock content is derived from adjacent-level changes in `slotCount` and `presetCount`.
No gameplay/data rule changed in V9.

## Why V9 exists
User browser feedback after V8:
- V8 table material finally started moving in the correct direction.
- However the original site cyan/lavender/pink background atmosphere disappeared because V8 made the page too neutral.
- Saved PNG showed the same issue: table material was present, but the overall composition became too white/flat.

Conclusion:
- Keep V8 table-glass direction.
- Restore the original site atmosphere outside the table.
- Do not return to V7 turbulence smoke.

## V9 changes
### Site atmosphere restored
- Adds `v9.css` after V8.
- Restores a soft cyan → lavender → pink site background inspired by the earlier/main-site visual language.
- Uses only large low-frequency ambient glows; no turbulence smoke/noise.
- Background stays secondary to the table.

### V8 table material preserved
- Keeps `table-glass-v8.svg` inside the table.
- Keeps single-sheet structure, directional highlight, internal chromatic refraction and continuous rows.
- Slightly reduces internal optical opacity so restored page colors and table material do not compete.
- Keeps unlock glow points and five-column typography.

### PNG export synchronized
- Existing `v8-export.js` updated to V9 visual behavior.
- Export now paints the restored cyan/lavender/pink site atmosphere first.
- The table then receives the same `table-glass-v8.svg` optical material.
- Saved image and live page therefore share the same hierarchy:
  1. site atmosphere outside;
  2. optical glass inside the table.

## Files
- `index.html` — V9 badge/cache and loads V9 stylesheet.
- `style.css` — preserved base layout/data sheet.
- `v7.css` — historical override layer still loaded underneath newer versions.
- `v8.css` — table-glass material rebuild.
- `v9.css` — restored site atmosphere and V8 tuning.
- `table-glass-v8.svg` — static optical texture inside table.
- `script.js` — preserved data/render logic.
- `v8-export.js` — V9-synchronized PNG export path.
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
- Do not introduce continuous high-cost animation solely for glass effects.
- Table material is the primary glass effect; page background is atmosphere only.
- Do not reintroduce page-wide turbulence smoke unless explicitly requested.
- Production promotion remains blocked until Browser Acceptance PASS.

## Browser acceptance gate for V9
Check:
1. Main-site cyan/lavender/pink atmosphere is visibly restored.
2. Background does not look like smoke/noise or fixed blobs.
3. V8 table material remains visible and distinct from the page background.
4. Table does not become too saturated after restoring site colors.
5. Five-column readability remains intact on desktop and phone.
6. Unlock glow points remain visible but restrained.
7. Saved PNG matches the live hierarchy: colored site atmosphere + optical table glass.
8. Dark mode.
9. Static-view phone temperature/battery behavior.

## Promotion rule
After Browser Acceptance PASS:
- create `feature/game-info-release` from current `main`;
- fold accepted Beta V9 rules into clean production files;
- do not blindly copy historical override layers or Beta-only handoff files;
- add official main-menu entry;
- update README / CI / release notes as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.
