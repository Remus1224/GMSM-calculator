# AI_HANDOFF_START_HERE — Light Sanctum Pray Preset Phase 1

## Current status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Feature branch: `feature/light-sanctum-pages`
- Production/main remains the user-accepted sealed baseline and must not be modified by preset experiments.
- Preset Phase 1 is still **beta-only** and has **NOT** passed browser acceptance yet.
- Local preview route is working through `RUN_LOCAL_PREVIEW.cmd` / `RUN_LOCAL_PREVIEW.ps1` at `http://127.0.0.1:8765/beta/light-sanctum-pray/`.

## Evidence-backed preset model
Top-left `1 / 2 / 3` controls are Pray presets under:
- `VarB_107Popup/Group/Pray/preset/01`
- `VarB_107Popup/Group/Pray/preset/02`
- `VarB_107Popup/Group/Pray/preset/03`

Client / exported evidence supports:
- `SantuaryOfLightPopupFunc.OnChangePreset(int presetIndex)`
- `SanctuaryOfLightStatFunc.GetCurrentPresetIndex()`
- `GetCurrentPresetCount()`
- `GetPresetUnlockLevel(int presetIndex)`
- `SearchStatSlot(int presetIndex, int slotIndex)`
- `UpdateStatGrade(int presetIndex, int slotIndex, ..., bool locked)`

Therefore:
- Level / accumulated EXP / currencies / pray count are shared sanctuary state.
- Each Pray preset owns independent five-slot blessing state and lock state.
- Availability follows `LevelInfo.presetCount`.
- Lv.1 fixture proves preset 1 selected, preset 2 available, preset 3 locked with `Lv.11`.

## Phase 1 implementation intent
- `activePreset`, default 1.
- Three independent `{ slots[5], locks[5] }` stores.
- Existing `gameplayState.slots/locks` remain aliases to active preset so sealed Pray/cost/popup/particle logic stays on its existing path.
- Preset `on/off/lock` hierarchy nodes follow availability and selected preset.
- Switching preset closes confirm UI and interrupts active visual work so old preset RAF/particle work does not continue in background.
- Reset restores preset 1 and clears all three preset stores.
- `window.MAPLEM_PRAY_PRESETS.snapshot()` is the diagnostic API.

## Hard regression boundary — SEALED
Do not rewrite/simplify these while developing presets:
- P98 OptionChange particle restoration.
- P104 result/refresh behavior.
- P114 rapid Pray behavior.
- P117 all-locked Pray/EXP behavior.
- P118 level-up + slot-open parallel presentation timing.
- P119 unlocked-slot prompt / skip-confirm behavior.
- P120 costs: `CharacterCoin = 5 × SlotCount`; `Meso = 1,500,000 × actual lockedCount`.
- P121 eligible grades / max-level presentation.
- PrayConfirmPopup P136 WebFix2 behavior and partial-lock filtering.
- Current generic click audio closure.
- Current fullscreen geometry and site bridge.
- Dedicated Pray-result sound codes remain unresolved/silent; do not guess substitutes.

## Local preview findings
### 1. Direct `file://` route rejected
Chromium treated nested local documents as unique origins and blocked XHR/fetch/iframe interactions. Direct file launch is no longer a supported test path.

### 2. One-click local HTTP route works
Use:
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`
- starts built-in Windows PowerShell/.NET loopback server
- no Python, Node, Git CLI, or extra installation required
- default URL: `http://127.0.0.1:8765/beta/light-sanctum-pray/`

The first PowerShell script revision had a Windows PowerShell 5.1 parser/encoding issue; it was replaced with an ASCII-safe script. User then successfully launched the local HTTP preview.

## Current blocker — preset patch anchor mismatch
User browser smoke on the working HTTP preview produced:

```text
Preset Phase 1 loader failed: preset helpers: anchor not found
```

and top-level diagnostic:

```js
document.documentElement.dataset.presetPhase1
// 'failed'
```

This proves:
- Local HTTP preview is working.
- The runtime black screen is now caused by the Preset Phase 1 patch bootstrap, not by GitHub Desktop, file://, Python, PowerShell, or the outer site shell.
- The failing anchor is specifically the multi-line `preset helpers` anchor.

Inspection of repository source shows the intended helper lines do exist in the base player. The remaining discrepancy is consistent with the Windows checkout/local server serving CRLF text while the loader's multi-line anchor was authored with LF. Single-line anchors before it can match, while the first multi-line anchor fails.

## Current fix — line-ending normalization before patching
New Beta file:
- `runtime/preset-source-normalizer.js`

It wraps only the fetch of `player-presentation.js`, normalizes `CRLF` / lone `CR` to `LF`, and returns the normalized source to the existing fail-closed preset loader. HTTP behavior for all other resources is unchanged.

Beta runtime load order is now:
1. scene / fixture / gameplay / particle data
2. sealed `player-presentation-patch.js`
3. `preset-status-bridge.js`
4. `preset-source-normalizer.js`
5. `player-presentation-pages-loader.js`

`MAPLEM_PRESET_SOURCE_NORMALIZER` exposes diagnostics including CRLF count and whether normalization changed the source.

Relevant new commits:
- `fcd375a5168573f6fe682a38a71cc20689a00f8f` — add preset player source line-ending normalizer.
- `a7e606b7eecf90e96afd426cf3c7d7117870b13c` — load normalizer before preset loader.
- `6f4349f81e297c1b73c13fecee366fa7b2c8187c` — add normalizer to PR syntax gate.

## Next browser smoke
1. Pull latest `feature/light-sanctum-pages` in GitHub Desktop.
2. Keep/restart `RUN_LOCAL_PREVIEW.cmd`.
3. Hard refresh the browser page.
4. Check:
```js
document.documentElement.dataset.presetPhase1
```
Expected: `"ready"`.
5. If still failed, send the first `Preset Phase 1 loader failed: ...` Console line and:
```js
window.frames[0]?.MAPLEM_PRESET_SOURCE_NORMALIZER
```
6. Only after runtime reaches `ready`, proceed to full preset behavior acceptance.

## Full acceptance sequence after boot succeeds
1. Lv.1: preset 1 selected, preset 2 selectable, preset 3 locked `Lv.11`.
2. Pray in preset 1; switch to preset 2; preset 2 must have independent blessing/lock state.
3. Pray in preset 2; return to preset 1; preset 1 result must persist.
4. Lock in preset 1; switch 1 → 2 → 1; lock remains only in preset 1.
5. Preset 3 refuses selection before Lv.11.
6. At Lv.11 preset 3 becomes selectable and independent.
7. Level / EXP / currencies remain shared across presets.
8. Switching during active result animation stops old-preset visual work.
9. Regression smoke: Pray, lock/unlock, all-locked EXP-only, Confirm/Cancel popup, rapid Pray, click audio, cost layout, fullscreen, desktop/mobile rendering.

## Release rule
- No PR yet.
- Browser/player smoke is NOT PASS yet.
- Do not merge to main.
- After browser PASS: open PR `feature/light-sanctum-pages` → `main`, require CI PASS, review diff, merge, then promote/release.
