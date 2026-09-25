# AI_HANDOFF_START_HERE — Light Sanctum Pray Stable Fullscreen Restore

## Current baseline — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Active beta route: `/beta/light-sanctum-pray/`
- Runtime lineage: Preview137 → exact initial-working subtree restore → CPU root-cause closure → Fullscreen Restore 1 → verified fullscreen control alignment.
- Runtime/site files are intentionally restored to commit `56b8108a9319d1c68a1100fde276654f41485732` (`Match verified fullscreen control alignment`).

## User decision / scope closure
The user explicitly abandoned the requirement that iPhone Safari must allow an upward swipe from Light Sanctum fake fullscreen to collapse the browser/address chrome. Do not resume that work unless the user explicitly reopens it.

All post-`56b8108` fullscreen-scroll / toolbar-collapse experiments are removed from the active runtime. This includes iframe touch relay, parent scroll relay/state messaging, top-level diagnostic-route experiments, and the later Will-CSS experiment chain. The stable iframe architecture is retained.

## SEALED / browser-verified baseline
### Interaction baseline
Preserve Pray interaction, lock buttons, confirmation popup Confirm/Cancel, level selection, reset, P120/P121 gameplay, particles/audio and player presentation. These previously regressed when fullscreen/input work overreached and were restored before this baseline.

### CPU Root Cause Closure — PASS / SEALED
Idle CPU root cause was proven to be the bridge feedback loop `ready → get-state → ready`. Fix commit: `c709f39e96755568ae7765f76ef2cec0ca713aaa`.
`runtime/site-bridge.js` must keep the corrected protocol (`hello → sendReady()` and `get-state → queueState()`). Do not rewrite this bridge without new evidence.

### Fullscreen control alignment — preserved
User manually verified the fullscreen button alignment and specified:
- `top: 19px`
- `width: 72px`
- existing `right: 48px`
- existing `height: 48px`

Commit `56b8108a9319d1c68a1100fde276654f41485732` is the exact reference point for this geometry.

## Hard rules
- Do not change `runtime/site-bridge.js` for fullscreen/UI work without evidence.
- Do not alter P137/P121 gameplay, P120 cost rules, confirmation popup interaction, particles, audio, level selection, cumulative usage, or reset semantics as collateral fullscreen changes.
- Do not add transparent pointer-blocking overlays over the runtime.
- Do not reintroduce `fullscreen-scroll-relay`, synthetic `window.scrollBy` gesture relays, iframe touchstart/touchmove forwarding, or iOS top-level diagnostic routes.
- Do not restructure/remove `iframe#simulator-frame` merely to hide Safari browser chrome.
- Fullscreen icon remains in native 1280×720 runtime coordinates with the verified geometry above.

## Current acceptance target
Only verify that the restored baseline still behaves normally:
1. Desktop: simulator loads, Pray/lock interactions work, confirmation Confirm/Cancel is clickable, level selector works, reset works, and fullscreen enter/exit works.
2. Mobile: simulator remains usable and fullscreen enter/exit works. Safari browser chrome is allowed to remain visible; collapsing it is no longer a requirement.
3. Performance: idle CPU behavior must remain at the previously SEALED low-idle baseline.

## Next work
Do not continue fullscreen-toolbar experiments. After the user confirms this restored baseline, continue only with remaining Light Sanctum fidelity/gameplay work requested by the user.
