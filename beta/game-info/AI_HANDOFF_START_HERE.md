# AI_HANDOFF_START_HERE — Game Info Beta V3

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development policy: `main/beta` is the long-lived research / browser-validation area; a feature branch is only required later for Beta → Production promotion.
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct first-page URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` still does **not** exist.
- Root production menu remains intentionally untouched.
- V1 and V2 were browser-reviewed; V3 is a visual refinement round and is **NOT SEALED** yet.

## Product concept
Entry/display name: **也許有用的資訊**.

This is a data / reference center rather than another simulator. It hosts game tables, thresholds, growth requirements and other evidence-backed static information.

Planned entries:
1. 光之聖所祈禱經驗表 — implemented.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

## V3 design target
Formal visual target:
- **iOS / visionOS Frosted Data Sheet**
- premium but restrained glass material
- data remains the priority; glass is only the presentation material
- desktop and phone both keep the same compact one-row-per-level information model

User feedback driving V3:
- V2 glass quality was roughly 60–70% of the desired result.
- Continue toward Apple Vision / iOS frosted glass.
- Typography itself also needed refinement: size, hierarchy, weight and ordering felt insufficiently polished.

## V3 visual changes
### Glass material
- Reduced solid white/color fill so background light transmits through the rows.
- Replaced colored card feel with thin / medium / strong glass tiers.
- Increased material separation using selective blur and saturation rather than opaque fills.
- Directional highlight is biased to the upper-left rather than an equally bright white border on all sides.
- Shadows are more neutral and softer; less colored glow.
- Removed milestone whole-row color fill.
- Milestone emphasis now uses a thin vertical luminous indicator plus a small dot/text marker.
- Background changed to large, soft, non-repeating light fields instead of a visually obvious fixed gradient seam.

### Depth hierarchy
- Strong glass: page hero.
- Medium glass: summary strip / information navigation / notes.
- Thin glass: level rows and navigation controls.
- The result should read as layered frosted material instead of equally heavy cards.

### Typography
- Reduced excessive 900-weight usage.
- Main headings use a strong but less bulky display weight with tighter negative tracking.
- Secondary copy is smaller, lighter and quieter.
- Data column headers are intentionally small and low-contrast.
- Numeric cells use tabular lining numerals for stable vertical alignment.
- Summary values use clearer hierarchy without oversized card typography.
- Mobile milestone text is secondary and does not compete with the primary numeric row.
- Overall target is a system-like information sheet rather than a dashboard/card UI.

### Mobile density
- Level row height reduced further.
- Milestone rows add only a narrow secondary line instead of turning into tall cards.
- Hero and summary strip are compressed so the actual table enters the viewport sooner.
- Narrow phone layout keeps the same six primary numeric columns and removes the milestone header column.

## Table image export
The Light Sanctum page retains:
- `儲存 / 分享表格圖片`

Implementation policy:
- no screenshot permission and no server required;
- data is redrawn to a fixed high-resolution Canvas;
- Canvas exports PNG independent of screen width;
- devices supporting Web Share with files use the system share sheet;
- otherwise PNG downloads through an object URL;
- browsers cannot silently write directly to the phone photo library; user confirmation is required;
- no third-party DOM screenshot library is used.

## Architecture
Files:
- `index.html` — standalone Beta shell; noindex/nofollow.
- `style.css` — V3 frosted material + typography system.
- `script.js` — query routing, theme handling, row rendering and PNG export.
- `data/catalog.json` — navigation catalog.
- `data/light-sanctum-pray-exp.json` — first structured game-data page.
- `AI_HANDOFF_START_HERE.md` — this handoff.

Rules:
- Keep data separate from UI.
- Prefer JSON updates for game-data revisions rather than hard-coding numbers in HTML.
- Each ready page should have a stable `?page=<id>` URL.
- Do not blindly copy Beta governance/debug files into production.

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
V3 requires user browser testing before any production promotion.

Required checks:
1. Desktop: overall glass realism, especially whether rows look like frosted material rather than colored cards.
2. Desktop: typography hierarchy and numerical alignment.
3. Phone portrait: row density, header readability and milestone compactness.
4. Phone landscape.
5. Dark mode.
6. Long-page screenshots: background should no longer show an obvious horizontal seam.
7. `儲存 / 分享表格圖片` remains functional on desktop and phone.
8. Browser Back/Forward remains correct.

## Promotion rule
Do not copy the entire Beta directory into production.

After Browser Acceptance PASS:
- create `feature/game-info-release` from current `main`;
- selectively promote user-facing `index.html`, `style.css`, `script.js`, and `data/`;
- set production cache-bust strings;
- add the official main-menu entry;
- update README / CI / release notes as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.

## Next step
User Browser Acceptance for Beta V3 and any final material / typography tuning.
