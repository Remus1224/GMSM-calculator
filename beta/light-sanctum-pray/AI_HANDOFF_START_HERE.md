# AI_HANDOFF_START_HERE — Light Sanctum Pray Fix12

## Current patch
`Fix12 — Confirm Interaction Runtime Regression Closure`

## Browser evidence / verdict history
- Fix8: mobile portrait/landscape rendering PASS; user reported no meaningful idle warming. Keep as thermal regression gate.
- Fix10: FAIL.
- Fix11: FAIL on 2026-09-25 desktop player acceptance. Popup rendered, but Cancel and Confirm did nothing; user also reported smoothness materially worse than the original working simulator.
- Fix12: automated/source closure complete; **requires player desktop acceptance**.

## Fix11 failure root cause
The parent production runtime (`runtime/player-presentation.js`) contains the complete P137 popup interaction implementation:
- detects `PrayConfirmPopup` child scene;
- applies `maplem-pray-confirm-state` from the parent;
- calculates native Button_Cancel / Button_Confirm bounds;
- child canvas click posts `maplem-pray-confirm-action` to parent;
- parent validates `ev.source === prayConfirmFrame.contentWindow`;
- Cancel closes without Pray; Confirm executes exactly one Pray.

However the deployed child `runtime/pray-confirm-popup/index.html` still loaded its own historical `pray-confirm-popup/player.js`. That file predates the P137 interactive child implementation. It can render the popup, but it does not contain the required P137 canvas Cancel/Confirm postMessage path. This exactly matches the player evidence: visually correct popup, dead buttons.

The same child also loaded a duplicate ~1.6 MB `sanctuary-gameplay-data.js` although popup state is already supplied by the parent. That duplicate parsing/startup work is removed in Fix12 and is the primary source-level smoothness regression addressed this round.

## Fix12 changes
1. `runtime/pray-confirm-popup/index.html`
   - no longer loads historical child `player.js`;
   - no longer loads duplicate `sanctuary-gameplay-data.js`;
   - loads the shared, current `../player-presentation.js?v=20260925-fix12` instead.
2. Parent and child therefore use the same P137 interaction implementation and exact native button hit-bound logic.
3. Popup remains a view/interaction child only. Parent remains the sole owner of Pray gameplay state/cost/EXP/result.
4. `player-shell-controller.js` cache key advanced to Fix12. Desktop still preloads one stable child; iOS still keeps the child absent while default SkipConfirm is ON.
5. Runtime/outer iframe cache keys advanced to Fix12.

## Evidence authority
Earlier Preview136 handoff explicitly records that Preview134 added functional confirm/cancel/skipConfirm/pending interaction and that required behavior is:
- Skip Confirm default ON;
- OFF → Pray opens popup;
- Cancel closes without Pray;
- Confirm performs one Pray.
The actual popup hierarchy remains `PrayConfirmPopup/.../Button_Cancel` and `.../Button_Confirm`.

## Frozen gameplay / fidelity rules
Do not change P137/P121 gameplay, P120 costs, EXP, native-proven particles, audio, level/settings bridge, cumulative usage tracking, reset semantics, or iOS Auto 1× quality guard.

P120 sealed costs:
- `CharacterCoin = 5 × SlotCount`
- `Meso = 1,500,000 × actual lockedCount`
- all locked does not cap lock count
- 0 Lock hides Meso and centers CharacterCoin

## Automated/source checks
PASS by direct source audit:
- current shared player contains child `PrayConfirmPopup` state listener;
- current shared player contains Button_Cancel/Button_Confirm hit testing;
- current shared player posts `maplem-pray-confirm-action` from child;
- current shared player parent validates child `contentWindow` and implements cancel/confirm semantics;
- popup HTML now loads that shared player;
- popup HTML no longer loads duplicate 1.6 MB gameplay table;
- no P120/gameplay/particle/audio data file changed.

This is not equivalent to browser acceptance.

## Required acceptance — desktop first
1. Hard refresh and verify diagnostic title says Fix12.
2. Turn SkipConfirm OFF.
3. Pray → Cancel: popup closes; no cost/result.
4. Pray → Confirm: popup closes; exactly one Pray/result.
5. Repeat several Confirm cycles and compare smoothness with the original working version.
6. SkipConfirm ON: direct Pray remains correct.
7. If desktop passes, then resume iPhone fullscreen + thermal acceptance.

## Current verdict
`Fix11 = FAIL`

`Fix12 = SAFE FOR PLAYER DESKTOP ACCEPTANCE` (source/static only; browser PASS pending).
