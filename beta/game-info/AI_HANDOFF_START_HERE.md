# AI_HANDOFF_START_HERE — Game Info V21-P3S

## Current baseline / test state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Current interaction test: **V21-P3S — Main-Site Lift + Row Hover**
- P3Q static material received user Browser Visual PASS on 2026-09-29.
- P3R spring-style 2px lift was superseded by P3S because the user prefers the existing Main Site entry-card motion language.

## Active runtime files
### CSS
Only **2 CSS files are active** from `index.html`:
1. `style.css` — Game Info layout, typography, page atmosphere, generic panel/control styles, responsive rules.
2. `integrated-liquid-glass.css` — protected P3Q table material + current P3S interaction layer.

### JavaScript
Only **3 JavaScript files are active** from `index.html`:
1. `script.js` — routing, theme state, data loading, derived rows, page rendering.
2. `liquid-edge-refraction.js` — safe self-contained edge-refraction map used by the table glass.
3. `v12-export.js` — the sole table image export owner; export-image visual parity is intentionally deferred until page appearance is finished.

Retired experiments already removed:
- `refractive-glass-p3.css`
- `liquid-glass-table.js`
- `liquid-glass-upstream-demo.js`

## P3Q protected glass contract
- Keep the existing four material roles only: `outer / cover / sharp / reflect`.
- `outer`: fine 2px self-contained refraction rim; never return to live `backdrop-filter:url(...)` displacement because that produced moving black compositor artifacts.
- `cover`: subtle surface film/blur/saturation; do not gray out Light mode with the author's photo-specific `.12 black` cover.
- `sharp`: two restrained 1px directional edge lines; do not rebuild thick acrylic-style multi-inset rims.
- `reflect`: soft surface reflection only; avoid thick four-sided depth cues.
- Keep `data-unlock` readability colors: Light `#596477`, Dark `#b0bfcd`.
- Preserve the existing cyan / violet page atmosphere and table geometry.

## P3S interaction contract
### Whole-table lift
- Desktop/fine-pointer only: `@media (hover:hover) and (pointer:fine)`.
- Reference is the Main Site `.app-card` interaction language, not the earlier P3R spring motion.
- Motion: `0.30s cubic-bezier(.25,.8,.25,1)` and `translateY(-4px)`.
- Cyan/violet side glows mirror the Main Site idea at reduced intensity because the table is much larger.
- No `scale()`, no 3D tilt, no pointer-position tracking, no padding/layout growth and no text reflow.

### Per-row tracking
- Each `.data-row` receives a shallow translucent cyan/white/violet hover band on desktop/fine pointer.
- Row height, grid columns, typography and data do not move or change.
- Hover is informational only; rows remain non-clickable.
- Light and Dark use separate restrained opacity values.
- `data-unlock` becomes slightly clearer only while its row is hovered.

### Accessibility / touch
- Touch/mobile devices do not depend on hover.
- `prefers-reduced-motion: reduce` disables the whole-table lift animation and row-transition animation.

## Confirmed behavior / protected functionality
- Direct route `?page=light-sanctum-pray-exp` works.
- Back/history routing works.
- Light/Dark theme switching works.
- Five-column layout and 15-row Light Sanctum data are preserved.
- Data JSON and EXP/unlock derivation were not changed.
- Main Site files were not modified; P3S only references their existing motion language.

## Rejected lessons that must not regress
- Large live-backdrop SVG displacement caused moving black artifacts.
- Author `.12 black` cover made the pastel Light background visibly gray.
- Size-scaled visible rim thickness made the large table look too thick.
- Heavy multi-inset sharp/reflect treatment reads as acrylic rather than thin liquid glass.
- Hover padding expansion would reflow the 15-row table and must not be used.
- Do not reintroduce P3R spring timing unless explicitly requested.

## Current acceptance task
Judge P3S in Light and Dark:
1. Does the whole table lift feel consistent with Main Site entry cards without being over-glowy?
2. Is `-4px` appropriate for this large surface?
3. Does row hover clearly show the current line without looking like a clickable button?
4. Is row hover strong enough in Dark while staying clean?

If P3S passes, preserve P3Q as the static glass baseline and record P3S as the accepted interaction baseline. Continue overall page appearance work before revisiting export-image styling.
