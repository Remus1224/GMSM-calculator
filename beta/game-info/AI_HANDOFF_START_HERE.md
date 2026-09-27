# AI_HANDOFF_START_HERE — Game Info Beta V15

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V15 — Color Vitality Tuning**
- Production `game-info/` has not been created yet.

## What changed
- V13 remains the accepted static-glass material baseline.
- V14 Dark was judged too desaturated / nearly colorless and is no longer loaded at runtime.
- V15 changes atmosphere/color only; glass fill, blur, border, shadow, specular, five-column layout and typography are intentionally left as V13.
- Light increases cyan / violet / soft-pink color presence while keeping the same static glass structure.
- Dark returns to the V13 navy/cyan/violet direction, with stronger but still restrained color atmosphere.
- Footer/version presentation is updated to V15.

## PASS so far
- **V13 Light static baseline: PASS by user visual review.**
- Five-column layout: accepted.
- Typography/readability: accepted.
- Single-sheet table direction: accepted.
- Visible cursor-following light remains removed.

## Not finished yet
- V15 Light color tuning: pending user visual review.
- V15 Dark color tuning: pending user visual review.
- Subtle glass interaction: deferred until both static themes are accepted.
- PNG export parity: pending.
- Mobile portrait/landscape and idle thermal acceptance: pending.
- Production promotion: pending.

## Current runtime visual stack
- `style.css` — base layout/typography
- `v13.css` — accepted static-glass material baseline
- `v15.css` — current Light/Dark color-vitality tuning

## Next plan
1. User compares V15 Light and Dark against V13/V14.
2. If both colors pass, keep the static glass baseline fixed.
3. Add only a very subtle glass-material interaction if still desired.
4. Bring PNG export visually in line with the accepted live themes.
5. Run mobile/thermal acceptance.
6. After full acceptance, prepare selective promotion to production `game-info/`.
