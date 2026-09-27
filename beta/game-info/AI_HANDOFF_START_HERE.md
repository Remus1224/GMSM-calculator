# AI_HANDOFF_START_HERE — Game Info Beta V19-R1

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Current runtime: **V19-R1 — Organic Mist Color Balance**
- Test page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` has not been created yet.

## What changed
- V19 organic-mist structure is retained; no return to regular gradient fields.
- Light: increased cyan/blue/lavender/violet visibility, reduced white glass washout, and strengthened panel/table mist without changing layout.
- Dark: reduced gray-blue glass contamination, restored a cleaner navy/charcoal base, lowered mist coverage, and increased low-luminance cyan/violet chroma.
- Same static `assets/mist-organic-v19.webp` and same formal five-color palette remain the single atmosphere source.
- No data, EXP, unlock, routing, five-column layout, typography, export, animation, turbulence, or pointer interaction changes.

## PASS so far
- V13 Light static-glass baseline: PASS by user visual review.
- V15 color vitality: PASS by user visual review.
- V17 CSS consolidation/runtime flatten: PASS by user visual review.
- V19 organic/non-geometric atmosphere direction is retained; user feedback was specifically that Light was too pale and Dark looked muddy/dirty.

## Rejected / revised
- V18-R1: rejected and rolled back.
- V18-R3: rejected as final atmosphere because the color flow read as regular lines / bands.
- V19 initial color balance: revised because Light was too washed out and Dark was too gray/muddy.

## Not finished
- V19-R1 still needs Browser Acceptance for Light vitality and Dark cleanliness.
- Premium glass refinement, interaction, PNG export parity, mobile/thermal acceptance, and production promotion remain pending.

## Next plan
1. User compares V19-R1 Light and Dark at the same zoom as V19.
2. Check whether Light now has enough visible color while retaining breathing space.
3. Check whether Dark reads as clean navy/charcoal with restrained cyan/violet instead of gray fog.
4. If accepted, freeze atmosphere before any glass-material refinement.
