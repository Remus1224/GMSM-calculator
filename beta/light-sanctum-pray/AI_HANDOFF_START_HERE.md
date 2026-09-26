# AI_HANDOFF_START_HERE — Light Sanctum Pray Preset Phase 1

## Current status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Feature branch: `feature/light-sanctum-pages`
- Production/main remains the user-accepted sealed baseline and must not be modified by preset experiments.
- Preset Phase 1 remains **beta-only** and still requires player browser acceptance before PR/merge/release.
- Direct `file://` browser launch is unsupported for this Beta because Chromium unique-origin/CORS rules block the loader/iframe architecture.
- The first dependency-free PowerShell preview launcher reached the user but Windows PowerShell reported `ParserError / TerminatorExpectedAtEndOfString`. This was fixed in commit `5a811597f0162f6ba50293730033a4d3365531ea` by making the `.ps1` source ASCII-only / Windows PowerShell 5.1-safe and by simplifying the request-path parser.

## Critical model discovery
The top-left `1 / 2 / 3` controls are Pray presets under:
- `VarB_107Popup/Group/Pray/preset/01`
- `VarB_107Popup/Group/Pray/preset/02`
- `VarB_107Popup/Group/Pray/preset/03`

Evidence-backed behavior:
- Lv.1: preset 1 selected, preset 2 available, preset 3 locked and shows `Lv.11`.
- LevelInfo contains `presetCount`.
- Client exposes `OnChangePreset(int presetIndex)`, `GetCurrentPresetIndex()`, `GetCurrentPresetCount()`, `GetPresetUnlockLevel(int presetIndex)`, `SearchStatSlot(int presetIndex,int slotIndex)`, and `UpdateStatGrade(int presetIndex,int slotIndex,...,locked)`.
- Therefore Level / EXP / currencies are shared, while each preset owns independent blessing slots and lock states.

## Preset Phase 1 implementation
Primary Beta files:
- `runtime/player-presentation-pages-loader.js`
- `runtime/preset-status-bridge.js`
- `RUN_LOCAL_PREVIEW.ps1`
- `RUN_LOCAL_PREVIEW.cmd`

Behavior added by the preset loader:
1. `activePreset`, default 1.
2. Three independent `{ slots[5], locks[5] }` stores.
3. Existing `gameplayState.slots/locks` remain aliases to the active preset so sealed Pray/cost/popup/particle logic stays on the same path.
4. `preset/01..03` `on/off/lock` nodes follow `LevelInfo.presetCount` and active preset.
5. Available preset click switches to its independent state.
6. Locked preset click does not switch and reports unlock level.
7. Switching preset interrupts active visual work via existing `gameplayInterruptVisual("PresetSwitch")`, closes confirm popup, then renders the new preset.
8. Debug level downgrade clears invalid slots across all presets and clamps an unavailable active preset.
9. Reset recreates all preset stores and returns to preset 1.
10. `window.MAPLEM_PRAY_PRESETS.snapshot()` exposes diagnostics.

## Local test finding — direct file launch is rejected
User reproduced these Chromium errors when opening `beta/light-sanctum-pray/index.html` directly as `file:///...`:
- `Access to XMLHttpRequest ... from origin 'null' has been blocked by CORS policy`
- `Unsafe attempt to load URL file:///... from frame ... 'file:' URLs are treated as unique security origins`
- `document.documentElement.dataset.presetPhase1 === 'failed'`
- Runtime stayed black.

Conclusion: this is not a preset-state-model failure. Chromium treats nested local `file:` documents as unique origins, so the loader/fetch/iframe/postMessage architecture cannot be reliably validated by direct file launch. The earlier local-file XHR shim was removed.

## Dependency-free local preview route
Use:
- `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`

It invokes `RUN_LOCAL_PREVIEW.ps1`, which starts a tiny loopback HTTP server using built-in Windows PowerShell/.NET only. No Python, Node, Git CLI, or extra installation is required.

Server defaults:
- root = repository root
- address = `127.0.0.1`
- port = `8765`
- preview URL = `http://127.0.0.1:8765/beta/light-sanctum-pray/`
- sends `Cache-Control: no-store`
- prevents path traversal outside repository root
- supports GET/HEAD and common JS/CSS/image/audio MIME types

### Windows PowerShell 5.1 launcher correction
The first `.ps1` version contained Traditional-Chinese console strings and used an unnecessarily fragile request-path regex. On the user's Windows PowerShell it failed at parse time with:
- `ParserError`
- `TerminatorExpectedAtEndOfString`
- reported around the `Not Found` response line, with a secondary unmatched-block location.

Commit `5a811597f0162f6ba50293730033a4d3365531ea` replaces the launcher with an ASCII-only script to remove Windows PowerShell 5.1 encoding/parser ambiguity. It also replaces the query-string regex with a simple `IndexOf('?')` / `Substring` path split. Browser smoke after this correction is still pending.

`runtime/preset-status-bridge.js` mirrors runtime `data-preset-phase1` state to the Beta parent shell, so top-level DevTools may inspect:
```js
document.documentElement.dataset.presetPhase1
```
Expected final value: `"ready"`.

## Hard regression boundary — SEALED
Do not rewrite/simplify while developing presets:
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

## Browser acceptance sequence
1. Pull latest `feature/light-sanctum-pages` in GitHub Desktop.
2. Double-click `beta/light-sanctum-pray/RUN_LOCAL_PREVIEW.cmd`.
3. PowerShell window should stay open and browser should open `http://127.0.0.1:8765/beta/light-sanctum-pray/`.
4. Top-level DevTools: `document.documentElement.dataset.presetPhase1` must become `"ready"`.
5. Lv.1: preset 1 selected, preset 2 selectable, preset 3 locked `Lv.11`.
6. Pray once in preset 1; switch to preset 2; preset 2 must have independent slot/lock state.
7. Pray in preset 2; return to preset 1; preset 1 result must persist.
8. Lock in preset 1; switch 1 → 2 → 1; lock must remain only in preset 1.
9. Preset 3 must refuse selection before Lv.11.
10. At Lv.11 preset 3 must become selectable and independent.
11. Level / EXP / currencies remain shared across presets.
12. Switching during an active result animation must stop old-preset visual work rather than leaving background RAF/particle activity.
13. Regression smoke: Pray, lock/unlock, all-locked EXP-only, Confirm/Cancel popup, rapid Pray, click audio, cost layout, fullscreen, desktop/mobile rendering.

Useful runtime diagnostic:
```js
MAPLEM_PRAY_PRESETS.snapshot()
```

## Validation / release rule
- No PR has been opened yet.
- GitHub Actions has not yet validated this feature branch because workflow runs on PR-to-main or push-to-main.
- `.github/workflows/validate.yml` syntax-checks the Beta preset loader, presentation patch, and preset status bridge when present.
- **Browser/player smoke is NOT yet PASS. Do not merge to main yet.**

If Browser smoke passes:
1. mark Browser PASS here;
2. open PR `feature/light-sanctum-pages` → `main`;
3. require CI PASS;
4. review diff;
5. merge;
6. then release/promote.
