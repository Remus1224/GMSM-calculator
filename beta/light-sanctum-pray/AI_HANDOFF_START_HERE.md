# AI_HANDOFF_START_HERE — Light Sanctum Pray Click Audio R2

## Current baseline — 2026-09-26
- Repo: `Remus1224/GMSM-calculator`
- Active beta route: `/beta/light-sanctum-pray/`
- Stable pre-audio baseline: `569e906ad32ceac4b54cbdd462690ac142f1c83c`.
- First click-audio revision: `20dd70053f5ce38c88ad774b42d3f17d72820003`.
- Runtime lineage remains Preview137 / P121 on the user-verified fullscreen restore.

## User browser feedback after click-audio R1
Two corrections are required and are authoritative:
1. `BtMouseClick.mp3` belongs only to operations inside the MapleM simulator UI. Site-shell actions such as **主選單** and **日/夜主題切換** must be silent. The same applies to outer level/reset/fullscreen/settings controls unless they are part of the rendered game UI.
2. When every currently active blessing slot is locked, pressing Pray must **not show PrayConfirmPopup**, even if the skip-confirm setting is OFF. It must directly run the established all-locked Pray path: preserve every ability and add EXP, while retaining the sealed P120 cost rule.

## SEALED / must not regress
- P120 cost: `CharacterCoin = 5 × SlotCount`; `Meso = 1,500,000 × actual lockedCount`, including all-locked.
- All-locked Pray keeps abilities unchanged and accumulates EXP; level-up / slot-open transitions remain valid when EXP crosses thresholds.
- Partial/unlocked Pray keeps the existing confirmation behavior when skip-confirm is OFF.
- Popup Confirm/Cancel interaction and partial-lock row filtering remain unchanged.
- CPU bridge closure remains SEALED; do not rewrite `runtime/site-bridge.js`.
- Fullscreen geometry remains `top:19px; right:48px; width:72px; height:48px`.
- Safari toolbar-collapse work remains explicitly closed.

## Click-audio R2 behavior
- Sound toggle remains in outer settings and persists with `gmsm-light-sanctum-pray-sound`.
- The toggle itself is a setting, not MapleM game UI, so it is silent.
- Home, theme, level selector, reset, outer/fullscreen controls are silent.
- In-game canvas click/tap remains audible for real game UI hits: lock/unlock, Pray and skip-confirm.
- Popup Confirm/Cancel remain audible.
- Empty/non-interactive UI does not intentionally synthesize audio; playback is event-driven only.

## All-locked popup bypass implementation
- `runtime/confirm-bypass-parent.js` gates popup visibility while the popup classifies the current lock state, preventing a one-frame flash.
- `runtime/pray-confirm-popup/confirm-bypass-popup.js` inspects the existing `maplem-pray-confirm-state` payload.
- If every active slot is locked, it reuses the established parent confirm action with `silent:true`; the existing `gameplayPray()` remains the authority for cost, EXP, level-up and ability preservation.
- If any active slot is unlocked, the popup is revealed and existing behavior continues.
- This avoids rewriting the sealed gameplay function or `site-bridge.js`.

## Acceptance smoke
1. 主選單 / 日夜切換 / 外層等級 / 重設 / fullscreen / 音效開關：no BtMouseClick.
2. Lock/unlock, Pray, skip-confirm: one BtMouseClick.
3. Normal or partial-lock Pray with skip-confirm OFF: popup appears; Confirm/Cancel each click once.
4. All active slots locked + skip-confirm OFF: no visible popup; abilities unchanged; EXP and sealed costs apply once.
5. All active slots locked + skip-confirm ON: direct Pray remains unchanged.
6. Level-up caused by an all-locked Pray still unlocks the new slot and runs established level/slot presentation.
7. No idle CPU regression and no `site-bridge.js` change.
