# AI_HANDOFF_START_HERE — Game Info V21-P3R

## Current baseline / test state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Current interaction test: **V21-P3R — Fine Rim / Surface Glass + Subtle Lift**
- P3Q static material received user Browser Visual PASS on 2026-09-29.
- P3R must be judged only as an interaction layer on top of P3Q; do not reinterpret it as permission to redesign the accepted glass material.

## Active runtime files
### CSS
Only **2 CSS files are active** from `index.html`:
1. `style.css` — Game Info layout, typography, page atmosphere, generic panel/control styles, responsive rules.
2. `integrated-liquid-glass.css` — P3Q material + P3R table hover-lift interaction.

### JavaScript
Only **3 JavaScript files are active** from `index.html`:
1. `script.js` — routing, theme state, data loading, derived rows, page rendering.
2. `liquid-edge-refraction.js` — safe self-contained edge-refraction map used by the table glass.
3. `v12-export.js` — the sole table image export owner.

Retired experiments already removed:
- `refractive-glass-p3.css`
- `liquid-glass-table.js`
- `liquid-glass-upstream-demo.js`

## P3Q protected glass contract
- Keep the existing four material roles only: `outer / cover / sharp / reflect`.
- `outer`: fine 2px self-contained refraction rim; do not return to live `backdrop-filter:url(...)` displacement because that produced moving black compositor artifacts.
- `cover`: subtle surface film/blur/saturation; do not gray out Light mode with the author's photo-specific `.12 black` cover.
- `sharp`: two restrained 1px directional edge lines; do not rebuild thick acrylic-style multi-inset rims.
- `reflect`: soft surface reflection only; avoid thick four-sided depth cues.
- Keep the current restrained floating shadow.
- Keep `data-unlock` readability colors: Light `#596477`, Dark `#b0bfcd`.
- Preserve the existing cyan / violet page atmosphere and table geometry.

## P3R interaction contract
- Desktop/fine-pointer hover only: `@media (hover:hover) and (pointer:fine)`.
- Table rises only **2px** on hover via `translateY(-2px)`.
- No `scale()`, no 3D tilt, no pointer-position tracking, no layout/padding growth and no text reflow.
- Transition uses the author's spring-like motion language: `cubic-bezier(.175,.885,.32,2.2)` over 0.40s.
- Hover shadow opens slightly in Light and Dark to create the perception of the glass floating upward.
- Touch/mobile devices do not receive the hover interaction.
- `prefers-reduced-motion: reduce` disables the lift/transition.

## Confirmed behavior / protected functionality
- Direct route `?page=light-sanctum-pray-exp` works.
- Back/history routing works.
- Light/Dark theme switching works.
- Five-column layout and 15-row Light Sanctum data are preserved.
- `v12-export.js` remains the only export runtime.
- Data JSON and EXP/unlock derivation were not changed by the glass work.
- Main Site files were not modified by this Game Info work.

## Rejected lessons that must not regress
- Large live-backdrop SVG displacement caused moving black artifacts.
- Author `.12 black` cover made the pastel Light background visibly gray.
- Size-scaled visible rim thickness made the large table look too thick.
- Heavy multi-inset sharp/reflect treatment reads as acrylic rather than thin liquid glass.
- Do not use hover padding expansion on this large 15-row table because it would reflow the layout.

## Current acceptance task
User should compare P3R against P3Q in Light and Dark and judge only:
1. Does the hover feel like a subtle glass lift rather than a card jump?
2. Is 2px enough / too much?
3. Does the spring timing feel natural?
4. Does the hover shadow remain clean in Dark?

If P3R passes, keep P3Q as the static material baseline and record P3R as the accepted interaction layer. Export-image parity is intentionally deferred until the overall page appearance is finished.
