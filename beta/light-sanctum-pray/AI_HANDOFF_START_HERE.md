# AI_HANDOFF_START_HERE — Light Sanctum Pray iOS Fullscreen Fix3

## Current patch
`LightSanctumPray_iOSFullscreenFix3_UIButton_ThemeParity_PATCH_20260925.zip`

## User-confirmed production baseline
Light Sanctum Pray production slim runtime and settings are already deployed/tested on GitHub Pages.

## Fix3 changes
1. Fullscreen control moved out of the website title/navigation bar and into the visible game UI.
   - It is overlaid inside `stage-viewport`.
   - This lets iPhone users scroll slightly to hide Safari's address bar first, then press fullscreen without returning to the top navigation.
   - The same button toggles enter/exit fullscreen.
2. iOS fake-fullscreen fallback from Fix2 is retained.
3. Theme toggle visual style is changed to match the main GMSM-calculator site's canonical day/night toggle.
   - Prior Light Sanctum styling was derived from the older 1204 standalone style and was not pixel/style-identical to the main site.
4. Cache-bust updated to `20260925-iosfs3`.

## Frozen behavior
Do not change P137 gameplay/runtime, pray costs, EXP, particles, confirmation popup, level/settings bridge, cumulative usage tracking, or reset semantics.

## Test focus
- iPhone portrait: scroll enough to collapse browser chrome, then press the in-UI fullscreen button.
- iPhone landscape: same button should enter/exit fake fullscreen.
- Desktop/Android: native fullscreen should remain available.
- Day/night toggle should visually match the main site's toggle.


## 2026-09-25 Fix4 — title-bar fullscreen / theme parity / iPhone performance
- Fullscreen control is visually anchored into the game blue title bar immediately left of the native X; removed the floating glass-pill treatment.
- Main-site canonical theme variables were completed (`text-muted`, `card-bg`, `card-hover`, `input-bg`) while preserving the already canonical nav/theme-toggle styling.
- iPhone heating audit found no permanent requestAnimationFrame loop while idle. The bridge handshake stops after ready and the MutationObserver is event-driven.
- High-confidence mobile cost source: Auto HiDPI rendered the 1280×720 logical canvas at iPhone DPR 3 => 3840×2160 (8.29M pixels/frame) during pray animations. Fix4 makes iOS Auto quality render at 1× => 1280×720 (0.92M pixels/frame), a 9× pixel reduction per animated frame. The displayed mobile simulator is already below 1280 CSS pixels, so 1× preserves native logical resolution. Desktop behavior remains unchanged.
- Do not remove P98 native particle atlases or alter P137 gameplay/FX semantics as a performance shortcut.


## 2026-09-25 Fix5 — native title control + iOS thermal guard
- Player browser feedback after Fix4: fullscreen works, but the fullscreen control still looked like a separate boxed website control instead of belonging to the game's blue title bar. Fix5 removes the box/blur/border and renders a small white corner-mark icon immediately left of the native X.
- Fix4 iOS 1x canvas reduced pixel count but did not eliminate reported heating. No permanent idle RAF loop was found. Fix5 therefore adds an iOS-only 30 rendered-FPS cap to the expensive motion/particle RAF paths while preserving timestamp-based animation duration and final gameplay state. Desktop remains uncapped.
- iOS imageSmoothingQuality changes from high to medium during canvas rendering; logical resolution remains 1280x720 @ 1x.
- Fullscreen fake/native behavior remains based on the Fix3 known-good script; do not regress iPhone fake-fullscreen fallback.
- Browser acceptance needed: verify title-bar icon alignment in portrait/landscape/fake fullscreen; compare thermal behavior after several minutes of repeated Pray and after several minutes idle. If idle alone still heats, next audit target is Safari compositing/backdrop-filter + hidden PrayConfirm iframe/GPU memory, not gameplay formulas.
