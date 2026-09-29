# AI_HANDOFF_START_HERE — Game Info V21-P4C

## Current baseline / test state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Accepted interaction baseline: **V21-P3S — Main-Site Lift + Row Hover**
- Current Light Sanctum UI test: **V21-P4C — Unified Liquid Glass Surfaces**
- P3Q static material: user Browser Visual PASS on 2026-09-29.
- P3S whole-table lift + per-row hover: user Browser Visual PASS on 2026-09-29.

## Active runtime files
### CSS
Only 2 CSS files are active from `index.html`:
1. `style.css` — Game Info layout, typography, page atmosphere and generic styles.
2. `integrated-liquid-glass.css` — protected P3Q material, accepted P3S interaction, P4B nav/theme chrome, and P4C Hero/Note unification.

### JavaScript
Only 3 JavaScript files are active from `index.html`:
1. `script.js` — routing, theme state, data loading, derived rows and page rendering.
2. `liquid-edge-refraction.js` — safe self-contained refraction; P4C generalizes it so each Hero/Table/Note surface has its own geometry-correct map/filter.
3. `v12-export.js` — sole image-export owner; export visual parity remains deferred until visible UI is accepted.

## Protected P3Q / P3S contracts
- Keep the four material roles `outer / cover / sharp / reflect`.
- Never return to live `backdrop-filter:url(...)` displacement; that produced moving black compositor artifacts.
- Table hover stays `0.30s cubic-bezier(.25,.8,.25,1)` with `translateY(-4px)` and restrained cyan/violet side glow.
- Per-row hover remains informational only; rows are not clickable and geometry must not move.
- No scale, 3D tilt, pointer-position tracking, or padding/layout growth.

## P4C Unified Surface contract
### Hero / Table / Note material
Hero, central Table and bottom Note now use the **same P3Q optical material**:
- same `--glass-film`
- same 2px outer rim
- same cover blur/saturation
- same two-line sharp contour
- same shallow reflect layer
- same Light/Dark material variables
- same base shadow
- same `translateY(-4px)` + cyan/violet side-glow hover language

Do not reintroduce the old P4B Hero/Note app-card material (`rgba(...,.34/.38)` + 16px blur), because the user correctly identified that it looked materially different from the Table.

### Per-surface refraction
- Hero, Table and Note each carry `data-liquid-refraction`.
- `liquid-edge-refraction.js` creates a dedicated SVG filter/map for every surface.
- P3Q displacement math stays unchanged (`FILTER_SCALE=200`, `MAX_SHIFT=11`, `EDGE_BAND=14`, max map edge 480).
- This avoids applying a table-shaped displacement map to the smaller Hero/Note cards.

### Hero redesign
- Hero content is now a horizontal information/action composition on desktop:
  - left: eyebrow + title
  - right: `儲存 / 分享表格圖片`
- Hero content height target is compact (`min-height:92px`), rather than a large empty legacy card.
- Mobile stacks title/action vertically.
- `Client Table` badge remains removed.
- Old Lv.1~Lv.15 descriptive subtitle remains removed.

### Note redesign
- Note uses the exact same P3Q material as Table/Hero.
- It is intentionally a compact one-line information strip.
- Current copy:
  `遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。`

## Navigation / theme controls
- P4B Main-Site-style navigation controls and two-icon day/night slider remain unchanged in P4C.
- Navigation chrome is intentionally allowed to differ from the three content surfaces; the user only requested Hero/Table/Note material unification in this round.

## Table presentation retained from P4B
Visible headers:
- 等級
- 升等所需經驗
- 累積經驗
- 聖痕結晶
- 解鎖內容

Compact desktop density:
- header min-height 42px
- row min-height 44px
- row padding 5px 14px

Unlock presentation:
- Lv.1 has no `初始：` prefix.
- Lv.15 does not add `滿等`.
- real unlock changes remain visible.
- unlock text is stronger in both Light and Dark.

## Test-only footer
- `Beta V21-P4C · 測試版。` remains during visual testing.
- Formal release requirement: remove the small test footer.

## Confirmed protected functionality
- Direct route `?page=light-sanctum-pray-exp` remains the target detail route.
- Five-column / 15-row source data remains unchanged.
- Data JSON is untouched.
- Main Site files are untouched.
- Export runtime is untouched.

## Current acceptance task
After `git pull`, judge Light and Dark:
1. Do Hero, Table and Note now clearly read as the same glass material?
2. Does Hero's new left-title/right-action composition feel better balanced and less empty?
3. Does each surface still float naturally without looking like a thick acrylic card?
4. Are there any black moving artifacts on Hero or Note after giving them dedicated refraction maps?

If P4C passes, freeze Hero/Table/Note material as the unified Light Sanctum surface baseline. Do not restart the glass design.
