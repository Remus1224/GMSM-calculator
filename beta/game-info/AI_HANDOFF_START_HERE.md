# AI_HANDOFF_START_HERE — Game Info V21-P4G

## Current state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static table glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Accepted interaction baseline: **V21-P3S — Main-Site Lift + Row Hover**
- Protected surface/layout baseline: **V21-P4D — Perceptual Surface Unification + Auto-Width Nav Title**
- Background/chrome baseline before final polish: **V21-P4F**
- Current visual test: **V21-P4G — Final Visual Polish**

## Protected contracts
- Do not redesign the accepted Table glass core (`outer / cover / sharp / reflect`).
- Never return to live `backdrop-filter:url(...)` displacement; it produced moving black compositor artifacts.
- Hero / Table / Note remain one glass family.
- Whole-surface hover remains Main-Site-like `translateY(-4px)` with restrained cyan/violet glow.
- Per-row hover remains informational only and must not move row geometry.
- Top navigation title sizes to its text on desktop.
- Theme switch keeps the Main Site two-icon sliding control.
- No scale, 3D tilt, pointer tracking or layout-growth hover.

## P4G changes
### Light atmosphere — localized, not stronger overall
P4G does not add any new mist/image layer. It only reshapes the existing CSS atmosphere so the Light page keeps clean open space while glass has more local contrast to refract.

Changes from P4F:
- Base remains `#EEF1FA`.
- Cyan is slightly reduced from `.68` to `.66` and its main field is tightened toward the left.
- Violet is reduced from `.55` to `.48` and localized farther to the right.
- Blue is slightly reduced from `.32` to `.30`.
- The four existing detail fields are smaller/more concentrated while their local contrast is increased slightly.
- The visible page background and every `.liquid_glass-outer` still share the same `--page-atmosphere`.

### Dark atmosphere — intentionally frozen
Dark keeps the P4F palette and P4F spatial field geometry:
- base `#050A12`
- cyan `.34`
- violet `.27`
- blue `.21`

Do not continue changing Dark background unless a clear regression is reported.

### Dark center navigation title
One final restraint pass only:
- text glow `.60 -> .52`
- cyan/violet outer glow `.40 -> .34`
- geometry, auto-width, border and material are unchanged.

### Light Save/Share button
- background `.43 -> .38`
- border `.62 -> .58`
- hover background `.76 -> .68`
- hover cyan border `.78 -> .72`
- Dark button styling is unchanged.

### Unlock readability
No size/layout change:
- Light unlock text becomes `#354255`, weight `650`.
- Dark unlock text becomes `#dbe6ef`, weight `640`.
- Row-hover behavior remains the accepted P3S behavior.

### Version markers
- Top visible marker: `V21-P4G`.
- CSS/JS cache query markers in `index.html`: `v21p4g`.
- Test-only footer: `Beta V21-P4G · 測試版。`
- Formal release requirement remains: remove the test-only footer entirely.

## Protected content / functionality
- Table labels remain `等級 / 升等所需經驗 / 累積經驗 / 聖痕結晶 / 解鎖內容`.
- Lv.1 has no `初始：` prefix.
- Lv.15 does not add `滿等`.
- Bottom note remains only: `遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。`
- Data JSON and numeric derivation remain unchanged.
- `v12-export.js` remains the sole export owner; export-image parity is still deferred until the visible UI is frozen.

## Current acceptance task
After `git pull`, inspect Light and Dark:
1. Light should feel cleaner through the middle while retaining enough local spatial detail for glass refraction.
2. The violet wash on the lower/right Light background should be less dominant than P4F.
3. Dark background should look essentially unchanged from P4F.
4. Dark center nav should remain branded but no longer be the brightest/most neon element on the page.
5. Light Save/Share should read as a glass control rather than a solid white pill.
6. Unlock copy should be easier to read in both themes without becoming visually dominant.
7. Hero / Table / Note glass, hover, row hover, routing and theme switching must remain unchanged.

If P4G passes, freeze **background + glass + hover + navigation chrome**. Next work should be formal cleanup (remove beta/footer/internal legacy markers) and export-image parity / regression checks, not another visual redesign.
