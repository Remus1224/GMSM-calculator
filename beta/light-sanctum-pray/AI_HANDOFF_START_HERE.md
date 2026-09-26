# AI_HANDOFF_START_HERE — Light Sanctum Pray Preset Phase 1

## Current status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Feature branch: `feature/light-sanctum-pages`
- Production/main remains untouched and is still the current SEALED baseline.
- Preset 1 / 2 / 3 is now implemented **directly inside Beta `runtime/player-presentation.js`**.
- The discarded runtime source-patching approach (`loader` / `source normalizer` / `Blob patch`) has been removed and must not return.
- Browser acceptance is still pending. Do not merge to main yet.

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

Therefore the working model is:
- sanctuary level / accumulated EXP / currencies / Pray count are shared;
- each preset owns an independent five-slot blessing state and lock state;
- availability follows `LevelInfo.presetCount`;
- Lv.1: preset 1 selected, preset 2 available, preset 3 locked and displays `Lv.11`;
- preset 3 becomes available at Lv.11.

## Direct Beta implementation
Target file:
- `beta/light-sanctum-pray/runtime/player-presentation.js`

Implementation commit:
- `e09ff83fa139fe3b1d822db3a6f43f1eb6c0d2cb` — `feat: implement direct beta light sanctum presets`

Implemented:
- `gameplayState.activePreset = 1`
- `gameplayState.presets = [preset1, preset2, preset3]`
- each preset has independent `slots[5]` and `locks[5]`
- existing `gameplayState.slots` / `gameplayState.locks` are aliases to the active preset so existing sealed Pray/cost/popup logic remains on its established path
- `gameplayPresetCount(level)` reads `LevelInfo.presetCount`
- `gameplayPresetUnlockLevel(presetIndex)` derives the first level where that preset is available
- `gameplaySwitchPreset()` blocks unavailable presets, blocks during pending Pray, interrupts current visual work, closes confirm popup, swaps active alias, and rerenders
- render now drives preset `/on`, `/off`, `/lock` hierarchy state and lock label
- click hit testing and pointer hover support preset 1 / 2 / 3
- debug level-down cleanup applies to all preset stores
- newly opened slot lock reset applies to all preset stores
- reset returns to preset 1 and clears all three preset stores
- `window.MAPLEM_PRAY_PRESETS.snapshot()` exposes current per-preset state for browser diagnostics
- `window.MAPLEM_PRAY_PRESET_PHASE1` exposes `ready: true`, `mode: "direct-beta"`, and evidence labels

## Static validation already PASS
A one-shot branch-only workflow applied the direct edit and ran:
- `node --check beta/light-sanctum-pray/runtime/player-presentation.js`
- marker guard for `MAPLEM_PRAY_PRESETS`
- marker guard for `gameplayState.presets=`
- marker guard for `function gameplaySwitchPreset`
- absence guards for the removed loader / normalizer / status bridge

The one-shot run completed successfully. Temporary one-shot workflow/script files were deleted afterward, so they do not remain in the branch.

## Current branch diff against main
After cleanup, the meaningful branch differences are limited to:
- `.github/workflows/validate.yml`
- `beta/light-sanctum-pray/AI_HANDOFF_START_HERE.md`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.ps1`
- `beta/light-sanctum-pray/runtime/player-presentation.js`

The Preset feature delta in `player-presentation.js` is small: 24 additions / 9 deletions at the last comparison.

## Local browser route
Direct `file://` is not supported for acceptance because Chromium treats nested local files as unique origins.

Use:
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`
- URL: `http://127.0.0.1:8765/beta/light-sanctum-pray/`

This route needs no Python, Node, or Git CLI on the user's Windows machine.

## Hard regression boundary — SEALED
Do not regress or redesign these while validating presets:
- P98 OptionChange native particle restoration
- P104 result / refresh behavior
- P114 rapid Pray behavior
- P117 all-locked Pray / EXP behavior
- P118 level-up + slot-open overlapping presentation timing
- P119 unlocked-slot prompt / Skip Confirm behavior
- P120 costs: `CharacterCoin = 5 × SlotCount`; `Meso = 1,500,000 × actual lockedCount`
- P121 eligible grades / max-level presentation
- PrayConfirmPopup P136 WebFix2 / P137 backport behavior
- generic click audio closure
- fullscreen / site bridge behavior
- dedicated Pray-result sound codes remain unresolved/silent; do not invent substitutes

## Required browser acceptance
1. Pull latest `feature/light-sanctum-pages`.
2. Start `RUN_LOCAL_PREVIEW.cmd`.
3. Open `http://127.0.0.1:8765/beta/light-sanctum-pray/` and hard refresh.
4. At Lv.1:
   - preset 1 selected
   - preset 2 selectable
   - preset 3 locked and shows `Lv.11`
5. Pray in preset 1; note result.
6. Switch to preset 2; it must be independent/empty.
7. Pray in preset 2; switch back to preset 1; preset 1 result must persist.
8. Lock a slot in preset 1; switch 1 → 2 → 1; lock must remain only in preset 1.
9. Before Lv.11, clicking preset 3 must not switch.
10. Use Debug/Audit to reach Lv.11; preset 3 must become selectable and independent.
11. Level / EXP / balances remain shared across presets.
12. Switching during active OptionChange / level-up / slot-open visual work must stop the old visual path rather than leave hidden RAF/particle work running.
13. Regression smoke:
    - Pray
    - lock/unlock
    - all-locked EXP-only
    - Confirm / Cancel popup
    - rapid Pray
    - click audio
    - 0-lock / lock-cost layout
    - fullscreen
    - desktop/mobile rendering

Diagnostic API inside the runtime iframe:
```js
window.MAPLEM_PRAY_PRESET_PHASE1
window.MAPLEM_PRAY_PRESETS.snapshot()
```

## Release rule
- Browser PASS is not yet granted.
- No PR yet.
- Do not merge to main yet.
- After browser PASS: open PR `feature/light-sanctum-pages` → `main` → require CI PASS → review complete diff → merge → Release.
