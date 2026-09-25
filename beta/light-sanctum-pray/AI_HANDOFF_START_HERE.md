# AI_HANDOFF_START_HERE — Light Sanctum Pray Mobile Audio Latency R1

## Current baseline — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Active beta route: `/beta/light-sanctum-pray/`
- Stable pre-audio baseline: `569e906ad32ceac4b54cbdd462690ac142f1c83c`.
- Click-audio scope/all-locked baseline before this latency change: `6eeb8a1272c7b61461cd2c934c70a559a7ceb45d`.
- Runtime lineage remains Preview137 / P121 on the user-verified fullscreen restore.

## User browser feedback
- Desktop click sound timing is acceptable.
- On mobile, BtMouseClick could arrive noticeably late, sometimes after the visible click/Pray animation had already progressed.
- This revision treats that as a playback-path latency problem rather than changing animation/gameplay timing.

## Mobile Audio Latency R1
- `runtime/click-audio.js` now uses Web Audio (`AudioContext` / `webkitAudioContext`) as the primary short-SFX engine.
- `BtMouseClick.mp3` is fetched and decoded to an `AudioBuffer` ahead of interaction when possible.
- First real game gesture resumes/unlocks the AudioContext for iOS/Safari.
- Game canvas SFX is triggered on `pointerdown` (or `touchstart`/`mousedown` fallback), before the later click/gameplay/animation work.
- Each click creates a fresh `AudioBufferSourceNode` and calls `start(0)`, so rapid taps do not wait for a shared HTMLAudio element to seek/restart.
- If Web Audio is unavailable, decode fails, or the first tap beats preload, the existing HTMLAudio path is retained as an immediate fallback. It is not the normal path after successful preload/unlock.
- No timers and no animation-complete hook are used for click sound.

## Audio scope — must not regress
- BtMouseClick belongs only to operations inside the MapleM simulator UI.
- Home, theme, outer level selector, reset, outer/fullscreen controls and the sound toggle are silent.
- In-game lock/unlock, Pray and skip-confirm remain audible.
- PrayConfirmPopup Confirm/Cancel remain audible through the existing parent message path.
- All-locked automatic popup bypass remains silent beyond the Pray tap; it must not create a second synthetic click sound.

## All-locked Pray rule — authoritative
- When every currently active blessing slot is locked, pressing Pray does not show PrayConfirmPopup even when skip-confirm is OFF.
- It directly uses the established all-locked Pray path: abilities remain unchanged, EXP increases, sealed costs apply, and level-up/slot-open transitions remain valid.
- Partial/unlocked Pray retains the existing popup behavior when skip-confirm is OFF.

## SEALED / must not regress
- P120 cost: `CharacterCoin = 5 × SlotCount`; `Meso = 1,500,000 × actual lockedCount`, including all-locked.
- P121 max-level / eligible-grade behavior remains unchanged.
- Popup Confirm/Cancel interaction and partial-lock row filtering remain unchanged.
- CPU bridge closure remains SEALED; do not rewrite `runtime/site-bridge.js`.
- Fullscreen geometry remains `top:19px; right:48px; width:72px; height:48px`.
- Safari toolbar-collapse work remains explicitly closed.

## Acceptance smoke
1. On iPhone/mobile, first and subsequent lock/Pray taps should produce BtMouseClick close to touch-down rather than after animation progress.
2. Rapid repeated valid game-UI taps should each be able to play without waiting for the previous sound to finish.
3. Desktop behavior remains immediate.
4. Main menu / theme / outer settings / fullscreen remain silent.
5. Popup Confirm/Cancel each play once.
6. All active slots locked + skip-confirm OFF: no visible popup; one Pray click sound only; abilities unchanged; EXP/cost applied once.
7. No gameplay, particle, fullscreen or idle-CPU regression.
