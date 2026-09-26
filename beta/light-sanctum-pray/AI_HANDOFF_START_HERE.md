# AI_HANDOFF_START_HERE — Light Sanctum Pray Preset Phase 1

## Current status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Feature branch: `feature/light-sanctum-pages`
- Production/main remains untouched and is still the current SEALED baseline.
- Preset 1 / 2 / 3 is implemented **directly inside Beta `runtime/player-presentation.js`**.
- The discarded runtime source-patching approach (`loader` / `source normalizer` / `Blob patch`) has been removed and must not return.
- **USER BROWSER ACCEPTANCE: PASS (2026-09-26).** The user opened the normal "光之聖所祈禱模擬器｜楓之谷M 也許有用的工具" page from the feature branch and reported that it was usable and all tested Preset behavior had no observed problems.
- This is now safe to advance to the formal PR / CI / diff-review stage. Do not merge main until that stage is completed.

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

Therefore the accepted model is:
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
- render drives preset `/on`, `/off`, `/lock` hierarchy state and lock label
- click hit testing and pointer hover support preset 1 / 2 / 3
- debug level-down cleanup applies to all preset stores
- newly opened slot lock reset applies to all preset stores
- reset returns to preset 1 and clears all three preset stores
- `window.MAPLEM_PRAY_PRESETS.snapshot()` exposes current per-preset state for browser diagnostics
- `window.MAPLEM_PRAY_PRESET_PHASE1` exposes `ready: true`, `mode: "direct-beta"`, and evidence labels

## Static validation PASS
A one-shot branch-only workflow applied the direct edit and ran:
- `node --check beta/light-sanctum-pray/runtime/player-presentation.js`
- marker guard for `MAPLEM_PRAY_PRESETS`
- marker guard for `gameplayState.presets=`
- marker guard for `function gameplaySwitchPreset`
- absence guards for the removed loader / normalizer / status bridge

The one-shot run completed successfully. Temporary one-shot workflow/script files were deleted afterward, so they do not remain in the branch.

## Browser validation PASS — 2026-09-26
The user directly used the normal simulator page and reported the feature was usable and the tests had no problems.

Treat the following as accepted unless a later regression is reported:
- Preset 1 is the initial selected page.
- Preset 2 can be switched to and used.
- Preset 3 lock/unlock behavior is acceptable under the level rule.
- Preset-owned result/lock state does not show an observed cross-preset regression in user testing.
- Existing simulator operation remained usable during the user's smoke test.

This is **player browser acceptance**, not yet a production merge/release verdict.

## Current branch diff against main
Meaningful branch differences are limited to:
- `.github/workflows/validate.yml`
- `beta/light-sanctum-pray/AI_HANDOFF_START_HERE.md`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.ps1`
- `beta/light-sanctum-pray/runtime/player-presentation.js`

The direct Preset feature remains a small delta rather than a separate runtime patch architecture.

## Local browser route
Direct `file://` is not supported for acceptance because Chromium treats nested local files as unique origins.

Optional local route:
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`
- URL: `http://127.0.0.1:8765/beta/light-sanctum-pray/`

The user also confirmed the normal simulator page itself was directly usable for this acceptance round.

## Hard regression boundary — SEALED
Do not regress or redesign these while integrating presets:
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

## Diagnostic API
Inside the runtime iframe:
```js
window.MAPLEM_PRAY_PRESET_PHASE1
window.MAPLEM_PRAY_PRESETS.snapshot()
```

## Next formal step
1. Open PR `feature/light-sanctum-pages` → `main`.
2. Require project CI PASS.
3. Review the complete branch diff, especially `beta/light-sanctum-pray/runtime/player-presentation.js` and workflow changes.
4. Confirm no accidental temporary loader/normalizer/one-shot files remain.
5. Only after PR + CI + diff review: merge main.
6. Then prepare Release / production integration as appropriate.

## Release rule
- **Browser PASS: granted 2026-09-26.**
- PR: not yet opened.
- Main: not yet merged.
- Release: not yet performed.
