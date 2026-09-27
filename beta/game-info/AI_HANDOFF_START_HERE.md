# AI_HANDOFF_START_HERE — Game Info Beta V14

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V14 — Dark Static Baseline**
- Production `game-info/` has not been created yet.

## What V13 changed
- Recovered the Light static-glass direction after V12 regressed visually.
- Kept the current five-column layout and typography.
- Removed the visible pointer-following light effect.
- Returned to a calmer single-sheet glass concept inspired by the earlier V5 direction without reverting the whole page.

## Browser acceptance so far
- **V13 Light static baseline: PASS by user visual review.**
- The current five-column layout is accepted.
- Current typography/readability is accepted.
- Single-sheet table direction is accepted.

## What V14 changes
- V14 focuses only on **Dark static glass**; V13 Light is intentionally left unchanged.
- Dark palette is rebuilt toward deep navy / charcoal / cool steel glass.
- Large violet/pink atmosphere is removed from Dark.
- Table, hero and note panels use cooler translucent fills, restrained steel highlights and softer cyan edging.
- No pointer interaction is added in V14.
- Mobile Dark blur/saturation is reduced relative to desktop.
- The stale footer text `Beta V7-R1 · Turbulence Smoke Root Fix` is visually replaced with the correct V14 footer.

## Current runtime visual stack
- `style.css` — base layout, typography and responsive structure
- `v13.css` — accepted Light static-glass baseline
- `v14.css` — Dark static-glass override + current footer presentation

## Not finished yet
- **V14 Dark Browser Acceptance** — pending user review.
- Pointer/hover glass interaction — intentionally deferred until both static themes are accepted.
- Export parity — still needs a later pass after Light and Dark live visuals are accepted.
- Mobile portrait/landscape and idle thermal acceptance — pending.
- Production promotion — pending.

## Suggested next steps
1. User reviews V14 Dark on desktop and mobile.
2. If Dark passes, preserve both V13 Light and V14 Dark as the static visual baseline.
3. Add only a very restrained glass interaction if still wanted; no visible cursor-following light.
4. Bring PNG export visually in line with the accepted live themes.
5. Run mobile acceptance and idle thermal check.
6. After all acceptance gates pass, prepare selective promotion from Beta to production `game-info/`.
