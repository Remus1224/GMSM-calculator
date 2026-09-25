# AI_HANDOFF_START_HERE — Light Sanctum Pray Fullscreen Restore 1

## Current baseline — 2026-09-26
- Site/repo: `Remus1224/GMSM-calculator`
- Active beta route: `/beta/light-sanctum-pray/`
- Runtime lineage: Preview137 → user-PASS P136 WebFix2 → production integration → exact initial-working subtree restore → CPU root-cause closure → Fullscreen Restore 1.

## SEALED / browser-verified
### P137 interaction baseline restored
The exact initial-working Light Sanctum subtree was restored before performance work. Preserve the working Pray interaction, confirmation popup, level selection, reset, P120/P121 gameplay, particles/audio and existing player presentation.

### CPU Root Cause Closure — PASS / SEALED
2026-09-26 browser Performance Trace comparison proved the idle CPU problem was a bridge feedback loop, not the gameplay renderer:
- parent received runtime `ready` and sent `get-state`;
- runtime incorrectly answered `get-state` by calling `sendReady()`;
- this formed `ready → get-state → ready → ...`, driving postMessage, RAF, layout and paint continuously.

Fix commit: `c709f39e96755568ae7765f76ef2cec0ca713aaa`.
Current `runtime/site-bridge.js` keeps `hello → sendReady()` but uses `get-state → queueState()`.

User supplied a new Performance Trace after the fix. Result was effectively idle: ~99.93% CPU profiler samples idle, zero continuous RAF/Layout/Paint/FunctionCall activity, and trace size collapsed from ~49.9 MB compressed to ~0.119 MB. Treat the bridge CPU root cause as SEALED. Do not rewrite this bridge protocol again without new evidence.

## Fullscreen Restore 1
User requested fullscreen restoration only after the CPU closure. This work deliberately restores the earlier repository implementation instead of inventing another fullscreen architecture.

Historical evidence used:
- `239e20e9be57c711f08366fa3fd8d75beb8c3b6e`: first Light Sanctum iOS fullscreen closure, explicitly mirrors the already-working Will simulator strategy.
- `6f4d99050ac7fa27e7e51bbf979eef89364ecfb0`: iOS Fullscreen Fix2 with Apple detection, fake-fullscreen, viewport reflow and scroll restoration.
- `69961f180636a6922cb63a82975241c7f3524380`: Fix3 moved the fullscreen control from website navigation into the visible game UI.
- `b334b96514da76ae7792e6161834e021c267a4e6`: Fix4 anchored it into the blue game title bar immediately left of the native X.
- `c3ed1d6e4aa6a8419bfa9ac9f9fef0357da00e20`: Fix7 used a deterministic SVG icon in native simulator coordinates.
- `23d14d3ed6f8a223b8cb2d6ce089cc5b2933f062`: Fix8 enlarged/aligned the native-coordinate icon to a 48×48 hit box / 40×40 SVG at top=0, right=48.

Restored behavior:
1. Fullscreen button is inside `runtime/index.html`, in the fixed 1280×720 simulator coordinate system, immediately left of the game's native X.
2. Runtime button posts `toggle-fullscreen-from-runtime` using the existing `gmsm-light-sanctum-pray` channel.
3. Parent `script.js` owns fullscreen state.
4. Desktop/Android prefers native Fullscreen API.
5. Apple/iOS uses the proven fixed-position fake-fullscreen fallback.
6. Fake fullscreen locks document scroll, uses the visual viewport for stage scaling, and restores prior scroll position on exit.
7. Outer navigation fullscreen button is removed so there is only one player-facing fullscreen control.
8. Cache keys `20260926-fullscreen-restore1` prevent a mixed old/new shell after GitHub Pages deployment.

## Files changed by Fullscreen Restore 1
- `beta/light-sanctum-pray/script.js`
- `beta/light-sanctum-pray/runtime/index.html`
- `beta/light-sanctum-pray/index.html`
- `beta/light-sanctum-pray/style.css`
- this handoff file

## Hard rules
- Do not change the SEALED `runtime/site-bridge.js` CPU fix while doing fullscreen acceptance.
- Do not alter P137/P121 gameplay, P120 cost rules, confirmation popup interaction, particles, audio, level selection, cumulative usage or reset semantics for fullscreen work.
- Do not reintroduce speculative low-FPS/mobile-quality changes as a fullscreen fix.
- Fullscreen button geometry belongs to native 1280×720 simulator coordinates, not responsive outer-page CSS coordinates.
- Prefer restoring repository-proven behavior over new workaround layers.

## Browser acceptance next
After GitHub Pages deploys Fullscreen Restore 1:
1. Desktop: button appears immediately left of native X; click enters native fullscreen; second click exits.
2. Desktop: Pray, popup Confirm/Cancel, level selector and reset still work.
3. iPhone portrait: icon remains aligned with X and scales with game UI; tap enters fake fullscreen.
4. iPhone landscape: same control enters/exits fake fullscreen and stage remains centered/aspect-correct.
5. Exit restores the previous page scroll position.
6. No return of high idle CPU. If fullscreen acceptance passes, mark fullscreen restore browser PASS and stop modifying this subsystem.
