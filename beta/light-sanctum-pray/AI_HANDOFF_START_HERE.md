# AI_HANDOFF_START_HERE — Light Sanctum Pray Preset Phase 1

## Current status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Feature branch: `feature/light-sanctum-pages`
- Production/main remains the user-accepted sealed baseline and has not been modified by preset experiments.
- Browser/player preset work is NOT PASS yet.
- The first runtime-source-patching approach has been formally abandoned and cleaned out.
- New implementation direction: edit the Beta copy directly inside the feature branch, then browser-test, PR, CI, diff review, merge main, release.

## Correct workflow from this point
1. `feature/light-sanctum-pages` isolates development from `main`.
2. `beta/light-sanctum-pray/` is the direct-edit test copy inside that branch.
3. Implement preset 1/2/3 directly in Beta `runtime/player-presentation.js`.
4. Run local browser acceptance using `RUN_LOCAL_PREVIEW.cmd`.
5. After browser PASS, promote the verified delta to the production `light-sanctum-pray/` copy on the same feature branch.
6. Open PR to `main`.
7. Require CI PASS and review the full diff.
8. Merge main only after acceptance and review.
9. Release after merge.

## Cleanup completed
The following experimental runtime-patching files have been removed from the feature branch:
- `runtime/player-presentation-pages-loader.js`
- `runtime/preset-source-normalizer.js`
- `runtime/preset-status-bridge.js`

The Beta runtime entry has been restored to direct script loading:
- `player-presentation-patch.js`
- `player-presentation.js`
- `confirm-bypass-parent.js`
- `site-bridge.js`
- `click-audio.js`

The Beta outer page has also been restored to its normal iframe/runtime baseline. No preset-status bridge or experimental top-level diagnostic hook remains.

## Branch cleanup verification
After cleanup, `main...feature/light-sanctum-pages` compare shows only these branch differences:
- `.github/workflows/validate.yml`
- `beta/light-sanctum-pray/AI_HANDOFF_START_HERE.md`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.ps1`

Importantly, the following files are no longer different from main:
- `beta/light-sanctum-pray/index.html`
- `beta/light-sanctum-pray/runtime/index.html`
- `beta/light-sanctum-pray/runtime/player-presentation.js`

This means the failed dynamic-patch implementation has been completely removed from the active Beta runtime before the direct-edit implementation begins.

## Local preview route retained
Direct `file://` launch is not used because Chromium treats nested file documents as unique origins and breaks iframe/fetch/postMessage behavior.

Use:
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`

It starts a dependency-free Windows PowerShell/.NET loopback server at:
- `http://127.0.0.1:8765/beta/light-sanctum-pray/`

No Python, Node, Git CLI, or extra install is required for browser testing.

## Evidence-backed preset model
Top-left `1 / 2 / 3` controls are Pray presets under:
- `VarB_107Popup/Group/Pray/preset/01`
- `VarB_107Popup/Group/Pray/preset/02`
- `VarB_107Popup/Group/Pray/preset/03`

Client/exported evidence supports:
- `SantuaryOfLightPopupFunc.OnChangePreset(int presetIndex)`
- `SanctuaryOfLightStatFunc.GetCurrentPresetIndex()`
- `GetCurrentPresetCount()`
- `GetPresetUnlockLevel(int presetIndex)`
- `SearchStatSlot(int presetIndex, int slotIndex)`
- `UpdateStatGrade(int presetIndex, int slotIndex, ..., bool locked)`

Therefore the implementation contract is:
- Level / accumulated EXP / currencies / pray count are shared sanctuary state.
- Each Pray preset owns an independent five-slot blessing state and lock state.
- Availability follows `LevelInfo.presetCount`.
- Lv.1 fixture: preset 1 selected, preset 2 available, preset 3 locked with `Lv.11`.

## Direct Beta implementation plan
Implement directly in `beta/light-sanctum-pray/runtime/player-presentation.js`:
- `activePreset`, default 1.
- Three independent `{ slots[5], locks[5] }` stores.
- Keep existing `gameplayState.slots/locks` as aliases to the active preset so existing Pray/cost/popup/particle code remains on its current code path.
- Drive preset `on/off/lock` hierarchy nodes from current preset and `LevelInfo.presetCount`.
- Add hit detection for preset buttons.
- Block preset 3 before its unlock level.
- Preserve per-preset state across switching.
- Keep Level / EXP / currency shared.
- Switching preset must close confirm UI and interrupt active presentation/particle work so hidden background work does not continue.
- Reset must clear all presets and return to preset 1.
- Add a diagnostic snapshot API only if useful for browser acceptance; do not reintroduce source-patching infrastructure.

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

## CI policy
`.github/workflows/validate.yml` now syntax-checks the direct Beta runtime files when present:
- `beta/light-sanctum-pray/runtime/player-presentation.js`
- `beta/light-sanctum-pray/runtime/player-presentation-patch.js`
- `beta/light-sanctum-pray/script.js`

It no longer checks the removed loader/normalizer/status-bridge files.

## Browser acceptance after direct implementation
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
- Browser/player preset smoke is NOT PASS yet.
- Do not merge to main yet.
- After browser PASS: promote verified direct Beta delta to production copy, re-smoke, open PR, require CI PASS, review diff, merge, then release.
