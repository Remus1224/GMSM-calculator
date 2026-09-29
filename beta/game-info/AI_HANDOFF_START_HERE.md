# AI_HANDOFF_START_HERE — Game Info V21-P5B

## Current state
- Repo: `Remus1224/GMSM-calculator`
- Branch: `feature/game-info-v21-local-ui`
- Area: `beta/game-info/`
- Protected static table glass baseline: **V21-P3Q — Fine Rim / Surface Glass**
- Accepted interaction baseline: **V21-P3S — Main-Site Lift + Row Hover**
- Protected surface/layout baseline: **V21-P4D — Perceptual Surface Unification + Auto-Width Nav Title**
- Accepted/frozen visible polish candidate: **V21-P4G — Final Visual Polish**
- Current feature test: **V21-P5B — Manual Canvas Fidelity Test**

## Why P5B exists
P5A tested real-tab pixel capture, but the user correctly pointed out that mobile cannot keep Hero + the full 15-row Table + Note visible in one viewport. Therefore P5B intentionally returns to a fully programmatic Canvas export for device-independent complete output.

The goal is not to reuse the old V12 approximation unchanged. P5B rebuilds the manual renderer specifically against the frozen P4G visual baseline to determine whether the remaining visual gap is small enough to accept.

## Visible page is frozen during P5B
P5B does not redesign the browser UI. Preserve:
- P4G Light/Dark atmosphere.
- P3Q four-layer glass roles (`outer / cover / sharp / reflect`).
- Hero / Table / Note as one glass family.
- P3S whole-surface lift and per-row hover.
- Main-Site-like navigation/theme switch.
- Compact table labels / geometry.
- P4G unlock readability values.

## Active runtime files
### CSS
1. `style.css`
2. `integrated-liquid-glass.css`

### JavaScript loaded by `index.html`
1. `script.js` — routing/theme/data/page rendering.
2. `liquid-edge-refraction.js` — browser-page safe self-contained refraction.
3. `v12-export.js` — **P5B high-fidelity manual Canvas exporter**.

`wysiwyg-export.js` remains in the branch only as P5A experiment history and is **not loaded** by P5B.

## P5B manual export contract
File: `v12-export.js`

### Device independence
- Export is generated from live page data, not viewport pixels.
- Works even if mobile can only see part of the table.
- Fixed logical export width: `1280px`.
- Render scale: `2x`, so the PNG is high-resolution while layout stays deterministic.
- Height is calculated from Hero + full table rows + Note.

### What is exported
The PNG contains only:
1. Hero
2. full five-column / 15-row table
3. bottom game-version Note

It intentionally excludes:
- site title / top navigation
- theme switch
- BETA strip
- test-only footer

### Live-source behavior
P5B reads visible DOM text at export time:
- Hero eyebrow/title
- Save/Share button label
- five table headers
- all current table row values
- current unlock text
- bottom Note text
- current Light/Dark computed text colors

This reduces drift between the page and exporter when copy is adjusted.

### P4G atmosphere recreation
The Canvas background reads the same P4G CSS custom properties currently active on the page:
- `--page-base`
- cyan/violet/blue source colors
- all four organic detail colors
- subtle line-detail colors

The manual renderer reconstructs the same composition in Canvas rather than using the old unrelated V12 gradient.

### Glass approximation
For each Hero/Table/Note surface P5B:
1. redraws the same atmosphere through the surface
2. applies Canvas `blur(2.6px) saturate(120%)`
3. overlays the same Light/Dark film values used by the browser glass
4. adds directional reflection
5. adds fine cyan/white/violet rim
6. adds sharp highlight / return edge
7. adds restrained Light/Dark surface shadow

The large Table uses full rim energy. Hero and Note use lower rim energy, matching the browser's perceptual calibration that avoided the cyan-ring problem on short cards.

Important: Canvas cannot reproduce the browser's SVG displacement / compositor optics pixel-for-pixel. P5B is intentionally the closest controlled manual approximation, not a claim of exact browser rendering.

### Layout fidelity
- Hero is compact and includes the current Save/Share pill on the right.
- Table column proportions follow the browser CSS family: fixed narrow first column + `1 / 1 / 1 / 1.75` remaining weights.
- Full 15 rows are always present.
- Row separators, unlock markers, Light/Dark typography and bottom Note are reproduced.
- The old V12 metadata footer (`資料來源 / 資料版本`) is removed from the image because it no longer exists in the accepted browser page.

## P5A status
P5A WYSIWYG current-tab capture is not active in P5B because its full-target visibility requirement is unsuitable for mobile. Keep `wysiwyg-export.js` only until the P5B decision is made; then it can be deleted during cleanup if manual Canvas is accepted.

## Protected content / page behavior
- Headers: `等級 / 升等所需經驗 / 累積經驗 / 聖痕結晶 / 解鎖內容`.
- Lv.1 has no `初始：` prefix.
- Lv.15 does not add `滿等`.
- Bottom Note: `遊戲版本 2026-09。數據來源部分尚未於遊戲內正式驗證，實際請以遊戲內顯示為主。`
- Data JSON and numeric derivation are unchanged.
- Test-only browser footer remains during beta; remove for formal release.

## Current acceptance test
After `git pull`:
1. Confirm page marker is `V21-P5B`.
2. Test Light export first.
3. Compare PNG against the live P4G Hero / Table / Note for:
   - background distribution
   - glass transparency / edge weight
   - Hero geometry and Save/Share pill
   - table spacing / column alignment
   - unlock typography
   - bottom Note
4. Repeat in Dark.
5. Verify export succeeds even when the browser viewport is too short to show the full table (important mobile contract).

Decision after P5B:
- If the visual gap is small enough, keep/manual-tune this exporter and retire P5A WYSIWYG capture.
- If the gap is still unacceptable, move to offscreen DOM rasterization rather than trying to make screen capture work on mobile.
