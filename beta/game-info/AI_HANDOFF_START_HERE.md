# AI_HANDOFF_START_HERE — Game Info V21-P4D

## Current baseline / test state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static table glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Accepted interaction baseline: **V21-P3S — Main-Site Lift + Row Hover**
- Current Light Sanctum UI test: **V21-P4D — Perceptual Surface Unification + Auto-Width Nav Title**
- P3Q static material: user Browser Visual PASS on 2026-09-29.
- P3S table lift + per-row hover: user Browser Visual PASS on 2026-09-29.

## Active runtime files
### CSS
Only 2 CSS files are active:
1. `style.css` — Game Info layout / typography / atmosphere / generic styles.
2. `integrated-liquid-glass.css` — P3Q table material + P3S interactions + Light Sanctum chrome / surface tuning.

### JavaScript
Only 3 JavaScript files are active:
1. `script.js` — routing, theme state, data loading, derived rows, page rendering.
2. `liquid-edge-refraction.js` — safe per-surface self-refraction filters/maps.
3. `v12-export.js` — sole export owner; export-image parity remains deferred until visible UI is accepted.

## Protected contracts
- Do not redesign the accepted Table glass core (`outer / cover / sharp / reflect`) unless a real regression is found.
- Never return to live `backdrop-filter:url(...)` displacement; it produced moving black compositor artifacts.
- Table hover remains `0.30s cubic-bezier(.25,.8,.25,1)` + `translateY(-4px)` + restrained cyan/violet side glow.
- Row hover remains informational only and must not move row geometry.
- No scale, 3D tilt, pointer tracking, or padding growth.

## P4D change — short-card glass calibration
User correctly observed that the bottom Note card showed a conspicuous cyan ring even though P4C used the same four-layer material as the Table.

Root cause / interpretation:
- A fixed 2px / 0.50 OUTER rim is perceptually much stronger on a ~42px-high card than on the large Table.
- This is a geometry/perception issue, not a need for a different glass system.

P4D keeps the exact same four layer roles and the same cover/sharp/reflect values, but scales only the **visible OUTER rim energy** on the short cards:
- Table: unchanged 2px / opacity .50 Light, .26 Dark.
- Hero: 1px / opacity .34 Light, .18 Dark.
- Note: 1px / opacity .20 Light, .12 Dark.
- Dedicated per-surface refraction maps remain active.

Goal: Hero / Table / Note should look like one glass family without the thin Note reading as a cyan-outlined chip.

## P4D change — navigation title width
The generic Game Info CSS gave `.nav-title` a desktop minimum width up to 360px, making `光之聖所祈禱經驗表` look unnecessarily stretched.

P4D desktop behavior:
- `min-width: 0`
- `width: max-content`
- `max-width: min(56vw, 360px)`
- title therefore grows from its text length, similar to the Main Site, while long text still truncates safely.

Mobile behavior remains grid-filling (`width:100%`) to prevent crowding between back button and theme toggle.

## Current Light Sanctum content / presentation
- `Client Table` remains removed.
- Old Lv.1~Lv.15 descriptive subtitle remains removed.
- Hero desktop: left eyebrow/title, right `儲存 / 分享表格圖片`.
- Table labels:
  - 等級
  - 升等所需經驗
  - 累積經驗
  - 聖痕結晶
  - 解鎖內容
- Lv.1 has no `初始：` prefix.
- Lv.15 does not add `滿等`.
- Bottom copy remains only:
  `遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。`
- Test-only footer remains during beta; remove for formal release.

## Current acceptance task
After `git pull`, inspect Light and Dark:
1. Does the Note card lose the cyan-ring look and visually belong to the Table glass family?
2. Does Hero also feel closer to the Table rather than a separate outlined card?
3. Does the top center title now size naturally to its text instead of stretching across a fixed width?
4. Are the existing Table glass, table float, row hover, routing and theme behavior unchanged?

If P4D passes, keep the surface material fixed and continue only with Hero composition / final page-layout polish rather than restarting glass research.
