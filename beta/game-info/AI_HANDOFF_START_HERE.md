# AI_HANDOFF_START_HERE — Game Info Beta V11

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development area: direct work on `main/beta/game-info/` until Browser Acceptance PASS.
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum direct page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V11 — Visual Regression Correction / Glass Recovery**.
- V11 starts from V10 commit `f38edaf26ff432470b59fd4e4e271ee863a47878`.
- Production `game-info/` does not exist yet.
- Production home/menu and the formal Light Sanctum simulator remain untouched.
- **V11 Browser Acceptance is NOT PASS yet.**
- Production promotion remains blocked.

## Stable product/data contract — DO NOT REDESIGN
The Light Sanctum page remains one continuous five-column single-glass data sheet:
1. 等級
2. 升下一級 EXP
3. 累積 EXP
4. 每次祈禱 EXP
5. 解鎖內容

Do not split unlock information back into 欄位 / Preset / milestone columns.
Unlock text remains derived in `script.js` from adjacent-level changes in `slotCount` / `presetCount`.
Typography hierarchy remains: table header > level/numeric data > unlock content.
`?page=<id>` routing remains stable.

## Data authority — unchanged
Authority source:
- `light-sanctum-pray/runtime/sanctuary-gameplay-data.js`
- schema: `MapleStoryM.SanctuaryGameplayWebData.P121`
- snapshot reference: `75ab1b24b94e9ddf9d12545e4ab75c5b408a04ad`

Derived rules remain unchanged:
- EXP to next = next `needPoint` - current `needPoint`.
- CharacterCoin per Pray = `upgradeCostAmount0 × slotCount`.
- EXP per Pray = `gainPoint + gainPointPerCoin × CharacterCoin cost`.
- Unlock content = adjacent-level `slotCount` / `presetCount` delta plus max-level state.

V11 does not modify gameplay data, formulas, routing or the five-column structure.

## V10 browser evidence that triggered V11
User supplied three Browser Acceptance captures:
1. V10 Light live.
2. V10 Light export.
3. V10 Dark live.

Observed regression:
- Light retained cyan/lilac/pink but became too pale and evenly washed.
- V8/V9 optical table material became noticeably flatter.
- Light export followed the same palette family but still looked more like a flat translucent panel than the live glass target.
- Dark became a dark gradient panel rather than deep navy optical glass.
- Dark table showed a conspicuous broad gray-purple region toward the lower/right area.
- V10 short marker was better than the old emissive dot, but still read as a small colored dash rather than a surface refraction.

Treat these captures as V11 regression evidence, not V10 as a visual baseline.

## Root-cause audit — V9/V8 versus V10
### 1. V10 weakened the table material itself
V8/V9 table material had:
- table optical SVG around `saturate(124–130%) / contrast(103–104%)`;
- strong top inset highlight around `.96`;
- cyan/pink inset edges around `.16 / .13`;
- a third horizontal chromatic-edge layer in `.data-section::after`;
- stronger V8 border pink/refraction stop;
- V8-style `backdrop-filter` saturation/contrast around `175% / 106%`.

V10 reduced these to approximately:
- `saturate(116%) / contrast(102%)`;
- top inset `.82`;
- cyan/pink inset edges `.10 / .065`;
- removed the third cyan↔pink chromatic-edge layer entirely;
- weaker border/refraction stops;
- `backdrop-filter` around `164% / 104%`.

Result: the sheet still had transparency/color, but lost optical thickness and directional refraction.

### 2. V10 flattened the light atmosphere
V9 light atmosphere used a stronger localized violet field (`rgba(220,147,255,.29)`) and slightly stronger pink/local contrast.
V10 shifted violet to a grayer/lower-alpha value (`rgba(190,157,245,.20)`), lowered pink, and reduced mobile atmosphere opacity.
Result: cyan/lilac/pink became a more uniform pastel wash rather than low-frequency localized environment light.

### 3. Dark lower/right block source
The large dark lower/right region is not fixed by adding another page gradient.
The root is the lower broad paths inside `table-glass-v8.svg` becoming disproportionately visible when V10 combined:
- `screen` blend;
- dark desaturation/brightness filtering;
- very weak dark specular/chromatic edge;
- very translucent cool table fill.

Those broad optical bands became a milky gray-purple shape and visually dominated the weaker fine material.

## V11 implementation
V11 deliberately **does not add `v11.css`**. To stop override-layer growth, the existing V10 shared-token layer is corrected in place:
- `v10.css` remains the loaded shared visual-token owner, but its header/cache/version behavior is V11.
- `v10-export.js` remains the loaded export file, but its implementation is V11.
- `--v10-*` token names are intentionally retained for compatibility and to avoid an unnecessary token namespace migration during Beta.

### A. Light atmosphere recovery
- Restores V9-like localized cyan / violet / pink intensity and geometry.
- Violet and pink are no longer over-muted into a uniform pastel wash.
- No turbulence smoke, noise animation or moving effects.
- Background remains atmosphere only; the table remains the primary material surface.

### B. Light table-glass recovery
- Restores V8/V9-strength optical SVG visibility.
- Restores stronger refraction saturation/contrast.
- Restores V8-strength directional top inset highlight.
- Restores restrained cyan/pink inset edges.
- Restores the third horizontal cyan↔pink chromatic-edge layer that V10 removed.
- Restores stronger V8-like border/refraction stops.
- Restores stronger table backdrop saturation/contrast.
- Keeps one continuous sheet and hairline separators; no row cards or row filters.

### C. Dark theme rebuild from the root cause
Dark remains independent from Light:
- base is deep navy / charcoal (`#050b12` → `#08111a` → `#0d1219`);
- atmosphere is primarily cool cyan/steel blue;
- violet is very small;
- pink is near-zero except microscopic chromatic edge;
- panel/table fills are cool steel/blue-gray rather than purple-gray.

For `table-glass-v8.svg` in Dark:
- blend changes from `screen` to `soft-light`;
- saturation is strongly reduced without turning the full panel purple;
- optical opacity is raised from V10 `.16` to a controlled `.25`, because blend/crop now prevent the broad band from dominating;
- the SVG is enlarged vertically and top-aligned (`124%` height), so the lower broad paths are clipped/faded out of the visible table instead of becoming the V10 lower/right block.

This is a source-layer correction, not a cover-up gradient.

### D. Unlock marker refinement
The circular emissive dot remains permanently removed.
V11 refines the V10 dash into a **micro glass sliver**:
- about 11×2 px desktop / 9×2 px mobile;
- transparent ends;
- weak cyan → violet → soft pink center refraction;
- tiny internal top highlight;
- no outside glow;
- no border ring;
- no whole-row tint or milestone line.

### E. Export architecture preserved and improved
The V10 architecture remains mandatory:
- current theme read from live DOM/root;
- palette read from CSS custom properties;
- table values read from the already-rendered live DOM;
- no duplicate EXP/unlock derivation;
- same `table-glass-v8.svg` asset;
- Light exports Light, Dark exports Dark.

V11 improves Canvas parity without creating a second visual truth:
- hero panel now uses the shared multi-stop panel fill/border tokens instead of one flat fill;
- table uses the same four table-fill tokens instead of one flat `canvas-fill` color;
- optical blend reads `--v10-table-optical-blend` (`screen` Light / `soft-light` Dark);
- Dark export uses the same vertical optical crop strategy as live;
- export restores the same specular end highlight and cyan/pink chromatic-edge tokens;
- header fill uses the shared header token;
- marker uses the same micro-sliver token colors and transparent-ended geometry.

Canvas still cannot exactly duplicate browser `backdrop-filter` compositor blur, so acceptance target remains visual near-parity, not pixel identity.

## Performance contract
V11 adds no:
- continuous animation;
- `requestAnimationFrame` loop;
- WebGL loop;
- animated turbulence;
- per-row expensive filter.

Effects remain static CSS gradients, static SVG, backdrop filters and static pseudo-elements.
Mobile blur/saturation/optical intensity remain lower than desktop.

## File map
- `index.html` — V11 badge and cache bust; still loads the corrected `v10.css` / `v10-export.js` files.
- `style.css` — base layout/data sheet, unchanged.
- `v7.css` — historical layer only; turbulence behavior remains superseded.
- `v8.css` — optical single-glass foundation.
- `v9.css` — site-atmosphere layer beneath the corrected shared-token layer.
- `v10.css` — **V11-corrected shared theme/material token owner**.
- `table-glass-v8.svg` — same static optical asset; unchanged.
- `smoke-v7.svg` — historical asset; not restored as page background.
- `script.js` — unchanged routing/data/unlock derivation.
- `v8-export.js` — historical fallback, not loaded.
- `v10-export.js` — **V11 export implementation**, still based on V10 shared-token architecture.
- data JSON files — unchanged.

## Hard rules
- Do not change the five-column contract.
- Do not change gameplay data or EXP formulas during visual work.
- Do not split unlock data back into multiple columns.
- Keep the table one continuous glass sheet.
- Background = atmosphere; table = glass material.
- Never restore V7 page-wide turbulence smoke.
- No continuous decorative animation / RAF / WebGL.
- Export must use current theme and shared CSS visual tokens.
- Do not return to independent Canvas palette truth.
- Do not create Production `game-info/` before Browser Acceptance PASS.

## V11 Browser Acceptance gate — next action
### Light live
1. Main-site cyan / soft blue / lilac / pink atmosphere is clearly present again.
2. Atmosphere has low-frequency localized depth, not a uniform pastel wash or obvious blobs.
3. Table reads as one optical glass sheet with visible directional highlight/refraction.
4. Text remains stable and readable.
5. Micro glass sliver is subtle and no longer reads as a colored icon/dash.

### Dark live
1. First impression is deep navy / charcoal optical glass.
2. No broad gray-purple lower/right block.
3. No large pink/purple blob or neon cast.
4. Internal refraction is subtle and cool, with restrained cyan/steel edge light.
5. Hero/table/note remain visually distinct without muddy haze.
6. All text, Client Table chip and controls remain readable.

### Export
Test all four views:
1. Light live.
2. Light PNG.
3. Dark live.
4. Dark PNG.

Compare atmosphere, panel/table fill, optical material, text palette and marker. Live ≈ export is required by eye.

### Mobile
Test portrait, landscape and idle thermal behavior with no interaction.

## Promotion — still blocked
Do not create production `game-info/`, do not add the production home entry, and do not open `feature/game-info-release` until V11 Browser Acceptance PASS.

After PASS only:
1. Create `feature/game-info-release` from the accepted latest `main`.
2. Selectively flatten/promote accepted Beta behavior into clean production `game-info/`.
3. Exclude Beta-only handoff/debug/history files.
4. Add the official main-menu entry **也許有用的資訊**.
5. PR → CI → diff review → merge → Pages → Production Browser Acceptance.
