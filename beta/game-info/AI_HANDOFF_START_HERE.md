# AI_HANDOFF_START_HERE — Game Info V21-P5A

## Current state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static table glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Accepted interaction baseline: **V21-P3S — Main-Site Lift + Row Hover**
- Protected surface/layout baseline: **V21-P4D — Perceptual Surface Unification + Auto-Width Nav Title**
- Accepted/frozen visible polish candidate: **V21-P4G — Final Visual Polish**
- Current feature test: **V21-P5A — WYSIWYG Export Prototype**

## Visual state is frozen during P5A
P5A does not redesign the accepted P4G page. Preserve:
- Light/Dark atmosphere.
- P3Q four-layer glass (`outer / cover / sharp / reflect`).
- Hero / Table / Note material family.
- P3S surface lift and per-row hover.
- Main-Site-like navigation title/theme switch.
- Table labels and compact density.
- Light/Dark unlock readability tuning.

Do not restart Liquid Glass or background experimentation while validating export.

## Active runtime files
### CSS
1. `style.css`
2. `integrated-liquid-glass.css`

The P4G accepted atmosphere/polish values are still kept in the page-local style block in `index.html` while final cleanup is deferred.

### JavaScript
1. `script.js` — routing/theme/data/page rendering.
2. `liquid-edge-refraction.js` — safe self-contained refraction maps.
3. `wysiwyg-export.js` — P5A real-tab-pixel capture path.
4. `v12-export.js` — legacy hand-drawn Canvas exporter retained only as compatibility fallback during P5A.

## Why P5A exists
The previous V12 export is not a screenshot of the live page. It independently redraws a 1440px Canvas with its own background, Hero, Table and metadata footer. Therefore the saved PNG visibly diverges from the accepted P4G browser UI.

P5A changes the preferred export architecture to **What You See Is What You Get**:
- Browser compositor renders the actual P4G page.
- User clicks `儲存 / 分享表格圖片`.
- Browser screen-capture permission opens.
- User must choose **the current browser tab / 這個分頁**.
- P5A captures the real rendered tab pixels.
- It crops only the union of:
  1. Hero
  2. Table
  3. bottom game-version Note
- Navigation/header/BETA strip/test footer are excluded.
- The resulting PNG therefore includes the browser's actual Liquid Glass, backdrop blur, masks, self-refraction, typography and current Light/Dark atmosphere rather than a second approximation renderer.

## WYSIWYG technical contract
File: `wysiwyg-export.js`

- Uses `navigator.mediaDevices.getDisplayMedia()` with current-tab preference.
- Requires a browser-tab capture surface when the browser exposes `displaySurface`.
- Uses current `getBoundingClientRect()` values for Hero/Table/Note and maps CSS viewport coordinates into captured video pixels using `videoWidth/window.innerWidth` and `videoHeight/window.innerHeight`.
- Adds 14px crop padding so card shadows/glass edges are retained.
- Hides the toast before the frame is captured.
- Does not visually disable the save button during capture, avoiding an exported disabled-state button.
- Stops all capture tracks immediately after a frame is obtained.
- Keeps current theme in the filename.

### Visibility limitation in P5A
For true pixel parity, Hero + Table + Note must all fit inside the currently visible tab viewport. If they do not, P5A currently invokes the V12 compatibility fallback rather than pretending the off-screen DOM was captured.

### Wrong source behavior
If the browser reports that the user selected a window/monitor instead of a browser tab, P5A stops and asks the user to choose the current tab. It does not silently crop an unrelated screen source.

### Permission cancellation
If the user cancels or denies the capture picker, export is cancelled cleanly; legacy export is not started.

## Legacy V12 fallback
`v12-export.js` remains unchanged during P5A so the old exporter is still available as a fallback for unsupported environments / non-visible full target.

`wysiwyg-export.js` is loaded **before** `v12-export.js` and intercepts the save button first. When fallback is intentionally requested, it bypasses itself once and re-dispatches the click so the existing V12 listener handles it.

Do not remove V12 until P5A browser testing confirms the WYSIWYG path is reliable.

## Protected content / page behavior
- Table labels: `等級 / 升等所需經驗 / 累積經驗 / 聖痕結晶 / 解鎖內容`.
- Lv.1 has no `初始：` prefix.
- Lv.15 does not add `滿等`.
- Bottom Note: `遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。`
- Data JSON and numeric derivation remain unchanged.
- Test-only footer remains during beta; remove for formal release.

## Current acceptance test
After `git pull`:
1. Open `?page=light-sanctum-pray-exp` in desktop Edge/Chrome.
2. Ensure Hero + full Table + Note are visible in the viewport (the user's current desktop layout already satisfies this).
3. Test Light first.
4. Click `儲存 / 分享表格圖片`.
5. In the browser picker choose **這個分頁 / current tab**.
6. Compare exported PNG directly with the live Hero + Table + Note pixels.
7. Repeat in Dark.
8. Confirm glass/refraction/background/text/card geometry match the live page, apart from the intentional 14px crop margin.
9. Confirm capture permission is stopped immediately after export.

If P5A passes, next step is to retire the hand-drawn V12 path or keep it only as explicitly labeled compatibility fallback, then perform formal-release cleanup (remove beta/test footer and legacy markers).
