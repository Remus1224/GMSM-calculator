import {loadImage} from './resource-loader.mjs';
const FRAME_COUNT = 16;
const MODES = new Set(['CURRENT_FLASH02', 'SCREENFX_CANDIDATE', 'COMBINED_FLASH02_SCREENFX', 'OFF']);
const SCREENFX_MODES = new Set(['SCREENFX_CANDIDATE', 'COMBINED_FLASH02_SCREENFX']);

export function createFeverScreenFxCandidate({ onChange = () => {} } = {}) {
  const images = Array(FRAME_COUNT).fill(null);
  const errors = [];
  let mode = 'CURRENT_FLASH02';
  let frameIndex = 0;
  let intervalMs = 100;
  let opacity = 70;
  let composite = 'source-over';
  let reverse = false;
  let loop = true;
  let playing = false;
  let visible = false;
  let startedAt = 0;
  let runId = null;
  let lastDrawnFrame = -1;
  let drawCalls = 0;

  const assetsReady = Promise.all(Array.from({length:FRAME_COUNT},(_,i)=>
    loadImage(`assets/fever-screenfx-candidate/Treasure_ScreenFx_${String(i+1).padStart(2,'0')}.png`)
      .then(image=>{images[i]=image;return {index:i+1,ok:true};})
      .catch(()=>{const error={index:i+1,ok:false};errors.push(error);return error;})
  ));

  function changed(reason) { onChange({ reason, ...snapshot() }); }
  function snapshot() {
    return {
      classification: 'ENGINEERING_EXPERIMENT_WEB_VISUAL_CANDIDATE_NOT_NATIVE_PARITY',
      nativeRole: 'SOURCE_UNRESOLVED_ROLE', nativeOrder: 'SOURCE_UNRESOLVED_ORDER', nativeTiming: 'SOURCE_UNRESOLVED_FRAME_TIME',
      mode, frame: frameIndex + 1, frameCount: FRAME_COUNT, intervalMs, order: reverse ? '16_TO_01' : '01_TO_16',
      loop, opacity, composite, playing, visible, runId, lastDrawnFrame: lastDrawnFrame < 0 ? null : lastDrawnFrame + 1, drawCalls, assetsLoaded: images.filter(Boolean).length,
      assetErrors: [...errors], decodeStrategy: 'HTML_IMAGE_DECODE_ONCE_NO_PER_FRAME_BITMAP_COPY'
    };
  }
  function setMode(value, activeRunId = null, now = performance.now()) {
    if (!MODES.has(value)) throw new Error('INVALID_SCREENFX_MODE');
    mode = value;
    if (SCREENFX_MODES.has(mode) && activeRunId !== null) replay(activeRunId, now);
    else if (!SCREENFX_MODES.has(mode)) stop();
    changed('mode');
  }
  function replay(activeRunId = null, now = performance.now()) {
    if (!SCREENFX_MODES.has(mode)) mode = 'SCREENFX_CANDIDATE';
    runId = activeRunId === null ? runId : String(activeRunId);
    frameIndex = reverse ? FRAME_COUNT - 1 : 0;
    startedAt = now;
    playing = true;
    visible = true;
    lastDrawnFrame = -1;
    changed('replay');
  }
  function stop() { playing = false; visible = false; lastDrawnFrame = -1; changed('stop'); }
  function inspectFrame(index) {
    frameIndex = Math.max(0, Math.min(FRAME_COUNT - 1, Number(index) - 1));
    playing = false;
    visible = true;
    lastDrawnFrame = -1;
    changed('manual-frame');
  }
  function update(values = {}) {
    if (values.intervalMs !== undefined) intervalMs = Math.max(30, Math.min(500, Number(values.intervalMs)));
    if (values.opacity !== undefined) opacity = Math.max(0, Math.min(100, Number(values.opacity)));
    if (values.composite !== undefined) composite = values.composite === 'lighter' ? 'lighter' : 'source-over';
    if (values.reverse !== undefined && Boolean(values.reverse) !== reverse) { reverse = Boolean(values.reverse); frameIndex = reverse ? FRAME_COUNT - 1 : 0; }
    if (values.loop !== undefined) loop = Boolean(values.loop);
    changed('parameters');
  }
  function currentFrame(now) {
    if (!playing) return frameIndex;
    const step = Math.max(0, Math.floor((now - startedAt) / intervalMs));
    if (loop) return ((reverse ? FRAME_COUNT - 1 - step : step) % FRAME_COUNT + FRAME_COUNT) % FRAME_COUNT;
    if (step >= FRAME_COUNT) {
      frameIndex = reverse ? 0 : FRAME_COUNT - 1;
      playing = false;
      return frameIndex;
    }
    return reverse ? FRAME_COUNT - 1 - step : step;
  }
  function paint(ctx, now, activeRunId) {
    if (!SCREENFX_MODES.has(mode) || activeRunId === null) return false;
    const activeId = String(activeRunId);
    if (runId !== activeId) replay(activeId, now);
    if (!visible) return false;
    frameIndex = currentFrame(now);
    const image = images[frameIndex];
    if (!image?.complete || !image.naturalWidth) return false;
    ctx.save();
    ctx.globalAlpha = opacity / 100;
    ctx.globalCompositeOperation = composite;
    ctx.drawImage(image, 0, 0, 1280, 720);
    ctx.restore();
    drawCalls += 1;
    const frameChanged = lastDrawnFrame !== frameIndex;
    lastDrawnFrame = frameIndex;
    if (frameChanged) changed('frame');
    return true;
  }
  function needsAnimation() { return SCREENFX_MODES.has(mode) && playing; }

  return Object.freeze({ assetsReady, snapshot, setMode, replay, stop, inspectFrame, update, paint, needsAnimation });
}
