# AI_HANDOFF_START_HERE — Light Sanctum Pray Fix10

## Current patch
`Fix10 — Desktop Confirm Smoothness Closure`

## Baseline and user evidence
Fix8 is the thermal regression gate: user reported portrait/landscape rendering correct and no meaningful idle warming. Fix9 restored fullscreen bridge and confirmation popup, but the user-provided 2026-09-25 desktop recording showed obvious repeated stutter during the confirmation/Pray cycle. Do not proceed to mobile acceptance until desktop smoothness is accepted.

## Root cause addressed by Fix10
Fix9 lazy-loaded `pray-confirm-popup/index.html` when the overlay opened and immediately changed the child iframe back to `about:blank` when the overlay closed. The popup runtime itself loads a large gameplay dataset plus player/scene code. Repeated Pray with SkipConfirm OFF therefore repeatedly created, parsed, rendered and destroyed the child runtime in the same interaction path as the result animation.

Fix10 changes only confirmation-runtime residency:
- Default SkipConfirm ON: child iframe remains `about:blank`, preserving Fix8 idle/thermal behavior.
- When the player explicitly switches SkipConfirm OFF: load the confirmation runtime once.
- Repeated Pray / Cancel / Confirm while SkipConfirm remains OFF: reuse the same child runtime; show/hide the overlay without destroying/reloading the iframe.
- When SkipConfirm is switched back ON: unload the child runtime to `about:blank`.
- Reset still restores the product default SkipConfirm ON.

## Frozen gameplay / fidelity rules
Do not change P137/P121 gameplay, P120 pray costs, EXP, native-proven particles, audio, level/settings bridge, cumulative usage tracking, reset semantics, or the iOS Auto 1× canvas quality guard unless new evidence explicitly requires it.

P120 sealed cost rule:
- `CharacterCoin = 5 × SlotCount`
- `Meso = 1,500,000 × actual lockedCount`
- all-locked does not cap the Meso lock count
- 0 Lock hides the Meso group and centers CharacterCoin

## Preserved Fix9 behavior
- Runtime fullscreen button posts on `gmsm-light-sanctum-pray` and remains in native 1280×720 coordinates.
- iPhone uses the outer page fake-fullscreen fallback where native non-video fullscreen is unavailable.
- Confirmation semantics remain: SkipConfirm ON = Pray directly; OFF = show PrayConfirmPopup; Cancel closes without Pray; Confirm closes and executes Pray.

## Cache / deployment
- outer iframe cache key: `runtime/index.html?v=20260925-fix10`
- confirmation residency helper cache key: `fix9-mobile-closure.js?v=20260925-fix10`
- popup child cache key: `pray-confirm-popup/index.html?v=20260925-fix10`

## Fix10 acceptance order
1. Desktop first. Disable SkipConfirm and perform several consecutive Pray → Confirm cycles like the supplied recording.
2. Confirm the repeated stutter from Fix9 is materially reduced/removed and the result animation remains visually faithful.
3. Verify Cancel and Confirm semantics.
4. Switch SkipConfirm back ON and verify direct Pray still works.
5. Only after desktop PASS, resume iPhone portrait/landscape fullscreen and thermal testing.

## Hard regression gates
- Do not solve smoothness by lowering native-proven particle FPS or removing FX/audio.
- Do not change P120 costs or EXP/level-up/slot-unlock behavior.
- Do not restore iPhone DPR 3 rendering.
- Do not keep the confirmation child runtime resident while default SkipConfirm is ON.
- Do not move fullscreen back into an outer responsive overlay.
