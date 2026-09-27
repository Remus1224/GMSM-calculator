# AI_HANDOFF_START_HERE — Game Info Beta V19

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Current runtime: **V19 — Organic Mist / Glass Separation Rebuild**
- Test page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` has not been created yet.

## What changed
- Replaced the V18-R3 regular gradient-field atmosphere with one static raster organic-mist source: `assets/mist-organic-v19.webp`.
- Kept the formal palette anchors: `#9CEAFE`, `#A7D3F6`, `#B2BCEE`, `#BDA4E5`, `#C88DDD`.
- Split page atmosphere, glass material, and panel-internal atmosphere into separate layers.
- Hero / table / note reuse the same mist source with different crop, scale, opacity, and dark-mode treatment.
- No animation, turbulence, pointer glow, new version CSS override, routing/data/layout/typography changes, or export rewrite.

## PASS so far
- V13 Light static-glass baseline: PASS by user visual review.
- V15 color vitality: PASS by user visual review.
- V17 CSS consolidation/runtime flatten: PASS by user visual review.
- Five-column layout, typography/readability, and single-sheet direction remain unchanged.

## Rejected / rolled back
- V18-R1: rejected and rolled back.
- V18-R3: rejected as final atmosphere because the color flow still read as regular lines / bands.

## Not finished
- V19 still needs user Browser Acceptance for Light/Dark atmosphere.
- Premium glass refinement, interaction, PNG export parity, mobile/thermal acceptance, and production promotion remain pending.

## Next plan
1. User checks Light page mist, Light table internal mist, Dark cyan/violet vitality, layer separation, and absence of visible lines/circles/bands.
2. If V19 atmosphere passes, freeze it before any glass-material refinement.
3. If it fails, revert or revise the V19 atmosphere layer instead of stacking another override.
