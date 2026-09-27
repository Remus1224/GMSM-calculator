# AI_HANDOFF_START_HERE — Game Info Beta V18-R1

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V18-R1 — Internal Table Atmosphere + Glass Depth**
- Production `game-info/` has not been created yet.

## PASS so far
- **V13 Light static-glass baseline: PASS by user visual review.**
- **V15 color vitality: PASS by user visual review.**
- **V17 CSS consolidation/runtime flatten: PASS by user visual review.**
- Five-column layout: accepted.
- Typography/readability: accepted.
- Single-sheet table direction: accepted.

## What V18-R1 changes
- Keeps the V18 page/background atmosphere frozen.
- Changes only the main `.data-section` table glass.
- Adds several very low-opacity asymmetric internal cyan/violet/soft-pink optical fields inside the table so the table does not simply mirror the whole-page background.
- Strengthens top specular, thin inner rim, left/right edge refraction and near/far depth shadow.
- Dark uses the same internal-table idea at much lower intensity without changing the overall dark palette.
- No smoke, noise, turbulence, animation or pointer-following light was added.
- Beta badge, cache bust and footer are updated to V18-R1.

## Current runtime visual stack
- `style.css` — layout, typography and responsive structure
- `glass-theme.css` — all Light/Dark palette, atmosphere and glass material

## Not finished yet
- V18-R1 Browser Acceptance — pending user visual review.
- Subtle material interaction — deferred.
- PNG export parity — pending.
- Mobile portrait/landscape and idle thermal acceptance — pending.
- Production promotion — pending.

## Next plan
1. User checks whether the table itself now has a more irregular internal color flow and more convincing thickness/refraction.
2. If V18-R1 is not accepted, revert the focused table-material change back to V18.
3. If accepted, keep the visual baseline fixed and move to interaction/export/mobile acceptance.
