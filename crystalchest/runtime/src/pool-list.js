import {fetchResource as fetch,loadDOMImageURL} from './resource-loader.mjs?startupProbe=1';
const $ = (id) => document.getElementById(id);
const panel = $('official-pool-browser');
const gridScroll = $('pool-grid-scroll');
const grid = $('pool-grid');
const summary = $('pool-summary');
const tabs = [...document.querySelectorAll('.pool-tabs [data-pool]')];
const scrollTrack = $('pool-scrollbar');
const scrollThumb = $('pool-scrollbar-thumb');
const devSummary = $('pool-diag-summary');
const imageFailures = [];
const scrollByPool = { NORMAL: 0, FEVER: 0 };
const nameFitRecords = new Map();
let data = null;
let scene = null;
let manifest = null;
let nameLabelFields = null;
let nameMeasureContext = null;
let selectedPool = 'NORMAL';
let pointerDrag = null;
let scrollActiveTimer = 0;

const unresolvedLabels = {
  ICON_VISUAL_EQUIVALENCE_ONLY_ITEM_ID_AMBIGUOUS: '舊版顯示圖已確認；ItemID 仍有歧義',
  ICON_VARIANTS_UNRESOLVED: '舊版顯示圖已確認；原始變體仍未裁定',
  CONTAINER_VS_EQUIP_UNRESOLVED: '舊版顯示圖已確認；裝備／容器身分仍未裁定',
};

// Share one loaded face between the list's Canvas measurements and app.js.
// The font file is an existing Web fixture, not a proven live game font.
window.crystalChestEnsureNameFont ??= (fontPath) => {
  if (!window.crystalChestNameFontPromise) {
    const existing = [...document.fonts].find((face) => face.family === 'FixtureNoto' && face.status === 'loaded');
    window.crystalChestNameFontPromise = existing
      ? Promise.resolve(existing)
      : new FontFace('FixtureNoto', `url("${new URL(fontPath, document.baseURI).href}")`).load()
        .then((face) => { document.fonts.add(face); return document.fonts.ready; })
        .catch((error) => { window.crystalChestNameFontPromise = null; throw error; });
  }
  return window.crystalChestNameFontPromise;
};

function measureS1cNameFit(entry) {
  const cached = nameFitRecords.get(entry.officialSourceRowKey);
  if (cached) return cached;
  if (!nameLabelFields || !nameMeasureContext) throw new Error('S1C name measurement was requested before the source label and font fixture were ready.');
  const chars = Array.from(entry.announcementName);
  const maxWidth = Number(nameLabelFields.mWidth);
  const maxFontSize = Number(nameLabelFields.mFontSize);
  const spacingX = Number(nameLabelFields.mSpacingX || 0);
  let fontSize = maxFontSize;
  let advances = [];
  let advanceWidth = 0;
  for (; fontSize >= 1; fontSize -= 1) {
    nameMeasureContext.font = `${fontSize}px FixtureNoto`;
    advances = chars.map((character) => nameMeasureContext.measureText(character).width);
    advanceWidth = advances.reduce((sum, width) => sum + width, 0) + Math.max(0, chars.length - 1) * spacingX;
    if (advanceWidth <= maxWidth) break;
  }
  const record = {
    sourceRowKey: entry.officialSourceRowKey,
    name: entry.announcementName,
    fontSize: Math.max(1, fontSize),
    maxFontSize,
    advanceWidth,
    maxWidth,
    spacingX,
    lineCount: 1,
    fitsAtMinimum: advanceWidth <= maxWidth,
    advances,
    evidence: 'S1C_R7_WEB_MEASURE_REUSED_NOT_NATIVE_NGUI',
  };
  nameFitRecords.set(entry.officialSourceRowKey, record);
  return record;
}

function renderS1cNameGlyphs(name, record) {
  const fragment = document.createDocumentFragment();
  const chars = Array.from(record.name);
  chars.forEach((character, index) => {
    const glyph = document.createElement('span');
    glyph.className = 'pool-item-glyph';
    glyph.textContent = character;
    glyph.style.setProperty('--pool-glyph-advance', `${record.advances[index] ?? 0}px`);
    if (index < chars.length - 1) glyph.dataset.nameGap = 'true';
    fragment.append(glyph);
  });
  name.replaceChildren(fragment);
}

function sourceNote(entry) {
  const icon = entry.icon;
  if (icon?.playerDisplayImage) {
    if (icon.sourceAdmissionClass === 'ICON_VISUAL_EQUIVALENCE_ONLY_ITEM_ID_AMBIGUOUS') return 'S1C 玩家確認圖；ItemID 未唯一';
    if (icon.sourceAdmissionClass === 'ICON_VARIANTS_UNRESOLVED') return 'S1C 玩家確認圖；來源變體未決';
    if (icon.sourceAdmissionClass === 'CONTAINER_VS_EQUIP_UNRESOLVED') return 'S1C 玩家確認圖；類別未決';
    return 'S1C 玩家確認圖；來源身分維持原裁定';
  }
  if (icon?.state === 'SOURCE_ICON_CONNECTED') {
    const ambiguous = entry.clientIdentity?.identityVerdict !== 'EXACT_CLIENT_IDENTITY';
    const label = icon.sourceAdmissionClass === 'SOURCE_MAPPING_VERIFIED_NOT_UI_CONNECTED' ? 'IconName／PathID 來源已核' : '原始圖示來源已核';
    return ambiguous ? `${label}；ItemID 仍有歧義` : label;
  }
  return unresolvedLabels[icon?.sourceAdmissionClass] ?? '圖示來源待裁定';
}

function iconInfo(entry) {
  const player = entry.icon?.playerDisplayImage;
  if (player?.runtimeAssetPath) {
    const source = player.sourceAsset ?? {};
    const sourceLabel = [source.bundle, source.cab, source.pathId ? `PathID ${source.pathId}` : null].filter(Boolean).join(' / ');
    return {
      kind: 'PLAYER_VISUAL_CONFIRMED',
      path: player.runtimeAssetPath,
      sha256: player.runtimePngSha256,
      title: `舊版 S1C 玩家確認展示圖；PNG SHA ${player.legacyPngSha256}；RGBA SHA ${player.legacyRgbaSha256}${sourceLabel ? `；來源 ${sourceLabel}` : ''}`,
    };
  }
  if (entry.icon?.state === 'SOURCE_ICON_CONNECTED') {
    return {
      kind: 'SOURCE_ICON_CONNECTED',
      path: entry.icon.runtimeAssetPath,
      sha256: entry.icon.runtimePngSha256 ?? entry.icon.sourcePngSha256,
      title: `原始來源圖示：${entry.icon.iconName ?? 'IconName 未提供'}；PNG SHA ${entry.icon.sourcePngSha256}`,
    };
  }
  return null;
}

function setCellSprite() {
  const component = scene?.components?.find((item) => item.path === 'GachaGlobalLuckyListItem' && item.class === 'UISprite');
  const binding = component?.atlasBinding;
  const texture = binding && manifest?.textures?.[binding.texture];
  const webSprite = manifest?.shopPoolPanelIntegration?.sourceContract?.listItemBackground?.webSlicedSpriteAsset;
  if (!binding?.rect || !texture || !webSprite?.file) throw new Error('Original list_weapon sprite binding or exact sliced Web asset is missing from scene-ui.json / ASSET_MANIFEST.json.');
  const rect = binding.rect;
  const slicedSpriteUrl = new URL(`../${webSprite.file}`, import.meta.url).href;
  panel.style.setProperty('--pool-cell-sliced-sprite', `url("${slicedSpriteUrl}")`);
  panel.dataset.spriteEvidence = binding.status;
  const reference = manifest.shopPoolPanelIntegration?.playerReferenceWebLayout;
  const badge = reference?.visualRules?.probabilityBadge;
  if (badge?.sprite?.rect && badge?.sprite?.texture) {
    const atlas = manifest.textures?.[badge.sprite.texture];
    if (atlas) {
      const rect = badge.sprite.rect;
      const badgeUrl = new URL(`../${atlas.file}`, import.meta.url).href;
      panel.style.setProperty('--pool-badge-sprite', `url("${badgeUrl}")`);
      panel.style.setProperty('--pool-badge-sprite-size', `${atlas.width / rect.width * 100}% ${atlas.height / rect.height * 100}%`);
      panel.style.setProperty('--pool-badge-sprite-position', `${rect.x / (atlas.width - rect.width) * 100}% ${rect.y / (atlas.height - rect.height) * 100}%`);
    }
  }
  return {
    sourcePath: component.path,
    sourceClass: component.class,
    spriteName: component.fields.mSpriteName,
    sourceBindingStatus: binding.status,
    sourceTextureKey: binding.texture,
    sourceTexturePngSha256: texture.sha256,
    sourceRect: rect,
    sourceWidget: { width: component.fields.mWidth, height: component.fields.mHeight, pivot: component.fields.mPivot, depth: component.fields.mDepth },
    sourceSpriteType: component.fields.mType === 1 ? 'Sliced' : `Serialized type ${component.fields.mType}`,
    webSlicedSpriteAsset: webSprite,
    webProjection: 'The exact atlas crop is drawn with preserved 20px left/right sprite borders and a stretched center sample to match the saved S1C sliced-sprite adapter; this is Web CSS, not native NGUI draw-call or live Camera parity.',
  };
}

let spriteContract = null;
const s1cSmallIconRows = new Map([
  ['NORMAL:17', { itemId: 55387, name: '混沌結晶碎片5個 交換券' }],
  ['NORMAL:18', { itemId: 55614, name: '混沌結晶碎片 10個交換券' }],
  ['FEVER:49', { itemId: 55387, name: '混沌結晶碎片5個 交換券' }],
  ['FEVER:50', { itemId: 55614, name: '混沌結晶碎片 10個交換券' }],
]);

function iconDisplayPolicy(entry, info) {
  const target = s1cSmallIconRows.get(`${entry.pool}:${entry.officialSourceRow}`);
  if (!target) return null;
  const icon = entry.icon;
  const itemId = entry.clientIdentity?.verifiedClientItemId;
  const matches = info?.kind === 'SOURCE_ICON_CONNECTED'
    && itemId === target.itemId
    && entry.announcementName === target.name
    && icon?.iconName === 'Icon_Upgrade_2302_MG2040062'
    && icon?.sourcePngSha256 === '9808bbe17e52b4a535a356167810fe71f0aab3f633262d678e5fc0c16806c7b3'
    && icon?.width === 22
    && icon?.height === 20;
  return matches ? 's1c-pixel-double' : null;
}

function makeIcon(entry, index) {
  const info = iconInfo(entry);
  if (!info) {
    const placeholder = document.createElement('span');
    placeholder.className = 'pool-item-placeholder';
    placeholder.textContent = '圖示待確認';
    placeholder.title = unresolvedLabels[entry.icon?.sourceAdmissionClass] ?? '此公告列尚無可准入的原始圖示';
    return placeholder;
  }
  const img = document.createElement('img');
  img.className = 'pool-item-icon';
  img.loading = 'eager';
  img.decoding = 'async';
  img.alt = '';
  img.title = info.title;
  img.dataset.displayEvidence = info.kind;
  img.dataset.runtimePngSha256 = info.sha256;
  img.dataset.sourceRowKey = entry.officialSourceRowKey;
  img.dataset.sourceOrder = String(index + 1);
  const displayPolicy = iconDisplayPolicy(entry, info);
  if (displayPolicy) img.dataset.iconDisplayPolicy = displayPolicy;
  if (info.kind === 'SOURCE_ICON_CONNECTED') img.dataset.sourcePngSha256 = entry.icon.sourcePngSha256;
  img.dataset.atlasReady='pending';
  // Local Blob image: rely on real load/error, not decode() on a hidden lazy IMG.
  img.addEventListener('load',()=>{img.dataset.atlasReady='loaded';},{once:true});
  const imageFailed = error => {
    img.dataset.atlasReady='failed';
    if (!imageFailures.some((failure) => failure.runtimePngSha256 === info.sha256 && failure.pool === entry.pool)) {
      imageFailures.push({ pool: entry.pool, officialSourceRowKey: entry.officialSourceRowKey, runtimePngSha256: info.sha256, path: info.path, displayEvidence: info.kind, reason: String(error?.message||error?.type||error) });
    }
    const placeholder = document.createElement('span');
    placeholder.className = 'pool-item-placeholder';
    placeholder.textContent = '載入失敗';
    placeholder.title = `圖示載入失敗：${info.path}`;
    img.replaceWith(placeholder);
    updateSummary();
  };
  img.addEventListener('error',imageFailed,{once:true});
  loadDOMImageURL(new URL(`../${info.path}`, import.meta.url).href).then(url=>{img.src=url;}).catch(imageFailed);
  return img;
}

function makeTile(entry, index) {
  const tile = document.createElement('li');
  const info = iconInfo(entry);
  const grade = entry.officialGrade ?? '—';
  const odds = `${entry.officialProbabilityPercentRaw}%`;
  tile.className = 'pool-item';
  tile.dataset.officialOrder = String(index + 1);
  tile.dataset.sourceRow = String(entry.officialSourceRow);
  tile.dataset.sourceRowKey = entry.officialSourceRowKey;
  tile.dataset.pool = entry.pool;
  tile.dataset.iconEvidence = info?.kind ?? 'SOURCE_GAP';
  tile.dataset.sourceAdmissionClass = entry.icon?.sourceAdmissionClass ?? 'SOURCE_GAP';
  tile.dataset.officialGrade = entry.officialGrade ?? '';
  tile.dataset.officialProbabilityPercent = entry.officialProbabilityPercentRaw;
  tile.title = `公告順序 ${index + 1}；${entry.announcementName}；${sourceNote(entry)}。公告列身分以 source row key 為準。`;
  tile.setAttribute('aria-label', `第 ${index + 1} 項，${entry.announcementName}，${sourceNote(entry)}`);
  const reference = manifest.shopPoolPanelIntegration?.playerReferenceWebLayout;
  const visualRules = reference?.visualRules;
  const gradeColor = visualRules?.gradeColors?.[grade] ?? visualRules?.defaultNameColor ?? '#913ce2';
  const badgeRows = visualRules?.probabilityBadge?.rows?.[entry.pool] ?? [];
  if (badgeRows.includes(index + 1)) {
    const badge = document.createElement('span');
    badge.className = 'pool-item-event-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.title = 'S1C 玩家參考版面中的活動機率標記；不是本列公告機率或 RNG 結果。';
    tile.append(badge);
  }
  tile.append(makeIcon(entry, index));

  const name = document.createElement('span');
  name.className = 'pool-item-name';
  const fit = measureS1cNameFit(entry);
  name.dataset.sourceRowKey = entry.officialSourceRowKey;
  name.dataset.webCalibration = 'S1C_R7_REUSABLE_WEB_FIT';
  name.dataset.nameFitFontSize = String(fit.fontSize);
  name.dataset.nameFitAdvanceWidth = fit.advanceWidth.toFixed(3);
  name.dataset.nameFitMaxWidth = String(fit.maxWidth);
  name.dataset.nameFitSpacingX = String(fit.spacingX);
  name.dataset.nameFitLineCount = '1';
  name.style.setProperty('--pool-name-base-size', `${fit.fontSize}px`);
  name.style.color = gradeColor;
  name.dataset.colorEvidence = visualRules?.gradeColors?.[grade] ? 'PLAYER_REFERENCE_CALIBRATED_S1C_GRADE_COLOR' : 'SOURCE_DIRECT_SERIALIZED_LABEL_DEFAULT';
  renderS1cNameGlyphs(name, fit);
  tile.append(name);
  return tile;
}

function unit() {
  return $('stage').clientWidth / 1280;
}

function refreshScrollbar() {
  const viewportHeight = gridScroll.clientHeight;
  const contentHeight = grid.scrollHeight;
  const maxScroll = Math.max(0, contentHeight - viewportHeight);
  const thumbHeight = maxScroll > 0 ? Math.min(viewportHeight, Math.max(14 * unit(), viewportHeight * viewportHeight / Math.max(viewportHeight, contentHeight))) : viewportHeight;
  const travel = Math.max(0, viewportHeight - thumbHeight);
  const offset = maxScroll > 0 ? travel * gridScroll.scrollTop / maxScroll : 0;
  scrollThumb.style.height = `${thumbHeight}px`;
  scrollThumb.style.transform = `translateY(${offset}px)`;
  scrollTrack.setAttribute('aria-valuemax', String(Math.round(maxScroll)));
  scrollTrack.setAttribute('aria-valuenow', String(Math.round(gridScroll.scrollTop)));
  scrollTrack.dataset.active = String(maxScroll > 0);
}

function updateSummary() {
  if (!data) return;
  const selected = data.pools.find((pool) => pool.pool === selectedPool);
  const imageCount = selected.entries.filter((entry) => Boolean(iconInfo(entry))).length;
  const playerImageCount = selected.entries.filter((entry) => Boolean(entry.icon?.playerDisplayImage)).length;
  summary.textContent = `最新玩家 Excel · ${selected.displayName}：${selected.entries.length}/134 項，展示圖示 ${imageCount}/134（舊版玩家確認沿用 ${playerImageCount}）；公告機率總計 ${selected.officialPercentTotalRaw}%（原值）；清單依公告列順序顯示，靜態展示、不執行抽獎。`;
}

function renderPool(pool, { initial = false } = {}) {
  const selected = data?.pools.find((item) => item.pool === pool);
  if (!selected || selected.entries.length !== 134) throw new Error(`Unexpected pool rows for ${pool}`);
  if (!initial) scrollByPool[selectedPool] = gridScroll.scrollTop;
  selectedPool = pool;
  const fragment = document.createDocumentFragment();
  selected.entries.forEach((entry, index) => fragment.append(makeTile(entry, index)));
  grid.replaceChildren(fragment);
  for (const tab of tabs) {
    const active = tab.dataset.pool === pool;
    tab.setAttribute('aria-selected', String(active));
  }
  gridScroll.scrollTop = scrollByPool[pool] ?? 0;
  updateSummary();
  refreshScrollbar();
  document.dispatchEvent(new CustomEvent('crystal-chest-pool-change', { detail: { pool } }));
}

function makeDiagnostics() {
  if (!data || !spriteContract) return { status: 'not-ready' };
  const current = data.pools.find((pool) => pool.pool === selectedPool);
  return {
    schema: 'CrystalChest.CleanRebuild.ShopPoolPanel.R2',
    playerIconStatus: 'CLEAN_POOL_ICON_DISPLAY_268_OF_268_PLAYER_VISUAL_PASS',
    previousR1ReviewStatus: 'CLEAN_SHOP_POOL_LAYOUT_PLAYER_FAIL',
    shopPanelReviewStatus: 'CLEAN_SHOP_POOL_LAYOUT_R2_PLAYER_PENDING',
    selectedPool,
    rows: current.entries.length,
    rowsWithDisplayIcons: current.entries.filter((entry) => Boolean(iconInfo(entry))).length,
    rowsWithSourceConnectedIcons: current.entries.filter((entry) => entry.icon?.state === 'SOURCE_ICON_CONNECTED').length,
    rowsWithPlayerConfirmedImages: current.entries.filter((entry) => Boolean(entry.icon?.playerDisplayImage)).length,
    rowsWithUnresolvedIdentityOrVariant: current.entries.filter((entry) => Boolean(entry.icon?.sourceAdmissionClass && entry.icon.sourceAdmissionClass !== 'SOURCE_ICON_CONNECTED')).length,
    officialPercentTotalRaw: current.officialPercentTotalRaw,
    imageFailures: [...imageFailures],
    atlasDisplayRevision: 'DOM_LOAD_EVENTS_V2',
    visibleIconStates: [...grid.querySelectorAll('.pool-item-icon')].reduce((counts,img)=>{const key=img.dataset.atlasReady||'unknown';counts[key]=(counts[key]||0)+1;return counts;},{}),
    layout: {
      sourceUIPanel: {
        normal: { path: 'GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/NormalListGrid/ScrollView', clipping: 3, clipRange: { x: 252, y: -115, width: 504, height: 240 }, depth: 14 },
        fever: { path: 'GachaGlobalLucky/Root/Frame/GachaCrystalPage/list/FeverListGrid/ScrollView', clipping: 3, clipRange: { x: 252, y: -115, width: 504, height: 240 }, depth: 14 },
      },
      sourceListItem: spriteContract,
      playerAcceptedS1CWebReference: manifest.shopPoolPanelIntegration?.playerReferenceWebLayout,
      visibleTileFields: ['source list_weapon tile', '64×64 UITexture slot with source-scoped small-icon rendering where admitted', 'UILabel multiline text area (16px Web fallback) with S1C grade hue', 'S1C probability badge only at its saved 1-based positions'],
      nameRendering: {
        sourceUILabel: { width: nameLabelFields?.mWidth ?? null, height: nameLabelFields?.mHeight ?? null, fontSize: nameLabelFields?.mFontSize ?? null, spacingX: nameLabelFields?.mSpacingX ?? null, multiline: Boolean(nameLabelFields?.mMultiline), maxLineCount: nameLabelFields?.mMaxLineCount ?? null, shrinkToFit: Boolean(nameLabelFields?.mShrinkToFit), forceNewLine: Boolean(nameLabelFields?.mForceNewLine), overflow: nameLabelFields?.mOverflow === 0 ? 'ShrinkContent (0)' : nameLabelFields?.mOverflow ?? null },
        webAdaptation: 'Reuses S1C R7 per-codepoint Canvas measureText with the same loaded FixtureNoto face used for glyph display, source width/font size/spacing, and descending fit; one-line is the saved S1C Web presentation rule, not native NGUI parity.',
        webFitRowsMeasured: nameFitRecords.size,
        webFitRowsByPool: Object.fromEntries(['NORMAL', 'FEVER'].map((pool) => [pool, [...nameFitRecords.values()].filter((fit) => JSON.parse(fit.sourceRowKey)[0] === pool).length])),
        webFitFontSizes: Object.fromEntries([...new Set([...nameFitRecords.values()].map((fit) => fit.fontSize))].sort((a, b) => a - b).map((size) => [String(size), [...nameFitRecords.values()].filter((fit) => fit.fontSize === size).length])),
        fitFontFamily: 'FixtureNoto',
        fontFixture: manifest?.fontFixture,
        status: 'WEB_VISUAL_CALIBRATION; FONT_SOURCE_UNRESOLVED; PER_NAME_LINE_COUNT_UNDETERMINED',
      },
      hiddenFromTileFace: ['official grade caption', 'per-item official probability'],
      currentWebPanel: { designViewport: [1280, 720], clipScreenRect: [748, 329, 504, 240], scrollbar: 'separate responsive Web thumb outside clip; browser wheel/pointer/keyboard control' },
      projectionBoundary: 'Source panel clip and widget values are serialized; screen rectangle uses existing Clean 1280×720 Canvas fixture. Live UIRoot/CameraManager/VirtualDrawcall/safe-area parity remains unverified.',
    },
    statuses: { rng: data.rngStatus, feverRuntime: data.feverRuntimeStatus, staticDisplay: data.displayStatus },
  };
}

function showDiagnostics() {
  devSummary.textContent = JSON.stringify(makeDiagnostics(), null, 2);
}

function scrollTo(value) {
  const max = Math.max(0, grid.scrollHeight - gridScroll.clientHeight);
  gridScroll.scrollTop = Math.min(max, Math.max(0, value));
  scrollByPool[selectedPool] = gridScroll.scrollTop;
  refreshScrollbar();
}

tabs.forEach((tab) => tab.addEventListener('click', () => renderPool(tab.dataset.pool)));
gridScroll.addEventListener('scroll', () => {
  scrollByPool[selectedPool] = gridScroll.scrollTop;
  refreshScrollbar();
  scrollTrack.dataset.scrolling = 'true';
  clearTimeout(scrollActiveTimer);
  scrollActiveTimer = setTimeout(() => { scrollTrack.dataset.scrolling = 'false'; }, 900);
});
gridScroll.addEventListener('wheel', (event) => {
  if (!grid.scrollHeight || grid.scrollHeight <= gridScroll.clientHeight) return;
  const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gridScroll.clientHeight : 1;
  event.preventDefault();
  scrollTo(gridScroll.scrollTop + event.deltaY * multiplier * 0.25);
}, { passive: false });
gridScroll.addEventListener('keydown', (event) => {
  const page = gridScroll.clientHeight;
  const actions = { ArrowDown: gridScroll.scrollTop + 36 * unit(), ArrowUp: gridScroll.scrollTop - 36 * unit(), PageDown: gridScroll.scrollTop + page, PageUp: gridScroll.scrollTop - page, Home: 0, End: grid.scrollHeight };
  if (!(event.key in actions)) return;
  event.preventDefault();
  scrollTo(actions[event.key]);
});
scrollTrack.addEventListener('pointerdown', (event) => {
  const rect = scrollTrack.getBoundingClientRect();
  const thumbRect = scrollThumb.getBoundingClientRect();
  const viewportHeight = gridScroll.clientHeight;
  const travel = Math.max(1, viewportHeight - thumbRect.height);
  const maxScroll = Math.max(0, grid.scrollHeight - viewportHeight);
  if (event.target === scrollThumb || scrollThumb.contains(event.target)) {
    pointerDrag = { id: event.pointerId, y: event.clientY, scroll: gridScroll.scrollTop, travel, maxScroll };
  } else {
    const center = Math.min(viewportHeight, Math.max(0, event.clientY - rect.top));
    scrollTo((center - thumbRect.height / 2) / travel * maxScroll);
    pointerDrag = { id: event.pointerId, y: event.clientY, scroll: gridScroll.scrollTop, travel, maxScroll };
  }
  scrollTrack.setPointerCapture(event.pointerId);
  event.preventDefault();
});
scrollTrack.addEventListener('pointermove', (event) => {
  if (!pointerDrag || event.pointerId !== pointerDrag.id) return;
  scrollTo(pointerDrag.scroll + (event.clientY - pointerDrag.y) / pointerDrag.travel * pointerDrag.maxScroll);
});
const endDrag = () => { pointerDrag = null; };
scrollTrack.addEventListener('pointerup', endDrag);
scrollTrack.addEventListener('pointercancel', endDrag);
scrollTrack.addEventListener('lostpointercapture', endDrag);
scrollTrack.addEventListener('keydown', (event) => {
  const page = gridScroll.clientHeight;
  const actions = { ArrowDown: gridScroll.scrollTop + 36 * unit(), ArrowUp: gridScroll.scrollTop - 36 * unit(), PageDown: gridScroll.scrollTop + page, PageUp: gridScroll.scrollTop - page, Home: 0, End: grid.scrollHeight };
  if (!(event.key in actions)) return;
  event.preventDefault();
  scrollTo(actions[event.key]);
});
new ResizeObserver(() => {
  const u = unit();
  panel.style.setProperty('--pool-unit', String(u));
  refreshScrollbar();
}).observe($('stage'));

async function init() {
  try {
    const [poolResponse, sceneResponse, manifestResponse] = await Promise.all([
      fetch(new URL('../data/official-pools.json?r31r5=20261105', import.meta.url)),
      fetch(new URL('../data/scene-ui.json', import.meta.url)),
      fetch(new URL('../ASSET_MANIFEST.json', import.meta.url)),
    ]);
    for (const [response, name] of [[poolResponse, 'official-pools.json'], [sceneResponse, 'scene-ui.json'], [manifestResponse, 'ASSET_MANIFEST.json']]) {
      if (!response.ok) throw new Error(`${name} HTTP ${response.status}`);
    }
    [data, scene, manifest] = await Promise.all([poolResponse.json(), sceneResponse.json(), manifestResponse.json()]);
    await window.crystalChestEnsureNameFont((manifest.fontFixture.runtimeFile||manifest.fontFixture.file));
    const nameLabel = scene.components.find((item) => item.class === 'UILabel' && item.path === 'GachaGlobalLuckyListItem/txt ');
    if (!nameLabel) throw new Error('Source UILabel GachaGlobalLuckyListItem/txt is missing from scene-ui.json.');
    nameLabelFields = nameLabel.fields;
    nameMeasureContext = document.createElement('canvas').getContext('2d');
    if (!nameMeasureContext) throw new Error('Canvas 2D text metrics are unavailable.');
    if (data.schema !== 'CrystalChest.OfficialStaticPoolDisplay.v1' || data.displayStatus !== 'STATIC_POOL_UI_PLAYER_PASS') throw new Error('Unrecognized static pool source contract.');
    if (data.pools.length !== 2 || data.pools.some((pool) => pool.entryCount !== 134 || pool.entries.length !== 134)) throw new Error('Normal/Fever pool tables must each contain 134 rows.');
    const panelPaths = data.pools.map((pool) => `${pool.pool === 'NORMAL' ? 'Normal' : 'Fever'}ListGrid/ScrollView`);
    for (const path of panelPaths) {
      const component = scene.components.find((item) => item.class === 'UIPanel' && item.path.endsWith(path));
      if (!component || component.fields.mClipping !== 3 || component.fields.mClipRange?.z !== 504 || component.fields.mClipRange?.w !== 240) throw new Error(`Source clipped list panel does not match the saved contract: ${path}`);
    }
    spriteContract = setCellSprite();
    panel.style.setProperty('--pool-unit', String(unit()));
    renderPool(selectedPool, { initial: true });
    $('pool-diag-refresh').addEventListener('click', showDiagnostics);
    window.crystalChestPoolList = {
      snapshot: makeDiagnostics,
      select: renderPool,
      layout: makeDiagnostics().layout,
    };
    document.body.dataset.poolPanelReady = 'true';
    window.__releaseMarkReady?.('pool');
  } catch (error) {
    summary.textContent = `公告獎池面板載入失敗：${String(error)}`;
    summary.setAttribute('aria-invalid', 'true');
    window.crystalChestPoolList = { snapshot: () => ({ error: String(error) }) };
    console.error(error);window.__releaseFail?.(error);
  }
}

init();
