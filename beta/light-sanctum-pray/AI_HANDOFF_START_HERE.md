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
