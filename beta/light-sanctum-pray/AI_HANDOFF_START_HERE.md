# AI_HANDOFF_START_HERE — Light Sanctum Pray Fullscreen Scroll 1

## Current baseline — 2026-09-26
- Site/repo: `Remus1224/GMSM-calculator`
- Active beta route: `/beta/light-sanctum-pray/`
- Runtime lineage: Preview137 → user-PASS P136 WebFix2 → production integration → exact initial-working subtree restore → CPU root-cause closure → Fullscreen Restore 1 → Fullscreen Scroll 1.

## SEALED / browser-verified
### P137 interaction baseline restored
Preserve Pray interaction, confirmation popup, level selection, reset, P120/P121 gameplay, particles/audio and player presentation.

### CPU Root Cause Closure — PASS / SEALED
Idle CPU root cause was proven to be the bridge feedback loop `ready → get-state → ready`. Fix commit `c709f39e96755568ae7765f76ef2cec0ca713aaa`; `runtime/site-bridge.js` now keeps `hello → sendReady()` and uses `get-state → queueState()`. User Performance Trace after the fix was effectively idle. Do not rewrite this bridge protocol without new evidence.

## Fullscreen Scroll 1 — awaiting iPhone browser acceptance
User supplied side-by-side screen recording: Will fake fullscreen can swipe upward and Safari collapses its browser chrome; Light Sanctum fake fullscreen cannot. The important structural difference is now explicit: Will's playable surface lives directly in the top-level document, while Light Sanctum's 1280×720 player is inside `iframe#simulator-frame`. A touch gesture that begins inside that iframe does not become a top-document page-scroll gesture, so merely removing outer `overflow:hidden` was insufficient.

Changes in this revision:
- Preserve the existing working fullscreen button geometry (`top:19px`, `width:72px`) and existing fake/native fullscreen split.
- Preserve the SEALED gameplay/site bridge; `runtime/site-bridge.js` is untouched.
- Parent sends runtime a small `fullscreen-state` message when fake fullscreen changes.
- Runtime listens passively for one-finger vertical touch movement only while iOS fake fullscreen is active and relays deltaY to the parent.
- Parent applies that delta with top-level `window.scrollBy`, restoring the missing top-document scroll path without `preventDefault` and without overlaying/blocking Pray controls.
- Cache key changed to `20260926-fullscreen-scroll1` so GitHub Pages does not mix the previous shell/runtime.

Commits in this change:
- `9dbc11b47d2ed7e7fb1625c718f31d78b35d370e` parent fullscreen relay receiver/state.
- `25fdf63d51b24ca1c62303179b7d849003d7ad02` runtime passive touch relay.
- `7ae1884974bd1da892a7b3a650d6a650276aa23c` cache-busted shell.

## Hard rules
- Do not change `runtime/site-bridge.js` for fullscreen work.
- Do not alter P137/P121 gameplay, P120 cost rules, confirmation popup interaction, particles, audio, level selection, cumulative usage or reset semantics.
- Do not add transparent pointer-blocking overlays over the runtime; they would recreate the earlier broken interaction state.
- Fullscreen icon remains in native 1280×720 runtime coordinates.
- Do not mark Fullscreen Scroll 1 PASS until real iPhone Safari confirms browser chrome can collapse while already in fake fullscreen.

## Browser acceptance next
On iPhone Safari, enter Light Sanctum fullscreen first, then swipe upward over the simulator. Expected: Safari address/browser chrome collapses similarly to Will and the simulator reflows to the enlarged visual viewport. Then verify Pray, lock buttons, confirmation Confirm/Cancel, and fullscreen exit remain tappable. Desktop behavior should remain unchanged. If Safari still refuses to collapse chrome, do not stack another CSS workaround; the next investigation is whether iOS permits programmatic parent scroll to drive chrome collapse from an iframe-originating gesture, and if not the architecture must move the iOS fullscreen player into the top-level browsing context rather than intercepting input.
