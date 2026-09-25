# AI_HANDOFF_START_HERE — Light Sanctum Pray iOS Fullscreen Fix3

## Current patch
`LightSanctumPray_iOSFullscreenFix3_UIButton_ThemeParity_PATCH_20260925.zip`

## User-confirmed production baseline
Light Sanctum Pray production slim runtime and settings are already deployed/tested on GitHub Pages.

## Fix3 changes
1. Fullscreen control moved out of the website title/navigation bar and into the visible game UI.
   - It is overlaid inside `stage-viewport`.
   - This lets iPhone users scroll slightly to hide Safari's address bar first, then press fullscreen without returning to the top navigation.
   - The same button toggles enter/exit fullscreen.
2. iOS fake-fullscreen fallback from Fix2 is retained.
3. Theme toggle visual style is changed to match the main GMSM-calculator site's canonical day/night toggle.
   - Prior Light Sanctum styling was derived from the older 1204 standalone style and was not pixel/style-identical to the main site.
4. Cache-bust updated to `20260925-iosfs3`.

## Frozen behavior
Do not change P137 gameplay/runtime, pray costs, EXP, particles, confirmation popup, level/settings bridge, cumulative usage tracking, or reset semantics.

## Test focus
- iPhone portrait: scroll enough to collapse browser chrome, then press the in-UI fullscreen button.
- iPhone landscape: same button should enter/exit fake fullscreen.
- Desktop/Android: native fullscreen should remain available.
- Day/night toggle should visually match the main site's toggle.


## 2026-09-25 Fix4 — title-bar fullscreen / theme parity / iPhone performance
- Fullscreen control is visually anchored into the game blue title bar immediately left of the native X; removed the floating glass-pill treatment.
- Main-site canonical theme variables were completed (`text-muted`, `card-bg`, `card-hover`, `input-bg`) while preserving the already canonical nav/theme-toggle styling.
- iPhone heating audit found no permanent requestAnimationFrame loop while idle. The bridge handshake stops after ready and the MutationObserver is event-driven.
- High-confidence mobile cost source: Auto HiDPI rendered the 1280×720 logical canvas at iPhone DPR 3 => 3840×2160 (8.29M pixels/frame) during pray animations. Fix4 makes iOS Auto quality render at 1× => 1280×720 (0.92M pixels/frame), a 9× pixel reduction per animated frame. The displayed mobile simulator is already below 1280 CSS pixels, so 1× preserves native logical resolution. Desktop behavior remains unchanged.
- Do not remove P98 native particle atlases or alter P137 gameplay/FX semantics as a performance shortcut.

## Fix6 — Native-coordinate fullscreen + Idle 60s profiler (2026-09-25)
- Fullscreen button moved from outer site CSS pixels into `runtime/index.html`, i.e. the native 1280×720 simulator coordinate space. It now scales with the entire game UI. Runtime button sends `toggle-fullscreen-from-runtime` through the existing site bridge channel; outer page remains responsible for native/fake fullscreen.
- Added `runtime/idle-profiler.js`, loaded before runtime data/player scripts. It instruments RAF requests/callbacks, timers, postMessage, MutationObserver activity and Canvas 2D draw calls without changing gameplay state.
- Added a player-visible diagnostic panel below the simulator. `開始 60 秒閒置診斷` captures baseline/end reports; `複製診斷結果` copies JSON for AI analysis.
- IMPORTANT test: after page load stabilizes, start the 60 s diagnostic and do not touch/scroll/rotate/switch tabs until complete. Paste the copied JSON into ChatGPT and state whether the phone became warmer during that exact 60 s window.
- Fix5 thermal guard remains in the runtime; Fix6 is diagnostic-first and does not further reduce visual quality.
