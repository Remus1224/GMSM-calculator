# CrystalChest development preview

This directory belongs to `codex/crystalchest-atlas-preview-20261124` only. It is
not linked from the production menu. Pushing this branch does not publish it to
the existing GitHub Pages website; use a local static server for acceptance.

Open `crystalchest/` for the website wrapper, or `crystalchest/runtime/` directly.
Append `?phoneDiag=1` to record the existing phone diagnostics. Diagnostics are
disabled by default. No Unity WASM/data runtime is shipped.

The source-derived P3/P7/P32/P8 Canvas2D visuals remain approximations. Lucky
uses the existing compact baked atlases. P3 center_b001 is disabled by player
decision. Sampling, game flow, original textures and timing policies are retained.

## Static image atlas

`runtime/src/static-atlas-manifest.mjs` maps 125 original image paths to five
lossless PNG pages under `runtime/assets/static-atlas/`. Identical RGBA content
shares 91 cropped ImageBitmaps. Pages have a transparent one-pixel border, are
not resized, and are released after extraction. Individual originals remain as
source evidence; mapped runtime requests use the atlas instead.

Source SHA-256 values are preserved in the atlas map and original asset manifest.
The release WOFF2 subset has its own runtime hash; the original font hash is not
replaced. Large source JSON files are whitespace-minified without value changes.

Desktop Edge checks: all 125 browser-rendered crops equal their original images;
visible pool pixels match; single and Normal 10+1 flow pass. Initial network requests
dropped from 277 to 167 HTTP(S) requests in the measured local run. This is a request reduction,
not proof of faster animation, lower phone temperature or carrier/CDN reliability.
Mobile-sized Normal/Fever pool screenshots also match exactly. Pool DOM images
use cached local Blob URLs extracted from the atlas, not separate HTTP downloads.
Phone visual and thermal acceptance of this atlas version remains pending.

This is an unofficial community simulator, not affiliated with NEXON or MapleStory M.
Simulation results do not represent game-server results or consume game items.
