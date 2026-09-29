# AI_HANDOFF_START_HERE — Game Info V21-P4E

## Current baseline / test state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static table glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Accepted interaction baseline: **V21-P3S — Main-Site Lift + Row Hover**
- Protected surface/layout state: **V21-P4D — Perceptual Surface Unification + Auto-Width Nav Title**
- Current experiment: **V21-P4E — Background Detail Test 1**

## P4E scope — background only
P4E must be judged as an atmosphere test, not a glass redesign.

No P3Q/P3S/P4D glass or interaction values were changed:
- no change to outer rim widths/opacities
- no change to cover blur/saturation
- no change to sharp/reflect
- no change to displacement math or per-surface maps
- no change to Hero/Table/Note geometry
- no change to row hover, lift, nav controls, theme toggle, data or export runtime

## What P4E changes
The existing cyan / blue / violet atmosphere is preserved, but receives a very low-energy CSS-only organic detail stack:
- small/medium soft ellipses
- a very faint diagonal light/dark sweep
- Light detail intentionally stays around subtle 3–8% alpha ranges
- Dark detail stays slightly more visible because deep navy absorbs contrast

No image/mist asset is used in this first test. `mist-organic-v19-r2.webp` remains available but intentionally unused so the first A/B test has a clean signal and easy rollback.

## Shared atmosphere source
P4E defines one `--page-atmosphere` stack and applies it to both:
- `body`
- every `.liquid_glass-outer`

This is important because P3Q/P4D use self-contained refraction rather than live backdrop displacement. The visible page background and the pixels owned by each refraction OUTER must describe the same atmosphere; otherwise the glass edge would refract a different scene from the page behind it.

For this first experiment the P4E override is intentionally isolated in `index.html` (`<style id="p4e-background-test">`) after the two production CSS files. If accepted, migrate the shared atmosphere definition into `style.css` / `integrated-liquid-glass.css` during cleanup. If rejected, rollback is limited and trivial.

## Protected P4D behavior
- Hero/Table/Note remain the same glass family.
- Table outer: 2px / .50 Light, .26 Dark.
- Hero outer: 1px / .34 Light, .18 Dark.
- Note outer: 1px / .20 Light, .12 Dark.
- Desktop center nav title sizes from text (`width:max-content`) with max-width safety.
- Main Site-style navigation/theme controls remain unchanged.
- Table labels/content/density remain unchanged.
- Beta footer remains test-only and must be removed for formal release.

## Current acceptance task
After `git pull`, compare V21-P4E in Light and Dark against P4D:
1. Does the background still read first as clean cyan / violet rather than a visible texture or aurora?
2. Can the eye now see slightly more depth/refraction through Hero/Table/Note, especially while hovering/floating?
3. Do the three glass surfaces still feel clean rather than dirty or cloudy?
4. Is Dark still cold navy/blue-black rather than purple/muddy?
5. If the detail is too weak, increase only background detail next; if it is too visible, reduce only background detail. Do not compensate by touching the protected glass material.

If P4E is accepted, consolidate the atmosphere vars into the normal CSS files. If not, keep P4D and try a second background-only calibration.
