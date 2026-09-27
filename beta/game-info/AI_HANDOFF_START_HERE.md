# AI_HANDOFF_START_HERE — Game Info Beta V18

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V18 — Irregular Atmosphere + Optical Glass Refinement**
- Production `game-info/` has not been created yet.

## PASS so far
- **V13 Light static-glass baseline: PASS by user visual review.**
- **V15 color vitality: PASS by user visual review.**
- **V17 CSS consolidation/runtime flatten: PASS by user visual review.**
- Five-column layout: accepted.
- Typography/readability: accepted.
- Single-sheet table direction: accepted.

## What V18 changes
- Keeps the clean V17 runtime architecture: only `style.css + glass-theme.css` control visual presentation.
- Keeps the V15-approved color strength, but changes the page atmosphere from a predictable left-cyan/right-pink flow into multiple asymmetric low-frequency color fields.
- Uses static elliptical ambient fields with different positions, scales and opacity; no smoke, noise, turbulence, animation or extra SVG material layer.
- Refines the main glass sheet with stronger but shallow edge refraction, top specular, inner highlight and depth shadow.
- Dark keeps the V17 color direction and receives only a restrained version of the same atmosphere/material refinement.
- No pointer-following light or interaction was added.
- Footer and Beta badge are updated to V18.

## Current runtime visual stack
- `style.css` — layout, typography and responsive structure
- `glass-theme.css` — all Light/Dark palette, atmosphere and glass material

## Not finished yet
- V18 Browser Acceptance — pending user review.
- Subtle material interaction — deferred.
- PNG export parity — pending.
- Mobile portrait/landscape and idle thermal acceptance — pending.
- Production promotion — pending.

## Next plan
1. User reviews whether V18 color distribution feels more natural and whether the glass surface is closer to the desired premium/liquid-glass direction.
2. If V18 passes, keep the visual baseline fixed.
3. Decide whether a very subtle material interaction is still useful.
4. Bring PNG export in line with the accepted live theme.
5. Run mobile/thermal acceptance.
6. After full acceptance, prepare selective promotion to production `game-info/`.
