# AI_HANDOFF_START_HERE — Game Info Beta V5

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development policy: `main/beta` is the long-lived research / browser-validation area; a feature branch is only required later for Beta → Production promotion.
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct first-page URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` still does **not** exist.
- Root production menu remains intentionally untouched.
- V1/V2/V3/V4 were browser-reviewed. V5 is a structural optical-glass redesign and is **NOT SEALED** yet.

## Product concept
Entry/display name: **也許有用的資訊**.

This is a data/reference center rather than another simulator. It hosts game tables, thresholds, growth requirements and other evidence-backed static information.

Planned entries:
1. 光之聖所祈禱經驗表 — implemented.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

## Why V5 exists
User review of V4:
- Typography/alignment improved and was broadly acceptable.
- V4 still looked like a colored translucent surface with white outlines rather than premium liquid glass.
- The major structural issue was that each Lv. row remained its own glass card/button.
- Desired direction is closer to high-end liquid-glass references where a small number of glass objects have stronger material depth, localized refraction, directional highlights and chromatic edges.

Assistant assessment before V5:
- V4 roughly 70–75% toward the desired target.
- Further `rgba()` tuning alone would have diminishing returns.
- Best next step: one main optical glass sheet, de-cardified rows, static optical distortion/chromatic edge.

## V5 design target
Formal target:
- **Optical Liquid Glass Data Sheet**
- one primary glass object for the entire table instead of one glass object per row
- row separation through hairlines / spacing / milestone cues, not individual rounded cards
- local light fields behind the glass so the material has real variation to transmit
- static optical distortion only; no continuous WebGL/shader animation
- data readability and phone thermal behavior remain hard requirements

## V5 structural changes
### Single main glass table
- `data-section` is now the primary optical glass object.
- The entire header + Lv.1–Lv.15 table lives inside one rounded liquid-glass sheet.
- Individual `.data-row` elements no longer have their own glass border, backdrop blur, rounded rectangle or independent shadow.
- Rows are separated by subtle horizontal hairlines.
- Hover uses only a faint local luminance change.
- Milestones use a narrow chromatic light rail + small dot/annotation instead of card tinting.

### Optical material
The main table uses:
- very low-opacity interior fill;
- conic/gradient optical edge rather than uniform white outline;
- stronger single-surface `backdrop-filter` blur + saturation + contrast;
- directional specular highlight;
- localized cyan / violet / magenta transmission;
- uneven page background light fields so the glass has something to refract visually.

### Static distortion layer
`index.html` now defines a hidden SVG filter:
- `feTurbulence`
- light `feGaussianBlur`
- `feDisplacementMap`

The filter is applied only to one decorative optical overlay on the primary table:
- no animation;
- no per-row filter;
- no persistent JavaScript render loop;
- graceful fallback if a browser ignores the SVG filter.

This is intended to provide a slight lens/refraction cue without turning the page into a high-cost WebGL demo.

## Typography / alignment
The V4 typography direction is retained:
- column headers centered and stronger than data values;
- Lv identity centered and slightly stronger than numeric cells;
- numeric cells centered and use tabular lining numerals;
- milestone text remains tertiary / lower contrast;
- summary labels remain stronger than summary values.

## Table image export
The page still retains:
- `儲存 / 分享表格圖片`

Current V5 scope deliberately prioritizes the live web material redesign. The existing Canvas export remains functional and preserves the centered V4 data layout. If the V5 single-sheet visual direction is browser-accepted, the Canvas renderer can be updated afterward to match the single-sheet material more closely rather than repeatedly rewriting export styling during visual exploration.

## Architecture
Files:
- `index.html` — V5 cache-bust + static SVG optical filter definitions.
- `style.css` — V5 single-sheet Optical Liquid Glass material system.
- `script.js` — unchanged data/routing/export logic; loaded with V5 cache key.
- `data/catalog.json` — navigation catalog.
- `data/light-sanctum-pray-exp.json` — structured Light Sanctum source data.
- `AI_HANDOFF_START_HERE.md` — this handoff.

## Hard rules
- Keep data separate from UI.
- Prefer JSON updates for game-data revisions rather than hard-coding values into HTML/CSS.
- Each ready page keeps a stable `?page=<id>` URL.
- Do not blindly copy Beta governance/debug files into production.
- No continuous high-cost animation purely for glass effects.
- No per-row SVG/WebGL effects.
- Production promotion remains blocked until Browser Acceptance PASS.
- Do not regress existing table/image export behavior while experimenting with material styling.

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

## Browser acceptance gate — V5
Required checks:
1. Desktop: table should read as **one continuous glass sheet**, not 15 glass cards.
2. Desktop: localized background light should visibly affect different parts of the glass.
3. Desktop: optical edge should not look like a uniform white outline.
4. Phone portrait: single-sheet structure, readability and row separation.
5. Phone: confirm scrolling remains smooth and static viewing does not noticeably increase heat/battery usage.
6. Phone landscape.
7. Dark mode.
8. SVG distortion should remain subtle; if it looks watery/noisy it must be reduced or removed.
9. `儲存 / 分享表格圖片` must still function.
10. Browser Back/Forward remains correct.

## Promotion rule
After Browser Acceptance PASS:
- create `feature/game-info-release` from current `main`;
- selectively promote user-facing `index.html`, `style.css`, `script.js`, and `data/`;
- add official main-menu entry;
- update README / CI / release notes as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.

## Next step
User browser review of Beta V5. If the single-sheet optical material is accepted, synchronize Canvas export styling to the same V5 visual language before production promotion.
