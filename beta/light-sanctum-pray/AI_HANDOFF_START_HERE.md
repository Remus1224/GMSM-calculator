# AI_HANDOFF_START_HERE — Light Sanctum Pray Click Audio

## Current baseline — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Active beta route: `/beta/light-sanctum-pray/`
- Stable pre-audio baseline: commit `569e906ad32ceac4b54cbdd462690ac142f1c83c` (`Restore verified Light Sanctum fullscreen baseline`).
- Runtime lineage remains Preview137 / P121 gameplay on the user-verified fullscreen restore.

## User-verified baseline that must not regress
- Pray, slot lock/unlock, confirmation popup Confirm/Cancel, level selection, reset, animation/particles and cumulative consumption are working.
- CPU feedback-loop closure remains SEALED: `runtime/site-bridge.js` protocol must not be rewritten.
- Fullscreen button geometry is user-verified and frozen: `top:19px; right:48px; width:72px; height:48px`.
- Safari toolbar-collapse/up-swipe requirement was explicitly abandoned. Do not reintroduce fullscreen scroll/touch relay experiments.

## This revision — UI click sound
User supplied `BtMouseClick.mp3`; it is the authority for the UI click sound. Audio characteristics checked before integration: ~0.261 s, mono/22050 Hz source decode, short UI click.

### Required behavior
- Default sound state: ON, matching the existing simulator convention (`🔊 音效：開啟`).
- Sound setting button is in the simulator settings header and uses the same existing `.btn-sound` / red `.muted` visual language as other simulators.
- OFF state: `🔇 音效：關閉`.
- Preference persists in `localStorage` key `gmsm-light-sanctum-pray-sound`.
- Click sound is played for game UI click/tap operations, including slot lock/unlock, Pray, skip-confirm checkbox/button, popup Confirm/Cancel and runtime fullscreen control.
- Site-level simulator controls (theme/navigation/reset and level selection) also use the same click sound.
- Audio playback is event-driven only; render/state restore/animation/state bridge must never synthesize click sounds.
- Playback restarts from time 0 so rapid repeated UI taps remain responsive.

### Files
- `runtime/audio/BtMouseClick.mp3` — user-supplied click audio.
- `runtime/click-audio.js` — runtime click playback, including existing popup action message reuse.
- `sound-toggle.js` — persisted sound setting and site-level UI click playback.
- `sound-toggle.css` — matches the existing simulator `.btn-sound` style.
- `index.html` / `runtime/index.html` — load only the new audio modules; gameplay logic remains untouched.

## Hard correctness rules
- Do not alter `runtime/player-presentation.js` gameplay/cost/EXP/lock/Pray logic merely for click audio.
- Do not alter `runtime/site-bridge.js`.
- Do not alter confirmation popup geometry/filtering.
- Do not move the verified fullscreen button.
- Do not couple sound playback to animation completion, state messages, render loops, or timers.
- Keep click audio optional and user-disableable.

## Acceptance smoke
1. Sound defaults ON and button reads `🔊 音效：開啟`.
2. Lock/unlock, Pray, skip-confirm and popup Confirm/Cancel each produce one click sound.
3. Turning sound OFF changes the button to red `🔇 音效：關閉`; subsequent UI operations are silent.
4. Turning sound back ON immediately restores click audio.
5. Refresh preserves the sound preference.
6. Pray/lock/popup/level/reset/fullscreen behavior remains identical to the verified baseline.
7. No idle CPU regression; no audio loop/timer exists.
