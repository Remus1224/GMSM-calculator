# AI_HANDOFF_START_HERE — Game Info Beta V12

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development area: direct work on `main/beta/game-info/` until Browser Acceptance PASS.
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum direct page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V12 — Glass Architecture Reset**.
- V12 starts from V11 commit `18412546c7feb639f71e5cec38e1eaa584077686`.
- Production `game-info/` still does not exist.
- Production menu and the formal Light Sanctum simulator remain untouched.
- **V12 Browser Acceptance is NOT PASS yet.**
- Production promotion remains blocked.

## Stable product/data contract — DO NOT REDESIGN
The Light Sanctum page remains one continuous five-column single-glass data sheet:
1. 等級
2. 升下一級 EXP
3. 累積 EXP
4. 每次祈禱 EXP
5. 解鎖內容

Unlock text remains derived in `script.js` from adjacent-level `slotCount` / `presetCount` changes plus max-level state.
Typography hierarchy remains header > level/numeric data > unlock content.
Routing remains `?page=<id>`.
No gameplay data, EXP formula, structured JSON or unlock derivation changed in V12.

## Why V12 exists
V11 browser evidence showed the remaining problem was architectural, not another opacity/color-tuning problem.

### Confirmed V11 issues
- Dark still showed a conspicuous broad lower/right optical block.
- Glass had become a static painted texture rather than a responsive material.
- Earlier pointer/hover surface reaction had disappeared during the move to a single-sheet table.
- Runtime visual styling had become a historical cascade: `style.css + v7.css + v8.css + v9.css + v10.css`.

### Root cause
`table-glass-v8.svg` contains large fixed cyan/violet optical paths in the lower half of the SVG. Later versions changed opacity, blend mode, saturation, crop and scale, but the fixed geometry remained. V11 therefore reduced/repositioned the symptom rather than removing the source.

Important distinction:
- **V8 design principle is kept:** the table itself is the glass material.
- **V8 implementation is NOT sealed:** `table-glass-v8.svg` is no longer treated as the runtime material truth.

## V12 architecture reset
### A. Runtime visual stack flattened
`index.html` now loads only:
- `style.css` — base layout/typography/data-sheet structure;
- `v12.css` — the single active visual/theme/material override.

The historical files remain in the Beta repo/Git history but are no longer loaded at runtime:
- `v7.css`
- `v8.css`
- `v9.css`
- `v10.css`
- `table-glass-v8.svg`
- old export scripts

This removes the five-generation pseudo-element/`!important` cascade from the live page.

### B. Table glass rebuilt without fixed optical blobs
V12 glass is generated from:
- translucent table fill;
- backdrop blur/saturation/contrast;
- directional top highlight;
- small cyan/pink chromatic edge;
- local specular highlight;
- depth shadow;
- hairline row separators.

There is no table optical SVG and no large cyan/violet blob geometry.
The table remains one continuous sheet; rows are not cards.

### C. Whole-sheet pointer-reactive glass restored
New file: `v12-interaction.js`.

Desktop/fine-pointer behavior:
- real `pointermove` updates only `--glass-x` and `--glass-y` on `.data-section`;
- local specular/refraction highlight follows the pointer across the whole sheet;
- `pointerleave` returns the highlight to a calm default location.

Performance rules:
- no `requestAnimationFrame` loop;
- no timer loop;
- no WebGL;
- no animated turbulence;
- no per-row expensive filter.

Mobile/coarse pointer:
- interaction script exits early;
- static lightweight fallback is used.

### D. Light/Dark palettes are independent
V12 uses generic `--gi-*` shared tokens.

Light:
- cyan / soft blue / lilac / soft pink site atmosphere;
- atmosphere stays outside/behind the sheet;
- table supplies material depth.

Dark:
- deep navy / charcoal base;
- cool steel-blue glass;
- restrained cyan edge;
- violet minimal;
- pink nearly absent except microscopic marker/edge accent.

No V7 page-wide turbulence smoke is restored.

### E. Unlock marker
The circular emissive dot remains removed.
V12 keeps a micro refractive sliver:
- ~11×2 px desktop / 9×2 px mobile;
- transparent ends;
- cyan → violet → soft pink center;
- internal highlight only;
- no outside glow;
- no milestone side line;
- no whole-row tint.

### F. Export architecture reset with shared tokens
New file: `v12-export.js`.

The export path:
- reads current Light/Dark state from the live root;
- reads `--gi-*` CSS tokens from `v12.css`;
- reads the rendered five-column data directly from the live DOM;
- does not duplicate EXP/unlock derivation;
- does not load `table-glass-v8.svg`;
- renders the same page atmosphere, panel fill, table fill, local specular, chromatic edge and marker concept using shared tokens.

Canvas cannot reproduce browser compositor `backdrop-filter` pixels exactly, so acceptance target remains visual near-parity rather than pixel identity.

## Runtime file map after V12
Loaded:
- `index.html`
- `style.css`
- `v12.css`
- `script.js`
- `v12-interaction.js`
- `v12-export.js`
- data JSON files

Historical but NOT loaded:
- `v7.css`
- `v8.css`
- `v9.css`
- `v10.css`
- `smoke-v7.svg`
- `table-glass-v8.svg`
- `v8-export.js`
- `v10-export.js`

## Hard rules
- Keep the five-column contract.
- Keep the single-sheet table architecture.
- Do not change gameplay data/EXP formulas during visual work.
- Do not split unlock content back into 欄位 / Preset / milestone columns.
- Background = atmosphere; table = material.
- Do not restore page-wide smoke or fixed giant optical blobs.
- Do not reintroduce `table-glass-v8.svg` as runtime material truth.
- No continuous animation / RAF / WebGL decorative loop.
- Export must follow current theme and shared CSS tokens.
- Production promotion remains blocked until Browser Acceptance PASS.

## V12 Browser Acceptance gate
### Desktop Light
1. Table no longer shows any fixed broad optical block.
2. Cyan/lilac/pink atmosphere remains secondary to the table.
3. Moving the mouse across the table visibly but subtly moves the sheet specular/refraction highlight.
4. Hover reaction belongs to the whole sheet, not individual row cards.
5. Five-column readability remains unchanged.

### Desktop Dark
1. No lower/right gray-purple block.
2. First impression is deep navy / cool steel optical glass.
3. Pointer reaction is visible but restrained and not neon.
4. Text/note/chips remain readable.

### Mobile
1. No pointer effect is required.
2. Static glass remains clean in portrait and landscape.
3. Idle page should not continuously consume GPU due to decorative loops.

### Export
Test Light and Dark separately.
Compare live vs saved PNG for palette, atmosphere, panel/table fill, marker and overall hierarchy.

## Promotion — still blocked
Do not create production `game-info/`, do not add the production home entry, and do not create the release/promotion branch until V12 Browser Acceptance PASS.

After PASS only:
1. Create `feature/game-info-release` from latest accepted `main`.
2. Selectively promote/flatten accepted Beta files into production `game-info/`.
3. Exclude Beta-only handoff/history files.
4. Add official main-menu entry **也許有用的資訊**.
5. PR → CI → diff review → merge → Pages → Production Browser Acceptance.
