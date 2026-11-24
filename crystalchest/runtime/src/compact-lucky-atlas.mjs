import {fetchResource as fetch} from './resource-loader.mjs';
import { sha256Digest } from './sha256-http-compat.mjs';

export async function loadCompactLuckyAtlas(name, expectedSourceSha) {
  const base = new URL('../i1-fever-source/assets/compact-lucky/', import.meta.url);
  const response = await fetch(new URL(name + '.json', base));
  if (!response.ok) throw Error('COMPACT_LUCKY_MANIFEST_' + response.status);
  const manifest = await response.json();
  if (manifest.sourceSha256.toUpperCase() !== expectedSourceSha.toUpperCase()) {
    throw Error('COMPACT_LUCKY_SOURCE_IDENTITY');
  }
  const images = [];
  for (const page of manifest.pages) {
    const fetched = await fetch(new URL(page.file, base));
    if (!fetched.ok) throw Error('COMPACT_LUCKY_PAGE_' + fetched.status);
    const bytes = await fetched.arrayBuffer();
    const digest = await sha256Digest(bytes);
    const actual = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    if (actual !== page.sha256) throw Error('COMPACT_LUCKY_PAGE_SHA');
    const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
    const image = new Image();
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(Error('COMPACT_LUCKY_PAGE_DECODE'));
        image.src = url;
      });
      if (image.naturalWidth !== 1024 || image.naturalHeight !== 1024) throw Error('COMPACT_LUCKY_PAGE_SIZE');
      images.push(image);
    } finally { URL.revokeObjectURL(url); }
    await new Promise(resolve => setTimeout(resolve, 16));
  }
  return { compact: true, manifest, images };
}

export function drawLuckyAtlasFrame(context, atlas, index, sx, sy, sw, sh, dx, dy, dw, dh) {
  if (!atlas.compact) {
    context.drawImage(atlas, sx, sy, sw, sh, dx, dy, dw, dh);
    return;
  }
  const cell = atlas.manifest.frames[index];
  if (!cell) return;
  context.drawImage(atlas.images[cell.page], cell.x, cell.y, cell.w, cell.h,
    dx + cell.left * dw / sw, dy + cell.top * dh / sh,
    cell.w * dw / sw, cell.h * dh / sh);
}
