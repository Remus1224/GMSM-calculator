# AI_HANDOFF_START_HERE — Light Sanctum Pray Fix11

## Current patch
`Fix11 — Regression Closure / Single-Owner Confirm Shell`

## Why Fix11 exists
Fix10 failed player desktop acceptance on 2026-09-25: PrayConfirmPopup was visible, but both Cancel and Confirm appeared non-responsive. The player also reported that the fullscreen control was still vertically misplaced. Treat Fix10 as FAIL; do not use it as a browser-accepted baseline.

## Regression audit result
The stable P137 player already owns the complete confirmation contract inside `player-presentation.js`:
- parent opens/closes `prayConfirmOverlay`;
- parent sends `maplem-pray-confirm-state`;
- child sends `maplem-pray-confirm-ready` and `maplem-pray-confirm-action`;
- parent validates `ev.source === prayConfirmFrame.contentWindow`;
- Cancel closes without Pray;
- Confirm closes and executes Pray.

Fix9/Fix10 added a second controller (`fix9-mobile-closure.js`) that navigated the same child iframe between `about:blank` and the popup runtime based on overlay/status mutations. That created two owners for the same confirmation lifecycle and moved iframe navigation into the live Pray interaction path. Fix10 reduced repeated reloads but did not remove the dual-ownership architecture. Fix11 removes that helper from production and replaces it with `player-shell-controller.js`, whose only responsibility is child-runtime residency. It does not mutate gameplay state, synthesize canvas clicks, or handle Cancel/Confirm.

## Fix11 confirmation policy
Desktop:
- preload the confirmation child once during runtime startup;
- keep the same child WindowProxy resident;
- restore the original P137 parent/child message topology before the first Pray;
- no iframe navigation is performed during Pray / Cancel / Confirm.

Mobile/iOS:
- preserve Fix8 thermal isolation while SkipConfirm is ON: confirmation child stays `about:blank`;
- when SkipConfirm becomes OFF, preload the child before Pray;
- keep it resident while confirmation remains enabled;
- unload again only when SkipConfirm returns ON.

This is intentionally asymmetric: desktop correctness/smoothness is the immediate acceptance gate, while iOS retains the proven no-meaningful-idle-warming constraint.

## Fullscreen Fix11
The runtime fullscreen control still posts through the corrected Fix9 channel `gmsm-light-sanctum-pray`; outer page remains the only native/fake fullscreen owner.

The button remains in the 1280×720 runtime coordinate system, but its vertical anchor is moved from `top:0` to `top:18px`. The user screenshot showed the prior icon touching the top edge while the native X visual center was materially lower in the title bar. This is a geometry correction only; fullscreen behavior/bridge is unchanged.

## Frozen gameplay / fidelity rules
Do not change P137/P121 gameplay, P120 costs, EXP, native-proven particles, audio, level/settings bridge, cumulative usage tracking, reset semantics, or iOS Auto 1× canvas quality guard unless new evidence explicitly requires it.

P120 sealed cost rule:
- `CharacterCoin = 5 × SlotCount`
- `Meso = 1,500,000 × actual lockedCount`
- all-locked does not cap Meso lock count
- 0 Lock hides Meso and centers CharacterCoin

## Fix8 regression gate
User browser acceptance after Fix8:
- portrait/landscape rendering was correct;
- no meaningful idle warming.

Do not regress this mobile thermal result.

## Automated/static audit status
PASS by source inspection:
- production runtime no longer loads `fix9-mobile-closure.js`;
- `player-shell-controller.js` has no gameplayState access and no synthetic MouseEvent/canvas click path;
- desktop popup child is resident before interaction;
- original P137 message bridge remains in `player-presentation.js` and is not duplicated by shell controller;
- fullscreen message channel remains `gmsm-light-sanctum-pray`;
- P120/gameplay/particle/audio core files were not modified by Fix11.

These are source/static checks only. They are **not** player-browser PASS.

## Required player browser acceptance — desktop first
1. Hard refresh the Light Sanctum page so `runtime/index.html?v=20260925-fix11` is loaded.
2. Verify the fullscreen icon is vertically aligned with the native X/title-bar controls rather than touching the top edge.
3. Turn SkipConfirm OFF.
4. Pray → Cancel: popup must close and no Pray result/cost should execute.
5. Pray → Confirm: popup must close and Pray must execute exactly once.
6. Repeat Confirm several times. There must be no Fix9-style reload stutter and no dead popup.
7. Turn SkipConfirm ON and verify direct Pray.
8. Only after desktop PASS, test iPhone portrait/landscape fullscreen and 2–5 minute idle warmth.

## Current verdict
`Fix11 = SAFE FOR PLAYER DESKTOP ACCEPTANCE`

Not yet browser PASS. Do not advance to further visual/gameplay work until desktop Cancel/Confirm + repeated Pray are accepted.
