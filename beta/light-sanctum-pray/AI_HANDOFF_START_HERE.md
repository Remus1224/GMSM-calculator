# AI_HANDOFF_START_HERE — Light Sanctum Pray P137 Regression Restore 1

## Current patch
`P137 Regression Restore 1 — Known-Good Confirm Interaction Restore`

## Why this patch exists
User explicitly rejected further invented/workaround interaction fixes. The confirmation popup originally worked, so this patch restores the original proven P137/P136 WebFix2 path instead of adding another Fix14-style input layer.

Known-good reference commit:
- `d1c6cdbd9b348217fcb294111a467b9a7621ed6f`
- Production integration lineage recorded there: Preview137 → user-PASS P136 WebFix2 → production integration.

## Restored confirmation architecture
The confirmation subsystem is returned to the original structure:
1. Parent runtime keeps `prayConfirmOverlay` + an eager resident `prayConfirmFrame`.
2. Frame loads `pray-confirm-popup/index.html` directly.
3. Popup index loads its original `player.js` directly.
4. `player.js` owns the original Canvas hit test for the real prefab paths:
   - `PrayConfirmPopup/PopupFrame/ButtonSet_2/Button_Cancel`
   - `PrayConfirmPopup/PopupFrame/ButtonSet_2/Button_Confirm`
5. Child sends the original `{ type: "maplem-pray-confirm-action", action }` message.
6. Parent `player-presentation.js` remains the sole gameplay owner: Cancel closes without Pray; Confirm closes and executes Pray.

No new click geometry, pointer relay, transparent DOM buttons, or replacement input system was introduced.

## Removed post-regression workarounds
Removed from the active runtime:
- `runtime/player-shell-controller.js` — Fix11/12/13 residency/controller layer.
- `runtime/pray-confirm-popup/pray-confirm-interaction.js` — Fix13 transparent DOM hit-target workaround.
- `runtime/fix9-mobile-closure.js` — Fix9 lazy iframe / MutationObserver workaround.
- popup no longer loads parent `player-presentation.js` plus an extra interaction helper; it again loads its original `player.js`.

These removals are intentional rollback of the later confirmation redesign, not a new interaction implementation.

## Preserved later verified behavior
Do NOT regress these while testing the restored popup:
- P120 sealed cost rules:
  - `CharacterCoin = 5 × SlotCount`
  - `Meso = 1,500,000 × actual lockedCount`
  - all-locked does not cap Meso
  - 0 Lock hides Meso and centers CharacterCoin
- P121/P137 gameplay, EXP, level-up, slot-unlock behavior.
- Native-proven particles and audio behavior.
- Current parent `player-presentation.js` including iPhone Auto 1× canvas guard.
- Existing fullscreen/site integration.
- Cumulative usage tracking and reset semantics.

## Important tradeoff restored on purpose
The known-good P137 architecture uses an eager resident confirmation iframe. Fix8/Fix9 later changed this partly for mobile thermal isolation. This restore intentionally prioritizes recovering the already-working interaction path first. Do not reintroduce lazy iframe logic until the original interaction has been browser-verified again.

## Browser acceptance required
1. Hard refresh the beta page; diagnostic label should show `P137 Restore 1`.
2. Default SkipConfirm should remain checked according to the existing gameplay state.
3. Turn SkipConfirm OFF and press Pray: original popup must open.
4. Tap/click Cancel: popup closes; no Pray and no cost deduction.
5. Open again and tap/click Confirm: popup closes and exactly one Pray executes.
6. Repeat several cycles on desktop.
7. Repeat Cancel + Confirm on iPhone/mobile touch.
8. Verify Pray costs, EXP, locks, level-up/slot-unlock effects and fullscreen have not regressed.
9. After functional PASS, separately observe idle warmth. Do not mix thermal redesign into the interaction acceptance test.

## Verdict
- Fix11: FAIL.
- Fix12: FAIL (multi-device).
- Fix13: abandoned as an invented workaround path.
- `P137 Regression Restore 1`: source restore complete; browser acceptance pending.
