# AI_HANDOFF_START_HERE — Game Info Beta V18-R3

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current deployed/runtime version: **V18-R3 — Atmosphere Positioning Test**
- Production `game-info/` has not been created yet.

## PASS so far
- **V13 Light static-glass baseline: PASS by user visual review.**
- **V15 color vitality: PASS by user visual review.**
- **V17 CSS consolidation/runtime flatten: PASS by user visual review.**
- Five-column layout: accepted.
- Typography/readability: accepted.
- Single-sheet table direction: accepted.
- Runtime CSS remains the clean two-file architecture: `style.css + glass-theme.css`.

## Latest visual feedback
- V18-R3 is **not accepted as the final atmosphere**. Even after repositioning the gradients, the color flow still reads as regular bands / lines rather than organic mist.
- The user provided visual references showing the intended direction: irregular watercolor / fog / cloud-like color islands with no obvious circular, linear or geometric boundaries.
- The user also provided the intended site palette. These colors should anchor the next experiment instead of inventing new hues:
  - `#9CEAFE` — primary cyan
  - `#A7D3F6` — cyan/blue transition
  - `#B2BCEE` — blue/lavender transition
  - `#BDA4E5` — lavender transition
  - `#C88DDD` — primary violet/pink
- `#9CEAFE` and `#C88DDD` are the main endpoint colors; the other three are transition colors between them.

## Next visual experiment
- Replace the regular gradient-field approach with a **static organic mist / watercolor-cloud atmosphere** while keeping the established palette above.
- The goal is irregular soft color islands with blurred, non-geometric boundaries and visible breathing space, similar to the user-provided watercolor/fog references.
- Apply the concept separately to:
  1. the page background atmosphere;
  2. the table/internal atmosphere at lower strength;
  3. keep the glass surface/highlight layer separate.
- Light should preserve the main-site cyan → blue → lavender → violet/pink identity.
- Dark should preserve the same hue identity at lower luminance; it must not collapse to gray/navy-only.
- Do not reintroduce the old stacked CSS architecture. Continue editing the single `glass-theme.css` visual layer.

## Not finished yet
- Organic mist / watercolor atmosphere experiment — next.
- Premium / liquid-glass refinement closer to the visual reference — pending after atmosphere direction is accepted.
- Subtle material interaction — deferred.
- PNG export parity — pending.
- Mobile portrait/landscape and idle thermal acceptance — pending.
- Production promotion — pending.

## Next plan
1. Build the organic mist / watercolor-cloud test using the fixed five-color palette.
2. User visually compares Light and Dark, including zoomed-out screenshots.
3. If accepted, freeze atmosphere and continue glass-material refinement separately.
4. Align PNG export after the live page is stable.
5. Run mobile/thermal acceptance, then prepare production promotion.
