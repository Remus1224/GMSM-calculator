# AI_HANDOFF_START_HERE — Game Info Beta V6

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development policy: `main/beta` is the long-lived research / browser-validation area; a feature branch is only required later for Beta → Production promotion.
- Beta root: `beta/game-info/`
- Public Beta URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Direct Light Sanctum URL: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Production `game-info/` still does **not** exist.
- Root production menu remains intentionally untouched.
- V1～V5 were browser-reviewed. V6 is the current browser-validation target and is **NOT SEALED** yet.

## Product concept
Entry/display name: **也許有用的資訊**.

This is a data/reference center rather than another simulator. Planned entries:
1. 光之聖所祈禱經驗表 — implemented.
2. 海洛斯的封印標準 — coming soon.
3. 星座核心需求表 — coming soon.
4. 六轉核心需求表 — coming soon.

## V6 changes
User feedback after V5:
- Single-sheet glass direction is accepted.
- Background color flow was still too gradient-like; user requested a smoke-shaped visual field.
- The separate summary row (`最高等級 / 滿等累積 EXP / 最大欄位 / 最大 Preset`) was redundant and should be removed.
- `Preset` is not player-friendly terminology.
- `欄位 / Preset / 里程碑` should be merged into one field.

Implemented in V6:
- Background changed from obvious color blobs into layered **static smoke / cloud light fields**.
- No continuous smoke animation; mobile thermal cost remains bounded.
- Summary strip removed entirely.
- Table reduced from 7 columns to 5:
  - 等級
  - 升下一級 EXP
  - 累積 EXP
  - 每次祈禱 EXP
  - 解鎖內容
- `Preset` no longer appears as a standalone column.
- Unlock text uses player-facing Traditional Chinese, e.g. `第 3 組預設`.
- `解鎖內容` is derived automatically from changes in `slotCount` and `presetCount` between adjacent levels.
- Lv.1 displays initial slot/preset state.
- Final level appends `滿等`.
- Existing single Optical Liquid Glass sheet from V5 is retained.
- Existing centered typography and table hierarchy are retained.
- PNG export is also updated to the same five-column model.

## Unlock derivation rules
For each level:
- Lv.1: show initial `slotCount` and `presetCount`.
- If `slotCount` increases versus previous level: add `第 N 個欄位`.
- If `presetCount` increases versus previous level: add `第 N 組預設`.
- Final level: add `滿等`.
- No change: show `—`.

Expected examples from current data:
- Lv.1: `初始：1 個欄位・2 組預設`
- Lv.3: `開放 第 2 個欄位`
- Lv.7: `開放 第 3 個欄位`
- Lv.11: `開放 第 4 個欄位・第 3 組預設`
- Lv.15: `開放 第 5 個欄位・滿等`

## Visual target
- **Smoke Liquid Glass Data Sheet**
- one main optical sheet rather than many glass cards
- irregular smoke/light behind the sheet so the glass has non-uniform content to transmit
- restrained cyan / violet / pink tinting
- no continuous WebGL/shader animation
- data readability remains primary

## Architecture
Files:
- `index.html` — standalone Beta shell; V6 cache-bust.
- `style.css` — V6 smoke background + single-sheet glass + five-column layout.
- `script.js` — routing, derived unlock content, rendering and PNG export.
- `data/catalog.json` — navigation catalog.
- `data/light-sanctum-pray-exp.json` — structured Light Sanctum source data.
- `AI_HANDOFF_START_HERE.md` — this handoff.

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

Derived values:
- EXP to next level = next `needPoint` - current `needPoint`.
- CharacterCoin per Pray = `upgradeCostAmount0 × slotCount`.
- EXP per Pray = `gainPoint + gainPointPerCoin × CharacterCoin cost`.
- Unlock content = adjacent-level delta of `slotCount` / `presetCount` plus max-level state.

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

## Hard rules
- Keep data separate from UI.
- Prefer JSON updates for game-data revisions rather than hard-coded values in HTML.
- Keep stable `?page=<id>` URLs.
- Do not blindly copy Beta governance/debug files into production.
- Do not introduce continuous high-cost animation purely for glass effects.
- Production promotion remains blocked until Browser Acceptance PASS.

## Browser acceptance gate for V6
Check:
1. Desktop smoke background quality — should read as irregular smoke/clouds, not obvious circular gradients.
2. Single-sheet glass quality and readability.
3. Five-column table balance.
4. `解鎖內容` wording on desktop and phone.
5. Phone portrait width and density.
6. Phone landscape.
7. Dark mode.
8. `儲存 / 分享表格圖片` five-column output.
9. Browser Back/Forward.
10. Static-view phone temperature / battery behavior.

## Promotion rule
After Browser Acceptance PASS:
- create `feature/game-info-release` from current `main`;
- selectively promote user-facing `index.html`, `style.css`, `script.js`, and `data/`;
- add official main-menu entry;
- update README / CI / release notes as appropriate;
- PR → CI → diff review → merge → Pages deployment → production browser test.
