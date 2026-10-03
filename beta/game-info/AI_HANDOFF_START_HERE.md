# AI_HANDOFF_START_HERE — Game Info Frozen RC Baseline

## Status
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Date: 2026-09-30
- Verdict: **APPROVED / RC PASS / READY TO FREEZE**

## User acceptance already completed
The final RC has been browser-tested by the user and accepted on desktop and mobile. The following are PASS:
- Light theme.
- Dark theme.
- Mobile responsive layout, including compact widths.
- Theme persistence after reload.
- Direct `?page=light-sanctum-pray-exp` navigation and back/home behavior.
- Image save/share on a real mobile device.
- Unlock copy without the previous `開放` prefix.
- Unified top navigation alignment, including the Dark theme toggle knob.

## Search indexing
`index.html` explicitly uses `meta name="robots" content="index,follow"`. This page is no longer intentionally blocked from search-engine indexing. Actual indexing remains up to the search engine and site-level crawl conditions.

## Frozen runtime
Keep the runtime intentionally small:
- `index.html`
- `glass.css`
- `page.css`
- `script.js`
- `dom-export.js`
- `data/catalog.json`
- `data/light-sanctum-pray-exp.json`

Do **not** reintroduce retired experiments such as:
- `style.css`
- `integrated-liquid-glass.css`
- `liquid-edge-refraction.js`
- `v12-export.js`
- `wysiwyg-export.js`
- old mist/particle assets

## Navigation baseline
This RC is the visual reference for future Main Site navigation work.
- One unified glass navigation surface.
- Left control changes between `主選單` and `資訊首頁` without changing the overall navigation balance.
- Center current-page label keeps its content-driven width/space within the unified bar.
- Theme control uses the accepted two-icon switch.
- Dark knob geometry is aligned with Light; do not reintroduce border-driven size drift.
- Desktop and mobile use compact, equalized vertical control geometry.

Treat this navigation as **frozen reference behavior** unless a later user-approved change explicitly replaces it.

## Light Sanctum data contract
Visible table columns remain:
1. 等級
2. 升等所需經驗
3. 累積經驗
4. 聖痕結晶
5. 解鎖內容

Display rules:
- Lv.1: `1個欄位 2組預設`
- Lv.3: `第2個欄位`
- Lv.7: `第3個欄位`
- Lv.11: `第4個欄位 第3組預設`
- Lv.15: `第5個欄位`
- Do not restore the display prefixes `初始：`, `開放`, or `滿等`.
- Source JSON may retain provenance wording; only the player-facing derived copy follows the rules above.

Bottom note remains:
`遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。`

## Export baseline
`dom-export.js` is the sole export owner.
- Export is DOM/CSS based and renders the complete Hero + Table + Note independent of the visible mobile viewport height.
- It supports current Light/Dark theme.
- Mobile save/share has been user-tested PASS.
- Do not revive viewport capture or the retired manual Canvas exporter unless explicitly requested.

## Formal-release cleanup already reflected in this RC
- No visible BETA/test footer.
- No legacy V12/WYSIWYG export runtime.
- No old particle/mist/refraction experiment dependencies.
- HTML/CSS/JS structure has been reduced to the frozen runtime listed above.

## Next planned work
Game Info itself should remain frozen. The next design task is to use this RC's unified navigation/glass language as the reference when updating the Main Site, without changing this Game Info baseline.
