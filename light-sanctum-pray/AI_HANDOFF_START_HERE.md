# AI_HANDOFF_START_HERE — Light Sanctum Pray Post-Release Cost Label Fit R1

## Current status — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Production simulator has been promoted by the user and is live.
- Last production/browser-accepted baseline remains the Mobile Audio Latency R1 release lineage.
- New work is intentionally **beta-only** until browser acceptance.
- Beta Cost Label Fit R1 implementation commit: `93cf5465dac8940ba256b64811cb30d82c355a11`.

## New post-release issue
User screenshots showed that in special/high-cost states the Pray cost amount can extend outside its intended UI area. This affects both the Meso amount and potentially the CharacterCoin/material amount as the displayed number grows.

Root cause is presentation-only: runtime cost strings are dynamic (`toLocaleString()`), while the exported UILabels retain their serialized overflow behavior/bounds. The player already has a safe UILabel `ShrinkContent` implementation when `mOverflow === 0`, but these two runtime amount labels were not forced onto that fit mode.

## Beta Cost Label Fit R1
Only `runtime/player-presentation-patch.js` is changed.

Targets:
- `VarB_107Popup/Group/Pray/Right/CostDesc/Cost/CharacterCoin/Amount`
- `VarB_107Popup/Group/Pray/Right/CostDesc/Cost/Meso/Amount`

Before `player-presentation.js` starts, the existing presentation patch now sets those two UILabels to:
- `mOverflow = 0` — reuse the player's existing ShrinkContent path.
- `mMaxLineCount = 1` — cost values remain single-line.

This deliberately does **not** widen/move the cost containers, icons, groups or button. It preserves the authored label rectangle and only reduces text size when the actual rendered number would exceed that rectangle. Short/normal values should therefore retain their existing size; only long values shrink as needed.

## Regression boundary — must not change
- No gameplay/cost formula change.
- P120 remains `CharacterCoin = 5 × SlotCount` and `Meso = 1,500,000 × actual lockedCount`.
- No `player-presentation.js` modification.
- No `site-bridge.js` modification.
- No hit-target/input modification.
- No popup modification.
- No audio modification.
- No particle/animation modification.
- No fullscreen modification; accepted geometry remains `top:19px; right:48px; width:72px; height:48px`.
- All-locked Pray bypass behavior remains unchanged.

## Beta acceptance test
1. Reproduce the user's high Meso state: the complete number must remain inside its intended cost area and on one line.
2. Test the longest CharacterCoin/material amount reachable by the simulator: it must also remain inside its intended area and on one line.
3. Test ordinary low values: text should look unchanged rather than unnecessarily small.
4. Verify 0 Lock still hides Meso and centers CharacterCoin.
5. Verify lock/unlock, Pray, popup Confirm/Cancel, all-locked Pray, effects and click audio still work.
6. Verify desktop and mobile rendering.

## Release rule
Do not copy this beta patch to production until the user visually confirms the cost labels are correct. If accepted, promote the beta `runtime/player-presentation-patch.js` change and then update this handoff to mark Cost Label Fit R1 browser PASS.
