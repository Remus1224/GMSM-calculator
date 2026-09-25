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


## Fix7 — Fullscreen icon proportion + Fix6 idle evidence interpretation (2026-09-25)
- Replaced the font glyph fullscreen icon with a deterministic 32x32 SVG corner icon inside a 48x46 native-coordinate hit box. This fixes the iPhone result where the glyph rendered much smaller than the adjacent native X. Position remains immediately left of the X and still scales with the 1280x720 runtime.
- Fix6 iPhone 60 s evidence: main runtime becomes quiescent. After startup, RAF=0, Canvas draw=0, timers=0, mutations=0; postMessage traffic stops by ~12 s. Total canvas draws remain 549 (startup only), RAF total 1. This rules out a persistent main-window JS/render loop as the idle heat source.
- The runtime still contains one hidden/eager confirm iframe. Fix6 profiler does not instrument child-frame internals. Next thermal isolation should distinguish static main canvas/GPU compositing from child-frame/resource residency if the user confirms the phone continued warming during the measured 60 s.
- Do not regress P137/P121 gameplay, P120 cost rules, native particles, confirmation behavior, or iOS Auto 1x thermal guard.

## Fix8 — 2026-09-25 Mobile UI unblock + idle isolation
User Fix6 60s capture: after ~12s runtime instrumentation is fully idle (RAF/canvas/timers/mutations/postMessage all 0/s), while user reports only mild warmth (B) during that run, not the prior continuous strong heating. This rules out the previously suspected continuous parent-runtime JS/canvas loop for that capture.

Fix7 regression observed on iPhone: confirmation popup appeared immediately/blocked interaction, despite prior product requirement that confirmation flow need not be reproduced and the lower-right skip-confirm checkbox remain checked. Fix8 removes the production confirmation iframe/overlay from runtime/index.html, forces skipConfirm=true on reset/request, and therefore also removes the remaining child iframe from the idle production path. This is both a correctness fix and the next heat-source isolation step.

Fullscreen: Fix7 SVG coordinate approach was correct but glyph remained visually too small/misaligned relative to native X. Fix8 keeps it inside the 1280x720 runtime coordinate system and uses a 48x48 native hit box with a 40x40 SVG, top=0/right=48, so it scales with the whole simulator rather than the outer responsive page.

Hard rules: do not reintroduce eager confirmation iframe; do not change P120 cost rules; do not replace native-proven particle fidelity with fabricated/low-FPS effects merely to reduce heat; preserve skip-confirm as checked. Next browser acceptance: verify (1) page opens without modal and all simulator controls respond, (2) fullscreen icon visually matches X scale/alignment in portrait and landscape, (3) 2-5 min idle warmth after iframe removal. If meaningful heat persists while JS profiler stays zero, isolate Safari GPU/compositing/static-canvas residency next.
