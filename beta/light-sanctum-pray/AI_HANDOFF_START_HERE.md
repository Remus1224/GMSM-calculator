# AI_HANDOFF_START_HERE — Light Sanctum Pray Preset Phase 1

## Current status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Feature branch: `feature/light-sanctum-pages`
- Production/main remains the user-accepted sealed baseline and must not be modified by preset experiments.
- The user accepted and promoted the Cost Label Fit behavior: full cost numbers remain visible by shrinking only when needed; material/Meso icons are reduced and redundant resource-name text is removed.
- Preset Phase 1 is **beta-only** and still requires player browser acceptance before PR/merge/release.

## Critical discovery: 1 / 2 / 3 are Pray presets, not separate unrelated pages
The top-left `1 / 2 / 3` controls belong to:
- `VarB_107Popup/Group/Pray/preset/01`
- `VarB_107Popup/Group/Pray/preset/02`
- `VarB_107Popup/Group/Pray/preset/03`

Lv.1 ground-truth fixture already proves:
- Preset 1 = selected (`on`).
- Preset 2 = available but not selected (`off`).
- Preset 3 = locked and displays `Lv.11`.

The exported/client LevelInfo carries `presetCount`, and the current-build client exposes the corresponding native model:
- `SantuaryOfLightPopupFunc.OnChangePreset(int presetIndex)`
- `SanctuaryOfLightStatFunc.GetCurrentPresetIndex()`
- `SanctuaryOfLightStatFunc.GetCurrentPresetCount()`
- `SanctuaryOfLightStatFunc.GetPresetUnlockLevel(int presetIndex)`
- `SanctuaryOfLightStatFunc.SearchStatSlot(int presetIndex, int slotIndex)`
- `SanctuaryOfLightStatFunc.UpdateStatGrade(int presetIndex, int slotIndex, ..., bool locked)`

Therefore the evidence-backed state model is:
- Level / accumulated EXP / currencies / pray count are shared sanctuary state.
- Each Pray preset independently owns its five blessing slots and lock states.
- Available preset count follows LevelInfo `presetCount`.
- A locked preset must not become selectable before its unlock level.

## Preset Phase 1 implementation
New beta-only file:
- `runtime/player-presentation-pages-loader.js`

Implementation / governance commits:
- `d83d9d0130746456693e829dbe89856972485e02` — add evidence-backed preset loader.
- `12fda887a696d0bfbb3cc9056fb40e8ce665ff81` — wire loader into Beta runtime.
- `1da00ec9e6a08a6acd4f3efa6ffa93858bbe4a8e` — extend PR CI syntax gate to the Beta preset loader/patch.

The loader deliberately keeps the sealed `runtime/player-presentation.js` file unchanged. It loads that exact current core and applies a narrow in-memory Phase 1 patch before execution.

Added behavior:
1. `activePreset` state, default 1.
2. Three independent `{ slots[5], locks[5] }` stores.
3. Existing `gameplayState.slots/locks` are aliases to the active preset, so the sealed Pray/cost/popup/particle logic continues to use the same code path.
4. Original `preset/01..03` `on/off/lock` hierarchy nodes are driven from `LevelInfo.presetCount` and the active preset.
5. Clicking an available preset switches to its independent state.
6. Clicking a locked preset does not switch and reports its unlock level.
7. Switching preset cancels an active Pray presentation through the existing `gameplayInterruptVisual("PresetSwitch")`, closes an open confirm popup, then renders the new preset. This prevents an old preset's RAF/particle presentation from continuing after navigation.
8. Debug EXP downgrade clears now-invalid slot indices across all presets and clamps an active preset if its availability is reduced.
9. Reset recreates all three preset stores and returns to preset 1.
10. `window.MAPLEM_PRAY_PRESETS.snapshot()` is available for Browser diagnostics.

## Hard regression boundary — SEALED
Do not rewrite or simplify these while developing presets:
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

## Static validation status
- Beta core used by the loader is SHA `6ef0f011d76bdaca3194a8dfa6329dacc0844b50`, exactly the same core audited before implementation.
- Loader uses fail-closed unique string anchors: a missing or duplicate anchor stops Phase 1 instead of silently patching the wrong code.
- Beta `index.html` loads scene/gameplay/native-particle data and `player-presentation-patch.js` first; the preset loader then loads the patched core followed by confirm-bypass, site-bridge and click-audio in the original order.
- Branch was confirmed ahead of main only; Phase 1 did not alter production simulator files.
- `.github/workflows/validate.yml` now runs `node --check` on the Beta preset loader and Beta presentation patch when present.
- Current GitHub Actions status is intentionally absent because this workflow runs on `pull_request -> main` (or push to main) and no PR has been opened yet.
- **Browser/player smoke is NOT yet PASS.** Do not merge to main yet.

## Required Browser acceptance sequence
1. Start at Lv.1: Preset 1 selected, Preset 2 selectable, Preset 3 shows locked `Lv.11`.
2. Pray once in Preset 1 and note the resulting blessing.
3. Switch to Preset 2: it must begin with its own independent blessing/lock state.
4. Pray in Preset 2, then return to Preset 1: Preset 1's previous result must still be present.
5. Lock a blessing in Preset 1, switch 1 → 2 → 1: that lock must persist only in Preset 1.
6. Attempt Preset 3 before Lv.11: it must not switch.
7. Raise sanctuary level to Lv.11: Preset 3 must become selectable and retain its own state.
8. Confirm Level / EXP / currency remain shared while blessing/lock state changes per preset.
9. Trigger a Pray result animation, then switch preset during the presentation: old-page animation/particle work must stop rather than continue invisibly.
10. Re-test Pray, lock/unlock, all-locked EXP-only Pray, Confirm/Cancel popup, rapid Pray, click audio, cost layout, fullscreen and desktop/mobile rendering for regressions.

Useful diagnostic in DevTools:
```js
MAPLEM_PRAY_PRESETS.snapshot()
```
Expected shape includes `activePreset`, `availablePresetCount`, unlock levels, and all three preset slot/lock arrays.

## Browser testing note
GitHub Pages production is sourced from `main`, so the feature branch is intentionally **not** live at the normal production/Beta URL yet. Test the checked-out `feature/light-sanctum-pages` branch through a local HTTP server or equivalent branch preview. Do not copy these files to main merely to obtain a test URL.

## Release rule
Preset Phase 1 remains on `feature/light-sanctum-pages` until the user browser-tests it. If the acceptance sequence passes:
1. mark Browser PASS in this handoff;
2. open PR from `feature/light-sanctum-pages` to `main`;
3. require CI PASS;
4. review the PR diff;
5. merge main;
6. create the release / production promotion only after merge.

If Browser smoke fails, fix only the preset navigation/state layer unless evidence proves a sealed subsystem is actually responsible.
