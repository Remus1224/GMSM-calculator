# AI_HANDOFF_START_HERE — Light Sanctum Pray FINAL / Browser Accepted

## Final status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Accepted beta route: `/beta/light-sanctum-pray/`
- Runtime lineage: Preview137 / P121 + P120 cost fidelity + restored fullscreen geometry + low-idle CPU bridge + Click Audio R2 + Mobile Audio Latency R1.
- Mobile Audio Latency implementation baseline: `12a8d44e1685c065f6dbb930a6756dd8f4cb446e`.
- User browser acceptance after Mobile Audio Latency R1: **PASS — 「目前測試 沒什麼問題」**.
- Project disposition: **READY TO CLOSE / READY FOR MANUAL PROMOTION FROM BETA TO MAIN ROUTE**.

## Final browser-accepted behavior
- Desktop and mobile simulator operation is responsive enough for release; the earlier high-CPU / interaction regressions were removed before this baseline.
- Mobile BtMouseClick timing is accepted after switching the short UI SFX path to Web Audio and triggering it from the earliest valid game gesture.
- Fullscreen button geometry is the user-adjusted accepted position: `top:19px; right:48px; width:72px; height:48px`.
- Safari toolbar-collapse/fullscreen scrolling experiment was abandoned by explicit user decision and its experimental changes were removed; do not reopen it unless requested.
- Popup Confirm/Cancel works; all-locked Pray bypasses the popup and directly adds EXP while preserving locked abilities.

## Mobile Audio Latency R1
- `runtime/click-audio.js` uses Web Audio (`AudioContext` / `webkitAudioContext`) as the primary short-SFX engine.
- `BtMouseClick.mp3` is fetched and decoded to an `AudioBuffer` ahead of interaction when possible.
- First real game gesture resumes/unlocks the AudioContext for iOS/Safari.
- Game canvas SFX is triggered on `pointerdown` (or `touchstart`/`mousedown` fallback), before later click/gameplay/animation work.
- Each click creates a fresh `AudioBufferSourceNode` and calls `start(0)`, allowing rapid taps without waiting for a shared HTMLAudio element to seek/restart.
- HTMLAudio remains only as a safety fallback if Web Audio is unavailable/not ready.
- No timer or animation-complete hook controls click sound.

## Audio scope — SEALED
- BtMouseClick belongs only to operations inside the MapleM simulator UI.
- In-game lock/unlock, Pray, skip-confirm, and PrayConfirmPopup Confirm/Cancel are audible.
- Home/main menu, theme/day-night toggle, outer level/reset/settings, fullscreen and the sound toggle are silent.
- All-locked automatic popup bypass must not synthesize a second click sound beyond the original Pray tap.

## Gameplay correctness — SEALED
- P120 cost: `CharacterCoin = 5 × SlotCount`.
- P120 Meso: `1,500,000 × actual lockedCount`, including all-locked; no `SlotCount - 1` cap.
- 0 Lock: Meso group hidden and CharacterCoin cost centered.
- All active slots locked: Pray does not show PrayConfirmPopup even if skip-confirm is OFF; abilities remain unchanged, EXP increases, cost applies once, and level-up/slot-open transitions remain valid.
- Partial/unlocked Pray: existing confirmation behavior remains when skip-confirm is OFF.
- P121 max level remains `Lv.MAX`; max EXP presentation and eligible grade rules remain unchanged.
- Established level-up, slot-unlock, Pray animation, native-proven particle/effect behavior remain authoritative.

## Architecture / performance — SEALED
- CPU bridge closure remains SEALED; do not rewrite `runtime/site-bridge.js` without new measured evidence.
- Do not reintroduce high-frequency bridge polling or speculative fullscreen/scroll handlers.
- Do not replace working interaction/popup code with newly invented handlers when an accepted historical implementation exists.
- Preserve relative asset/audio/runtime paths when promoting the accepted beta contents to the production route.

## Promotion guidance
The user plans to manually move the accepted contents from the beta directory to the production/main directory. Treat this as a path/deployment operation, not a new feature revision. Preserve the accepted directory structure and relative references (`runtime/`, audio, popup runtime, native particle assets, etc.). After promotion, only a short production smoke is needed: load, level selection, lock/unlock, Pray, normal popup Confirm/Cancel, all-locked Pray, sound toggle/audio scope, fullscreen, and mobile touch/audio timing.

## Final acceptance smoke
1. Desktop/mobile page loads and remains responsive.
2. Level selection and normal simulator interaction work.
3. Lock/unlock and Pray produce one timely BtMouseClick; shell controls remain silent.
4. Normal/partial-lock Pray with skip-confirm OFF shows working Confirm/Cancel popup.
5. All active slots locked + skip-confirm OFF shows no popup; abilities unchanged; EXP/cost applied exactly once.
6. Level-up/slot unlock/effects remain correct.
7. Fullscreen button remains at accepted geometry and fullscreen itself works.
8. No idle CPU regression.

## Closure
As of the user's 2026-09-26 browser test, there is no known blocker requiring another beta revision. This simulator can be considered **browser-accepted and closed**, subject only to a brief smoke test after the user's manual beta-to-production promotion.
