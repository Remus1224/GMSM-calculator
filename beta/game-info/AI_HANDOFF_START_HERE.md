# AI_HANDOFF_START_HERE — Game Info Beta V13

## Current status — 2026-09-27
- Repo: `Remus1224/GMSM-calculator`
- Development area: direct work on `main/beta/game-info/` until Browser Acceptance PASS.
- Public Beta: `https://remus1224.github.io/GMSM-calculator/beta/game-info/`
- Light Sanctum direct page: `https://remus1224.github.io/GMSM-calculator/beta/game-info/?page=light-sanctum-pray-exp`
- Current version: **V13 — Static Light Baseline Recovery**.
- V13 follows V12 but deliberately stops the V12 pointer-light experiment.
- Production `game-info/` still does not exist.
- Production menu and the formal Light Sanctum simulator remain untouched.
- **V13 Browser Acceptance is NOT PASS yet.**
- Production promotion remains blocked.

## Stable product/data contract — DO NOT REDESIGN
The Light Sanctum page remains one continuous five-column single-glass data sheet:
1. 等級
2. 升下一級 EXP
3. 累積 EXP
4. 每次祈禱 EXP
5. 解鎖內容

Unlock text remains derived in `script.js` from adjacent-level `slotCount` / `presetCount` changes plus max-level state.
Typography hierarchy remains header > level/numeric data > unlock content.
Routing remains `?page=<id>`.
No gameplay data, EXP formula, structured JSON or unlock derivation changed in V13.

## Why V13 exists
V12 removed the historical V8 fixed optical SVG and flattened the runtime CSS stack successfully, but browser testing showed two visual regressions:
- overall Light color/material quality dropped sharply compared with the earlier V5/V8/V9 period;
- the whole-sheet pointer reaction looked like a visible light spot following the cursor, rather than the glass material subtly reacting.

User assessment: the page had previously reached roughly 70–75/100 visually, while V12 felt closer to ~30/100.

The correct recovery strategy is NOT a full Git revert to V5. V13 selectively combines:
- **V5 design principle:** one thick optical glass sheet with transparency, blur/saturation and directional edge/specular light;
- **current structure:** five-column table, current typography, unlock derivation, current routing.

## V13 scope — Stage 1 only
V13 intentionally focuses on a **static Light baseline** before any new interaction work.

Frozen / unchanged during V13:
- five-column structure;
- current typography/layout;
- gameplay data and EXP formulas;
- unlock derivation;
- routing;
- single-sheet table architecture.

Only these are allowed to change:
- page atmosphere;
- glass surface fill;
- border / edge light;
- shadow / depth;
- static highlight/specular.

## V13 implementation
### A. Runtime visual stack remains flattened
`index.html` loads only:
- `style.css` — base layout/typography/data structure;
- `v13.css` — active visual/material layer.

Historical visual files remain in Git history/repo but are not loaded:
- `v7.css`
- `v8.css`
- `v9.css`
- `v10.css`
- `v12.css`
- `smoke-v7.svg`
- `table-glass-v8.svg`

### B. Pointer interaction disabled
`v12-interaction.js` is no longer loaded.

V13 has:
- no cursor-following light spot;
- no pointer-driven CSS variables;
- no RAF/WebGL/continuous decorative animation;
- no per-row glass hover material.

A later interaction pass may be reintroduced only after the static baseline is accepted, and it must alter edge/specular balance subtly rather than display a visible light following the cursor.

### C. Static Light material recovery
V13 references the V5 material concept without reverting the V5 page/code wholesale.

The main sheet uses:
- lower-opacity translucent fill so the environment actually shows through;
- stronger backdrop blur/saturation/contrast similar to the more successful V5 material feel;
- directional top specular highlight;
- thin cyan/pink edge refraction;
- layered border highlight;
- controlled depth shadow;
- no giant fixed cyan/violet blob texture;
- no turbulence smoke.

The page atmosphere is intentionally quiet:
- cyan / soft blue / lilac / soft pink remain the site identity;
- only broad low-frequency ambient fields are used;
- atmosphere supports the glass rather than pretending to be the glass.

### D. Unlock marker
The circular emissive dot remains removed.
V13 keeps a subdued micro sliver:
- ~10×2 px;
- transparent ends;
- cyan → violet → soft pink center;
- internal highlight only;
- no outside glow;
- no whole-row tint or milestone side line.

### E. Dark / Export are deliberately not V13 acceptance targets
Dark remains functional via the V13 CSS fallback, but it is **not being visually tuned in Stage 1**.

`v12-export.js` remains loaded so Save/Share continues to work, but export parity is also **not the V13 Stage-1 acceptance target**. Do not tune export until the live static glass baseline is accepted.

Planned order after Light static PASS:
1. Stage 2 — Dark palette/material.
2. Stage 3 — very subtle whole-sheet material interaction, with no visible cursor light.
3. Stage 4 — export visual parity.

## Runtime file map after V13
Loaded:
- `index.html`
- `style.css`
- `v13.css`
- `script.js`
- `v12-export.js` (functional fallback; visual parity deferred)
- data JSON files

Not loaded:
- `v12-interaction.js`
- `v12.css`
- `v7.css`
- `v8.css`
- `v9.css`
- `v10.css`
- `table-glass-v8.svg`
- `smoke-v7.svg`

## Hard rules
- Keep the five-column contract.
- Keep current typography/layout.
- Keep one continuous sheet; never return to 15 glass cards.
- Do not change gameplay data/EXP formulas during visual work.
- Do not split unlock content back into multiple columns.
- Background = atmosphere; table = material.
- Do not restore page-wide smoke or fixed giant optical blobs.
- Do not restore `table-glass-v8.svg` as runtime material truth.
- Do not add cursor-following light spots.
- No continuous animation / RAF / WebGL decorative loop.
- Do not tune Dark/Export until Static Light is accepted.
- Production promotion remains blocked until Browser Acceptance PASS.

## V13 Browser Acceptance gate — current next action
Test **Light live first**. Ignore Dark/export polish for this gate.

Check:
1. Does the page recover the earlier premium cyan / lilac / pink atmosphere without looking washed out?
2. Does the main table read as one thick translucent glass sheet rather than a pale colored panel?
3. Is there visible material depth from blur/saturation, thin edge refraction and static directional highlight?
4. Are there NO large fixed optical blobs / gray-purple blocks / smoke shapes?
5. Is there NO visible cursor-following light?
6. Are the current five-column layout and typography unchanged?

Do not proceed to Dark, interaction or export refinement until this static Light baseline is judged acceptable (target: back to at least the earlier ~75–80/100 visual level).

## Promotion — still blocked
Do not create production `game-info/`, do not add the production home entry, and do not create the release/promotion branch until Browser Acceptance PASS.

After full PASS only:
1. Create `feature/game-info-release` from latest accepted `main`.
2. Selectively promote/flatten accepted Beta files into production `game-info/`.
3. Exclude Beta-only handoff/history files.
4. Add official main-menu entry **也許有用的資訊**.
5. PR → CI → diff review → merge → Pages → Production Browser Acceptance.
