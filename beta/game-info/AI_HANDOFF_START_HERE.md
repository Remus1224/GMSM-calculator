# AI_HANDOFF_START_HERE — Game Info Beta V4

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development policy: `main/beta` is the long-lived research / browser-validation area; a feature branch is only required later for Beta → Production promotion.
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct first-page URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` still does **not** exist.
- Root production menu remains intentionally untouched.
- V1/V2/V3 were browser-reviewed. V4 is the first dedicated **Liquid Glass Material Prototype** and is **NOT SEALED** yet.

## Product concept
Entry/display name: **也許有用的資訊**.

This is a data / reference center rather than another simulator. It hosts game tables, thresholds, growth requirements and other evidence-backed static information.

Planned entries:
1. 光之聖所祈禱經驗表 — implemented.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

## V4 design target
Formal target:
- **Liquid Glass Material Prototype**
- visually inspired by modern liquid-glass / high-end glassmorphism techniques commonly achievable on the web
- not a copy of Apple proprietary UI assets/code
- data readability remains primary
- no continuous WebGL/shader animation; mobile thermal cost must stay bounded

User feedback driving V4:
- V3 typography was acceptable.
- V3 did not read as real glass; it looked like a colored background plus white border.
- Desired direction is closer to liquid-glass references: transparent material, local color transmission, directional/specular highlights and slight chromatic edge behavior.
- Column headers and main field labels should be more visually prominent than the row values.
- Column headers, levels and numeric values should be centered.

## V4 material changes
- Replaced flat translucent fills with multi-layer transparent material.
- Added large background color/light fields so the glass has something visible to transmit and blur.
- Added directional white specular highlight.
- Added subtle cyan / magenta chromatic edge transmission.
- Increased saturation/contrast inside backdrop filtering.
- Glass border is now a gradient material edge rather than a uniform white outline.
- Hero uses stronger glass; data rows use thinner glass.
- Data section has local soft colored light fields behind the rows to increase refraction/transmission perception.
- No continuous animation and no persistent WebGL loop.
- Mobile blur intensity is deliberately reduced to keep GPU cost lower.

## V4 typography / alignment
- Existing V3 typography direction retained.
- Data headers are now stronger/darker than row values and centered.
- Lv values centered.
- Numeric values centered.
- Summary labels centered and visually stronger than summary values.
- Milestone / annotation remains tertiary and low-emphasis.
- PNG export was updated to use centered headers and centered row values as well.

## Table image export
The Light Sanctum page retains:
- `儲存 / 分享表格圖片`

V4 export changes:
- high-resolution Canvas remains independent of device viewport;
- column headings centered;
- row values centered;
- lighter transparent row material with gradient edge treatment;
- background light fields retained in the exported image;
- Web Share API is used when file sharing is supported;
- otherwise PNG download fallback is used;
- browsers still cannot silently write into the user's photo library without user confirmation.

## Architecture
Files:
- `index.html` — standalone Beta shell; noindex/nofollow; V4 cache-bust.
- `style.css` — V4 Liquid Glass material system.
- `script.js` — routing, data rendering, V4 Canvas export.
- `data/catalog.json` — navigation catalog.
- `data/light-sanctum-pray-exp.json` — structured Light Sanctum source data.
- `AI_HANDOFF_START_HERE.md` — this handoff.

## Hard rules
- Keep data separate from UI.
- Prefer JSON updates for game-data revisions rather than hard-coding numbers in HTML.
- Each ready page should keep a stable `?page=<id>` URL.
- Do not blindly copy Beta governance/debug files into production.
- Do not introduce continuous high-cost visual animation purely for glass effects.
- Production promotion remains blocked until Browser Acceptance PASS.

## Light Sanctum data authority
Source:
- `light-sanctum-pray/runtime/sanctuary-gameplay-data.js`
- Source schema: `MapleStoryM.SanctuaryGameplayWebData.P121`
- Snapshot reference used for current data extraction: `75ab1b24b94e9ddf9d12545e4ab75c5b408a04ad`

Direct fields retained:
- `level`
- `needPoint`
- `gainPoint`
- `gainPointPerCoin`
- `slotCount`
- `presetCount`
- `upgradeCostAmount0`

UI-derived values:
- EXP to next level = next `needPoint` - current `needPoint`.
- CharacterCoin per Pray = `upgradeCostAmount0 × slotCount`.
- EXP per Pray = `gainPoint + gainPointPerCoin × CharacterCoin cost`.

Known cumulative EXP thresholds:
- Lv1 0
- Lv2 50
- Lv3 150
- Lv4 750
- Lv5 1,550
- Lv6 2,550
- Lv7 3,750
- Lv8 5,050
- Lv9 6,450
- Lv10 7,950
- Lv11 9,450
- Lv12 11,450
- Lv13 13,450
- Lv14 15,450
- Lv15 17,450

Milestones:
- Lv1: 1 slot, Preset 1 / 2.
- Lv3: slot 2.
- Lv7: slot 3.
- Lv11: slot 4 + Preset 3.
- Lv15: slot 5 + max level.

## Browser acceptance gate
Required V4 checks:
1. Desktop: glass should look like a material rather than a colored panel with a white outline.
2. Desktop: column header hierarchy should be stronger than row values.
3. Desktop: headers / levels / numeric cells should be visually centered and aligned.
4. Phone portrait: glass effect, density and readability.
5. Phone landscape.
6. Dark mode.
7. Long-page screenshot background continuity.
8. `儲存 / 分享表格圖片` output alignment and quality.
9. Browser Back/Forward.
10. Observe whether phone temperature / battery use stays reasonable during static viewing.

## Promotion rule
After Browser Acceptance PASS:
- create `feature/game-info-release` from current `main`;
- selectively promote user-facing `index.html`, `style.css`, `script.js`, and `data/`;
- add official main-menu entry;
- update README / CI / release notes as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.

## Next step
User Browser Acceptance for Beta V4 and targeted liquid-glass refinement if needed.
