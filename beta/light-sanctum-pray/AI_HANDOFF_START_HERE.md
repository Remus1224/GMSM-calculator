# AI_HANDOFF_START_HERE — Light Sanctum Pray Fix13

## Current patch
`Fix13 — Prefab-Derived DOM Input Closure`

## Browser verdict history
- Fix8: mobile portrait/landscape + thermal PASS; preserve.
- Fix10: FAIL.
- Fix11: FAIL — popup visible, Cancel/Confirm dead, smoothness regression.
- Fix12: FAIL on 2026-09-25. User reproduced dead Cancel/Confirm on multiple devices. This rules out a device-specific mouse/touch/browser issue.
- Fix13: source implementation complete; player acceptance required.

## What Fix12 taught us
Fix12 correctly restored the current P137 child runtime and removed the duplicate gameplay table, but multi-device player evidence proved that merely restoring the canvas click handler was insufficient. Therefore the failure is treated as a Canvas input/hit-test regression, not a cache/device problem.

The visual popup is reconstructed into one HTML Canvas. The real Unity prefab has BoxCollider/CUIButton components, but those are evidence only; they do not become browser DOM controls. P137 attempted to reconstruct interaction by deriving Button_Cancel/Button_Confirm canvas bounds and hit-testing the canvas click. That path is the remaining unreliable layer.

## Fix13 architecture
`runtime/pray-confirm-popup/pray-confirm-interaction.js` adds two transparent DOM hit targets above the child Canvas. They are NOT guessed rectangles. Geometry is derived from the exported real PrayConfirmPopup prefab and the already accepted P137 WebFix2 registration:
- ButtonSet_2/Button_Cancel local X = -147
- ButtonSet_2/Button_Confirm local X = +147
- both real UISprite sizes = 280 × 70
- PopupFrame P137 registration scale = 1.04
- PopupFrame registered local Y = -40
- ButtonSet Y = -49 - bodyHeight/2
- bodyHeight = max(60, count×48+(count-1)×2) + 40

The hit targets are repositioned from the Canvas client rect, so outer-site responsive scaling does not invalidate them. `pointerup` is the primary mouse/touch/pen path; `click` is keyboard/compat fallback with duplicate suppression.

The target sends the existing `maplem-pray-confirm-action` message only. Parent P137 remains the sole gameplay owner and still validates `ev.source === prayConfirmFrame.contentWindow`. No gameplay/cost/EXP/result logic is duplicated in the child.

## Performance
Fix12 removal of duplicate child `sanctuary-gameplay-data.js` remains. Fix13 adds only two DOM elements and passive resize/viewport reposition listeners; there is no animation loop, polling loop, or new gameplay dataset in the child.

## Frozen rules
Do not change P137/P121 gameplay, P120 costs, EXP, native-proven particles/audio, level/settings bridge, cumulative usage, reset semantics, or Fix8 iOS Auto 1× thermal guard.

P120 sealed costs:
- CharacterCoin = 5 × SlotCount
- Meso = 1,500,000 × actual lockedCount
- all-locked does not cap Meso
- 0 Lock hides Meso and centers CharacterCoin

## Required player acceptance
1. Hard refresh; outer diagnostic must say Fix13.
2. SkipConfirm OFF → Pray.
3. Click/tap Cancel: popup must close and no Pray/cost occurs.
4. Reopen → Confirm: popup closes and exactly one Pray occurs.
5. Repeat several cycles on desktop.
6. Test one mobile device for touch input.
7. Compare smoothness to original stable runtime; Fix13 must not introduce repeated reload/stutter.

## Current verdict
`Fix11 = FAIL`
`Fix12 = FAIL (multi-device)`
`Fix13 = SAFE FOR PLAYER ACCEPTANCE` (source/static; browser PASS pending).
