# AI_HANDOFF_START_HERE — Game Info Beta V17

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V17 — CSS Consolidation / Runtime Flatten**
- Production `game-info/` has not been created yet.

## PASS so far
- **V13 Light static-glass baseline: PASS by user visual review.**
- **V15 color vitality: PASS by user visual review.**
- Five-column layout: accepted.
- Typography/readability: accepted.
- Single-sheet table direction: accepted.

## What V17 changes
- Root cause from V16 review: `style.css` still contained V6 smoke/material rules while V13/V16 also redefined the same pseudo-elements and glass surface. The runtime was being produced by multiple historical CSS generations at once.
- `style.css` is now rewritten as layout / typography / responsive structure only.
- New `glass-theme.css` is the single visual-material source for Light/Dark palette, page atmosphere, glass fill, border, blur, specular, shadow and unlock marker.
- V17 baseline intentionally uses the accepted **V13 glass direction + V15 color vitality**. The V16 atmosphere/material experiment is not carried forward.
- Runtime now loads only `style.css + glass-theme.css`.
- Historical version CSS files are removed from `beta/game-info/` once confirmed unused, so they cannot accidentally re-enter the cascade.
- Footer/version presentation is updated to V17.

## Current runtime visual stack
- `style.css` — layout, typography and responsive structure only
- `glass-theme.css` — all current Light/Dark visual material

## Not finished yet
- V17 Browser Acceptance — verify that consolidation did not regress the accepted V13/V15 direction.
- More natural irregular color distribution — revisit only after the flattened baseline is accepted.
- Premium/liquid-glass refinement — pending after baseline acceptance.
- Subtle glass interaction — deferred.
- PNG export parity — pending.
- Mobile portrait/landscape and idle thermal acceptance — pending.
- Production promotion — pending.

## Next plan
1. Browser-test V17 Light and Dark after CSS flattening.
2. If the baseline is stable, improve color distribution and glass material from the clean two-file architecture.
3. Bring PNG export in line with the accepted live theme.
4. Run mobile/thermal acceptance.
5. After full acceptance, prepare selective promotion to production `game-info/`.
