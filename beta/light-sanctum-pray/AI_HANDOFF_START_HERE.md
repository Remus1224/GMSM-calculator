# AI_HANDOFF_START_HERE — Light Sanctum Pray Production Slim

## Current production target
- Site: `GMSM-calculator`
- Tool display name: `光之聖所祈禱模擬器`
- Production route: `/light-sanctum-pray/`
- Menu image expected at: `assets/menu/icon_光之聖所祈禱模擬器.png`
- Runtime lineage: Preview137 → user-PASS P136 WebFix2 → Beta8 player presentation/settings/mobile alignment → production integration.

## User-verified behavior to preserve
- The simulator game UI is kept as the restored MapleStory M UI rather than redesigned into a generic responsive web form.
- Desktop/tablet landscape: full game stage scales to fit with no simulator-internal scrollbars.
- Phone landscape: same game UI scales to fit; no alternate/rearranged mobile game UI.
- Phone portrait: full UI remains visible by scaling, with landscape-use guidance.
- Player-facing engineering/audit controls are hidden.
- Page title is `光之聖所祈禱模擬器`.
- Confirm popup is enabled by default (skip-confirm is unchecked by default).
- PrayConfirmPopup partial-lock behavior is user-PASS: locked blessing rows are omitted and remaining rows compact correctly.
- Settings support Lv.1–Lv.15 starting state.
- Changing the current level resets cumulative 聖痕結晶 and 楓幣 usage to zero and starts a new usage baseline.
- Reset clears simulator state and cumulative usage.
- Reset button follows the main site's light/dark clear/reset visual language.
- Mobile level label/select alignment is horizontally aligned and vertically centered.

## Repository layout / naming rule
Keep the independent player tools at the repository root:
- `/1204/`
- `/light-sanctum-pray/`

Do **not** add a new wrapper folder such as `/tools/` at this stage. This preserves the existing public routes and keeps relative return links stable.

Menu artwork follows the site's existing `icon_` asset naming convention:
- `/assets/menu/icon_1204產生器.png`
- `/assets/menu/icon_光之聖所祈禱模擬器.png`

URL folders remain English/stable while menu artwork follows the existing Chinese `icon_...` convention.

## Main-site integration
The integration changes the existing root site files:
- `/index.html`: simulator count becomes 8 and a `光之聖所祈禱模擬器` card is inserted after 威爾二階練習機 and before 1204.
- `/script.js`: adds the NEW-badge entry `light-sanctum-pray` with version `2026-09-25`.

The user supplies this image separately:
- `/assets/menu/icon_光之聖所祈禱模擬器.png`

## Production runtime files intentionally retained
The browser runtime uses:
- `index.html`, `style.css`, `script.js`
- `runtime/index.html`
- `runtime/styles.css`
- `runtime/player-view.css`
- `runtime/player-presentation.js`
- `runtime/player-presentation-patch.js`
- `runtime/site-bridge.js`
- `runtime/ui-static-scene-data.js`
- `runtime/ui-state-fixture-data.js`
- `runtime/sanctuary-gameplay-data.js`
- `runtime/native-particles/p98-native-particle-bake.js`
- required particle atlases and UI assets
- the complete player-facing `runtime/pray-confirm-popup/` runtime (HTML/CSS/data JS/player JS/assets)

## Production slimming performed
The following development/evidence-only files were intentionally removed because the player runtime does not reference them:
- `runtime/index.audit.html`
- root runtime duplicate `runtime/player.js` (player page loads `player-presentation.js` instead)
- `runtime/runtime-package-manifest.json`
- raw duplicate `runtime/ui-static-scene.json`
- raw duplicate `runtime/ui-state-fixture.json`
- `runtime/native-particles/README_P98_NATIVE_PARTICLE_BAKE.txt`
- `runtime/pray-confirm-popup/p135-popup-manifest.json`
- raw duplicate popup `ui-static-scene.json`
- raw duplicate popup `ui-state-fixture.json`
- historical build reports, patch diff, and standalone SHA list

Do not delete the `*-data.js` files: these are the browser-loaded scene/fixture payloads and are required even though the similarly named raw `.json` evidence files are not.

Do not delete `runtime/pray-confirm-popup/player.js`: the popup page directly loads it.

## Hard rule
Do not refactor or regenerate the P137 gameplay/rendering logic while doing site-only work. Production changes should remain presentation/integration-only unless a new game-ground-truth discrepancy is explicitly demonstrated by the user.

## Main-site bulletin integration (2026-09-25)
- Homepage bulletin hero now announces `光之聖所祈禱模擬器`.
- Latest timeline entry date: `2026-09-25`.
- Bulletin records the new simulator and its level/reset/cumulative-consumption features.
- `latestNoticeVersion` is `2026-09-25`, so the existing unread notice badge logic treats this release as new.


## 2026-09-25 iOS fullscreen closure
- User verified GitHub Pages desktop/mobile presentation, but iPhone native fullscreen did not work.
- Root cause: Light Sanctum Pray used only element Fullscreen API, while the already-working Will simulator uses an iOS `fake-fullscreen` fallback.
- Production fix mirrors that proven strategy: iPhone/iPad uses a fixed 100vw × 100dvh stage with body scroll locked; desktop/Android continue to prefer native Fullscreen API.
- A fullscreen-local exit button is shown because the normal page navigation is covered during iOS fake fullscreen.
- P137 runtime/gameplay files remain unchanged.
