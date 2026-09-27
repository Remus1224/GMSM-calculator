# AI_HANDOFF_START_HERE — Game Info Beta V7-R1

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development policy: `main/beta` is the long-lived research / browser-validation area; a feature branch is only required later for Beta → Production promotion.
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct Light Sanctum URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` still does **not** exist.
- Root production menu remains intentionally untouched.
- V1～V6 were browser-reviewed. V7 visual direction was reviewed and exposed a root-cause issue; V7-R1 is the current validation target and is **NOT SEALED**.

## Product concept
Entry/display name: **也許有用的資訊**.

This is a data/reference center rather than another simulator. Planned entries:
1. 光之聖所祈禱經驗表 — implemented.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

## Preserved V6 structure
The main table remains a five-column single Optical Liquid Glass sheet:
- 等級
- 升下一級 EXP
- 累積 EXP
- 每次祈禱 EXP
- 解鎖內容

Unlock content remains derived automatically from adjacent-level changes in `slotCount` and `presetCount`.

## V7 feedback and root-cause diagnosis
User feedback on first V7 browser/export result:
- Saved PNG and live page still looked visually close to V6.
- Smoke did not read as smoke.
- Unlock iridescent dot did not visibly glow.
- User suspected CSS was being constrained/overridden.

Diagnosis:
1. V7 CSS **was loading**. The V6 left milestone line disappeared, proving the override layer applied.
2. `smoke-v7.svg` originally applied `feGaussianBlur` around 28–42px after turbulence/displacement.
3. The V6 `.data-section` then applied another `backdrop-filter: blur(32px)`.
4. V6 `.data-section::before` also retained its own radial-gradient light field.
5. Those layers flattened the turbulence detail into broad cyan/pink/violet color fields.
6. PNG export was a separate path: `createShareCanvas()` still painted three old radial gradients and did not load `smoke-v7.svg` at all.
7. Unlock dot existed in CSS but was only 5px with a weak 8px halo, so it was visually lost inside the bright glass field.

Conclusion: this was not a missing stylesheet; it was a material-stack and export-path mismatch.

## V7-R1 fixes
### Shared smoke asset
- `smoke-v7.svg` rebuilt using higher-frequency static SVG turbulence/noise masks.
- Gaussian blur reduced to roughly 6–8px so curl/noise structure survives glass refraction.
- Cyan/violet/rose smoke layers use separate seeds and masked regions.
- No animation, WebGL loop, or continuously updating shader.

### Live-page glass fix
- V7-R1 keeps the single-sheet glass architecture.
- `.data-section` backdrop blur reduced from the V6 32px range to 17px desktop / 12px mobile.
- Old V6 radial light field inside `.data-section::before` is replaced with a neutral optical highlight so it no longer paints fake color blobs over the SVG smoke.
- Smoke opacity/contrast increased moderately so the actual turbulence pattern remains visible through the glass.

### Unlock marker fix
- No left milestone line and no whole-row milestone tint.
- Unlock marker increased to 7px desktop / 6px mobile.
- Marker now uses a white/cyan/violet/pink radial core plus multiple emissive shadow rings.
- Unlock text stays tertiary but slightly clearer than V6.

### PNG export path fixed
- `createShareCanvas()` is now async.
- The export loads the **same `smoke-v7.svg` asset** used by the live page.
- Removed old Canvas radial-gradient background blobs.
- Export draws an emissive unlock dot for meaningful unlock rows.
- Live page and saved PNG now share the same smoke source instead of maintaining two separate background designs.

## Implementation files
- `index.html` — V7-R1 cache bust.
- `style.css` — preserved V6 base layout/single-sheet implementation.
- `v7.css` — V7-R1 material overrides and unlock marker treatment.
- `smoke-v7.svg` — shared static turbulence smoke asset.
- `script.js` — data/render logic plus shared-smoke Canvas export.
- `data/catalog.json` — navigation catalog.
- `data/light-sanctum-pray-exp.json` — structured Light Sanctum data.
- `AI_HANDOFF_START_HERE.md` — this handoff.

## Light Sanctum data authority
Source:
- `light-sanctum-pray/runtime/sanctuary-gameplay-data.js`
- Source schema: `MapleStoryM.SanctuaryGameplayWebData.P121`
- Snapshot reference: `75ab1b24b94e9ddf9d12545e4ab75c5b408a04ad`

Derived values remain:
- EXP to next level = next `needPoint` - current `needPoint`.
- CharacterCoin per Pray = `upgradeCostAmount0 × slotCount`.
- EXP per Pray = `gainPoint + gainPointPerCoin × CharacterCoin cost`.
- Unlock content = adjacent-level delta of `slotCount` / `presetCount` plus max-level state.

## Hard rules
- Keep data separate from UI.
- Preserve stable `?page=<id>` URLs.
- Do not blindly copy Beta governance/debug files into production.
- Do not introduce continuous high-cost animation purely for glass/smoke effects.
- Production promotion remains blocked until Browser Acceptance PASS.
- Keep one shared smoke visual source between live page and PNG export where practical.

## Browser acceptance gate for V7-R1
Check:
1. Desktop smoke should show irregular/noisy wisps rather than broad radial blobs.
2. Smoke should remain visible through the main glass instead of being fully blurred away.
3. Phone portrait should retain smoke structure without overpowering data.
4. No left selection-like milestone line.
5. Unlock dot should visibly emit a restrained glow.
6. Unlock text remains less prominent than core numeric data.
7. Five-column layout remains unchanged.
8. Saved PNG should use the same smoke visual family as the live page.
9. Dark mode.
10. Static-view phone temperature / battery behavior.

## Promotion rule
After Browser Acceptance PASS:
- create `feature/game-info-release` from current `main`;
- selectively promote user-facing files only;
- fold accepted V7-R1 override rules into the production stylesheet rather than blindly copying Beta governance files;
- add official main-menu entry;
- update README / CI / release notes as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.
