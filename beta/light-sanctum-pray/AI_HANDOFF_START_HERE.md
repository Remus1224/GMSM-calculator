# AI_HANDOFF_START_HERE — Light Sanctum Pray Preset Phase 1 SEALED

## Current status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Feature branch: `feature/light-sanctum-pages`
- PR: `#6 — Light Sanctum Pray: add Preset 1 / 2 / 3`
- PR #6 is **MERGED** into `main`.
- Merge commit: `6e3f649a7fcdd3d50c48cc520f170bb643ca8273`.
- `Validate project` on the final PR head: **PASS**.
- `Validate project` on merged `main` (run #92): **PASS**.
- GitHub Pages build/deployment #542 for the merge commit: **PASS**.
- **PRODUCTION BROWSER ACCEPTANCE: PASS (2026-09-26).** After deployment completed, the user tested the normal production "光之聖所祈禱模擬器｜楓之谷M 也許有用的工具" page and reported no observed problems.
- Preset Phase 1 is now **PRODUCTION PASS / SEALED** unless a later regression is reported.
- The discarded runtime source-patching approach (`loader` / `source normalizer` / `Blob patch`) was removed and must not return.

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

Accepted model:
- sanctuary level / accumulated EXP / currencies / Pray count are shared;
- each preset owns an independent five-slot blessing state and lock state;
- availability follows `LevelInfo.presetCount`;
- Lv.1: preset 1 selected, preset 2 available, preset 3 locked and displays `Lv.11`;
- preset 3 becomes available at Lv.11.

## Production implementation
Browser-accepted Beta source:
- `beta/light-sanctum-pray/runtime/player-presentation.js`

Production source:
- `light-sanctum-pray/runtime/player-presentation.js`

At PR integration time both used the same Git blob SHA:
- `e42fcc6c8028f68b8289d6e94fa050f347042819`

Production page cache route after merge:
- outer iframe: `runtime/index.html?v=20260926-preset-r1`
- runtime player: `player-presentation.js?v=20260926-preset-r1`

Implemented:
- `gameplayState.activePreset = 1`
- `gameplayState.presets = [preset1, preset2, preset3]`
- each preset has independent `slots[5]` and `locks[5]`
- existing `gameplayState.slots` / `gameplayState.locks` alias the active preset so established Pray/cost/popup logic stays on the same path
- `gameplayPresetCount(level)` reads `LevelInfo.presetCount`
- `gameplayPresetUnlockLevel(presetIndex)` derives the first level where the preset is available
- `gameplaySwitchPreset()` blocks unavailable presets, blocks during pending Pray, interrupts current visual work, closes confirm popup, swaps active alias, and rerenders
- render drives preset `/on`, `/off`, `/lock` hierarchy state and lock label
- click hit testing and pointer hover support preset 1 / 2 / 3
- debug level-down cleanup applies to all preset stores
- newly opened slot lock reset applies to all preset stores
- reset returns to preset 1 and clears all three preset stores
- `window.MAPLEM_PRAY_PRESETS.snapshot()` exposes current per-preset state for browser diagnostics
- `window.MAPLEM_PRAY_PRESET_PHASE1` exposes readiness/evidence metadata

## Validation history
### Player browser acceptance — PASS
Before merge, the user directly used the normal feature-branch simulator page and reported Preset behavior had no observed issues.

Accepted behaviors include:
- Preset 1 initial selected state
- Preset 2 switching/usage
- Preset 3 lock/unlock behavior under level rule
- independent result/lock state per preset
- no observed regression in established simulator operation

### PR / integration validation — PASS
- Full PR diff reviewed.
- Final retained changed files: 8.
- One-shot `PROMOTE_LIGHT_SANCTUM_PRESETS.cmd` was removed before merge.
- No runtime loader / source normalizer / Blob patch / temporary one-shot workflow remained.
- Final PR-head `Validate project` run #91: **PASS**.
- PR #6 merged successfully using squash merge.

### Main / deployment validation — PASS
- Merge commit: `6e3f649a7fcdd3d50c48cc520f170bb643ca8273`.
- Main `Validate project` run #92: **PASS**.
- GitHub Pages build/deployment #542: **PASS**.
- User then tested the deployed production simulator and reported **no problems**.

Verdict:
- **Preset Phase 1: PRODUCTION BROWSER PASS / SEALED.**

## PR diff retained in main
- `.github/workflows/validate.yml`
- `beta/light-sanctum-pray/AI_HANDOFF_START_HERE.md`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.ps1`
- `beta/light-sanctum-pray/runtime/player-presentation.js`
- `light-sanctum-pray/index.html`
- `light-sanctum-pray/runtime/index.html`
- `light-sanctum-pray/runtime/player-presentation.js`

Removed before merge:
- `PROMOTE_LIGHT_SANCTUM_PRESETS.cmd` — one-shot promotion helper, intentionally excluded from main.

## Local browser route
Direct `file://` is not supported for acceptance because Chromium treats nested local files as unique origins.

Optional local route:
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`
- URL: `http://127.0.0.1:8765/beta/light-sanctum-pray/`

## Hard regression boundary — SEALED
Do not regress or redesign these without new evidence / explicit scope:
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
- Preset 1 / 2 / 3 production behavior from PR #6
- dedicated Pray-result sound codes remain unresolved/silent; do not invent substitutes

## Diagnostic API
Inside the runtime iframe:
```js
window.MAPLEM_PRAY_PRESET_PHASE1
window.MAPLEM_PRAY_PRESETS.snapshot()
```

## Current baseline
Use merged `main` commit `6e3f649a7fcdd3d50c48cc520f170bb643ca8273` as the Preset Phase 1 production baseline.

Do not reopen Preset Phase 1 unless:
- the user reports a production regression;
- new reverse-engineering evidence contradicts the accepted model;
- a later feature explicitly requires changing preset behavior.

## Next work
Preset Phase 1 itself requires no further implementation.

Future work should begin from this SEALED production baseline and preserve all hard regression boundaries above.

## Release / acceptance summary
- **Feature Browser Acceptance: PASS (2026-09-26).**
- **PR #6: MERGED.**
- **Final PR CI: PASS.**
- **Main CI: PASS.**
- **GitHub Pages deployment: PASS.**
- **Production Browser Acceptance: PASS (2026-09-26).**
- **Preset Phase 1: PRODUCTION PASS / SEALED.**
