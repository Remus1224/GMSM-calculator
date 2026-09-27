# AI_HANDOFF_START_HERE — Game Info Beta V16

## Current version
- Repo: `Remus1224/GMSM-calculator`
- Area: `main/beta/game-info/`
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V16 — Irregular Atmosphere + Glass Surface Refinement**
- Production `game-info/` has not been created yet.

## PASS so far
- **V13 Light static-glass baseline: PASS by user visual review.**
- **V15 overall color vitality: PASS by user visual review.**
- Five-column layout: accepted.
- Typography/readability: accepted.
- Single-sheet table direction: accepted.
- Visible cursor-following light remains removed.

## What V16 changes
- Keeps the V15 cyan / violet / soft-pink color strength.
- Replaces the obvious left-cyan / center-white / right-pink flow with multiple asymmetric low-frequency ambient fields.
- Uses static ellipse radial fields plus a very subtle conic component to make color distribution less regular.
- Does **not** use smoke, noise, turbulence, animated effects or large SVG blobs.
- Strengthens glass thickness using clearer edge refraction, stronger but shallow directional specular, deeper inner highlight and controlled depth shadow.
- Keeps the table as one continuous sheet and does not add row cards or pointer-following effects.
- Dark keeps the same V15 navy / cyan / violet color idea, with the same irregular-atmosphere treatment.
- Footer/version presentation is updated to V16.

## Current runtime visual stack
- `style.css` — base layout/typography
- `v13.css` — accepted static-glass material baseline
- `v16.css` — current V15 palette + irregular atmosphere + glass-surface refinement

`v14.css` and `v15.css` remain in the repo for history but are not loaded by the current runtime.

## Not finished yet
- V16 Browser Acceptance — pending user review.
- Subtle glass interaction — still deferred; any future interaction should change the glass material very gently and must not show a visible cursor light.
- PNG export parity — pending.
- Mobile portrait/landscape and idle thermal acceptance — pending.
- Production promotion — pending.

## Next plan
1. User reviews whether V16 color flow looks more natural and whether the glass surface is closer to the desired premium/liquid-glass feel.
2. If V16 passes, keep color/material fixed.
3. Decide whether a very restrained material interaction is still useful.
4. Bring PNG export visually in line with the accepted live theme.
5. Run mobile/thermal acceptance.
6. After full acceptance, prepare selective promotion to production `game-info/`.
