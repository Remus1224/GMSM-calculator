# AI_HANDOFF_START_HERE — Game Info Beta V10

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Branch/workflow: direct development on `main/beta` until Browser Acceptance PASS.
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct Light Sanctum URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- V10 name: **Theme / Export / Unlock Marker Closure**.
- V10 implementation baseline: main commit `447276d1092f585a345c62c39b2a50b9c61349a8` (V9 handoff head before this implementation).
- Production `game-info/` still does not exist.
- Production main-menu entry remains untouched.
- Formal Light Sanctum simulator remains untouched.
- **Browser Acceptance for V10 is NOT PASS yet.**
- Production promotion remains blocked until the user completes V10 Browser Acceptance.

## Product concept
Entry/display name: **也許有用的資訊**.

Planned entries:
1. 光之聖所祈禱經驗表 — implemented and under visual/browser validation.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

This area is a data-oriented information center, not a simulator.

## Stable table/data contract — DO NOT REDESIGN
The Light Sanctum page remains a five-column single-sheet table:
- 等級
- 升下一級 EXP
- 累積 EXP
- 每次祈禱 EXP
- 解鎖內容

The old separate 欄位 / Preset / 里程碑 presentation must not return.
Player-facing unlock text is derived from adjacent-level changes in `slotCount` and `presetCount`; the derivation remains in `script.js` and was not changed in V10.
The table remains one continuous **single-glass data sheet** with hairline row separators, centered headers/numbers and unlock content as tertiary information.

## Light Sanctum data authority — unchanged
Source:
- `light-sanctum-pray/runtime/sanctuary-gameplay-data.js`
- Source schema: `MapleStoryM.SanctuaryGameplayWebData.P121`
- Snapshot reference: `75ab1b24b94e9ddf9d12545e4ab75c5b408a04ad`

Derived values remain unchanged:
- EXP to next level = next `needPoint` - current `needPoint`.
- CharacterCoin per Pray = `upgradeCostAmount0 × slotCount`.
- EXP per Pray = `gainPoint + gainPointPerCoin × CharacterCoin cost`.
- Unlock content = adjacent-level delta of `slotCount` / `presetCount` plus max-level state.

V10 did not modify `data/catalog.json`, `data/light-sanctum-pray-exp.json`, routing, gameplay formulas or structured data.

## V9 browser feedback that defines V10
Accepted from V9:
- Main-site cyan / lavender / pink atmosphere returned in light mode.
- V8 table-glass direction is correct and must remain.
- Single-glass five-column table is correct.
- Typography and data hierarchy are basically acceptable.

Open V9 problems closed by the V10 implementation:
1. Dark mode had excessive purple/pink neon and muddy glow.
2. Saved PNG used a separately hard-coded light palette and therefore looked like a different design from the live page.
3. Unlock markers were emissive circular dots and looked like notifications/selection indicators.

## V10 implementation

### A. Dark Theme Closure
New file: `v10.css`.

V10 introduces an independent dark palette rather than inverting the light palette:
- page base: deep navy / charcoal blue (`#050b12` → `#09111b` → `#10131c`);
- glass: cool gray-blue translucent surfaces;
- cyan and violet only as restrained edge/refraction accents;
- pink reduced to a very small secondary accent;
- dark table optical texture opacity is heavily reduced;
- dark specular highlight is thin and low-opacity;
- note panel receives its own clearer cool glass surface so text is not hidden by gray haze;
- `Client Table` chip, beta chip, nav controls and action button receive dark-specific neutral/cool treatment;
- dark text variables were rebalanced for stable contrast.

No continuous animation, RAF, WebGL or animated turbulence was added.
All atmosphere and glass effects are static CSS gradients, static SVG, backdrop filtering and pseudo-elements.
Mobile blur/saturation are reduced relative to desktop.

### B. Shared visual tokens / Export Parity Closure
`v10.css` is now the visual-token owner for V10. It defines shared custom properties for:
- light/dark page background colors;
- cyan/violet/pink ambient atmosphere;
- veil colors;
- panel glass fill/border colors;
- table glass fill/border colors;
- table optical/specular intensity;
- row separator color;
- unlock marker colors.

New file: `v10-export.js`.

The previous `v8-export.js` is retained only as historical Beta fallback but is **no longer loaded by `index.html`**.
The V10 export path does not own an independent hard-coded theme anymore. At export time it reads the currently active CSS custom properties via `getComputedStyle(document.documentElement)`.

Export also reads the actual rendered five-column table rows from the live DOM instead of reimplementing EXP/unlock derivation. This means:
- `script.js` remains the single derivation path for player-visible table content;
- export cannot silently drift to a second unlock/EXP formula;
- current live Light/Dark theme controls the saved PNG;
- saved filenames include `日間` or `夜間` for test clarity.

The live table and PNG both reuse the same static optical asset:
- `table-glass-v8.svg`

The export remains Canvas-based because direct DOM screenshot approaches are not sufficiently reliable for Safari/iOS `backdrop-filter`, cross-browser rasterization and GitHub Pages without adding a large dependency.

### Export parity limits
V10 is single-source for palette/tokens, table optical asset, unlock marker colors and live row text. However Canvas cannot obtain the browser compositor's exact already-blurred backdrop pixels, so these browser-rendering details may still differ slightly:
- exact `backdrop-filter` blur kernel;
- blend/compositing implementation;
- font rasterization/anti-aliasing;
- Safari vs Chromium color/compositor behavior.

Target is visual near-parity, not byte/pixel identity. Browser Acceptance must judge this by eye in both themes.

### C. Unlock Marker Closure
The old circular emissive dot is removed by the V10 override.
The final marker is a **short iridescent glass lozenge**:
- short horizontal capsule;
- cyan → restrained violet → soft pink;
- thin glass edge;
- no external glow;
- no whole-row tint;
- no milestone side line;
- smaller on mobile.

`v10-export.js` draws the same short lozenge style before unlock text in saved PNGs.

## File map after V10
- `index.html` — V10 badge/cache, loads `v10.css` and `v10-export.js`.
- `style.css` — preserved base layout/data sheet.
- `v7.css` — historical override layer, still loaded underneath newer layers.
- `v8.css` — V8 single-table optical glass foundation.
- `v9.css` — V9 light-site atmosphere restoration layer.
- `v10.css` — **current shared visual-token + theme closure layer**.
- `table-glass-v8.svg` — static optical table texture shared by live and export.
- `smoke-v7.svg` — historical asset; V10 does not restore V7 page-wide smoke.
- `script.js` — unchanged data/routing/render derivation logic.
- `v8-export.js` — historical export fallback, not loaded by V10.
- `v10-export.js` — **current export path**; reads live CSS tokens + live table DOM.
- `data/catalog.json` — unchanged navigation catalog.
- `data/light-sanctum-pray-exp.json` — unchanged structured Light Sanctum data.

## Hard rules
- Do not change the five-column contract without explicit user instruction.
- Do not split unlock content back into separate 欄位 / Preset / milestone columns.
- Keep data separate from presentation.
- Preserve stable `?page=<id>` routing.
- Do not change gameplay data or EXP formulas in visual/theme work.
- Keep the table as one continuous glass sheet, not one card per level.
- Table material is the primary glass effect; page background remains secondary atmosphere.
- Do not return to page-wide turbulence smoke or obvious fixed neon blobs.
- Do not add continuous animation, RAF loops, WebGL loops or animated turbulence for decoration.
- Keep mobile idle rendering static and lower-intensity than desktop.
- Export must follow the currently active light/dark theme.
- Export must not maintain a separate independent palette.
- Production promotion remains blocked until Browser Acceptance PASS.

## V10 Browser Acceptance gate — next action
The user must test the deployed Beta page directly.

### Light mode
1. V9 cyan / lavender / pink site atmosphere is still present.
2. Background remains secondary and does not become smoke/noise or obvious color blobs.
3. V8 single-sheet table glass still has visible material/refraction.
4. New short unlock marker is natural and does not look like a notification dot.
5. Five-column readability remains intact.

### Dark mode
1. No large purple/pink neon cast.
2. Overall impression is deep navy / charcoal + cool gray-blue glass.
3. Cyan/violet refraction is subtle; pink is only a trace accent.
4. Hero/table/note panel have clear hierarchy.
5. Note text is not hidden by gray haze.
6. `Client Table`, navigation and theme toggle look native to the dark palette.
7. All text is clearly readable.

### Saved image
Test both separately:
1. Light mode → Save/Share image.
2. Dark mode → Save/Share image.
3. Compare live page vs PNG by eye: page atmosphere, table material, text palette and unlock marker should be very close.
4. Confirm Dark export is actually dark and Light export is actually light.

### Mobile
Test:
- portrait;
- landscape;
- idle thermal/temperature behavior with no interaction.

## Promotion rule — still blocked
Do **not** create production `game-info/` before V10 Browser Acceptance PASS.

After PASS only:
1. Create `feature/game-info-release` from latest accepted `main`.
2. Selectively promote validated Beta behavior into production `game-info/`.
3. Exclude Beta-only files such as `AI_HANDOFF_START_HERE.md`, debug/local preview helpers and historical temporary override layers.
4. Add production main-menu entry: **也許有用的資訊**.
5. Update README / CI / release notes as appropriate.
6. PR → CI → diff review → merge → Pages deployment → Production Browser Acceptance.
