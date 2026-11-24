(function () {
  'use strict';

  const model = window.FX_SOURCE_MODEL;
  const canvas = document.getElementById('compositionCanvas');
  const status = document.getElementById('compositionLoadState');
  const errorBox = document.getElementById('compositionError');
  const transformMath = window.LUCKY_FEVER_TRANSFORM_MATH;
  if (!model || !canvas) {
    if (errorBox) {
      errorBox.hidden = false;
      errorBox.textContent = '來源模型或合成畫布無法載入。';
    }
    return;
  }
  if (!transformMath) {
    errorBox.hidden = false;
    errorBox.textContent = 'Transform math 模組無法載入；停止繪製，避免輸出錯位畫面。';
    return;
  }

  // Every value below is a replaceable Web rendering choice, not a recovered NGUI setting.
  const WEB_ADAPTER = Object.freeze({
    stageWidth: 1280,
    stageHeight: 720,
    sourceUnitScale: 0.82,
    atlasRectOrigin: 'png-top-left',
    spriteWidgetSize: 'serialized-uisprite-mWidth-mHeight',
    widgetPivot: 'serialized-mPivot',
    hierarchyPaintOrder: 'panel-depth-then-widget-depth-web-adaptation',
    extensionBlend: 'lighter',
    spriteTint: 'serialized-mColor-rgb-multiply-web-adaptation',
    build: 'i1-c5-r2-result-overlay-20261030',
    animatedAlpha: 'mColor.a curve replaces its serialized initial value; existing ancestor curve product remains WEB_ADAPTATION',
    spriteGradient: 'mode 2: source C1 at widget top, C2 at bottom; orientation/interpolation WEB_ADAPTATION, not recovered native corner order',
    gradientAlphaConvention: 'straight-alpha Canvas candidate; no extra RGB premultiply; native PMA/material unresolved',
    fontFamily: 'sans-serif',
    fontEvidence: 'system sans-serif fallback; runtime font unresolved',
    sourceFontSize: 'serialized-UILabel-mFontSize',
    textEffects: 'serialized-UILabel-gradient/tint; runtime font/material unresolved',
    clipping: 'serialized UIPanel clipping fields; current panels mClipping=0',
    background: 'transparent result overlay; source Bg only',
    rootOrigin: 'serialized popup/effect transforms are identity; centered stage projection is WEB_ADAPTATION',
    rootActivation: 'forced active for isolated preview; prefab root and popup serialize inactive'
  });
  const ALPHA_MATTE_ASSETS = Object.freeze({
    RadialLight: 'i1-fever-source/assets/diagnostic/effect-alpha-matte/RadialLight.png',
    ET_Line_UI: 'i1-fever-source/assets/diagnostic/effect-alpha-matte/ET_Line_UI.png',
    circleblur: 'i1-fever-source/assets/diagnostic/effect-alpha-matte/circleblur.png'
  });
  const A1_LAYER_CONTRACTS = Object.freeze([
    Object.freeze({ node: 'Box', componentPathID: '5225915023030916938', spriteName: 'Img_Box', texturePathID: '6629820909576309265', rect: [414, 333, 259, 226], widget: [260, 226, 4, 1, 10], baseAlpha: 1, gradient: 0, overrideShaderPathID: '0' }),
    Object.freeze({ node: 'Box_Eff', componentPathID: '-8856153808333209992', spriteName: 'Img_Box', texturePathID: '6629820909576309265', rect: [414, 333, 259, 226], widget: [260, 226, 4, 0, 11], baseAlpha: 0.31764707, gradient: 0, overrideShaderPathID: '-4434582610107754559' }),
    Object.freeze({ node: 'Bg', componentPathID: '-7177952651435908046', spriteName: 'Img_Bg_Gr', texturePathID: '6629820909576309265', rect: [923, 890, 61, 46], widget: [1300, 816, 4, 1, 2], baseAlpha: 1, gradient: 2, overrideShaderPathID: '0' }),
    Object.freeze({ node: 'Bg_Eff', componentPathID: '-4063197687723761300', spriteName: 'Img_Bg_Gr', texturePathID: '6629820909576309265', rect: [923, 890, 61, 46], widget: [1300, 816, 4, 1, 15], baseAlpha: 1, gradient: 0, overrideShaderPathID: '0' })
  ]);
  const A1_ATLAS_SHA256 = '3efd1d140a414959e73743f99fead9ffe413e1a3264e2e8d96215747be368aa4';
  const A1_CLIP_PATH_ID = '-4564642093306647845';
  const A1_CLIP_SHA256 = '40CED5B174B3EDC7C76969FB553E3F739AE1F82A7A1298F308D39E11DB16DAB4';
  const A1_TIMES = Object.freeze([0, 0.417, 0.833, 1.25, 1.9166666]);
  const A2_DIRECT_LAYER_CONTRACTS = Object.freeze([
    Object.freeze({ node: 'Bg_Deco/Bg_Deco_01', transformPathID: '-4388753609158786752', parentTransformPathID: '7105720936560789388', siblingIndex: 0, componentPathID: '4349737832543350558', sourceComponentSha256: '5f639d28314716a0213b3242a25295e0c455a842b2f91065554d31f4533c7af6', spriteName: 'Img_Result_BgDeco_01', atlasPathID: '-5574294688662392163', texturePathID: '6629820909576309265', materialPathID: '-4341517626419781892', baseMaterialShaderPathID: '-8926381322839304170', overrideShaderPathID: '0', gradient: 0, imagePath: 'i1-fever-source/assets/Treasurebox_GL_Atlas_6629820909576309265.png', imageSha256: '3efd1d140a414959e73743f99fead9ffe413e1a3264e2e8d96215747be368aa4', imageSize: [1024, 1024], rect: [0, 433, 412, 352], padding: [0, 0, 0, 0], border: [0, 0, 0, 0], widget: [412, 352, 4, 1, 3], curves: [{ index: 8, property: 'mColor.a', keyCount: 4 }, { index: 1, property: 'localScale', keyCount: 2 }] }),
    Object.freeze({ node: 'Bg_Deco/Bg_Deco_02_L', transformPathID: '-6164115443301042417', parentTransformPathID: '7105720936560789388', siblingIndex: 1, componentPathID: '4214099378249083303', sourceComponentSha256: '4efe70908ba71426f903fdeaf02a1df963a4f9dba0d51c560cc92180b2f05666', spriteName: 'Img_Result_BgDeco_02', atlasPathID: '-5574294688662392163', texturePathID: '6629820909576309265', materialPathID: '-4341517626419781892', baseMaterialShaderPathID: '-8926381322839304170', overrideShaderPathID: '0', gradient: 0, imagePath: 'i1-fever-source/assets/Treasurebox_GL_Atlas_6629820909576309265.png', imageSha256: '3efd1d140a414959e73743f99fead9ffe413e1a3264e2e8d96215747be368aa4', imageSize: [1024, 1024], rect: [675, 149, 209, 410], padding: [0, 0, 0, 0], border: [0, 0, 0, 0], widget: [210, 410, 4, 1, 3], curves: [{ index: 6, property: 'mColor.a', keyCount: 4 }, { index: 0, property: 'localPosition', keyCount: 2 }] }),
    Object.freeze({ node: 'Bg_Deco/Bg_Deco_03_R', transformPathID: '1702733887034733177', parentTransformPathID: '7105720936560789388', siblingIndex: 2, componentPathID: '-6358815841843998496', sourceComponentSha256: 'd17bde938f1ac58d0c7a46d871e544ae992e6ddc0c135a8a58df4100268262be', spriteName: 'Img_Result_BgDeco_02', atlasPathID: '-5574294688662392163', texturePathID: '6629820909576309265', materialPathID: '-4341517626419781892', baseMaterialShaderPathID: '-8926381322839304170', overrideShaderPathID: '0', gradient: 0, imagePath: 'i1-fever-source/assets/Treasurebox_GL_Atlas_6629820909576309265.png', imageSha256: '3efd1d140a414959e73743f99fead9ffe413e1a3264e2e8d96215747be368aa4', imageSize: [1024, 1024], rect: [675, 149, 209, 410], padding: [0, 0, 0, 0], border: [0, 0, 0, 0], widget: [210, 410, 4, 1, 3], curves: [{ index: 7, property: 'mColor.a', keyCount: 4 }, { index: 1, property: 'localPosition', keyCount: 2 }] }),
    Object.freeze({ node: 'Bottom/Line_Deco', transformPathID: '-7778522570624081653', parentTransformPathID: '1055834139680398418', siblingIndex: 1, componentPathID: '7205850405443322833', sourceComponentSha256: '19283ac63629b0158bc0418721387a25fa589ea9ba3229a7f95c280b3e06c36b', spriteName: 'UI_Fx_Texture_03', atlasPathID: '2396177791787358744', texturePathID: '6500721227336104253', materialPathID: '3948664000578929346', baseMaterialShaderPathID: '-8926381322839304170', overrideShaderPathID: '-4434582610107754559', gradient: 0, imagePath: 'i1-fever-source/assets/CommonFxAtlas_6500721227336104253.png', imageSha256: '87b76c01ef39c091def4ce34a88554f8dc0b2e3d87e389e4ffa8c77deed181c3', imageSize: [512, 512], rect: [0, 126, 128, 128], padding: [0, 0, 0, 0], border: [0, 0, 0, 0], widget: [1002, 5, 4, 0, 20], curves: [{ index: 15, property: 'mColor.a', keyCount: 5 }] }),
    Object.freeze({ node: 'Fx/Img_Eff_01', transformPathID: '-2055549887565325722', parentTransformPathID: '3456832356501497106', siblingIndex: 0, componentPathID: '8858805679236095927', sourceComponentSha256: '4930c15106fed942c612aa00f7d5c61c72fab327553b449b484ec199183ff845', spriteName: 'NewFeverMode_Eff_Img_01', atlasPathID: '2396177791787358744', texturePathID: '6500721227336104253', materialPathID: '3948664000578929346', baseMaterialShaderPathID: '-8926381322839304170', overrideShaderPathID: '-4434582610107754559', gradient: 0, imagePath: 'i1-fever-source/assets/CommonFxAtlas_6500721227336104253.png', imageSha256: '87b76c01ef39c091def4ce34a88554f8dc0b2e3d87e389e4ffa8c77deed181c3', imageSize: [512, 512], rect: [258, 279, 202, 233], padding: [27, 27, 10, 13], border: [0, 0, 0, 0], widget: [256, 256, 4, 0, 11], curves: [{ index: 23, property: 'mColor.a', keyCount: 4 }, { index: 8, property: 'localScale', keyCount: 3 }] }),
    Object.freeze({ node: 'Fx/Img_Eff_03', transformPathID: '1247888971621021976', parentTransformPathID: '3456832356501497106', siblingIndex: 1, componentPathID: '4773992109173443795', sourceComponentSha256: '912ecf7563dd045cb933597a4be235ed6501fd430e0f7900e7d1006701ab8cff', spriteName: 'img_commonCircle2', atlasPathID: '2396177791787358744', texturePathID: '6500721227336104253', materialPathID: '3948664000578929346', baseMaterialShaderPathID: '-8926381322839304170', overrideShaderPathID: '0', gradient: 0, imagePath: 'i1-fever-source/assets/CommonFxAtlas_6500721227336104253.png', imageSha256: '87b76c01ef39c091def4ce34a88554f8dc0b2e3d87e389e4ffa8c77deed181c3', imageSize: [512, 512], rect: [0, 2, 122, 122], padding: [3, 3, 3, 3], border: [0, 0, 0, 0], widget: [256, 256, 4, 0, 12], curves: [{ index: 21, property: 'mColor.a', keyCount: 3 }, { index: 7, property: 'localScale', keyCount: 3 }] })
  ]);
  const A2_TIMES = Object.freeze([0.417, 0.833, 1.25]);
  const A2_CLIP_PATH_ID = A1_CLIP_PATH_ID;
  const A2_CLIP_SHA256 = A1_CLIP_SHA256;
  // Start on the first serialized frame. Fixture wait time is scheduled by app.js
  // and remains outside this clip timeline.
  window.LUCKY_FEVER_INITIAL_TIME = 0;
  window.LUCKY_FEVER_WEB_ADAPTER = WEB_ADAPTER;

  let ctx = canvas.getContext('2d', { alpha: true });
  const nodeByPath = new Map(model.nodes.map(node => [node.relativePath, node]));
  const nodeByTransform = new Map(model.nodes.map(node => [String(node.transformPathID), node]));
  const sourceComponentByPathID = new Map((model.sourceComponents || []).map(component => [String(component.pathID), component]));
  const sourceComponentsByGameObject = new Map();
  for (const component of model.sourceComponents || []) {
    const go = String(component.gameObjectPathID || '');
    if (!go) continue;
    if (!sourceComponentsByGameObject.has(go)) sourceComponentsByGameObject.set(go, []);
    sourceComponentsByGameObject.get(go).push(component);
  }
  const curvesByNode = new Map();
  const alphaCurveByComponent = new Map();
  for (const curve of model.curves) {
    if (!curvesByNode.has(curve.path)) curvesByNode.set(curve.path, []);
    curvesByNode.get(curve.path).push(curve);
    if (curve.property === 'mColor.a' && curve.instanceComponentPathIDs) {
      alphaCurveByComponent.set(String(curve.instanceComponentPathIDs), curve);
    }
  }
  const children = new Map();
  const roots = [];
  for (const node of model.nodes) {
    const parent = nodeByTransform.get(String(node.sourceTransform.fatherPathID));
    if (!parent) {
      roots.push(node);
    } else {
      if (!children.has(parent.relativePath)) children.set(parent.relativePath, []);
      children.get(parent.relativePath).push(node);
    }
  }
  const bySibling = (a, b) => Number(a.sourceTransform.siblingIndex) - Number(b.sourceTransform.siblingIndex);
  roots.sort(bySibling);
  for (const group of children.values()) group.sort(bySibling);

  const imageByPath = new Map();
  const tintedSpriteCache = new Map();
  const gradientSpriteCache = new Map();
  const imageFailures = new Set();
  const spriteSources = [];
  for (const node of model.nodes) {
    for (const sprite of node.sprites || []) {
      const rect = sprite.declaredSpriteRect || sprite.candidateExtendedAtlas?.rect;
      if (sprite.imagePath && rect) spriteSources.push({ node, sprite, rect });
    }
  }
  const uiTextureSources = (model.sourceComponents || []).filter(component => component.type === 'UITexture' && component.assetBinding?.imagePath);
  const uniqueImages = [...new Set([...spriteSources.map(item => item.sprite.imagePath), ...uiTextureSources.map(component => component.assetBinding.imagePath)])];
  const effectImagePaths = Object.values(ALPHA_MATTE_ASSETS);
  const DOTPARTICLE_C2 = Object.freeze({
    imagePath: 'i1-fever-source/assets/diagnostic/dotparticle/DotParticle_C2_native_additive_atlas_60fps_75f.png',
    sha256: '22E0DBD67C434AE7E1B1BDF2B79F38D79EAD158514A2D9387AF6EF55575A46B9',
    imageWidth: 4096, imageHeight: 5120, frameSize: 512, columns: 8, rows: 10, frameCount: 75,
    fps: 60, clipStart: 0.083333336, clipEnd: 1.3333334,
    diagnosticOrthoSize: 535.8157958984375, capturedDotWorldScale: 80,
    alphaPolicy: 'WEB_ADAPTATION: atlas RGB is the exact Unity black-matte additive RGB; binary alpha is 255 only where any measured RGB channel is nonzero'
  });
  const IN_COME_PA_C5 = Object.freeze({
    imagePath: 'i1-fever-source/assets/diagnostic/in_come_pa/InComePa_C5_native_additive_atlas_60fps_76f.png',
    sha256: 'E9F0FF1A04F21A682EB039914987D78EDE314425CDA88175459FCFDD18555715',
    imageWidth: 4096, imageHeight: 5120, frameSize: 512, columns: 8, rows: 10, frameCount: 76,
    fps: 60, clipStart: 0, activeStart: 0.16666667, clipEnd: 1.25,
    diagnosticOrthoSize: 710, sourceScale: 250,
    transformPath: 'Fx/Fx_3', transformPathID: '8975392899316170530',
    particleSystemPathID: '-8857431582975294220',
    particleRendererPathID: '-5895741106913502562',
    materialPathID: '-27882949132957908', shaderPathID: '-724264285084394351',
    mainTexturePathID: '-2373015520645106106', subTexturePathID: '-4883062197625269014',
    alphaPolicy: 'WEB_ADAPTATION: RGB is captured from the Unity native black-matte additive render; binary alpha marks nonzero RGB energy for Canvas lighter compositing.',
    projectionPolicy: 'WEB_ADAPTATION: fixed diagnostic orthographicSize=710 mapped through the serialized Fx_3 parent transform; not game Camera/UIRoot projection.',
    seedPolicy: 'WEB_ADAPTATION: offline atlas uses fixed seed 170101309; source ParticleSystem autoRandomSeed=true.'
  });
  let effectAlphaMode = 'black-matte-to-alpha';
  let dotParticleMode = 'C5';
  let dotParticleAtlas = null;
  let dotParticleAtlasStatus = 'NOT_REQUESTED';
  let dotParticleLastDraw = null;
  let dotParticleAtlasLoadPromise = null;
  let inComePaAtlas = null;
  let inComePaAtlasStatus = 'NOT_REQUESTED';
  let inComePaLastDraw = null;
  let inComePaAtlasLoadPromise = null;
  let renderFailure = null;
  let lastDrawTrace = [];

  function classifyRenderError(error) {
    const name = String(error?.name || 'Error');
    const message = error instanceof Error ? error.message : String(error);
    if (name === 'SecurityError' && /getImageData|tainted|origin-clean/i.test(message)) {
      return { code: 'CANVAS_ORIGIN_TAINTED', message };
    }
    if (name === 'RangeError' && /matrix|non-finite|missing/i.test(message)) {
      return { code: 'TRANSFORM_MATRIX_ERROR', message };
    }
    return { code: 'COMPOSITION_RENDER_ERROR', message };
  }

  function track(node, property) {
    return (curvesByNode.get(node.relativePath) || []).find(curve => curve.property === property) || null;
  }
  function nodeTransform(node, time) {
    const source = node.sourceTransform;
    const position = transformMath.sampleCurve(track(node, 'localPosition'), time) ?? source.localPosition;
    const scale = transformMath.sampleCurve(track(node, 'localScale'), time) ?? source.localScale;
    return transformMath.localMatrix(position, scale, source.localRotation, `${node.relativePath || '(root)'} @ ${time.toFixed(3)}s`);
  }
  function nodeActive(node, time) {
    if (!node.gameObjectActive) return false;
    const activeCurve = track(node, 'm_IsActive');
    return !activeCurve || Number(transformMath.sampleCurve(activeCurve, time)) >= 0.5;
  }
  function nodeAlpha(node, time) {
    const alphaCurve = track(node, 'mColor.a');
    return alphaCurve ? Math.max(0, Math.min(1, Number(transformMath.sampleCurve(alphaCurve, time)))) : 1;
  }
  function textFor(node) {
    for (const binding of node.textBindings || []) {
      const values = binding.resolvedKnownValues || {};
      const text = Object.values(values).find(value => typeof value === 'string' && value.length);
      if (text) return text;
    }
    return '';
  }
  function spriteRect(sprite) {
    return sprite.declaredSpriteRect || sprite.candidateExtendedAtlas?.rect || null;
  }
  const PIVOT = Object.freeze([[0, 0], [.5, 0], [1, 0], [0, .5], [.5, .5], [1, .5], [0, 1], [.5, 1], [1, 1]]);
  function widgetFields(component) { return component?.serialized || {}; }
  function widgetInitialAlphaFactor(component) {
    // nodeAlpha/activeOpacityMap already contain this component's animated value.
    // Animation writes the field; its serialized initial value is not another multiplier.
    return alphaCurveByComponent.has(String(component.pathID))
      ? 1 : Math.max(0, Math.min(1, Number(widgetFields(component).mColor?.a ?? 1)));
  }
  function widgetBox(component) {
    const fields = widgetFields(component);
    const width = Number(fields.mWidth), height = Number(fields.mHeight);
    if (!(Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0)) {
      throw new Error(`Serialized widget size missing for ${component?.pathID || 'unknown component'}`);
    }
    const pivot = PIVOT[Math.max(0, Math.min(8, Math.round(Number(fields.mPivot ?? 4))))] || PIVOT[4];
    return { x: -pivot[0] * width, y: -pivot[1] * height, width, height, pivot };
  }
  function tintedSpriteCrop(image, imagePath, rect, color) {
    const tint = [Number(color.r ?? 1), Number(color.g ?? 1), Number(color.b ?? 1)].map(value => Math.max(0, Math.min(1, value)));
    if (tint.every(value => Math.abs(value - 1) < 1e-7)) return null;
    const key = [imagePath, rect.x, rect.y, rect.width, rect.height, ...tint].join('|');
    if (tintedSpriteCache.has(key)) return tintedSpriteCache.get(key);
    const width = Math.max(1, Math.round(Number(rect.width)));
    const height = Math.max(1, Math.round(Number(rect.height)));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const tintContext = canvas.getContext('2d', { willReadFrequently: true });
    if (!tintContext?.getImageData || !tintContext?.putImageData) {
      throw new Error(`Canvas pixel access unavailable for serialized UISprite tint: ${imagePath}`);
    }
    tintContext.drawImage(image, Number(rect.x), Number(rect.y), Number(rect.width), Number(rect.height), 0, 0, width, height);
    const pixels = tintContext.getImageData(0, 0, width, height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      pixels.data[index] = Math.round(pixels.data[index] * tint[0]);
      pixels.data[index + 1] = Math.round(pixels.data[index + 1] * tint[1]);
      pixels.data[index + 2] = Math.round(pixels.data[index + 2] * tint[2]);
    }
    tintContext.putImageData(pixels, 0, 0);
    const result = { image: canvas, x: 0, y: 0, width, height };
    tintedSpriteCache.set(key, result);
    return result;
  }
  function applyWidgetTransform(component, transform, opacity, label) {
    ctx.save();
    transformMath.assertFiniteMatrix(transform, `${label} @ ${currentTime.toFixed(3)}s`);
    ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
    const fields = widgetFields(component);
    ctx.globalAlpha *= opacity * widgetInitialAlphaFactor(component);
    lastDrawTrace.push({ node: component.node, componentPathID: String(component.pathID), opacity, initialFactor: widgetInitialAlphaFactor(component), canvasAlpha: ctx.globalAlpha });
    const flip = Math.round(Number(fields.mFlip || 0));
    if (flip & 3) {
      const box = widgetBox(component);
      ctx.translate(box.x + box.width / 2, box.y + box.height / 2);
      ctx.scale((flip & 1) ? -1 : 1, (flip & 2) ? -1 : 1);
      ctx.translate(-(box.x + box.width / 2), -(box.y + box.height / 2));
    }
    return fields;
  }
  function verticalGradientSpriteCrop(image, imagePath, rect, fields) {
    if (Number(fields.mGradient ?? 0) !== 2) return null;
    const top = fields.mColor1, bottom = fields.mColor2, tint = fields.mColor;
    if (!top || !bottom || !tint) throw new Error('Serialized vertical gradient colors missing');
    const key = JSON.stringify([imagePath, rect, tint.r, tint.g, tint.b, top, bottom]);
    if (gradientSpriteCache.has(key)) return gradientSpriteCache.get(key);
    const surface = document.createElement('canvas');
    surface.width = Number(rect.width); surface.height = Number(rect.height);
    const gc = surface.getContext('2d', { willReadFrequently: true });
    gc.drawImage(image, rect.x, rect.y, rect.width, rect.height, 0, 0, surface.width, surface.height);
    const pixels = gc.getImageData(0, 0, surface.width, surface.height);
    // A3R2 supplies C1/C2 and T.rgb*C.rgb, finalAlpha*C.a. Mapping C1 to top,
    // C2 to bottom and linear interpolation are explicit Web choices. Canvas
    // consumes straight RGBA; native PMA, Color32 quantization and pass are unknown.
    // Current admitted Bg has zero border/padding, so this maps over the widget.
    for (let y = 0; y < surface.height; y++) {
      const t = surface.height > 1 ? y / (surface.height - 1) : 0;
      const mix = channel => Number(top[channel]) * (1 - t) + Number(bottom[channel]) * t;
      for (let x = 0; x < surface.width; x++) {
        const i = (y * surface.width + x) * 4;
        pixels.data[i] = Math.round(pixels.data[i] * Number(tint.r) * mix('r'));
        pixels.data[i + 1] = Math.round(pixels.data[i + 1] * Number(tint.g) * mix('g'));
        pixels.data[i + 2] = Math.round(pixels.data[i + 2] * Number(tint.b) * mix('b'));
        pixels.data[i + 3] = Math.round(pixels.data[i + 3] * mix('a'));
      }
    }
    gc.putImageData(pixels, 0, 0);
    const result = { image: surface, x: 0, y: 0 };
    gradientSpriteCache.set(key, result);
    return result;
  }
  const plainSpriteCache = new Map();
  // Only the two repeatably expensive first-use decorations opt into snapshots.
  // Keep their original crop as a fallback; no per-frame conversion or readback.
  const bitmapSpriteNodes = new Set(['Bg_Deco/Bg_Deco_4', 'Bg_Deco/Bg_Deco_05']);
  const bitmapSpriteCache = new Map();
  const bitmapPreparation = { status: 'NOT_REQUESTED', bytes: 0, error: null };
  async function prepareSpriteBitmap(node, crop) {
    if (!bitmapSpriteNodes.has(node) || !crop || bitmapSpriteCache.has(node)) return;
    if (typeof createImageBitmap !== 'function') {
      bitmapPreparation.status = 'UNSUPPORTED';
      return;
    }
    try {
      const image = await createImageBitmap(crop.image);
      bitmapSpriteCache.set(node, { ...crop, image });
      bitmapPreparation.bytes += image.width * image.height * 4;
      bitmapPreparation.status = 'READY';
    } catch (error) {
      bitmapPreparation.status = 'FALLBACK';
      bitmapPreparation.error = String(error);
    }
  }
  function plainSpriteCrop(image, imagePath, rect) {
    const key = JSON.stringify([imagePath, rect]);
    if (plainSpriteCache.has(key)) return plainSpriteCache.get(key);
    const left = Math.min(2, rect.x), top = Math.min(2, rect.y);
    const right = Math.min(2, image.naturalWidth - rect.x - rect.width);
    const bottom = Math.min(2, image.naturalHeight - rect.y - rect.height);
    const surface = document.createElement('canvas');
    surface.width = rect.width + left + right;
    surface.height = rect.height + top + bottom;
    const crop = surface.getContext('2d', { willReadFrequently: true });
    crop.drawImage(image, rect.x - left, rect.y - top, surface.width, surface.height,
      0, 0, surface.width, surface.height);
    const result = { image: surface, x: left, y: top };
    plainSpriteCache.set(key, result);
    return result;
  }
  function drawSprite(node, sprite, rect, transform, opacity) {
    const component = sourceComponentByPathID.get(String(sprite.componentPathID));
    if (!component || component.type !== 'UISprite') throw new Error(`UISprite source component missing: ${sprite.componentPathID}`);
    const fields = widgetFields(component);
    const sourceImage = imageByPath.get(sprite.imagePath);
    if (!sourceImage || !sourceImage.complete || !sourceImage.naturalWidth) return;
    const sourceRect = { x: Number(rect.x), y: Number(rect.y), width: Number(rect.width), height: Number(rect.height) };
    const sw = sourceRect.width, sh = sourceRect.height;
    if (!(sw > 0 && sh > 0)) return;
    const sourceWidth = Number(sprite.candidateExtendedAtlas?.textureSize?.split?.('x')?.[0] || sourceImage.naturalWidth);
    const sourceHeight = Number(sprite.candidateExtendedAtlas?.textureSize?.split?.('x')?.[1] || sourceImage.naturalHeight);
    if (sourceRect.x < 0 || sourceRect.y < 0 || sourceRect.x + sw > sourceWidth || sourceRect.y + sh > sourceHeight) throw new Error(`Atlas crop outside image: ${sprite.spriteName}`);
    const tint = fields.mColor || { r: 1, g: 1, b: 1, a: 1 };
    const tinted = verticalGradientSpriteCrop(sourceImage, sprite.imagePath, sourceRect, fields) ||
      (sprite.candidateExtendedAtlas && effectAlphaMode === 'black-matte-to-alpha' ? null : tintedSpriteCrop(sourceImage, sprite.imagePath, sourceRect, tint)) ||
      (new URLSearchParams(location.search).get('luckySpriteCrops') === '1' ? plainSpriteCrop(sourceImage, sprite.imagePath, sourceRect) : null);
    const bitmapCrop = bitmapSpriteCache.get(node.relativePath);
    const image = bitmapCrop?.image || tinted?.image || sourceImage;
    const sx = tinted?.x ?? sourceRect.x, sy = tinted?.y ?? sourceRect.y;
    const box = widgetBox(component);
    const padL = Number(rect.paddingLeft || 0), padR = Number(rect.paddingRight || 0), padT = Number(rect.paddingTop || 0), padB = Number(rect.paddingBottom || 0);
    const paddedW = Math.max(1, sw + padL + padR), paddedH = Math.max(1, sh + padT + padB);
    const dest = {
      x: box.x + box.width * padL / paddedW,
      y: box.y + box.height * padT / paddedH,
      width: box.width * sw / paddedW,
      height: box.height * sh / paddedH
    };
    const fieldsAfterTransform = applyWidgetTransform(component, transform, opacity, `UISprite ${node.relativePath}`);
    const type = Math.round(Number(fieldsAfterTransform.mType || 0));
    const border = rect;
    const drawSimple = () => ctx.drawImage(image, sx, sy, sw, sh, dest.x, dest.y, dest.width, dest.height);
    const drawSlice = () => {
      const bl = Number(border.borderLeft || 0), br = Number(border.borderRight || 0);
      const bt = Number(border.borderTop || 0), bb = Number(border.borderBottom || 0);
      if (bl + br + bt + bb === 0) { drawSimple(); return; }
      const xs = [sx, sx + bl, sx + sw - br, sx + sw], ys = [sy, sy + bt, sy + sh - bb, sy + sh];
      const dl = Math.min(bl, dest.width / 2), dr = Math.min(br, dest.width / 2);
      const dt = Math.min(bt, dest.height / 2), db = Math.min(bb, dest.height / 2);
      const dx = [dest.x, dest.x + dl, dest.x + dest.width - dr, dest.x + dest.width];
      const dy = [dest.y, dest.y + dt, dest.y + dest.height - db, dest.y + dest.height];
      for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 3; xx++) {
        const cw = xs[xx + 1] - xs[xx], ch = ys[yy + 1] - ys[yy], dw = dx[xx + 1] - dx[xx], dh = dy[yy + 1] - dy[yy];
        if (cw > 0 && ch > 0 && dw > 0 && dh > 0) ctx.drawImage(image, xs[xx], ys[yy], cw, ch, dx[xx], dy[yy], dw, dh);
      }
    };
    const drawFilled = () => {
      const amount = Math.max(0, Math.min(1, Number(fieldsAfterTransform.mFillAmount ?? 1)));
      if (amount <= 0) return;
      if (amount >= .999999) { drawSimple(); return; }
      const direction = Math.round(Number(fieldsAfterTransform.mFillDirection || 0));
      const invert = Boolean(Number(fieldsAfterTransform.mInvert || 0));
      if (direction === 0) {
        const cropW = sw * amount, outW = dest.width * amount;
        ctx.drawImage(image, invert ? sx + sw - cropW : sx, sy, cropW, sh, invert ? dest.x + dest.width - outW : dest.x, dest.y, outW, dest.height);
      } else if (direction === 1) {
        const cropH = sh * amount, outH = dest.height * amount;
        ctx.drawImage(image, sx, invert ? sy : sy + sh - cropH, sw, cropH, dest.x, invert ? dest.y : dest.y + dest.height - outH, dest.width, outH);
      } else {
        // This clip's sprites have serialized fillAmount=1; non-rectangular NGUI fills are not source-closed here.
        throw new Error(`Non-full radial UISprite fill is not implemented: ${node.relativePath} type=${direction}`);
      }
    };
    if (sprite.candidateExtendedAtlas) {
      ctx.globalCompositeOperation = WEB_ADAPTER.extensionBlend;
      const mattePath = ALPHA_MATTE_ASSETS[sprite.spriteName];
      const matteImage = mattePath ? imageByPath.get(mattePath) : null;
      if (effectAlphaMode === 'black-matte-to-alpha') {
        if (!matteImage || !matteImage.complete || !matteImage.naturalWidth) throw new Error(`Alpha matte asset missing for ${sprite.spriteName}: ${mattePath || 'UNMAPPED'}`);
        const matteTint = tintedSpriteCrop(matteImage, mattePath, { x: 0, y: 0, width: matteImage.naturalWidth, height: matteImage.naturalHeight }, tint);
        ctx.drawImage(matteTint?.image || matteImage, dest.x, dest.y, dest.width, dest.height);
      } else if (type === 1 || type === 4) drawSlice();
      else if (type === 3) drawFilled();
      else drawSimple();
    } else if (type === 1 || type === 4) drawSlice();
    else if (type === 3) drawFilled();
    else drawSimple();
    ctx.restore();
  }
  function labelAlignment(fields, box) {
    const align = Math.round(Number(fields.mAlignment || 0));
    if (align === 1) return 'left';
    if (align === 2) return 'center';
    if (align === 3) return 'right';
    return box.pivot[0] === 0 ? 'left' : box.pivot[0] === 1 ? 'right' : 'center';
  }
  function drawText(node, component, transform, opacity) {
    const text = textFor(node);
    if (!text) return;
    const fields = widgetFields(component), box = widgetBox(component);
    const ctxFields = applyWidgetTransform(component, transform, opacity, `UILabel ${node.relativePath}`);
    const size = Math.max(1, Number(ctxFields.mFontSize || 16));
    ctx.font = `400 ${size}px ${WEB_ADAPTER.fontFamily}`;
    Object.assign(lastDrawTrace[lastDrawTrace.length - 1], { fontRequested: `400 ${size}px ${WEB_ADAPTER.fontFamily}`, fontApplied: ctx.font });
    ctx.textAlign = labelAlignment(ctxFields, box);
    ctx.textBaseline = 'middle';
    const top = box.y, bottom = box.y + box.height;
    if (Number(ctxFields.mApplyGradient || 0) === 1) {
      const topColor = ctxFields.mGradientTop || { r: 1, g: 1, b: 1, a: 1 };
      const bottomColor = ctxFields.mGradientBottom || topColor;
      const gradient = ctx.createLinearGradient(0, top, 0, bottom);
      const rgba = color => `rgba(${Math.round(Number(color.r ?? 1) * 255)},${Math.round(Number(color.g ?? 1) * 255)},${Math.round(Number(color.b ?? 1) * 255)},${Math.max(0, Math.min(1, Number(color.a ?? 1)))})`;
      gradient.addColorStop(0, rgba(topColor)); gradient.addColorStop(1, rgba(bottomColor));
      ctx.fillStyle = gradient;
    } else {
      const tint = ctxFields.mColor || { r: 1, g: 1, b: 1, a: 1 };
      ctx.fillStyle = `rgba(${Math.round(Number(tint.r ?? 1) * 255)},${Math.round(Number(tint.g ?? 1) * 255)},${Math.round(Number(tint.b ?? 1) * 255)},1)`;
    }
    const x = ctx.textAlign === 'left' ? box.x : ctx.textAlign === 'right' ? box.x + box.width : box.x + box.width / 2;
    const y = box.y + box.height / 2;
    // Runtime font/material are null in the serialized prefab; this family is a Web fallback only.
    const lines = String(text).split(/\n/);
    const lineHeight = size + Number(ctxFields.mSpacingY || 0);
    lines.forEach((line, index) => ctx.fillText(line, x, y + (index - (lines.length - 1) / 2) * lineHeight));
    ctx.restore();
  }
  function drawUITexture(node, component, transform, opacity) {
    const binding = component.assetBinding, image = binding && imageByPath.get(binding.imagePath);
    if (!image || !image.complete || !image.naturalWidth) throw new Error(`UITexture source image missing: ${binding?.imagePath || component.pathID}`);
    const fields = widgetFields(component), box = widgetBox(component), uv = fields.mRect || { x: 0, y: 0, width: 1, height: 1 };
    const sx = Number(uv.x || 0) * image.naturalWidth, sy = (1 - Number(uv.y || 0) - Number(uv.height ?? 1)) * image.naturalHeight;
    const sw = Number(uv.width ?? 1) * image.naturalWidth, sh = Number(uv.height ?? 1) * image.naturalHeight;
    const tf = applyWidgetTransform(component, transform, opacity, `UITexture ${node.relativePath}`);
    ctx.drawImage(image, sx, sy, sw, sh, box.x, box.y, box.width, box.height);
    ctx.restore();
  }
  function componentForNode(node, type) {
    for (const id of node.sourceComponentPathIDs || []) {
      const component = sourceComponentByPathID.get(String(id));
      if (component?.type === type) return component;
    }
    return null;
  }
  function nearestPanelDepth(node) {
    let path = node.hierarchyPath;
    while (path) {
      const panel = (model.sourceComponents || []).find(component => component.type === 'UIPanel' && component.hierarchyPath === path);
      if (panel) return Number(panel.serialized.mDepth || 0);
      const slash = path.lastIndexOf('/');
      if (slash < 0) break;
      path = path.slice(0, slash);
    }
    return 0;
  }
  function serializedDrawCommands() {
    const commands = [];
    for (const node of model.nodes) {
      for (const sprite of node.sprites || []) {
        const component = sourceComponentByPathID.get(String(sprite.componentPathID));
        if (component) commands.push({ kind: 'UISprite', node, component, sprite, panelDepth: nearestPanelDepth(node), widgetDepth: Number(component.serialized.mDepth || 0), siblingIndex: Number(node.sourceTransform.siblingIndex || 0) });
      }
      const label = componentForNode(node, 'UILabel');
      if (label) commands.push({ kind: 'UILabel', node, component: label, panelDepth: nearestPanelDepth(node), widgetDepth: Number(label.serialized.mDepth || 0), siblingIndex: Number(node.sourceTransform.siblingIndex || 0) });
      const texture = componentForNode(node, 'UITexture');
      if (texture) commands.push({ kind: 'UITexture', node, component: texture, panelDepth: nearestPanelDepth(node), widgetDepth: Number(texture.serialized.mDepth || 0), siblingIndex: Number(node.sourceTransform.siblingIndex || 0) });
    }
    // NGUI's live DrawCall/queue is unresolved. This stable panel/widget depth sort is a Web adapter, not a native queue claim.
    return commands.sort((a, b) => a.panelDepth - b.panelDepth || a.widgetDepth - b.widgetDepth || a.siblingIndex - b.siblingIndex || String(a.component.pathID).localeCompare(String(b.component.pathID)));
  }
  const drawCommands = serializedDrawCommands();
  const BACKGROUND_COVER_NODES = new Set(['Bg', 'Bg_Eff']);
  const backgroundWidgetCommands = drawCommands.filter(command => BACKGROUND_COVER_NODES.has(command.node.relativePath) && command.kind === 'UISprite');
  const backgroundReference = backgroundWidgetCommands.find(command => command.node.relativePath === 'Bg');
  if (!backgroundReference || backgroundWidgetCommands.length !== 2) throw new Error('Serialized Bg/Bg_Eff UISprite source pair is incomplete');
  const backgroundBox = widgetBox(backgroundReference.component);
  for (const command of backgroundWidgetCommands) {
    const box = widgetBox(command.component);
    if (box.width !== backgroundBox.width || box.height !== backgroundBox.height) throw new Error('Bg/Bg_Eff serialized Widget sizes differ; background cover contract cannot be shared');
  }
  const backgroundCoverScale = Math.max(
    WEB_ADAPTER.stageWidth / (backgroundBox.width * WEB_ADAPTER.sourceUnitScale),
    WEB_ADAPTER.stageHeight / (backgroundBox.height * WEB_ADAPTER.sourceUnitScale)
  );
  const BACKGROUND_COVER_PROJECTION = Object.freeze({
    classification: 'WEB_ADAPTATION_BACKGROUND_COVERAGE',
    nodes: [...BACKGROUND_COVER_NODES],
    sourceWidget: { width: backgroundBox.width, height: backgroundBox.height },
    sourceUnitScale: WEB_ADAPTER.sourceUnitScale,
    logicalStage: { width: WEB_ADAPTER.stageWidth, height: WEB_ADAPTER.stageHeight },
    uniformCoverScale: backgroundCoverScale,
    projectedWidget: { width: backgroundBox.width * WEB_ADAPTER.sourceUnitScale * backgroundCoverScale, height: backgroundBox.height * WEB_ADAPTER.sourceUnitScale * backgroundCoverScale },
    alignment: 'scale around the existing centered logical origin; preserve serialized transforms, color, alpha, curve and draw order'
  });
  function activeOpacityMap(time) {
    const states = new Map();
    function visit(node, parentActive, parentAlpha) {
      const active = parentActive && nodeActive(node, time);
      const alpha = parentAlpha * nodeAlpha(node, time);
      states.set(node.relativePath, { active, alpha });
      for (const child of children.get(node.relativePath) || []) visit(child, active, alpha);
    }
    for (const root of roots) visit(root, true, 1);
    return states;
  }
  function computeWorldTransforms(time) {
    const worldByPath = new Map();
    const visiting = new Set();
    function visit(node, parentWorld) {
      if (visiting.has(node.relativePath)) throw new Error(`Transform hierarchy cycle at ${node.relativePath}`);
      visiting.add(node.relativePath);
      const world = transformMath.multiply(parentWorld, nodeTransform(node, time), `${node.relativePath || '(root)'} world @ ${time.toFixed(3)}s`);
      worldByPath.set(node.relativePath, world);
      for (const child of children.get(node.relativePath) || []) visit(child, world);
      visiting.delete(node.relativePath);
    }
    const identity = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    const transformByPathID = new Map((model.sourceComponents || []).filter(component => component.type === 'Transform').map(component => [String(component.pathID), component]));
    function sourceTransformMatrix(pathID) {
      const c = transformByPathID.get(String(pathID));
      if (!c) return identity;
      const raw = c.serialized;
      return transformMath.localMatrix(raw.LocalPosition || raw.m_LocalPosition, raw.LocalScale || raw.m_LocalScale, raw.LocalRotation || raw.m_LocalRotation, `external ${c.node} transform`);
    }
    const popup = (model.externalContexts || []).find(context => context.name === 'GachaResultPopup');
    const effect = (model.externalContexts || []).find(context => context.name === 'EffectNewFever');
    const externalRoot = transformMath.multiply(sourceTransformMatrix(popup?.transformPathID), sourceTransformMatrix(effect?.transformPathID), 'serialized popup/effect root');
    for (const root of roots) visit(root, externalRoot);
    if (worldByPath.size !== nodeByPath.size) {
      throw new Error(`Transform walk visited ${worldByPath.size}/${nodeByPath.size} source nodes`);
    }
    return worldByPath;
  }

  let sourceLayerCosts = [];
  function paintSources(time, worldByPath, includeCommand = null) {
    lastDrawTrace = [];
    sourceLayerCosts = [];
    const stateByPath = activeOpacityMap(time);
    for (const command of drawCommands) {
      if (includeCommand && !includeCommand(command)) continue;
      const state = stateByPath.get(command.node.relativePath);
      if (!state?.active) continue;
      const world = worldByPath.get(command.node.relativePath);
      if (!world) throw new Error(`Finite world matrix missing for ${command.node.relativePath}`);
      transformMath.assertFiniteMatrix(world, `${command.node.relativePath} world @ ${time.toFixed(3)}s`);
      const background = BACKGROUND_COVER_NODES.has(command.node.relativePath);
      if (background) {
        // Source widget size at sourceUnitScale=0.82 is 1066×669.12 for a
        // 1280×720 logical stage. Apply a uniform, centered cover projection
        // only to the serialized background pair; never alter source curves.
        ctx.save();
        ctx.scale(backgroundCoverScale, backgroundCoverScale);
      }
      const layerStarted = performance.now();
      try {
        if (command.kind === 'UISprite') drawSprite(command.node, command.sprite, spriteRect(command.sprite), world, state.alpha);
        else if (command.kind === 'UILabel') drawText(command.node, command.component, world, state.alpha);
        else if (command.kind === 'UITexture') drawUITexture(command.node, command.component, world, state.alpha);
      } finally {
        if (background) ctx.restore();
        sourceLayerCosts.push({node:command.node.relativePath,kind:command.kind,ms:performance.now()-layerStarted});
      }
    }
  }

  function setDotParticleStatus(text, state) {
    const target = document.getElementById('candidateStatus');
    if (target) {
      target.textContent = text;
      if (state) target.dataset.state = state;
    }
  }

  let compactAtlasModule = null;
  function drawAtlasFrame(context, atlas, index, ...rect) {
    if (atlas.compact) compactAtlasModule.drawLuckyAtlasFrame(context, atlas, index, ...rect);
    else context.drawImage(atlas, ...rect);
  }
  async function loadDotParticleAtlas() {
    if (dotParticleAtlasLoadPromise) return dotParticleAtlasLoadPromise;
    dotParticleAtlasStatus = 'LOADING';
    dotParticleAtlasLoadPromise = (async () => {
      await window.__releaseOptionalGate;
      if (new URLSearchParams(location.search).get('luckyAtlas') === 'compact') {
        const module = await import('../src/compact-lucky-atlas.mjs');
        compactAtlasModule = module;
        dotParticleAtlas = await module.loadCompactLuckyAtlas('dot', DOTPARTICLE_C2.sha256);
        dotParticleAtlasStatus = 'READY';
        render();
        return { compact: true, decodedBytes: dotParticleAtlas.manifest.decodedBytes };
      }
      const response = await fetch(DOTPARTICLE_C2.imagePath, { cache: 'no-store' });
      if (!response.ok) throw new Error(`DotParticle C2 atlas HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      const digest = await import('../src/sha256-http-compat.mjs').then(module => module.sha256Digest(bytes));
      const sha = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
      if (sha !== DOTPARTICLE_C2.sha256) throw new Error(`DotParticle C2 atlas SHA mismatch: ${sha}`);
      const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      const image = new Image();
      try {
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () => reject(new Error('DotParticle C2 atlas PNG decode failed'));
          image.src = objectUrl;
        });
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
      if (image.naturalWidth !== DOTPARTICLE_C2.imageWidth || image.naturalHeight !== DOTPARTICLE_C2.imageHeight)
        throw new Error(`DotParticle C2 atlas dimensions mismatch: ${image.naturalWidth}x${image.naturalHeight}`);
      dotParticleAtlas = image;
      dotParticleAtlasStatus = 'READY';
      if (dotParticleMode === 'C2') setDotParticleStatus(`C2 DotParticle · Unity 60fps bake · ${DOTPARTICLE_C2.frameCount} frames · SHA PASS · WEB_ADAPTATION projection/blend`, 'ready');
      render();
      return { sha256: sha, width: image.naturalWidth, height: image.naturalHeight, sameOrigin: new URL(DOTPARTICLE_C2.imagePath, location.href).origin === location.origin };
    })().catch(error => {
      dotParticleAtlasStatus = 'FAILED';
      setDotParticleStatus(`C2 atlas load failed · ${error.message}`, 'failed');
      dotParticleAtlasLoadPromise = null;
      throw error;
    });
    return dotParticleAtlasLoadPromise;
  }

  function paintDotParticle(time, worldByPath) {
    dotParticleLastDraw = null;
    if (!['C2', 'C5'].includes(dotParticleMode) || dotParticleAtlasStatus !== 'READY' || !dotParticleAtlas) return;
    if (time < DOTPARTICLE_C2.clipStart || time >= DOTPARTICLE_C2.clipEnd) return;
    const node = nodeByPath.get('DotParticle');
    if (!node) throw new Error('Source model has no DotParticle node.');
    const state = activeOpacityMap(time).get(node.relativePath);
    if (!state?.active) return;
    const world = worldByPath.get(node.relativePath);
    if (!world) throw new Error('Finite DotParticle world matrix missing.');
    transformMath.assertFiniteMatrix(world, `DotParticle world @ ${time.toFixed(3)}s`);
    const rawScale = node.sourceTransform.localScale || {};
    const sourceScale = Number(rawScale.x ?? rawScale.X);
    if (!Number.isFinite(sourceScale) || sourceScale === 0) throw new Error('DotParticle source localScale.x is missing or invalid.');
    const frameIndex = Math.max(0, Math.min(DOTPARTICLE_C2.frameCount - 1, Math.floor((time - DOTPARTICLE_C2.clipStart) * DOTPARTICLE_C2.fps + 1e-5)));
    const column = frameIndex % DOTPARTICLE_C2.columns;
    const rowTop = Math.floor(frameIndex / DOTPARTICLE_C2.columns);
    const frameWorldSize = DOTPARTICLE_C2.diagnosticOrthoSize * 2;
    const localFrameSize = frameWorldSize / Math.abs(sourceScale);
    ctx.save();
    try {
      ctx.transform(world.a, world.b, world.c, world.d, world.e, world.f);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1;
      drawAtlasFrame(ctx, dotParticleAtlas, frameIndex,
        column * DOTPARTICLE_C2.frameSize, rowTop * DOTPARTICLE_C2.frameSize,
        DOTPARTICLE_C2.frameSize, DOTPARTICLE_C2.frameSize,
        -localFrameSize / 2, -localFrameSize / 2, localFrameSize, localFrameSize);
      dotParticleLastDraw = { frameIndex, clipTime: time, composition: 'Canvas globalCompositeOperation=lighter', sourceRow: rowTop, sourceColumn: column };
    } finally { ctx.restore(); }
  }

  async function loadInComePaAtlas() {
    if (inComePaAtlasLoadPromise) return inComePaAtlasLoadPromise;
    inComePaAtlasStatus = 'LOADING';
    inComePaAtlasLoadPromise = (async () => {
      await window.__releaseOptionalGate;
      if (new URLSearchParams(location.search).get('luckyAtlas') === 'compact') {
        const module = await import('../src/compact-lucky-atlas.mjs');
        compactAtlasModule = module;
        inComePaAtlas = await module.loadCompactLuckyAtlas('streak', IN_COME_PA_C5.sha256);
        inComePaAtlasStatus = 'READY';
        render();
        return { compact: true, decodedBytes: inComePaAtlas.manifest.decodedBytes };
      }
      const response = await fetch(IN_COME_PA_C5.imagePath, { cache: 'no-store' });
      if (!response.ok) throw new Error(`in_come_pa C5 atlas HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      const digest = await import('../src/sha256-http-compat.mjs').then(module => module.sha256Digest(bytes));
      const sha = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
      if (sha !== IN_COME_PA_C5.sha256) throw new Error(`in_come_pa C5 atlas SHA mismatch: ${sha}`);
      const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
      const image = new Image();
      try {
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () => reject(new Error('in_come_pa C5 atlas PNG decode failed'));
          image.src = objectUrl;
        });
      } finally { URL.revokeObjectURL(objectUrl); }
      if (image.naturalWidth !== IN_COME_PA_C5.imageWidth || image.naturalHeight !== IN_COME_PA_C5.imageHeight)
        throw new Error(`in_come_pa C5 atlas dimensions mismatch: ${image.naturalWidth}x${image.naturalHeight}`);
      inComePaAtlas = image;
      inComePaAtlasStatus = 'READY';
      if (dotParticleMode === 'C5' && dotParticleAtlasStatus === 'READY') setDotParticleStatus('C5-R2 ready · in_come_pa PNG atlas row orientation corrected + C2 DotParticle · projection/blend WEB_ADAPTATION', 'ready');
      render();
      return { sha256: sha, width: image.naturalWidth, height: image.naturalHeight, sameOrigin: new URL(IN_COME_PA_C5.imagePath, location.href).origin === location.origin };
    })().catch(error => {
      inComePaAtlasStatus = 'FAILED';
      setDotParticleStatus(`C5 atlas load failed · ${error.message}`, 'failed');
      inComePaAtlasLoadPromise = null;
      throw error;
    });
    return inComePaAtlasLoadPromise;
  }

  function paintInComePaStreak(time, worldByPath) {
    inComePaLastDraw = null;
    if (dotParticleMode !== 'C5' || inComePaAtlasStatus !== 'READY' || !inComePaAtlas) return;
    if (time < IN_COME_PA_C5.activeStart || time >= IN_COME_PA_C5.clipEnd) return;
    const parentPath = IN_COME_PA_C5.transformPath;
    const parentState = activeOpacityMap(time).get(parentPath);
    if (!parentState?.active) return;
    const parentWorld = worldByPath.get(parentPath);
    if (!parentWorld) throw new Error(`Serialized parent transform missing for in_come_pa: ${parentPath}`);
    transformMath.assertFiniteMatrix(parentWorld, `in_come_pa parent world @ ${time.toFixed(3)}s`);
    // Restore the serialized child Transform (position=(0,0,-1), scale=(250,250,0)).
    // The baked capture envelope is 2*orthographicSize in world units, so its
    // local image size is divided by the same source scale before that matrix is applied.
    const childLocal = transformMath.localMatrix(
      { x: 0, y: 0, z: -1 },
      { x: IN_COME_PA_C5.sourceScale, y: IN_COME_PA_C5.sourceScale, z: 0 },
      { x: 0, y: 0, z: 0, w: 1 },
      'serialized in_come_pa child transform'
    );
    const world = transformMath.multiply(parentWorld, childLocal, `in_come_pa world @ ${time.toFixed(3)}s`);
    transformMath.assertFiniteMatrix(world, `in_come_pa world @ ${time.toFixed(3)}s`);
    const frameIndex = Math.max(0, Math.min(IN_COME_PA_C5.frameCount - 1, Math.floor(time * IN_COME_PA_C5.fps + 1e-5)));
    const column = frameIndex % IN_COME_PA_C5.columns;
    // Unity SetPixels32 uses a bottom-left origin; the encoded PNG is sampled from its top-left origin.
    // Proof PNGs at frames 25/35/50/65 match the vertically inverted atlas rows byte-for-byte in RGB.
    const sourceUnityRow = Math.floor(frameIndex / IN_COME_PA_C5.columns);
    const rowTop = IN_COME_PA_C5.rows - 1 - sourceUnityRow;
    const localFrameSize = (IN_COME_PA_C5.diagnosticOrthoSize * 2) / IN_COME_PA_C5.sourceScale;
    ctx.save();
    try {
      ctx.transform(world.a, world.b, world.c, world.d, world.e, world.f);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1;
      drawAtlasFrame(ctx, inComePaAtlas, frameIndex,
        column * IN_COME_PA_C5.frameSize, rowTop * IN_COME_PA_C5.frameSize,
        IN_COME_PA_C5.frameSize, IN_COME_PA_C5.frameSize,
        -localFrameSize / 2, -localFrameSize / 2, localFrameSize, localFrameSize);
      inComePaLastDraw = { frameIndex, clipTime: time, activeWindow: [IN_COME_PA_C5.activeStart, IN_COME_PA_C5.clipEnd], parentPath, composition: 'Canvas globalCompositeOperation=lighter', sourceUnityRow, sourcePngTopRow: rowTop, sourceColumn: column, localFrameSize, sourceScale: IN_COME_PA_C5.sourceScale };
    } finally { ctx.restore(); }
  }

  let currentTime = Number(window.LUCKY_FEVER_INITIAL_TIME || 0);
  let layerAuditBusy = false;
  function fitStageToViewport() {
    const stage = canvas.parentElement;
    if (!stage) return;
    if (window.LUCKY_FEVER_EMBED_MODE && stage.id === 'luckyFeverOverlay') {
      return;
    }
    const availableWidth = stage.parentElement?.clientWidth || window.innerWidth;
    const maxHeight = Math.max(220, Math.min(window.innerHeight * 0.58, 810));
    const width = Math.min(availableWidth, maxHeight * WEB_ADAPTER.stageWidth / WEB_ADAPTER.stageHeight);
    const widthCss = `${Math.round(width * 1000) / 1000}px`;
    if (stage.style.width !== widthCss) stage.style.width = widthCss;
  }
  let lastRenderCosts = null;
  const staticPreparation = { status: 'NOT_REQUESTED', elapsedMs: 0, error: null };
  let staticPreparationPromise = null;
  function prepareStaticSpriteCaches() {
    if (staticPreparationPromise) return staticPreparationPromise;
    staticPreparationPromise = (async () => {
      staticPreparation.status = 'PREPARING';
      const started = performance.now();
      try {
        for (const command of drawCommands) {
          if (command.kind !== 'UISprite') continue;
          const sprite = command.sprite;
          const image = imageByPath.get(sprite.imagePath);
          if (!image?.complete || !image.naturalWidth) throw Error('LUCKY_STATIC_IMAGE_NOT_READY');
          const original = spriteRect(sprite);
          const rect = { x: Number(original.x), y: Number(original.y),
            width: Number(original.width), height: Number(original.height) };
          const fields = widgetFields(command.component);
          const color = fields.mColor || { r: 1, g: 1, b: 1, a: 1 };
          const preparedCrop = verticalGradientSpriteCrop(image, sprite.imagePath, rect, fields) ||
            (sprite.candidateExtendedAtlas && effectAlphaMode === 'black-matte-to-alpha' ? null :
              tintedSpriteCrop(image, sprite.imagePath, rect, color));
          const finalCrop = preparedCrop || (new URLSearchParams(location.search).get('luckySpriteCrops') === '1'
            ? plainSpriteCrop(image, sprite.imagePath, rect) : null);
          if (new URLSearchParams(location.search).get('luckySpriteBitmaps') === '1') {
            await prepareSpriteBitmap(command.node.relativePath, finalCrop);
          }
          await new Promise(resolve => setTimeout(resolve, 16));
        }
        staticPreparation.elapsedMs = performance.now() - started;
        staticPreparation.status = 'READY';
      } catch (error) {
        staticPreparation.status = 'FAILED';
        staticPreparation.error = String(error);
        throw error;
      }
    })();
    return staticPreparationPromise;
  }
  function render(preparedViewport = null) {
    if (layerAuditBusy) return;
    fitStageToViewport();
    const rect = preparedViewport?.width > 0 && preparedViewport?.height > 0
      ? preparedViewport : canvas.getBoundingClientRect();
    if (!rect.width || !rect.height || !ctx) return;
    const dpr = Math.max(1, Number(window.devicePixelRatio) || 1);
    const pixelWidth = Math.max(1, Math.round(rect.width * dpr));
    const pixelHeight = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fit = Math.min(rect.width / WEB_ADAPTER.stageWidth, rect.height / WEB_ADAPTER.stageHeight);
    const base = fit * WEB_ADAPTER.sourceUnitScale * dpr;
    ctx.setTransform(base, 0, 0, base, canvas.width / 2, canvas.height / 2);
    const identity = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    try {
      transformMath.assertFiniteMatrix(identity, 'stage identity');
      const worldByPath = computeWorldTransforms(currentTime);
      const sourceStarted = performance.now();
      paintSources(currentTime, worldByPath);
      const dotStarted = performance.now();
      paintDotParticle(currentTime, worldByPath);
      const streakStarted = performance.now();
      paintInComePaStreak(currentTime, worldByPath);
      lastRenderCosts = {
        time: currentTime,
        sourceLayers: sourceLayerCosts,
        sourcesMs: dotStarted - sourceStarted,
        dotMs: streakStarted - dotStarted,
        streakMs: performance.now() - streakStarted
      };
      renderFailure = null;
      ctx.globalCompositeOperation = 'source-over';
    } catch (error) {
      renderFailure = classifyRenderError(error);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      status.textContent = renderFailure.code === 'CANVAS_ORIGIN_TAINTED'
        ? 'Canvas 來源安全限制'
        : renderFailure.code === 'TRANSFORM_MATRIX_ERROR'
          ? 'Transform 矩陣計算失敗'
          : '合成繪製失敗';
      status.classList.remove('source');
      status.classList.add('warn');
    }
    updateErrorBox();
  }
  function setTime(value) {
    const next = Number(value);
    if (!Number.isFinite(next)) return;
    currentTime = Math.max(0, Math.min(Number(model.clip.maxSerializedKeyTime), next));
    render();
  }
  function loadImage(path) {
    return import('../src/resource-loader.mjs').then(module=>module.loadImage(new URL(path,document.baseURI).href))
      .then(image=>{imageByPath.set(path,image);return {path,ok:true};})
      .catch(()=>{imageFailures.add(path);return {path,ok:false};});
  }

  function updateErrorBox() {
    const messages = [];
    if (renderFailure?.code === 'CANVAS_ORIGIN_TAINTED') {
      messages.push('CANVAS_ORIGIN_TAINTED：Canvas 像素讀取被瀏覽器封鎖，通常是頁面或圖片使用 file://／跨來源。請執行 START_LOCAL_PREVIEW.cmd，並從同源 http://127.0.0.1:9171/ 開啟。');
    } else if (renderFailure?.code === 'TRANSFORM_MATRIX_ERROR') {
      messages.push(`Transform 矩陣錯誤：${renderFailure.message}`);
    } else if (renderFailure) {
      messages.push(`COMPOSITION_RENDER_ERROR：${renderFailure.message}`);
    }
    if (imageFailures.size) messages.push(`來源素材載入失敗：${[...imageFailures].join('、')}`);
    errorBox.hidden = messages.length === 0;
    errorBox.textContent = messages.join('；');
  }

  async function runBrowserSmoke() {
    const imageRecords = new Map();
    for (const [path, image] of imageByPath.entries()) imageRecords.set(path, image);
    // Include the four saved player-reference screenshots as same-origin page assets too.
    for (const image of document.querySelectorAll('.reference-grid img')) {
      const path = image.getAttribute('src') || image.currentSrc || image.src;
      if (path && !imageRecords.has(path)) imageRecords.set(path, image);
    }

    const imageChecks = [];
    for (const [path, image] of imageRecords.entries()) {
      const src = image.currentSrc || image.src;
      let resolved;
      try { resolved = new URL(src, window.location.href); }
      catch (error) {
        imageChecks.push({ path, ok: false, sameOrigin: false, httpStatus: null, pixelReadable: false, error: String(error) });
        continue;
      }
      let httpStatus = null;
      let contentType = null;
      try {
        const response = await fetch(resolved.href, { method: 'HEAD', cache: 'no-store', credentials: 'same-origin' });
        httpStatus = response.status;
        contentType = response.headers.get('content-type');
      } catch (error) {
        imageChecks.push({ path, ok: false, sameOrigin: resolved.origin === window.location.origin, httpStatus, pixelReadable: false, error: String(error) });
        continue;
      }
      let pixelReadable = false;
      let rgba = null;
      let pixelError = null;
      try {
        if (!image.complete || !image.naturalWidth || !image.naturalHeight) throw new Error('image not fully loaded');
        const probe = document.createElement('canvas');
        probe.width = 1; probe.height = 1;
        const probeContext = probe.getContext('2d', { willReadFrequently: true });
        probeContext.drawImage(image, 0, 0, 1, 1);
        rgba = [...probeContext.getImageData(0, 0, 1, 1).data];
        pixelReadable = true;
      } catch (error) {
        const classified = classifyRenderError(error);
        pixelError = { name: error?.name || 'Error', code: classified.code, message: classified.message };
      }
      imageChecks.push({
        path,
        ok: resolved.origin === window.location.origin && httpStatus === 200 && pixelReadable,
        sameOrigin: resolved.origin === window.location.origin,
        httpStatus,
        contentType,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        pixelReadable,
        rgba,
        error: pixelError
      });
    }

    const maxTime = Number(model.clip.maxSerializedKeyTime);
    const frameTimes = [...new Set([0, .417, .583, .833, 1.25, maxTime].map(value => Math.max(0, Math.min(maxTime, value))))];
    const priorTime = currentTime;
    const frameChecks = [];
    try {
      for (const time of frameTimes) {
        setTime(time);
        const width = canvas.width, height = canvas.height;
        const states = activeOpacityMap(time);
        const activeDrawableCount = drawCommands.filter(command => states.get(command.node.relativePath)?.active).length;
        const visibleDrawableCount = drawCommands.filter(command => {
          const state = states.get(command.node.relativePath);
          return state?.active && state.alpha > 0;
        }).length;
        const pixels = ctx.getImageData(0, 0, width, height).data;
        let nonTransparentPixels = 0;
        for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) nonTransparentPixels++;
        const pngDataUrl = canvas.toDataURL('image/png');
        const pngBase64Length = pngDataUrl.startsWith('data:image/png;base64,') ? pngDataUrl.length - 'data:image/png;base64,'.length : 0;
        frameChecks.push({
          timeSeconds: Number(time.toFixed(6)),
          width,
          height,
          activeDrawableCount,
          visibleDrawableCount,
          nonTransparentPixels,
          pngBase64Length,
          contextAlpha: ctx.globalAlpha,
          contextOperation: ctx.globalCompositeOperation,
          centralDrawTrace: lastDrawTrace.filter(row => ['Box', 'Box_Eff', 'Bg', 'Bg_Eff', 'Text_01', 'Text_02'].includes(row.node)),
          renderFailure: renderFailure?.code || null,
          // A serialized clip may intentionally fade all active drawables to alpha zero.
          // That clean transparent frame is distinct from a failed draw.
          expectedEmptyFrame: visibleDrawableCount === 0,
          ok: !renderFailure && width > 0 && height > 0 && pngBase64Length > 0 && (nonTransparentPixels > 0 || visibleDrawableCount === 0)
        });
      }
    } catch (error) {
      const classified = classifyRenderError(error);
      frameChecks.push({ timeSeconds: Number(currentTime.toFixed(6)), ok: false, error: { name: error?.name || 'Error', code: classified.code, message: classified.message } });
    } finally {
      setTime(priorTime);
    }

    const report = {
      status: null,
      page: { href: window.location.href, origin: window.location.origin, protocol: window.location.protocol },
      viewport: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        canvasCssWidth: Number(canvas.getBoundingClientRect().width.toFixed(3)),
        canvasCssHeight: Number(canvas.getBoundingClientRect().height.toFixed(3)),
        canvasBackingWidth: canvas.width,
        canvasBackingHeight: canvas.height
      },
      imageCount: imageChecks.length,
      imagesPassed: imageChecks.filter(item => item.ok).length,
      images: imageChecks,
      frameCount: frameChecks.length,
      framesPassed: frameChecks.filter(item => item.ok).length,
      frames: frameChecks,
      errorClassification: ['CANVAS_ORIGIN_TAINTED', 'TRANSFORM_MATRIX_ERROR', 'COMPOSITION_RENDER_ERROR'],
      classificationChecks: [
        { name: 'SecurityError/getImageData taint', expected: 'CANVAS_ORIGIN_TAINTED', actual: classifyRenderError(new DOMException('The canvas has been tainted by cross-origin data; getImageData failed.', 'SecurityError')).code },
        { name: 'non-finite Transform matrix', expected: 'TRANSFORM_MATRIX_ERROR', actual: classifyRenderError(new RangeError('Non-finite transform matrix')).code },
        { name: 'other rendering failure', expected: 'COMPOSITION_RENDER_ERROR', actual: classifyRenderError(new Error('other render failure')).code }
      ]
    };
    const expectedOrigin = window.location.protocol === 'http:' && window.location.hostname === '127.0.0.1';
    const classificationPassed = report.classificationChecks.every(item => item.actual === item.expected);
    report.status = expectedOrigin && imageChecks.every(item => item.ok) && frameChecks.length === 6 && frameChecks.every(item => item.ok) && classificationPassed ? 'PASS' : 'FAIL';
    return report;
  }

  function commandAuditRecord(command, order, time) {
    const component = command.component;
    const serialized = component.serialized || {};
    const sprite = command.sprite || null;
    const rect = sprite ? spriteRect(sprite) : null;
    const state = activeOpacityMap(time).get(command.node.relativePath) || { active: false, alpha: 0 };
    const role = command.kind === 'UILabel' ? 'text'
      : command.kind === 'UITexture' ? 'input-mask'
      : command.node.relativePath === 'Bg' || command.node.relativePath === 'Bg_Eff' ? 'large-background-widget'
      : command.node.relativePath.startsWith('Bg_Deco/') ? 'background-decoration'
      : command.node.relativePath === 'Box' || command.node.relativePath === 'Box_Eff' ? 'chest'
      : command.node.relativePath.startsWith('Fx/') ? 'foreground-effect'
      : command.node.relativePath.startsWith('Bottom/') ? 'bottom-decoration'
      : 'other';
    return {
      order,
      role,
      kind: command.kind,
      node: command.node.relativePath,
      componentPathID: String(component.pathID),
      componentSourceFile: component.source?.p8File || null,
      componentSourceSha256: component.source?.p8Sha256 || null,
      spriteName: sprite?.spriteName || null,
      imagePath: sprite?.imagePath || component.assetBinding?.imagePath || null,
      atlasRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
      atlasPathID: sprite?.declaredAtlasPathID || null,
      materialPathID: sprite?.declaredMaterialPathID || null,
      texturePathID: sprite?.declaredTexturePathID || null,
      widget: {
        width: serialized.mWidth ?? null,
        height: serialized.mHeight ?? null,
        pivot: serialized.mPivot ?? null,
        type: serialized.mType ?? null,
        depth: serialized.mDepth ?? null,
        color: serialized.mColor || null,
        alphaAtTime: state.alpha,
        activeAtTime: state.active
      },
      panelDepth: command.panelDepth,
      siblingIndex: command.siblingIndex,
      text: command.kind === 'UILabel' ? textFor(command.node) : null,
      drawBlend: sprite?.candidateExtendedAtlas ? WEB_ADAPTER.extensionBlend : 'source-over/Web default'
    };
  }

  function auditCanvasMetrics(context, width, height) {
    const data = context.getImageData(0, 0, width, height).data;
    let alphaPixels = 0, nearWhitePixels = 0, opaquePixels = 0, luminanceSum = 0;
    let minX = width, minY = height, maxX = -1, maxY = -1;
    const alphaMask = new Uint8Array(width * height);
    for (let p = 0, i = 0; p < alphaMask.length; p++, i += 4) {
      const alpha = data[i + 3];
      alphaMask[p] = alpha;
      if (!alpha) continue;
      alphaPixels++;
      if (alpha >= 250) opaquePixels++;
      if (data[i] >= 235 && data[i + 1] >= 235 && data[i + 2] >= 235) nearWhitePixels++;
      luminanceSum += .2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2];
      const x = p % width, y = Math.floor(p / width);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    return {
      alphaPixels,
      opaquePixels,
      nearWhitePixels,
      meanLuminanceOnAlpha: alphaPixels ? Number((luminanceSum / alphaPixels).toFixed(2)) : null,
      alphaBounds: maxX < minX ? null : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
      alphaMask
    };
  }

  async function renderAuditPng(time, includeCommand = null, keepMask = false) {
    const output = document.createElement('canvas');
    output.width = WEB_ADAPTER.stageWidth;
    output.height = WEB_ADAPTER.stageHeight;
    const outputContext = output.getContext('2d', { alpha: true, willReadFrequently: true });
    if (!outputContext) throw new Error('Diagnostic canvas 2D context unavailable');
    const previousContext = ctx, previousTime = currentTime;
    ctx = outputContext;
    currentTime = time;
    try {
      ctx.clearRect(0, 0, output.width, output.height);
      const scale = WEB_ADAPTER.sourceUnitScale;
      ctx.setTransform(scale, 0, 0, scale, output.width / 2, output.height / 2);
      const worldByPath = computeWorldTransforms(time);
      paintSources(time, worldByPath, includeCommand);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const metrics = auditCanvasMetrics(ctx, output.width, output.height);
      const blob = await new Promise((resolve, reject) => output.toBlob(value => value ? resolve(value) : reject(new Error('Canvas PNG encoding returned null')), 'image/png'));
      return {
        pngBytes: new Uint8Array(await blob.arrayBuffer()),
        metrics: {
          alphaPixels: metrics.alphaPixels,
          opaquePixels: metrics.opaquePixels,
          nearWhitePixels: metrics.nearWhitePixels,
          meanLuminanceOnAlpha: metrics.meanLuminanceOnAlpha,
          alphaBounds: metrics.alphaBounds
        },
        alphaMask: keepMask ? metrics.alphaMask : null
      };
    } finally {
      ctx = previousContext;
      currentTime = previousTime;
    }
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function createStoredZip(files) {
    const encoder = new TextEncoder();
    const locals = [], centrals = [];
    let offset = 0;
    const u16 = (view, at, value) => view.setUint16(at, value, true);
    const u32 = (view, at, value) => view.setUint32(at, value >>> 0, true);
    for (const file of files) {
      const name = encoder.encode(file.name), data = file.bytes;
      const checksum = crc32(data);
      const local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
      u32(lv, 0, 0x04034b50); u16(lv, 4, 20); u16(lv, 6, 0x0800); u16(lv, 8, 0);
      u16(lv, 10, 0); u16(lv, 12, 0); u32(lv, 14, checksum); u32(lv, 18, data.length); u32(lv, 22, data.length);
      u16(lv, 26, name.length); u16(lv, 28, 0); local.set(name, 30);
      locals.push(local, data);
      const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
      u32(cv, 0, 0x02014b50); u16(cv, 4, 20); u16(cv, 6, 20); u16(cv, 8, 0x0800); u16(cv, 10, 0);
      u16(cv, 12, 0); u16(cv, 14, 0); u32(cv, 16, checksum); u32(cv, 20, data.length); u32(cv, 24, data.length);
      u16(cv, 28, name.length); u16(cv, 30, 0); u16(cv, 32, 0); u16(cv, 34, 0); u16(cv, 36, 0); u32(cv, 38, 0); u32(cv, 42, offset);
      central.set(name, 46); centrals.push(central); offset += local.length + data.length;
    }
    const centralBytes = centrals.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22), ev = new DataView(end.buffer);
    u32(ev, 0, 0x06054b50); u16(ev, 4, 0); u16(ev, 6, 0); u16(ev, 8, files.length); u16(ev, 10, files.length);
    u32(ev, 12, centralBytes); u32(ev, 16, offset); u16(ev, 20, 0);
    return new Blob([...locals, ...centrals, end], { type: 'application/zip' });
  }

  async function buildLayerAuditPackage() {
    if (layerAuditBusy) throw new Error('Layer render audit is already running');
    layerAuditBusy = true;
    try {
    const times = [0, .417, .583, .833, 1.25];
    const files = [];
    const summaries = [];
    const safe = value => String(value || 'unnamed').replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 58) || 'unnamed';
    const commandRecords = drawCommands.map((command, order) => commandAuditRecord(command, order, 0));
    const commandFiles = commandRecords.map((record, index) => ({ record, command: drawCommands[index] }));
    const sourceDrawHash = model.clip.sha256;
    for (const time of times) {
      const timeTag = `t_${time.toFixed(3)}s`;
      const masksByPath = new Map();
      const layerRecords = [];
      for (const { record, command } of commandFiles) {
        const keepMask = ['Bg_Eff', 'Box', 'Box_Eff', 'Bottom/Text_01', 'Bottom/Text_02'].includes(command.node.relativePath);
        const rendered = await renderAuditPng(time, item => item === command, keepMask);
        const filename = `${String(record.order).padStart(2, '0')}_${safe(record.node)}_${safe(record.spriteName || record.kind)}_${safe(record.componentPathID)}.png`;
        files.push({ name: `${timeTag}/layers/${filename}`, bytes: rendered.pngBytes });
        if (rendered.alphaMask) masksByPath.set(command.node.relativePath, { mask: rendered.alphaMask, order: record.order });
        const timeRecord = commandAuditRecord(command, record.order, time);
        layerRecords.push({ ...timeRecord, file: filename, metrics: rendered.metrics });
      }
      const composite = await renderAuditPng(time, null, false);
      files.push({ name: `${timeTag}/source-composite-transparent.png`, bytes: composite.pngBytes });
      const overlay = masksByPath.get('Bg_Eff');
      const overlaps = [];
      if (overlay) {
        for (const targetPath of ['Box', 'Box_Eff', 'Bottom/Text_01', 'Bottom/Text_02']) {
          const target = masksByPath.get(targetPath);
          if (!target) continue;
          let targetPixels = 0, overlapPixels = 0, alphaSum = 0;
          for (let index = 0; index < target.mask.length; index++) {
            if (!target.mask[index]) continue;
            targetPixels++;
            const alpha = overlay.mask[index];
            if (alpha) { overlapPixels++; alphaSum += alpha / 255; }
          }
          overlaps.push({
            overlay: 'Bg_Eff',
            target: targetPath,
            overlayDrawOrder: overlay.order,
            targetDrawOrder: target.order,
            overlayDrawnAfterTarget: overlay.order > target.order,
            targetAlphaPixels: targetPixels,
            sharedAlphaPixels: overlapPixels,
            sharedCoverageRatio: targetPixels ? Number((overlapPixels / targetPixels).toFixed(4)) : null,
            meanOverlayAlphaOnTargetPixels: targetPixels ? Number((alphaSum / targetPixels).toFixed(4)) : null
          });
        }
      }
      summaries.push({
        timeSeconds: time,
        canvas: { width: WEB_ADAPTER.stageWidth, height: WEB_ADAPTER.stageHeight, sourceUnitScale: WEB_ADAPTER.sourceUnitScale },
        effectAlphaMode,
        drawCommandCount: drawCommands.length,
        layerRecords,
        transparentComposite: composite.metrics,
        bgEffOverlap: overlaps
      });
    }
    const manifest = {
      schema: 'CrystalChest.R11P3.P4.R5R2.LayerRenderAudit.v1',
      evidence: 'BROWSER_RENDERED_PRODUCTION_COMPOSITION_FUNCTIONS; per-command and full composite PNGs are transparent Canvas outputs; not native NGUI output',
      page: { href: window.location.href, origin: window.location.origin },
      model: { clipName: model.clip.name, clipPathID: model.clip.pathID, clipSha256: model.clip.sha256, nodeCount: model.nodes.length, curveCount: model.curves.length, keyframeCount: model.clip.sourceKeyframeCount, componentCount: model.sourceComponents.length },
      renderer: { mode: 'existing isolated Canvas composition code; no parameter or source mutation', adapter: WEB_ADAPTER, stageBackground: 'CSS radial gradient and vignette are outside the transparent Canvas and are not included in source-composite-transparent.png' },
      requestedTimesSeconds: times,
      fileCountBeforeManifest: files.length,
      summary: summaries
    };
    files.push({ name: 'layer-audit-manifest.json', bytes: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) });
    return { blob: createStoredZip(files), manifest };
    } finally {
      layerAuditBusy = false;
      render();
    }
  }

  function a1CommandsAndValidate() {
    if (String(model.clip.pathID) !== A1_CLIP_PATH_ID || String(model.clip.sha256).toLowerCase() !== A1_CLIP_SHA256.toLowerCase()) {
      throw new Error(`A1 clip identity mismatch: ${model.clip.pathID} / ${model.clip.sha256}`);
    }
    const commands = [];
    for (const spec of A1_LAYER_CONTRACTS) {
      const command = drawCommands.find(item => item.kind === 'UISprite' && item.node.relativePath === spec.node && String(item.component.pathID) === spec.componentPathID);
      if (!command) throw new Error(`A1 source row missing: ${spec.node} / ${spec.componentPathID}`);
      const { node, component, sprite } = command;
      const fields = widgetFields(component);
      const rect = spriteRect(sprite);
      const expected = spec.rect;
      const geometry = [fields.mWidth, fields.mHeight, fields.mPivot, fields.mType, fields.mDepth].map(Number);
      if (sprite.spriteName !== spec.spriteName || String(sprite.declaredTexturePathID) !== spec.texturePathID || !rect || [rect.x, rect.y, rect.width, rect.height].some((value, index) => Number(value) !== expected[index])) {
        throw new Error(`A1 source texture/rect mismatch: ${spec.node}`);
      }
      if (geometry.some((value, index) => value !== spec.widget[index])) throw new Error(`A1 serialized Widget mismatch: ${spec.node} ${JSON.stringify(geometry)}`);
      if (String(node.sourceTransform.fatherPathID) !== '-5149010126213325373') throw new Error(`A1 parent Transform mismatch: ${spec.node}`);
      if (Math.abs(Number(fields.mColor?.a ?? 1) - spec.baseAlpha) > 1e-7) throw new Error(`A1 base alpha mismatch: ${spec.node}`);
      if (Number(fields.mGradient ?? 0) !== spec.gradient) throw new Error(`A1 serialized gradient mismatch: ${spec.node}`);
      if (String(fields.overrideShader?.m_PathID ?? 0) !== spec.overrideShaderPathID) throw new Error(`A1 override Shader PPtr mismatch: ${spec.node}`);
      commands.push(command);
    }
    return commands.sort((a, b) => drawCommands.indexOf(a) - drawCommands.indexOf(b));
  }

  function a1ProjectedBounds(world, box) {
    const scale = WEB_ADAPTER.sourceUnitScale;
    const corners = [[box.x, box.y], [box.x + box.width, box.y], [box.x + box.width, box.y + box.height], [box.x, box.y + box.height]];
    const points = corners.map(([x, y]) => ({ x: 640 + scale * (world.a * x + world.c * y + world.e), y: 360 + scale * (world.b * x + world.d * y + world.f) }));
    const xs = points.map(point => point.x), ys = points.map(point => point.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys), corners: points };
  }

  async function a1BlobBytes(blob) {
    if (!blob) throw new Error('Canvas PNG encoding returned null');
    return new Uint8Array(await blob.arrayBuffer());
  }

  async function a1CanvasPng(canvasElement) {
    const blob = await new Promise((resolve, reject) => canvasElement.toBlob(value => value ? resolve(value) : reject(new Error('Canvas PNG encoding returned null')), 'image/png'));
    return a1BlobBytes(blob);
  }

  async function a1Sha256(bytes) {
    if (!window.crypto?.subtle) throw new Error('A1 SHA-256 requires a secure same-origin browser context');
    const digest = await import('../src/sha256-http-compat.mjs').then(module => module.sha256Digest(bytes));
    return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
  }

  function a1Csv(rows) {
    const columns = ['timeSeconds', 'node', 'transformPathID', 'componentPathID', 'spriteName', 'texturePathID', 'sourcePngSha256', 'sourceRectPngTopOrigin', 'uvConversionCandidate', 'widgetRectLocal', 'widgetWidth', 'widgetHeight', 'pivot', 'mType', 'mDepth', 'parentTransformPathID', 'localTRS', 'sourceCurveRefs', 'worldMatrix', 'active', 'animatedNodeAlpha', 'serializedTintRGBA', 'baseWidgetAlpha', 'effectiveCanvasAlpha', 'mAlphaMultiplyChild', 'mBorderResize', 'mBorderSize', 'mFillCenter', 'mFillAmount', 'mFillDirection', 'sourceRectBorder', 'projectedBoundsWebAdaptation', 'canvasDrawOrder', 'drawDispatch', 'mGradientSerialized', 'mGradientRendered', 'overrideShaderPathID', 'overrideShaderRendered', 'alphaPixels', 'outputPngSha256', 'browserCanvasCropPngSha256', 'browserCanvasCropRgbaSha256', 'renderClassification'];
    const cell = value => {
      const text = value === null || value === undefined ? '' : (typeof value === 'object' ? JSON.stringify(value) : String(value));
      return `"${text.replace(/"/g, '""')}"`;
    };
    return `${columns.join(',')}\r\n${rows.map(row => columns.map(column => cell(row[column])).join(',')).join('\r\n')}\r\n`;
  }

  async function buildA1LayerAuditPackage() {
    if (layerAuditBusy) throw new Error('A1 layer render audit is already running');
    layerAuditBusy = true;
    const previousContext = ctx, previousTime = currentTime;
    try {
      const commands = a1CommandsAndValidate();
      const atlasPath = commands[0].sprite.imagePath;
      if (commands.some(command => command.sprite.imagePath !== atlasPath)) throw new Error('A1 sprites do not share the admitted Atlas source');
      const image = imageByPath.get(atlasPath);
      if (!image?.complete || image.naturalWidth !== 1024 || image.naturalHeight !== 1024) throw new Error(`A1 full-size Atlas is not loaded at 1024×1024: ${atlasPath}`);
      const response = await fetch(atlasPath, { cache: 'no-store' });
      if (!response.ok) throw new Error(`A1 Atlas HTTP status ${response.status}: ${atlasPath}`);
      const atlasBytes = new Uint8Array(await response.arrayBuffer());
      const atlasSha256 = await a1Sha256(atlasBytes);
      if (atlasSha256 !== A1_ATLAS_SHA256) throw new Error(`A1 Atlas SHA mismatch: ${atlasSha256}`);

      const files = [];
      const crops = new Map();
      for (const command of commands) {
        const rect = spriteRect(command.sprite);
        const key = command.sprite.spriteName;
        if (crops.has(key)) continue;
        const crop = document.createElement('canvas');
        crop.width = Number(rect.width); crop.height = Number(rect.height);
        const cropContext = crop.getContext('2d', { alpha: true, willReadFrequently: true });
        cropContext.drawImage(image, Number(rect.x), Number(rect.y), Number(rect.width), Number(rect.height), 0, 0, crop.width, crop.height);
        const cropBytes = await a1CanvasPng(crop);
        const pixelBytes = new Uint8Array(cropContext.getImageData(0, 0, crop.width, crop.height).data);
        const cropRecord = { spriteName: key, rectPngTopOrigin: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, pngBytes: cropBytes, pngSha256: await a1Sha256(cropBytes), rgbaSha256: await a1Sha256(pixelBytes) };
        crops.set(key, cropRecord);
        files.push({ name: `A1_LAYER_EVIDENCE/browser-canvas-crops/${key}.png`, bytes: cropBytes });
      }

      const traceRows = [];
      const timeSummaries = [];
      for (const time of A1_TIMES) {
        const timeTag = `t_${time.toFixed(3)}s`;
        const layers = [];
        for (let a1Order = 0; a1Order < commands.length; a1Order++) {
          const command = commands[a1Order];
          const record = commandAuditRecord(command, drawCommands.indexOf(command), time);
          const rendered = await renderAuditPng(time, candidate => candidate === command, false);
          const outputPngSha256 = await a1Sha256(rendered.pngBytes);
          const layerFile = `${timeTag}/${String(a1Order + 1).padStart(2, '0')}_${command.node.relativePath}.png`;
          files.push({ name: `A1_LAYER_EVIDENCE/layers/${layerFile}`, bytes: rendered.pngBytes });
          const fields = widgetFields(command.component), sourceRect = spriteRect(command.sprite), box = widgetBox(command.component);
          const world = computeWorldTransforms(time).get(command.node.relativePath);
          if (!world) throw new Error(`A1 world transform missing: ${command.node.relativePath} @ ${time}`);
          transformMath.assertFiniteMatrix(world, `A1 ${command.node.relativePath} @ ${time.toFixed(3)}s`);
          const state = activeOpacityMap(time).get(command.node.relativePath);
          const baseAlpha = Number(fields.mColor?.a ?? 1);
          const type = Math.round(Number(fields.mType || 0));
          const zeroBorder = ['borderLeft', 'borderRight', 'borderTop', 'borderBottom'].every(key => Number(sourceRect[key] || 0) === 0);
          const drawDispatch = type === 1 && zeroBorder ? 'serialized Sliced → zero border → existing drawSlice fallback → single Canvas drawImage' : type === 1 ? 'serialized Sliced → existing drawSlice' : 'serialized Simple → existing drawSimple';
          const spec = A1_LAYER_CONTRACTS.find(item => item.node === command.node.relativePath);
          const row = {
            timeSeconds: time,
            node: command.node.relativePath,
            transformPathID: String(command.node.transformPathID),
            componentPathID: String(command.component.pathID),
            spriteName: command.sprite.spriteName,
            texturePathID: String(command.sprite.declaredTexturePathID),
            sourcePngSha256: atlasSha256,
            sourceRectPngTopOrigin: { x: sourceRect.x, y: sourceRect.y, width: sourceRect.width, height: sourceRect.height },
            uvConversionCandidate: { uMin: Number(sourceRect.x) / image.naturalWidth, uMax: Number(sourceRect.x + sourceRect.width) / image.naturalWidth, vMin: 1 - Number(sourceRect.y + sourceRect.height) / image.naturalHeight, vMax: 1 - Number(sourceRect.y) / image.naturalHeight, status: 'PNG-to-Unity-UV coordinate conversion candidate; effective NGUI UV unresolved' },
            widgetRectLocal: box,
            widgetWidth: Number(fields.mWidth), widgetHeight: Number(fields.mHeight), pivot: Number(fields.mPivot), mType: type, mDepth: Number(fields.mDepth),
            parentTransformPathID: String(command.node.sourceTransform.fatherPathID),
            localTRS: {
              position: transformMath.sampleCurve(track(command.node, 'localPosition'), time) ?? command.node.sourceTransform.localPosition,
              rotation: command.node.sourceTransform.localRotation,
              scale: transformMath.sampleCurve(track(command.node, 'localScale'), time) ?? command.node.sourceTransform.localScale,
              localMatrix: nodeTransform(command.node, time)
            },
            sourceCurveRefs: (curvesByNode.get(command.node.relativePath) || []).map(curve => ({ index: curve.index, property: curve.property, keyCount: curve.keys.length, clipPathID: String(curve.sourceClipPathID), clipSha256: curve.sourceClipSha256 })),
            worldMatrix: world,
            active: Boolean(state?.active), animatedNodeAlpha: Number(state?.alpha ?? 1), baseWidgetAlpha: baseAlpha, effectiveCanvasAlpha: Number((Number(state?.alpha ?? 1) * widgetInitialAlphaFactor(command.component)).toFixed(8)),
            serializedTintRGBA: fields.mColor || null,
            mAlphaMultiplyChild: fields.mAlphaMultiplyChild ?? null,
            mBorderResize: fields.mBorderResize ?? null,
            mBorderSize: fields.mBorderSize || null,
            mFillCenter: fields.mFillCenter ?? null,
            mFillAmount: fields.mFillAmount ?? null,
            mFillDirection: fields.mFillDirection ?? null,
            sourceRectBorder: { left: sourceRect.borderLeft ?? null, right: sourceRect.borderRight ?? null, top: sourceRect.borderTop ?? null, bottom: sourceRect.borderBottom ?? null },
            projectedBoundsWebAdaptation: a1ProjectedBounds(world, box),
            canvasDrawOrder: { globalCommandIndex: drawCommands.indexOf(command), a1Order, sortBasis: 'existing R5 web sort using panelDepth/widgetDepth/siblingIndex; not NGUI live DrawCall order' },
            drawDispatch,
            mGradientSerialized: Number(fields.mGradient ?? 0), mGradientRendered: Number(fields.mGradient ?? 0) === 0 ? 'no UISprite gradient requested in serialized field' : WEB_ADAPTER.spriteGradient,
            overrideShaderPathID: String(fields.overrideShader?.m_PathID ?? 0), overrideShaderRendered: String(fields.overrideShader?.m_PathID ?? 0) === '0' ? 'no override Shader PPtr' : 'not executed by Canvas adapter; native Shader/Blend remains unresolved',
            alphaPixels: rendered.metrics.alphaPixels,
            outputPngSha256,
            renderClassification: !state?.active ? 'SOURCE_GAMEOBJECT_INACTIVE_NOT_DRAWN' : (rendered.metrics.alphaPixels === 0 ? 'CANVAS_DRAW_ATTEMPT_ZERO_VISIBLE_PIXELS_AT_SOURCE_TIME' : 'BROWSER_CANVAS_DRAWN_WEB_ADAPTATION'),
            outputFile: layerFile,
            browserCanvasCropPngSha256: crops.get(command.sprite.spriteName)?.pngSha256,
            browserCanvasCropRgbaSha256: crops.get(command.sprite.spriteName)?.rgbaSha256,
            baseContract: spec
          };
          traceRows.push(row);
          layers.push({ node: row.node, componentPathID: row.componentPathID, alphaPixels: row.alphaPixels, outputPngSha256, outputFile: layerFile, drawOrder: row.canvasDrawOrder });
        }
        const composite = await renderAuditPng(time, candidate => commands.includes(candidate), false);
        const compositeSha256 = await a1Sha256(composite.pngBytes);
        const compositeFile = `${timeTag}/a1-four-layer-transparent-composite.png`;
        files.push({ name: `A1_LAYER_EVIDENCE/composites/${compositeFile}`, bytes: composite.pngBytes });
        timeSummaries.push({ timeSeconds: time, layerCount: layers.length, layers, composite: { outputFile: compositeFile, outputPngSha256: compositeSha256, ...composite.metrics } });
      }
      const manifest = {
        schema: 'CrystalChest.R11.A1.DirectAtlas.WebAdapter.v1',
        status: 'A1_SOURCE_ADAPTER_ENGINEERING_EVIDENCE; NOT_NATIVE_NGUI_PARITY; LUCKY_FEVER_PLAYER_PENDING',
        evidence: 'actual same-origin browser Canvas output produced by the existing isolated R5 composition.js drawSprite/widget/transform/clip code, filtered to the four admitted UISprite components',
        page: { href: window.location.href, origin: window.location.origin, protocol: window.location.protocol },
        source: { clipPathID: model.clip.pathID, clipSha256: model.clip.sha256, atlasPath: atlasPath, atlasSha256, atlasDimensions: { width: image.naturalWidth, height: image.naturalHeight }, contracts: A1_LAYER_CONTRACTS },
        renderer: { reused: ['R5 composition.js source-model component/PathID join', 'Preview137-congruent widgetBox/pivot', 'source Rect direct Canvas crop using PNG top-origin', 'existing R5 parent/local/world transform and curve evaluator', 'existing serialized Simple/Sliced dispatch'], mode: 'existing R5 canvas adapter; no Camera/Offset/Alpha/Shader/Depth override', stage: { width: 1280, height: 720, scale: WEB_ADAPTER.sourceUnitScale, projectionEvidence: 'WEB_ADAPTATION' }, drawOrder: 'existing Canvas command order; does not claim native NGUI order' },
        explicitUnresolved: [WEB_ADAPTER.spriteGradient, WEB_ADAPTER.gradientAlphaConvention, 'Box_Eff override Shader PPtr is recorded but not executed by Canvas; no Shader/Blend parity claim', 'effective NGUI outer/inner UV, live DrawCall, Camera/UIRoot projection and final render queue are unresolved'],
        requestedTimesSeconds: [...A1_TIMES],
        browserCanvasCrops: [...crops.values()].map(({ spriteName, rectPngTopOrigin, pngSha256, rgbaSha256 }) => ({ spriteName, rectPngTopOrigin, browserCanvasCropPngSha256: pngSha256, browserCanvasCropRgbaSha256: rgbaSha256 })),
        browserRasterizationNotes: ['Browser drawImage/getImageData/toBlob is a Web rasterization pipeline; decoded color-space conversion and alpha premultiplication can make its re-encoded crop RGBA differ from raw source PNG pixels. Exact source PNG crops are validated separately from browser layer captures.'],
        traceRows,
        timeSummaries,
        fileCountBeforeManifest: files.length
      };
      files.push({ name: 'A1_LAYER_EVIDENCE/A1_BROWSER_RENDER_TRACE.json', bytes: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) });
      files.push({ name: 'A1_LAYER_EVIDENCE/A1_SOURCE_DRAW_TRACE.csv', bytes: new TextEncoder().encode(a1Csv(traceRows)) });
      return { blob: createStoredZip(files), manifest };
    } finally {
      ctx = previousContext || canvas.getContext('2d');
      currentTime = previousTime;
      layerAuditBusy = false;
      render();
    }
  }

  function a2CommandsAndValidate() {
    if (String(model.clip.pathID) !== A2_CLIP_PATH_ID || String(model.clip.sha256).toLowerCase() !== A2_CLIP_SHA256.toLowerCase()) {
      throw new Error('A2 accepted AnimationClip identity mismatch');
    }
    const commands = [...a1CommandsAndValidate()];
    for (const spec of A2_DIRECT_LAYER_CONTRACTS) {
      // source-model.relativePath is rooted at EffectNewFever, so use the
      // serialized relative path directly; hierarchyPath carries the scene prefix.
      const fullPath = spec.node;
      const command = drawCommands.find(item => item.kind === 'UISprite' && item.node.relativePath === fullPath && String(item.component.pathID) === spec.componentPathID);
      if (!command) throw new Error('A2 source row missing: ' + fullPath + ' / ' + spec.componentPathID);
      const { node, component, sprite } = command;
      const fields = widgetFields(component);
      const rect = spriteRect(sprite);
      const rectValues = rect && [rect.x, rect.y, rect.width, rect.height].map(Number);
      const paddingValues = rect && [rect.paddingLeft, rect.paddingRight, rect.paddingTop, rect.paddingBottom].map(value => Number(value || 0));
      const borderValues = rect && [rect.borderLeft, rect.borderRight, rect.borderTop, rect.borderBottom].map(value => Number(value || 0));
      const widgetValues = [fields.mWidth, fields.mHeight, fields.mPivot, fields.mType, fields.mDepth].map(Number);
      const curves = (curvesByNode.get(node.relativePath) || []).map(curve => ({ index: Number(curve.index), property: String(curve.property), keyCount: (curve.keys || []).length })).sort((a, b) => a.index - b.index);
      const expectedCurves = spec.curves.map(curve => ({ index: Number(curve.index), property: curve.property, keyCount: Number(curve.keyCount) })).sort((a, b) => a.index - b.index);
      if (String(node.transformPathID) !== spec.transformPathID || String(node.sourceTransform.fatherPathID) !== spec.parentTransformPathID || Number(node.sourceTransform.siblingIndex) !== spec.siblingIndex) {
        throw new Error('A2 Transform parent/sibling identity mismatch: ' + fullPath);
      }
      if (String(component.source?.p8Sha256 || '').toLowerCase() !== spec.sourceComponentSha256) throw new Error('A2 serialized component SHA mismatch: ' + fullPath);
      if (sprite.spriteName !== spec.spriteName || String(sprite.declaredAtlasPathID) !== spec.atlasPathID || String(sprite.declaredTexturePathID) !== spec.texturePathID || String(sprite.declaredMaterialPathID) !== spec.materialPathID || sprite.imagePath !== spec.imagePath) {
        throw new Error('A2 Atlas/Texture/Material/Shader/PNG binding mismatch: ' + fullPath);
      }
      if (String(fields.overrideShader?.m_PathID ?? 0) !== spec.overrideShaderPathID || Number(fields.mGradient ?? 0) !== spec.gradient) throw new Error('A2 serialized override Shader/gradient PPtr mismatch: ' + fullPath);
      if (!rect || rectValues.some((value, index) => Number(value) !== spec.rect[index]) || paddingValues.some((value, index) => value !== spec.padding[index]) || borderValues.some((value, index) => value !== spec.border[index])) {
        throw new Error('A2 exact source rect/padding/border mismatch: ' + fullPath);
      }
      if (widgetValues.some((value, index) => value !== spec.widget[index])) throw new Error('A2 serialized Widget contract mismatch: ' + fullPath);
      if (JSON.stringify(curves) !== JSON.stringify(expectedCurves)) throw new Error('A2 AnimationClip curve join mismatch: ' + fullPath);
      commands.push(command);
    }
    const uniqueCommands = [...new Set(commands)];
    if (uniqueCommands.length !== 10) throw new Error('A2 expected exactly ten unique A1+A2 UISprite commands, got ' + uniqueCommands.length);
    return uniqueCommands.sort((a, b) => drawCommands.indexOf(a) - drawCommands.indexOf(b));
  }

  function a2Csv(rows) {
    const columns = ['timeSeconds', 'batch', 'node', 'componentPathID', 'componentSourceFile', 'componentSourceSha256', 'transformPathID', 'parentTransformPathID', 'siblingIndex', 'spriteName', 'atlasPathID', 'texturePathID', 'materialPathID', 'baseMaterialShaderPathID', 'overrideShaderPathID', 'sourceImagePath', 'sourcePngSha256', 'sourceImageSize', 'sourceRectPngTopOrigin', 'sourcePaddingLTRB', 'sourceBorderLTRB', 'widgetWH_Pivot_Type_Depth', 'serializedGradient', 'serializedTintRGBA', 'serializedAlpha', 'sourceCurveRefs', 'sampledLocalPosition', 'sampledLocalScale', 'worldMatrix', 'active', 'animatedAlpha', 'effectiveCanvasAlpha', 'widgetRectLocal', 'projectedBoundsWebAdaptation', 'canvasDrawOrder', 'drawDispatch', 'alphaPixels', 'alphaBounds', 'outputPngSha256', 'outputFile', 'renderClassification', 'nativeNguiStatus'];
    const cell = value => {
      const text = value === null || value === undefined ? '' : (typeof value === 'object' ? JSON.stringify(value) : String(value));
      return '"' + text.replace(/"/g, '""') + '"';
    };
    return columns.join(',') + '\r\n' + rows.map(row => columns.map(column => cell(row[column])).join(',')).join('\r\n') + '\r\n';
  }

  async function buildA2DirectSpriteAuditPackage() {
    if (layerAuditBusy) throw new Error('A2 source layer audit is already running');
    layerAuditBusy = true;
    const previousContext = ctx, previousTime = currentTime;
    try {
      const commands = a2CommandsAndValidate();
      const expectedImages = new Map([
        ['i1-fever-source/assets/Treasurebox_GL_Atlas_6629820909576309265.png', { sha256: '3efd1d140a414959e73743f99fead9ffe413e1a3264e2e8d96215747be368aa4', width: 1024, height: 1024 }],
        ['i1-fever-source/assets/CommonFxAtlas_6500721227336104253.png', { sha256: '87b76c01ef39c091def4ce34a88554f8dc0b2e3d87e389e4ffa8c77deed181c3', width: 512, height: 512 }]
      ]);
      const imageRecords = [];
      for (const [path, expected] of expectedImages) {
        const image = imageByPath.get(path);
        if (!image?.complete || image.naturalWidth !== expected.width || image.naturalHeight !== expected.height) throw new Error('A2 full-resolution source Atlas not loaded: ' + path);
        const response = await fetch(path, { cache: 'no-store', credentials: 'same-origin' });
        if (!response.ok) throw new Error('A2 source Atlas HTTP status ' + response.status + ': ' + path);
        const bytes = new Uint8Array(await response.arrayBuffer());
        const actualSha = await a1Sha256(bytes);
        if (actualSha !== expected.sha256) throw new Error('A2 full-resolution source Atlas SHA mismatch: ' + path + ' / ' + actualSha);
        imageRecords.push({ imagePath: path, sha256: actualSha, width: image.naturalWidth, height: image.naturalHeight, sameOrigin: new URL(image.currentSrc || image.src, window.location.href).origin === window.location.origin, byteLength: bytes.length });
      }
      const files = [];
      const cropRecords = new Map();
      for (const command of commands) {
        const rect = spriteRect(command.sprite);
        const key = command.sprite.spriteName;
        if (cropRecords.has(key)) continue;
        const image = imageByPath.get(command.sprite.imagePath);
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = Number(rect.width);
        cropCanvas.height = Number(rect.height);
        const cropContext = cropCanvas.getContext('2d', { alpha: true, willReadFrequently: true });
        if (!cropContext) throw new Error('A2 browser crop Canvas unavailable: ' + key);
        cropContext.drawImage(image, Number(rect.x), Number(rect.y), Number(rect.width), Number(rect.height), 0, 0, cropCanvas.width, cropCanvas.height);
        const pngBytes = await a1CanvasPng(cropCanvas);
        const rgbaBytes = new Uint8Array(cropContext.getImageData(0, 0, cropCanvas.width, cropCanvas.height).data);
        const record = { spriteName: key, sourceImagePath: command.sprite.imagePath, sourceRectPngTopOrigin: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, browserCanvasCropPngSha256: await a1Sha256(pngBytes), browserCanvasCropRgbaSha256: await a1Sha256(rgbaBytes), pngBytes };
        cropRecords.set(key, record);
        files.push({ name: 'A2_LAYER_EVIDENCE/browser-canvas-crops/' + key + '.png', bytes: pngBytes });
      }
      const traceRows = [];
      const timeSummaries = [];
      for (const time of A2_TIMES) {
        const timeTag = 't_' + time.toFixed(3) + 's';
        const timeLayers = [];
        for (let layerOrder = 0; layerOrder < commands.length; layerOrder++) {
          const command = commands[layerOrder];
          const globalOrder = drawCommands.indexOf(command);
          const render = await renderAuditPng(time, candidate => candidate === command, false);
          const outputPngSha256 = await a1Sha256(render.pngBytes);
          const file = timeTag + '/' + String(layerOrder + 1).padStart(2, '0') + '_' + command.node.relativePath.replaceAll('/', '_') + '.png';
          files.push({ name: 'A2_LAYER_EVIDENCE/layers/' + file, bytes: render.pngBytes });
          const record = commandAuditRecord(command, globalOrder, time);
          const world = computeWorldTransforms(time).get(command.node.relativePath);
          const state = activeOpacityMap(time).get(command.node.relativePath);
          const fields = widgetFields(command.component);
          const box = widgetBox(command.component);
          const curves = (curvesByNode.get(command.node.relativePath) || []).map(curve => ({ index: curve.index, property: curve.property, keyCount: (curve.keys || []).length, sample: transformMath.sampleCurve(curve, time), componentPathID: String(command.component.pathID) }));
          const rect = spriteRect(command.sprite);
          const dispatch = Number(fields.mType) === 1
            ? (['borderLeft', 'borderRight', 'borderTop', 'borderBottom'].every(key => Number(rect[key] || 0) === 0) ? 'serialized Sliced; zero serialized border; R5 drawSlice fallback uses one Canvas drawImage' : 'serialized Sliced; R5 nine-slice drawSlice')
            : Number(fields.mType) === 0 ? 'serialized Simple; R5 drawSimple' : 'serialized mType=' + fields.mType + '; existing R5 dispatch';
          const batch = command.node.relativePath === 'Box' || command.node.relativePath === 'Box_Eff' || command.node.relativePath === 'Bg' || command.node.relativePath === 'Bg_Eff' ? 'A1' : 'A2-direct';
          const uv = { uMin: Number(rect.x) / imageByPath.get(command.sprite.imagePath).naturalWidth, uMax: Number(rect.x + rect.width) / imageByPath.get(command.sprite.imagePath).naturalWidth, vMin: 1 - Number(rect.y + rect.height) / imageByPath.get(command.sprite.imagePath).naturalHeight, vMax: 1 - Number(rect.y) / imageByPath.get(command.sprite.imagePath).naturalHeight, status: 'PNG-to-Unity UV coordinate conversion candidate; effective NGUI UV unresolved' };
          const projected = a1ProjectedBounds(world, box);
          const sourceCurveRefs = curves.map(({ index, property, keyCount, componentPathID }) => ({ index, property, keyCount, componentPathID, clipPathID: model.clip.pathID, clipSha256: model.clip.sha256 }));
          const row = {
            timeSeconds: time, batch, node: command.node.relativePath, componentPathID: String(command.component.pathID), componentSourceFile: record.componentSourceFile, componentSourceSha256: record.componentSourceSha256,
            transformPathID: String(command.node.transformPathID), parentTransformPathID: String(command.node.sourceTransform.fatherPathID), siblingIndex: Number(command.node.sourceTransform.siblingIndex),
            spriteName: command.sprite.spriteName, atlasPathID: String(command.sprite.declaredAtlasPathID), texturePathID: String(command.sprite.declaredTexturePathID), materialPathID: String(command.sprite.declaredMaterialPathID), baseMaterialShaderPathID: A2_DIRECT_LAYER_CONTRACTS.find(spec => spec.componentPathID === String(command.component.pathID))?.baseMaterialShaderPathID || '-8926381322839304170', overrideShaderPathID: String(fields.overrideShader?.m_PathID ?? 0),
            sourceImagePath: command.sprite.imagePath, sourcePngSha256: A2_DIRECT_LAYER_CONTRACTS.find(spec => spec.componentPathID === String(command.component.pathID))?.imageSha256 || A1_ATLAS_SHA256, sourceImageSize: { width: imageByPath.get(command.sprite.imagePath).naturalWidth, height: imageByPath.get(command.sprite.imagePath).naturalHeight },
            sourceRectPngTopOrigin: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, sourcePaddingLTRB: { left: rect.paddingLeft || 0, right: rect.paddingRight || 0, top: rect.paddingTop || 0, bottom: rect.paddingBottom || 0 }, sourceBorderLTRB: { left: rect.borderLeft || 0, right: rect.borderRight || 0, top: rect.borderTop || 0, bottom: rect.borderBottom || 0 },
            widgetWH_Pivot_Type_Depth: { width: fields.mWidth, height: fields.mHeight, pivot: fields.mPivot, type: fields.mType, depth: fields.mDepth }, serializedGradient: Number(fields.mGradient ?? 0),
            serializedTintRGBA: fields.mColor || null, serializedAlpha: Number(fields.mColor?.a ?? 1), sourceCurveRefs,
            sampledLocalPosition: transformMath.sampleCurve(track(command.node, 'localPosition'), time) ?? command.node.sourceTransform.localPosition,
            sampledLocalScale: transformMath.sampleCurve(track(command.node, 'localScale'), time) ?? command.node.sourceTransform.localScale,
            worldMatrix: world, active: Boolean(state?.active), animatedAlpha: Number(state?.alpha ?? 1), effectiveCanvasAlpha: Number((Number(state?.alpha ?? 1) * widgetInitialAlphaFactor(command.component)).toFixed(8)),
            widgetRectLocal: box, projectedBoundsWebAdaptation: projected,
            canvasDrawOrder: { selectedLayerOrder: layerOrder, globalCommandIndex: globalOrder, sortBasis: 'existing R5 Web sort using serialized panelDepth/widgetDepth/siblingIndex; not native NGUI DrawCall order' },
            drawDispatch: dispatch, alphaPixels: render.metrics.alphaPixels, alphaBounds: render.metrics.alphaBounds, outputPngSha256, outputFile: file,
            renderClassification: !state?.active ? 'SOURCE_GAMEOBJECT_INACTIVE_NOT_DRAWN' : (render.metrics.alphaPixels === 0 ? 'CANVAS_DRAW_ATTEMPT_ZERO_VISIBLE_PIXELS_AT_SOURCE_TIME' : 'BROWSER_CANVAS_DRAWN_WEB_ADAPTATION'),
            nativeNguiStatus: 'SOURCE_DIRECT_SERIALIZED_ASSET_AND_CURVE; EFFECTIVE_NGUI_UV_DRAW_CALL_SHADER_PROJECTION_UNRESOLVED',
            browserCanvasCropPngSha256: cropRecords.get(command.sprite.spriteName)?.browserCanvasCropPngSha256,
            browserCanvasCropRgbaSha256: cropRecords.get(command.sprite.spriteName)?.browserCanvasCropRgbaSha256,
            sourceCropReference: 'A2_LAYER_EVIDENCE/source-png-crops/' + command.sprite.spriteName + '_EXACT_ATLAS_PNG_CROP.png',
            uvConversionCandidate: uv
          };
          traceRows.push(row);
          timeLayers.push({ node: row.node, batch, componentPathID: row.componentPathID, spriteName: row.spriteName, alphaPixels: row.alphaPixels, outputPngSha256, outputFile: 'A2_LAYER_EVIDENCE/layers/' + file, globalCommandIndex: globalOrder, selectedLayerOrder: layerOrder });
        }
        const selectedSet = new Set(commands);
        const composite = await renderAuditPng(time, candidate => selectedSet.has(candidate), false);
        const compositeSha256 = await a1Sha256(composite.pngBytes);
        const compositePath = 'A2_LAYER_EVIDENCE/composites/' + timeTag + '_ten-layer-transparent-composite.png';
        files.push({ name: compositePath, bytes: composite.pngBytes });
        timeSummaries.push({ timeSeconds: time, layerCount: timeLayers.length, layers: timeLayers, composite: { outputFile: compositePath, outputPngSha256: compositeSha256, ...composite.metrics } });
      }
      const manifest = {
        schema: 'CrystalChest.R11.A2.DirectSprite.SourceBoundedWebAdapter.v1',
        status: 'A2_DIRECT_SPRITE_BROWSER_ENGINEERING_EVIDENCE; NOT_NATIVE_NGUI_PARITY; LUCKY_FEVER_PLAYER_PENDING',
        evidence: 'Actual same-origin browser Canvas outputs from the existing isolated R5 composition.js drawSprite/widget/transform/clip pipeline; source-filtered to the four A1 and six A2-admitted UISprite commands.',
        page: { href: window.location.href, origin: window.location.origin, protocol: window.location.protocol },
        clip: { pathID: model.clip.pathID, sha256: model.clip.sha256, nodes: model.nodes.length, curves: model.curves.length, keyframes: model.clip.sourceKeyframeCount },
        sources: { images: imageRecords, contracts: [...A1_LAYER_CONTRACTS, ...A2_DIRECT_LAYER_CONTRACTS], exactSourceCropsAreSeparatelyExtractedFromFullPngs: true },
        renderer: { reused: ['Existing R5 composition.js drawSprite', 'serialized parent/local/world Transform and accepted Clip evaluator', 'serialized widget/pivot/Atlas rect/mType dispatch', 'full source PNGs fetched same-origin and SHA-checked'], stage: { width: 1280, height: 720, sourceUnitScale: WEB_ADAPTER.sourceUnitScale, projection: 'WEB_ADAPTATION' }, sort: 'existing R5 serialized depth/sibling Web order; not native NGUI queue' },
        semanticBoundary: { bgGradient: WEB_ADAPTER.spriteGradient, gradientAlpha: WEB_ADAPTER.gradientAlphaConvention, boxEffOverrideShader: 'PPtr and serialized Shader object identity/render state are documented separately; Canvas override Shader execution is not enabled.', allNativeParity: 'effective UISprite UV, Mesh/DrawCall, live material/shader pass, UIRoot/Camera and render queue are unresolved.' },
        requestedTimesSeconds: [...A2_TIMES],
        layerCount: commands.length,
        timeSummaries,
        traceRows,
        browserCanvasCrops: [...cropRecords.values()].map(({ spriteName, sourceImagePath, sourceRectPngTopOrigin, browserCanvasCropPngSha256, browserCanvasCropRgbaSha256 }) => ({ spriteName, sourceImagePath, sourceRectPngTopOrigin, browserCanvasCropPngSha256, browserCanvasCropRgbaSha256 })),
        filesBeforeManifest: files.length
      };
      files.push({ name: 'A2_LAYER_EVIDENCE/A2_BROWSER_RENDER_TRACE.json', bytes: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) });
      files.push({ name: 'A2_LAYER_EVIDENCE/A2_BROWSER_LAYER_TRACE.csv', bytes: new TextEncoder().encode(a2Csv(traceRows)) });
      return { blob: createStoredZip(files), manifest };
    } finally {
      ctx = previousContext || canvas.getContext('2d');
      currentTime = previousTime;
      layerAuditBusy = false;
      render();
    }
  }

  window.addEventListener('luckyfever:time', event => setTime(event.detail?.time));
  window.addEventListener('resize', render, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(render).observe(canvas);
  for (const button of document.querySelectorAll('[data-seek]')) {
    button.addEventListener('click', () => {
      const slider = document.getElementById('timeSlider');
      const time = Number(button.dataset.seek);
      slider.value = String(time);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  const effectModeControl = document.getElementById('effectMatteMode');
  if (effectModeControl) {
    effectModeControl.value = effectAlphaMode;
    effectModeControl.addEventListener('change', () => {
      effectAlphaMode = effectModeControl.value === 'original' ? 'original' : 'black-matte-to-alpha';
      render();
    });
  }

  const browserSmokeButton = document.getElementById('browserSmokeBtn');
  const browserSmokeResult = document.getElementById('originAuditResult');
  if (browserSmokeButton && browserSmokeResult) {
    browserSmokeButton.addEventListener('click', async () => {
      browserSmokeButton.disabled = true;
      browserSmokeResult.dataset.status = 'RUNNING';
      browserSmokeResult.textContent = '正在檢查同源圖片、Canvas 像素讀取與六個時間點…';
      try {
        const report = await runBrowserSmoke();
        browserSmokeResult.dataset.status = report.status;
        browserSmokeResult.textContent = JSON.stringify(report, null, 2);
      } catch (error) {
        const classified = classifyRenderError(error);
        browserSmokeResult.dataset.status = 'FAIL';
        browserSmokeResult.textContent = JSON.stringify({ status: 'FAIL', error: { name: error?.name || 'Error', code: classified.code, message: classified.message } }, null, 2);
      } finally {
        browserSmokeButton.disabled = false;
      }
    });
  }

  const layerAuditButton = document.getElementById('layerAuditBtn');
  const layerAuditResult = document.getElementById('layerAuditResult');
  if (layerAuditButton && layerAuditResult) {
    layerAuditButton.addEventListener('click', async () => {
      layerAuditButton.disabled = true;
      layerAuditResult.dataset.status = 'RUNNING';
      layerAuditResult.textContent = '正在以實際來源合成函式輸出五個時間點的透明圖層與合成 PNG…';
      try {
        const { blob, manifest } = await buildLayerAuditPackage();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'R11P3_P4_R5_R2_LAYER_RENDER_AUDIT.zip';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        layerAuditResult.dataset.status = 'PASS';
        layerAuditResult.textContent = JSON.stringify({ status: 'PASS', fileCount: manifest.fileCountBeforeManifest + 1, layerPngCount: manifest.fileCountBeforeManifest, times: manifest.requestedTimesSeconds, canvas: manifest.renderer.adapter, download: link.download }, null, 2);
      } catch (error) {
        const classified = classifyRenderError(error);
        layerAuditResult.dataset.status = 'FAIL';
        layerAuditResult.textContent = JSON.stringify({ status: 'FAIL', error: { name: error?.name || 'Error', code: classified.code, message: classified.message } }, null, 2);
      } finally {
        layerAuditButton.disabled = false;
      }
    });
  }

  const a1AuditButton = document.getElementById('a1AuditBtn');
  const a1AuditResult = document.getElementById('a1AuditResult');
  if (a1AuditButton && a1AuditResult) {
    a1AuditButton.addEventListener('click', async () => {
      a1AuditButton.disabled = true;
      a1AuditResult.dataset.status = 'RUNNING';
      a1AuditResult.textContent = '正在驗證原始 Atlas SHA，並以現有 Canvas 合成函式輸出四個 A1 圖層…';
      try {
        const { blob, manifest } = await buildA1LayerAuditPackage();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'R11_A1_DIRECT_ATLAS_BROWSER_EVIDENCE.zip';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        a1AuditResult.dataset.status = 'PASS';
        a1AuditResult.textContent = JSON.stringify({ status: 'PASS', layerRows: manifest.traceRows.length, layers: A1_LAYER_CONTRACTS.map(item => item.node), times: manifest.requestedTimesSeconds, atlasSha256: manifest.source.atlasSha256, evidence: manifest.evidence, download: link.download }, null, 2);
      } catch (error) {
        const classified = classifyRenderError(error);
        a1AuditResult.dataset.status = 'FAIL';
        a1AuditResult.textContent = JSON.stringify({ status: 'FAIL', error: { name: error?.name || 'Error', code: classified.code, message: classified.message } }, null, 2);
      } finally {
        a1AuditButton.disabled = false;
      }
    });
  }
  const a2AuditButton = document.getElementById('a2AuditBtn');
  const a2AuditResult = document.getElementById('a2AuditResult');
  if (a2AuditButton && a2AuditResult) {
    a2AuditButton.addEventListener('click', async () => {
      a2AuditButton.disabled = true;
      a2AuditResult.dataset.status = 'RUNNING';
      a2AuditResult.textContent = '正在核對兩份完整來源 Atlas SHA，並用既有 R5 合成函式輸出十層診斷…';
      try {
        const { blob, manifest } = await buildA2DirectSpriteAuditPackage();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'R11_A2_DIRECT_SPRITE_BROWSER_EVIDENCE.zip';
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 30000);
        a2AuditResult.dataset.status = 'PASS';
        a2AuditResult.textContent = JSON.stringify({ status: 'PASS', layerRows: manifest.traceRows.length, layerCount: manifest.layerCount, layers: manifest.sources.contracts.map(item => item.node), times: manifest.requestedTimesSeconds, atlases: manifest.sources.images, composites: manifest.timeSummaries.map(item => ({ timeSeconds: item.timeSeconds, sha256: item.composite.outputPngSha256, alphaPixels: item.composite.alphaPixels })), semantics: manifest.semanticBoundary, download: link.download }, null, 2);
      } catch (error) {
        const classified = classifyRenderError(error);
        a2AuditResult.dataset.status = 'FAIL';
        a2AuditResult.textContent = JSON.stringify({ status: 'FAIL', error: { name: error?.name || 'Error', code: classified.code, message: classified.message } }, null, 2);
      } finally {
        a2AuditButton.disabled = false;
      }
    });
  }

  const basePreparation = Promise.resolve(window.__releaseOptionalGate).then(()=>Promise.all([...uniqueImages, ...effectImagePaths].map(loadImage))).then(async results => {
    const failed = results.filter(result => !result.ok).map(result => result.path);
    if (failed.length) {
      const loadedAtlases = uniqueImages.filter(path => imageByPath.has(path)).length;
      const loadedAdaptations = effectImagePaths.filter(path => imageByPath.has(path)).length;
      status.textContent = `${loadedAtlases}/${uniqueImages.length} 原始/准入貼圖 · ${loadedAdaptations}/${effectImagePaths.length} WEB_ADAPTATION 特效裁切`;
      status.classList.remove('source');
      status.classList.add('warn');
      errorBox.hidden = false;
      errorBox.textContent = `來源圖集載入失敗：${failed.join('、')}。畫面不會以替代素材填補。`;
    } else {
      status.textContent = `${uniqueImages.length} 張原始來源貼圖＋${effectImagePaths.length} 張 WEB_ADAPTATION 特效裁切已載入`;
    }
    updateErrorBox();
    if (!failed.length && new URLSearchParams(location.search).get('luckyStaticWarm') === '1') {
      await prepareStaticSpriteCaches();
    }
    render();
  });
  window.LUCKY_FEVER_COMPOSITION = Object.freeze({
    ensureReady:()=>Promise.all([basePreparation,loadDotParticleAtlas(),loadInComePaAtlas()]).then(()=>{
      if(imageFailures.size)throw Error('LUCKY_SOURCE_IMAGE_FAILURE');return true;
    }),
    render,
    prepareFirstFrame: viewport => {
      if (!(viewport?.width > 0 && viewport?.height > 0)) throw Error('LUCKY_WARM_VIEWPORT_INVALID');
      const savedTime = currentTime;
      try {
        currentTime = 0;
        render(viewport);
        if (renderFailure) throw Error(renderFailure.message || renderFailure.code);
        return { width: canvas.width, height: canvas.height, costs: lastRenderCosts };
      } finally { currentTime = savedTime; }
    },
    setTime,
    setEffectAlphaMode: mode => { effectAlphaMode = mode === 'original' ? 'original' : 'black-matte-to-alpha'; render(); },
    setDotParticleMode: mode => {
      dotParticleMode = mode === 'C2' ? 'C2' : 'C5';
      if (dotParticleMode === 'C2') {
        if (dotParticleAtlasStatus === 'READY' && dotParticleAtlas) {
          setDotParticleStatus(`C2 DotParticle · Unity 60fps bake · ${DOTPARTICLE_C2.frameCount} frames · SHA PASS · WEB_ADAPTATION projection/blend`, 'ready');
        } else {
          setDotParticleStatus('C2 atlas loading · source-proven RGB energy · WEB_ADAPTATION projection', 'loading');
          loadDotParticleAtlas().catch(() => {});
        }
      } else {
        setDotParticleStatus('C5-R2 loading · original in_come_pa native bake + C2 DotParticle; PNG row orientation corrected', 'loading');
        Promise.all([loadDotParticleAtlas(), loadInComePaAtlas()]).then(() => {
          if (dotParticleMode === 'C5') setDotParticleStatus('C5-R2 ready · in_come_pa PNG row orientation corrected + C2 DotParticle · projection/blend WEB_ADAPTATION', 'ready');
        }).catch(() => {});
      }
      render();
      return dotParticleMode;
    },
    buildLayerAuditPackage,
    buildA1LayerAuditPackage,
    buildA2DirectSpriteAuditPackage,
    a1LayerContracts: A1_LAYER_CONTRACTS,
    a2DirectLayerContracts: A2_DIRECT_LAYER_CONTRACTS,
    adapter: WEB_ADAPTER,
    backgroundCoverageProjection: BACKGROUND_COVER_PROJECTION,
    alphaMatteAssets: ALPHA_MATTE_ASSETS,
    nodeCount: nodeByPath.size,
    spriteCount: spriteSources.length,
    sourceComponentCount: (model.sourceComponents || []).length,
    drawCommandCount: drawCommands.length,
    staticPreparationInfo: () => ({ ...staticPreparation,
      tintEntries: tintedSpriteCache.size, gradientEntries: gradientSpriteCache.size, plainEntries: plainSpriteCache.size,
      spriteBitmaps: { ...bitmapPreparation, entries: bitmapSpriteCache.size } }),
    atlasStorage: () => ({
      dot: dotParticleAtlas?.compact ? dotParticleAtlas.manifest.decodedBytes : 83886080,
      streak: inComePaAtlas?.compact ? inComePaAtlas.manifest.decodedBytes : 83886080
    }),
    currentTime: () => currentTime,
    renderCosts: () => lastRenderCosts ? { ...lastRenderCosts } : null,
    dotParticleC2Info: () => ({ mode: dotParticleMode, status: dotParticleAtlasStatus, lastDraw: dotParticleLastDraw, contract: DOTPARTICLE_C2 }),
    inComePaC5Info: () => ({ status: inComePaAtlasStatus, lastDraw: inComePaLastDraw, contract: IN_COME_PA_C5 }),
    classifyRenderError,
    browserOriginAudit: () => {
      const loadedImages = [...imageByPath.entries()].map(([path, image]) => {
        const src = image.currentSrc || image.src;
        const resolved = new URL(src, window.location.href);
        return {
          path,
          src,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          sameOrigin: resolved.origin === window.location.origin,
          responseStatus: performance.getEntriesByName(resolved.href, 'resource').at(-1)?.responseStatus ?? null
        };
      });
      return {
        href: window.location.href,
        origin: window.location.origin,
        protocol: window.location.protocol,
        expectedImageCount: uniqueImages.length + effectImagePaths.length,
        loadedImageCount: loadedImages.length,
        failedPaths: [...imageFailures],
        loadedImages
      };
    },
    auditCanvasPixelAccess: () => {
      const checks = [];
      for (const [path, image] of imageByPath.entries()) {
        try {
          const probe = document.createElement('canvas');
          probe.width = 1;
          probe.height = 1;
          const probeContext = probe.getContext('2d', { willReadFrequently: true });
          probeContext.drawImage(image, 0, 0, 1, 1);
          const pixel = probeContext.getImageData(0, 0, 1, 1).data;
          checks.push({ path, ok: true, rgba: [...pixel] });
        } catch (error) {
          const classified = classifyRenderError(error);
          checks.push({ path, ok: false, errorName: error?.name || 'Error', code: classified.code, message: classified.message });
        }
      }
      return { count: checks.length, passed: checks.filter(item => item.ok).length, failed: checks.filter(item => !item.ok), checks };
    },
    widgetGeometry: componentPathID => { const c = sourceComponentByPathID.get(String(componentPathID)); return c ? { width: c.serialized.mWidth ?? null, height: c.serialized.mHeight ?? null, pivot: c.serialized.mPivot ?? null, depth: c.serialized.mDepth ?? null, type: c.serialized.mType ?? null } : null; }
  });
  render();
})();
