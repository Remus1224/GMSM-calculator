# AI_HANDOFF_START_HERE — Game Info V21-P3Q

## Current baseline
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Current visual/runtime baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Browser visual acceptance: **PASS by user on 2026-09-29**
- This P3Q glass implementation is now the protected Game Info table-glass baseline unless a later regression is found.

## Active runtime files
### CSS
Only **2 CSS files are active** from `index.html`:
1. `style.css` — Game Info layout, typography, page atmosphere, generic panel/control styles, responsive rules.
2. `integrated-liquid-glass.css` — P3Q table glass material only.

`refractive-glass-p3.css` was a retired P3B experiment and has been removed.

### JavaScript
Only **3 JavaScript files are active** from `index.html`:
1. `script.js` — routing, theme state, data loading, derived rows, page rendering.
2. `liquid-edge-refraction.js` — safe self-contained edge-refraction map used by the P3Q table glass.
3. `v12-export.js` — the sole table image export owner.

Retired experiments removed during baseline cleanup:
- `liquid-glass-table.js`
- `liquid-glass-upstream-demo.js`

## P3Q glass contract
- Keep the existing four material roles only: `outer / cover / sharp / reflect`.
- `outer`: fine 2px self-contained refraction rim; do not return to live `backdrop-filter:url(...)` displacement because that produced moving black compositor artifacts.
- `cover`: subtle surface film/blur/saturation; do not gray out Light mode with the author's photo-specific `.12 black` cover.
- `sharp`: two restrained 1px directional edge lines; do not rebuild thick acrylic-style multi-inset rims.
- `reflect`: soft surface reflection only; avoid thick four-sided depth cues.
- Keep the current restrained floating shadow.
- Keep `data-unlock` readability colors: Light `#596477`, Dark `#b0bfcd`.
- Preserve the existing cyan / violet page atmosphere and table geometry.

## Confirmed behavior / protected functionality
- Direct route `?page=light-sanctum-pray-exp` works.
- Back/history routing works.
- Light/Dark theme switching works.
- Five-column layout and 15-row Light Sanctum data are preserved.
- `v12-export.js` remains the only export runtime.
- Data JSON and EXP/unlock derivation were not changed by the P3 glass work.
- Main Site files were not modified by this Game Info glass work.

## Rejected lessons that must not regress
- Large live-backdrop SVG displacement caused moving black artifacts.
- Author `.12 black` cover made the pastel Light background visibly gray.
- Size-scaled visible rim thickness made the large table look too thick.
- Heavy multi-inset sharp/reflect treatment reads as acrylic rather than thin liquid glass.

## Next step
Treat P3Q as the baseline. Future Game Info work should add/finish content and page-level UX without redesigning the accepted table glass. If glass changes are unavoidable, make one narrowly-scoped change at a time and compare against P3Q.
