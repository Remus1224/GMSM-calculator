# AI_HANDOFF_START_HERE — Game Info V21-P4B

## Current baseline / test state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Accepted interaction baseline: **V21-P3S — Main-Site Lift + Row Hover**
- Current Light Sanctum UI test: **V21-P4B — Main-Site Hero Parity + Compact Table**
- P3Q static material: user Browser Visual PASS on 2026-09-29.
- P3S whole-table lift + per-row hover: user Browser Visual PASS on 2026-09-29.

## Active runtime files
### CSS
Only 2 CSS files are active from `index.html`:
1. `style.css` — Game Info layout, typography, page atmosphere and generic styles.
2. `integrated-liquid-glass.css` — protected P3Q table material, accepted P3S interaction, and page-scoped P4B Light Sanctum chrome.

### JavaScript
Only 3 JavaScript files are active from `index.html`:
1. `script.js` — routing, theme state, data loading, derived rows and page rendering.
2. `liquid-edge-refraction.js` — safe self-contained table edge-refraction map.
3. `v12-export.js` — sole image-export owner; export visual parity is intentionally deferred until visible UI is accepted.

## Protected P3Q / P3S contracts
- Keep table material roles `outer / cover / sharp / reflect` unchanged unless a real regression is found.
- Never return to live `backdrop-filter:url(...)` displacement; it produced moving black compositor artifacts.
- P3S table hover stays `0.30s cubic-bezier(.25,.8,.25,1)` with `translateY(-4px)` and restrained cyan/violet side glow.
- Per-row hover remains informational only; rows are not clickable and geometry must not move.
- No scale, 3D tilt, pointer-position tracking, or padding/layout growth.

## P4B Light Sanctum presentation contract
### Main-Site parity
- Top navigation button/title and day/night switch now intentionally follow the Main Site visual language.
- Theme toggle uses two persistent icons (`☀️` / `🌙`) and a sliding inner knob; JavaScript no longer overwrites button text.
- Main Site-style transition/easing, cyan/violet lighting and Dark styling are used.
- Hero and bottom note panel both float `-4px` on desktop/fine-pointer hover with Main Site-style cyan/violet side glow.
- Table continues to use the already accepted P3S float interaction.

### Hero content
- Keep eyebrow `Growth · Light Sanctum` and the title only.
- `Client Table` badge is removed.
- The old subtitle `Lv.1～Lv.15 升級經驗、累積 EXP、每次祈禱 EXP 與解鎖內容。` is removed.
- `儲存 / 分享表格圖片` remains visible; export behavior itself is not modified in P4B.

### Table labels / density
Current visible headers:
- 等級
- 升等所需經驗
- 累積經驗
- 聖痕結晶
- 解鎖內容

Compact desktop density:
- header min-height 42px
- row min-height 44px
- row padding 5px 14px

Compact mobile density:
- header min-height 38px
- row min-height 40px
- row padding 4px 8px

### Unlock presentation
- Lv.1 no longer displays the `初始：` prefix; it shows only the actual starting unlock state.
- Last level no longer adds `滿等` to unlock content.
- Real unlock changes such as the fifth slot remain visible.
- Unlock copy is intentionally darker/stronger in Light and brighter in Dark for readability.

### Note panel
The bottom note contains only:
`遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。`

Do not restore the old formula/source-path paragraphs unless explicitly requested.

### Test-only footer
- The small `Beta V21-P4B · 測試版。` footer is intentionally retained during beta visual testing.
- **Formal release requirement:** remove this small test footer from the Light Sanctum detail page (and remove any CSS dedicated only to it).

## Confirmed protected functionality
- Direct route `?page=light-sanctum-pray-exp` works.
- Back/history routing works.
- Light/Dark state persists in localStorage.
- Five-column / 15-row source data remains unchanged.
- No data JSON was modified by P4B.
- The numeric derivation itself was not changed; P4B changes presentation labels and unlock-text presentation only.
- Main Site files were not modified.

## Current acceptance task
User should `git pull` and judge V21-P4B in Light and Dark:
1. Do Hero, Table and bottom Note all have a coherent floating interaction?
2. Does the top navigation/theme toggle now feel visually consistent with the Main Site?
3. Is the table height compact enough without hurting readability?
4. Is unlock text clear in both themes?
5. Are the requested labels/content removals correct?

If P4B passes, treat the visible Light Sanctum page UI as nearly final and move to export-image parity / final regression cleanup. Do not restart the table glass design.
