# AI_HANDOFF_START_HERE — Game Info Beta V18-R2

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V18-R2 — Main-site Atmosphere Transfer**
- Production `game-info/` has not been created yet.

## PASS so far
- **V13 Light static-glass baseline: PASS by user visual review.**
- **V15 color vitality: PASS by user visual review.**
- **V17 CSS consolidation/runtime flatten: PASS by user visual review.**
- Five-column layout: accepted.
- Typography/readability: accepted.
- Single-sheet table direction: accepted.

## What changed in V18-R2
- V18-R1 was rejected and rolled back before this revision.
- The page background now follows the main site's simpler atmosphere logic: three very large, soft overlapping radial fields instead of many small visible fields.
- The table uses the same principle internally: only three oversized fields whose centers sit at or beyond the table edges, so the table should show broad color transition rather than obvious blobs.
- Dark keeps visible cyan + violet atmosphere instead of being desaturated.
- Existing V18 glass edge, blur, shadow and specular settings were intentionally left unchanged so this revision tests atmosphere only.
- Runtime CSS remains the clean two-file architecture: `style.css + glass-theme.css`.

## Not finished yet
- V18-R2 Browser Acceptance — pending user visual review.
- Premium / liquid-glass refinement closer to the visual reference — pending.
- Subtle material interaction — deferred.
- PNG export parity — pending.
- Mobile portrait/landscape and idle thermal acceptance — pending.
- Production promotion — pending.

## Next plan
1. Compare the V18-R2 page background with the main site's natural color blending.
2. Check whether the table now inherits a similarly broad, shape-less color flow in both Light and Dark.
3. If accepted, keep the atmosphere fixed and continue glass-material refinement separately.
4. Then align PNG export and run mobile/thermal acceptance.
5. Prepare production promotion only after full acceptance.
