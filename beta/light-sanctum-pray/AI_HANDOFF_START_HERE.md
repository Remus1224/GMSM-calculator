# AI_HANDOFF_START_HERE — Light Sanctum Pray Preset Phase 1

## Current status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Feature branch: `feature/light-sanctum-pages`
- PR: `#6 — Light Sanctum Pray: add Preset 1 / 2 / 3`
- Preset 1 / 2 / 3 is implemented directly inside the Pray player runtime.
- The discarded runtime source-patching approach (`loader` / `source normalizer` / `Blob patch`) has been removed and must not return.
- **USER BROWSER ACCEPTANCE: PASS (2026-09-26).** The user opened the normal "光之聖所祈禱模擬器｜楓之谷M 也許有用的工具" page from the feature branch and reported that it was usable and all tested Preset behavior had no observed problems.
- First PR CI run on head `c223f2e1c49d18c848527a0f93a883d9cb9f503b`: **Validate project PASS**.
- Full PR diff review found one one-shot root helper `PROMOTE_LIGHT_SANCTUM_PRESETS.cmd`; it was intentionally removed before merge in commit `b51f6dafafed5a17e3045889e9f61d057c691ea7`.
- Production `light-sanctum-pray/runtime/player-presentation.js` on the feature branch is byte-identical to the browser-accepted Beta player (same Git blob SHA `e42fcc6c8028f68b8289d6e94fa050f347042819`).
- Main is not merged yet. Merge only after the updated PR head CI passes.

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

## Direct implementation
Browser-accepted Beta source:
- `beta/light-sanctum-pray/runtime/player-presentation.js`

Production integration source in the same PR:
- `light-sanctum-pray/runtime/player-presentation.js`

Both currently use the same Git blob SHA:
- `e42fcc6c8028f68b8289d6e94fa050f347042819`

Implementation commit lineage includes:
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
- `window.MAPLEM_PRAY_PRESET_PHASE1` exposes `ready: true` and evidence labels

## Static / CI validation
Static checks cover the Pray runtime via project validation workflow.

PR #6 first CI run:
- Workflow: `Validate project`
- Run number: `89`
- Head: `c223f2e1c49d18c848527a0f93a883d9cb9f503b`
- Result: **PASS**

The PR head then changed only to remove the one-shot promotion helper and update this handoff. Require the new head CI to PASS before merge.

## Browser validation PASS — 2026-09-26
The user directly used the normal simulator page and reported the feature was usable and the tests had no problems.

Treat the following as accepted unless a later regression is reported:
- Preset 1 is the initial selected page.
- Preset 2 can be switched to and used.
- Preset 3 lock/unlock behavior is acceptable under the level rule.
- Preset-owned result/lock state does not show an observed cross-preset regression in user testing.
- Existing simulator operation remained usable during the user's smoke test.

This is player browser acceptance plus PR integration review; production merge is still gated on final updated-head CI.

## PR diff review
PR #6 changed files were reviewed before merge.

Intended retained changes:
- `.github/workflows/validate.yml`
- `beta/light-sanctum-pray/AI_HANDOFF_START_HERE.md`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.ps1`
- `beta/light-sanctum-pray/runtime/player-presentation.js`
- `light-sanctum-pray/index.html`
- `light-sanctum-pray/runtime/index.html`
- `light-sanctum-pray/runtime/player-presentation.js`

Removed before merge:
- `PROMOTE_LIGHT_SANCTUM_PRESETS.cmd` — one-shot promotion helper, not runtime/production source.

No loader / source normalizer / Blob patch / temporary one-shot workflow should remain in the merge diff.

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
1. Wait for / verify CI PASS on the updated PR #6 head after cleanup.
2. Reconfirm the final changed-file list contains no temporary promotion/loader/normalizer/one-shot files.
3. Merge PR #6 into `main` if the updated-head CI is green and the PR remains mergeable.
4. Verify `main` contains the merged Preset production runtime and cache-bust changes.
5. Then prepare the formal Release / post-merge verification as appropriate.

## Release rule
- **Browser PASS: 2026-09-26.**
- **PR #6: OPEN.**
- **First CI: PASS.**
- **Full diff review: completed; one-shot promotion helper removed.**
- **Main: not yet merged.**
- **Release: not yet performed.**
