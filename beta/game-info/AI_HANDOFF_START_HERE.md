# AI_HANDOFF_START_HERE — Game Info Beta V19-R3

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Current runtime: **V19-R3 — Table-only Mist Containment**
- Test page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` has not been created yet.

## What changed
- V19-R2 is treated as rejected because the full-page mist returned to a regular left-cyan / right-violet read.
- Restored the page background to the main-site atmosphere model: light `#F3E8FF` with the accepted cyan/violet/blue radial fields, and dark `#070B14` with the main-site restrained cyan/violet fields.
- Removed mist from the page background, Hero, and Note panels.
- Mist is now confined to the table internal atmosphere only.
- Kept V17 flattened CSS architecture; no new version override stylesheet.
- No data, EXP, unlock, routing, five-column layout, typography, export, animation, turbulence, or pointer-interaction changes.

## PASS so far
- V13 Light static-glass baseline: PASS by user visual review.
- V15 color vitality: PASS by user visual review.
- V17 CSS consolidation/runtime flatten: PASS by user visual review.
- V19-R1 Dark cleanup / clean-base direction was visibly better than V19 initial.
- User explicitly requested main-site page background with smoke/mist restricted to the table only.

## Rejected / revised
- V18-R1: rejected and rolled back.
- V18-R3: rejected as final atmosphere because the color flow read as regular lines / bands.
- V19 initial: revised because Light was too pale and Dark too muddy.
- V19-R2: rejected because full-page mist again produced a regular large-scale left-cyan / right-violet layout.

## Not finished
- V19-R3 needs Browser Acceptance in Light and Dark.
- Table mist intensity/topology may still need one focused adjustment after browser review.
- Premium glass refinement, interaction, PNG export parity, mobile/thermal acceptance, and production promotion remain pending.

## Next plan
1. Verify page background now reads like the main site again in both themes.
2. Verify Hero and Note are clean glass without smoke.
3. Judge only the table mist: natural enough, visible enough, and not reading as a regular left/right color split.
4. If the table mist still fails, change only the table atmosphere source/treatment; do not touch page background or add another CSS override layer.
