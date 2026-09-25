# AI_HANDOFF_START_HERE — Light Sanctum Pray Fix9

## Current patch
`Fix9 — Mobile Fullscreen + Confirm Dialog Closure`

## User-confirmed production baseline
Light Sanctum Pray production slim runtime and settings are deployed/tested on GitHub Pages.

## Frozen gameplay / fidelity rules
Do not change P137/P121 gameplay, P120 pray costs, EXP, native-proven particles, audio, level/settings bridge, cumulative usage tracking, reset semantics, or the iOS Auto 1× canvas quality guard unless a new evidence-driven task explicitly requires it.

P120 sealed cost rule:
- `CharacterCoin = 5 × SlotCount`
- `Meso = 1,500,000 × actual lockedCount`
- all-locked does not cap the Meso lock count
- 0 Lock hides the Meso group and centers CharacterCoin

## Fix3 — iOS fullscreen / theme parity
- Fullscreen control moved into the visible game UI.
- iOS fake-fullscreen fallback retained.
- Theme toggle aligned with the main GMSM-calculator site.

## Fix4 — title-bar fullscreen / theme parity / iPhone performance
- Fullscreen control visually anchored into the game blue title bar immediately left of the native X.
- iOS Auto quality changed from DPR 3 rendering to 1× logical 1280×720, reducing animated pixel work by ~9× while preserving native logical resolution.
- Do not remove P98 native particle atlases or alter P137 gameplay/FX semantics as a performance shortcut.

## Fix6 — Native-coordinate fullscreen + Idle 60s profiler
- Fullscreen button moved into `runtime/index.html`, the native 1280×720 simulator coordinate space.
- Added `runtime/idle-profiler.js`.
- Player-visible 60 s idle profiler records RAF, timers, postMessage, MutationObserver and Canvas 2D activity.

## Fix7 — fullscreen icon proportion + idle evidence
- Replaced the font glyph with deterministic SVG corners in the native-coordinate title bar.
- User Fix6 iPhone 60 s evidence: after startup the main runtime becomes quiescent: RAF=0, Canvas draw=0, timers=0, mutations=0; postMessage traffic stops by ~12 s.
- The prior eager PrayConfirm iframe remained a possible idle-residency cost.

## Fix8 — Mobile UI unblock + idle isolation
- Removed the eager production confirmation iframe/overlay.
- Forced skip-confirm true so the page no longer opened/blocked on the confirmation popup.
- Fullscreen icon remained in the 1280×720 runtime coordinate system.
- User browser acceptance after Fix8: portrait and landscape UI render correctly and the phone has **no meaningful idle warming**. Treat Fix8 thermal behavior as PASS and a regression gate.
- User then reported two remaining functional issues:
  1. fullscreen icon is visible but does nothing when tapped;
  2. confirmation popup can no longer be reached.

## Fix9 — Mobile Fullscreen + Confirm Dialog Closure
### Root cause: fullscreen
`runtime/index.html` posted:
`channel: "maplem-light-sanctum-pray-site-v1"`

but the outer page listens on:
`channel: "gmsm-light-sanctum-pray"`

Therefore the runtime button click was real, but the outer page discarded the message before `toggleFullscreen()`.

Fix9 makes the runtime button use the existing outer bridge channel:
`gmsm-light-sanctum-pray`

The visual SVG/hit box remains in native 1280×720 coordinates; do not move it back to outer-page CSS pixels.

On iPhone Safari, non-video element fullscreen is not reliably available. The existing outer-page `fake-fullscreen` path remains the required iPhone fallback; desktop/iPad/compatible browsers may use native Fullscreen API.

### Confirmation popup restoration without Fix8 thermal regression
Fix8 removed the confirmation iframe entirely. Fix9 restores the already validated P137/P136 confirmation behavior, but **does not restore an eager resident confirm runtime**.

Implementation:
- `prayConfirmOverlay` / `prayConfirmFrame` exist again.
- frame starts as `about:blank`.
- `runtime/fix9-mobile-closure.js` loads `pray-confirm-popup/index.html` only when the overlay is actually opened.
- when the overlay closes, the confirm frame is returned to `about:blank`.
- production idle therefore does not keep the heavy confirmation runtime loaded.
- restored player logic is the pre-Fix8 P137 behavior:
  - SkipConfirm ON → Pray immediately.
  - SkipConfirm OFF → open PrayConfirmPopup.
- Fix9 helper restores the prior product default after initialization/reset: lower-right `跳過確認彈跳窗` remains checked by default, but the player can uncheck it and the popup must then work.

### Cache / deployment
- outer iframe cache key: `runtime/index.html?v=20260925-fix9`
- player cache key: `player-presentation.js?v=20260925-fix9`
- helper: `fix9-mobile-closure.js?v=20260925-fix9`

## Fix9 browser acceptance checklist
1. Open page in iPhone portrait. No confirmation popup should appear by itself.
2. Lower-right `跳過確認彈跳窗` should be checked after load/reset.
3. With it checked, Pray should run directly.
4. Tap the lower-right checkbox to turn it OFF, then Pray. The confirmation popup must appear.
5. Cancel must close without praying. Confirm must close and execute Pray.
6. Tap fullscreen in portrait. It must respond; on iPhone it should enter the page-level immersive/fake-fullscreen path rather than silently do nothing.
7. Rotate to landscape and repeat fullscreen enter/exit.
8. Confirm the fullscreen SVG still tracks the game title bar/X at the same scale.
9. Leave the page idle for 2–5 minutes. Fix8's “no meaningful warming” result must not regress.
10. If idle warming returns, run the 60 s profiler again and report the JSON plus subjective warmth.

## Hard regression gates
- Do not reintroduce an eager loaded PrayConfirm child runtime.
- Do not change P120 costs.
- Do not change native-proven particles/audio/EXP/level-up/slot-unlock behavior to solve mobile performance.
- Do not restore iPhone DPR 3 canvas rendering.
- Do not move fullscreen back into an outer responsive overlay; its visual/hit geometry belongs to the 1280×720 runtime.
- Do not force `skipConfirm=true` on every Pray request. The checkbox must control whether the popup is used.
