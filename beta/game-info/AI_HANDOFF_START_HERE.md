# AI_HANDOFF_START_HERE — Game Info Beta V18

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current runtime visual baseline: **V18 — Irregular Atmosphere + Optical Glass Refinement**
- V18-R1 was rejected by user visual review and has been rolled back.
- Production `game-info/` has not been created yet.

## PASS so far
- **V13 Light static-glass baseline: PASS by user visual review.**
- **V15 color vitality: PASS by user visual review.**
- **V17 CSS consolidation/runtime flatten: PASS by user visual review.**
- Five-column layout: accepted.
- Typography/readability: accepted.
- Single-sheet table direction: accepted.

## Current state
- Runtime remains the clean V17 architecture: `style.css + glass-theme.css` only.
- V18 keeps the V15-approved color strength and the current page atmosphere / glass refinement baseline.
- V18-R1 tried adding independent internal table color fields plus extra glass depth. User review found the table color flow still looked unnatural and Dark lost too much color again.
- V18-R1 has therefore been fully reverted; its internal table atmosphere approach is not the current runtime.

## Not finished yet
- A better approach for natural, irregular color behavior inside the table glass.
- Premium / liquid-glass refinement closer to the visual reference.
- Subtle material interaction — deferred.
- PNG export parity — pending.
- Mobile portrait/landscape and idle thermal acceptance — pending.
- Production promotion — pending.

## Next plan
1. Keep V18 as the safe visual baseline.
2. Do not continue tuning the rejected V18-R1 internal radial-field method.
3. Re-evaluate how to create natural table-internal color variation without reducing Dark color vitality.
4. After the live visual baseline is accepted, align PNG export, then run mobile/thermal acceptance.
5. Prepare production promotion only after full acceptance.
