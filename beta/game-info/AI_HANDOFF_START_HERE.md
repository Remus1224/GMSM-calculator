# AI_HANDOFF_START_HERE — Game Info V21-P4F

## Current state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static table glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Accepted interaction baseline: **V21-P3S — Main-Site Lift + Row Hover**
- Protected surface/layout baseline: **V21-P4D — Perceptual Surface Unification + Auto-Width Nav Title**
- Current visual test: **V21-P4F — Background / Chrome Polish**

## Source of truth for this pass
P4F is based on the user's uploaded `game-info.zip`, not only the previous GitHub P4E state. The uploaded state had already locally adjusted the Light/Dark atmosphere composition. Preserve those accepted local changes when judging P4F.

## Protected contracts
- Do not redesign the accepted Table glass core (`outer / cover / sharp / reflect`).
- Never return to live `backdrop-filter:url(...)` displacement; it produced moving black compositor artifacts.
- Hero / Table / Note remain one glass family.
- Whole-surface hover remains Main-Site-like `translateY(-4px)` with restrained cyan/violet glow.
- Per-row hover remains informational only and must not move row geometry.
- Top navigation title sizes to its text on desktop.
- Theme switch keeps the Main Site two-icon sliding control.
- No scale, 3D tilt, pointer tracking or layout-growth hover.

## P4F changes
### Background atmosphere
The visible page background and every `.liquid_glass-outer` still share the same `--page-atmosphere`, so the self-contained refraction source remains synchronized with the page.

Light keeps the uploaded palette:
- base `#EEF1FA`
- cyan `rgba(156,234,254,.68)`
- violet `rgba(200,141,221,.55)`
- blue `rgba(167,211,246,.32)`

P4F only makes the existing four organic detail fields slightly tighter and more legible. No image texture, new mist layer, or new color family is added.

Dark is treated as nearly frozen and keeps the uploaded values:
- base `#050A12`
- cyan `.34`
- violet `.27`
- blue `.21`

### Dark navigation title
- Geometry and auto-width stay unchanged.
- Cyan/violet text glow is reduced from `.80` to `.60`.
- Cyan/violet outer glow is reduced from `.55` to `.40`.
- Goal: keep Main Site identity without visually overpowering Hero/Table/Note.

### Light Save/Share button
- Light background opacity is reduced from `.55` to `.43`.
- Border strength is reduced from `.72` to `.62`.
- Hover white is reduced from `.88` to `.76`.
- Dark button styling is unchanged.

### Version markers during this test
- Visible top marker: `V21-P4F`.
- CSS/JS URL cache markers in `index.html` are bumped to P4F.
- The visible test-only footer is overridden to `Beta V21-P4F · 測試版。`.
- Some older internal comments / hidden legacy markers remain in the underlying CSS/JS until P4F visual acceptance. Do not treat those as the active visible version.
- Formal release requirement remains: remove the test-only footer entirely.

## Protected content
- Table labels remain `等級 / 升等所需經驗 / 累積經驗 / 聖痕結晶 / 解鎖內容`.
- Lv.1 has no `初始：` prefix.
- Lv.15 does not add `滿等`.
- Bottom note remains only: `遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。`
- Data JSON and numeric derivation are unchanged.
- `v12-export.js` remains the sole export owner; export-image parity is deferred until the visible UI is frozen.

## Current acceptance task
After `git pull`, inspect Light and Dark:
1. Light should remain clean but have slightly more spatial depth than the previous screenshot.
2. Dark should look almost unchanged.
3. Dark center navigation title should feel less neon / less dominant.
4. Light Save/Share should belong to the Hero instead of reading as an opaque white pill.
5. Hero / Table / Note glass, surface hover, row hover, routing and theme switching must remain unchanged.

If P4F passes, freeze background + chrome, then do legacy-marker cleanup and move to final regression / export-image parity instead of restarting the Liquid Glass design.
