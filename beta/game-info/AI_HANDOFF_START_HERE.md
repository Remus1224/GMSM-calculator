# AI_HANDOFF_START_HERE — Game Info V21-P4A

## Current baseline / test state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Accepted interaction baseline: **V21-P3S — Main-Site Lift + Row Hover**
- Current page-chrome test: **V21-P4A — Light Sanctum UI Completion**
- P3Q static material received user Browser Visual PASS on 2026-09-29.
- P3S whole-table lift + per-row hover received user Browser Visual PASS on 2026-09-29.

## Active runtime files
### CSS
Only **2 CSS files are active** from `index.html`:
1. `style.css` — Game Info layout, typography, page atmosphere, generic panel/control styles, responsive rules.
2. `integrated-liquid-glass.css` — protected P3Q table material + accepted P3S interaction + page-scoped P4A Light Sanctum UI completion.

### JavaScript
Only **3 JavaScript files are active** from `index.html`:
1. `script.js` — routing, theme state, data loading, derived rows, page rendering; P4A adds only the root class `is-light-sanctum-page` while the Light Sanctum detail route is active.
2. `liquid-edge-refraction.js` — safe self-contained edge-refraction map used by the table glass.
3. `v12-export.js` — the sole table image export owner; export-image visual parity remains intentionally deferred until page appearance is accepted.

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

## P3S accepted interaction contract
### Whole-table lift
- Desktop/fine-pointer only: `@media (hover:hover) and (pointer:fine)`.
- Reference is the Main Site entry-card interaction language.
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
- `prefers-reduced-motion: reduce` disables whole-table lift and row transition animation.

## P4A page-chrome scope
P4A intentionally changes only the remaining UI inside the `light-sanctum-pray-exp` detail page. The Game Info home page is protected by the root-class scope.

### Navigation
- Existing geometry is preserved.
- `資訊首頁`, centered title pill and theme button use thinner surface glass: lower blur, finer highlight, restrained shadow.
- Clickable nav/theme controls use the same Main Site-style ease and a small `-3px` lift with reduced cyan/violet glow.
- Center title pill remains stationary.
- Focus-visible outlines were added for keyboard navigation.

### Hero
- Hero is an informational surface and remains stationary; it does not behave like a clickable card.
- Legacy heavy 22–27px blur is overridden on this page with thinner surface glass using the accepted visual language.
- Existing content, spacing, typography and source semantics are preserved.
- `Client Table` chip is now a neutral cool-glass provenance badge rather than a green status-like badge.

### Save / share action
- `儲存 / 分享表格圖片` is the hero's single primary interaction.
- It receives the Main Site-like floating response: `0.30s cubic-bezier(.25,.8,.25,1)`, `translateY(-3px)`, restrained cyan/violet glow.
- No layout shift or scale.

### Note panel
- `資料說明` remains a lower-priority surface than Hero/Table.
- Heavy legacy glass is replaced with a quieter thin surface treatment.
- Inline code/source fields get a subtle background and `overflow-wrap:anywhere` so long source paths do not break mobile layout.

### Page scoping
- `script.js` adds `is-light-sanctum-page` to `<html>` only while the Light Sanctum detail page is active and removes it on the Game Info home page.
- This prevents the P4A chrome changes from redesigning the information-home cards.

## Confirmed behavior / protected functionality
- Direct route `?page=light-sanctum-pray-exp` works.
- Back/history routing works.
- Light/Dark theme switching works.
- Five-column layout and 15-row Light Sanctum data are preserved.
- Data JSON and EXP/unlock derivation were not changed.
- `v12-export.js` remains the only export runtime.
- Main Site files were not modified.

## Rejected lessons that must not regress
- Large live-backdrop SVG displacement caused moving black artifacts.
- Author `.12 black` cover made the pastel Light background visibly gray.
- Size-scaled visible rim thickness made the large table look too thick.
- Heavy multi-inset sharp/reflect treatment reads as acrylic rather than thin liquid glass.
- Hover padding expansion would reflow the 15-row table and must not be used.
- Do not return to P3R spring timing unless explicitly requested.
- Do not let Light Sanctum-specific page chrome leak onto the Game Info home page.

## Current acceptance task
Judge P4A in Light and Dark while treating P3Q/P3S as protected baselines:
1. Do the top navigation controls now feel consistent with the accepted table and Main Site interaction language?
2. Does the Hero look like a thin glass information surface rather than a heavy legacy glass card?
3. Does the Save/Share button have enough affordance without looking oversized or neon?
4. Is the `資料說明` panel visually quieter than Hero/Table while remaining readable?
5. On mobile, do long source/code strings wrap without horizontal overflow?

If P4A passes, treat the visible Light Sanctum detail page UI as complete and move next to export-image parity / final regression cleanup rather than continuing visual redesign.
