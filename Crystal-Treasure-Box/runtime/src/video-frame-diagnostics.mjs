// Diagnostic callbacks do not seek, pause, load or otherwise control the video.
export function attachVideoFrameDiagnostics(video) {
  const clips = [];
  let clip = null, callback = 0, previous = null;
  const quality = () => {
    const q = video.getVideoPlaybackQuality?.();
    return q ? { total: q.totalVideoFrames, dropped: q.droppedVideoFrames } : null;
  };
  const stop = () => {
    if (callback) video.cancelVideoFrameCallback?.(callback);
    callback = 0; previous = null;
  };
  const begin = () => {
    stop();
    clip = { source: video.currentSrc || video.src, loadAt: performance.now(),
      playingAt: null, firstFrameAt: null, callbacks: 0, maxCallbackGapMs: 0,
      events: [], frames: [], initialQuality: quality(), quality: null };
    clips.push(clip);
    if (clips.length > 16) clips.splice(4,1); // Retain first-use clips plus recent playback.
  };
  const tick = (now, metadata) => {
    callback = 0;
    if (!clip || video.paused || video.ended) return;
    clip.firstFrameAt ??= now;
    const gap = previous === null ? null : now - previous;
    if (gap !== null) clip.maxCallbackGapMs = Math.max(clip.maxCallbackGapMs, gap);
    clip.callbacks++;
    if ((clip.callbacks <= 12 || gap > 50) && clip.frames.length < 48) {
      clip.frames.push({ at: now, gapMs: gap, mediaTime: metadata.mediaTime,
        presentedFrames: metadata.presentedFrames, expectedDisplayTime: metadata.expectedDisplayTime,
        processingDuration: metadata.processingDuration });
    }
    clip.quality = quality(); previous = now;
    callback = video.requestVideoFrameCallback(tick);
  };
  const bufferedState=()=>{const ranges=[];let ahead=0;for(let i=0;i<video.buffered.length;i++){const start=video.buffered.start(i),end=video.buffered.end(i);ranges.push([start,end]);if(video.currentTime>=start&&video.currentTime<=end)ahead=end-video.currentTime;}return {readyState:video.readyState,networkState:video.networkState,currentTime:video.currentTime,bufferedAheadSeconds:ahead,buffered:ranges,error:video.error?{code:video.error.code,message:video.error.message}:null};};
  video.addEventListener('loadstart', begin);
  for(const type of ['loadstart','loadedmetadata','loadeddata','canplay','playing','waiting','stalled','suspend','error','ended'])video.addEventListener(type,()=>{if(clip&&clip.events.length<48)clip.events.push({type,at:performance.now(),...bufferedState()});});
  video.addEventListener('playing', () => {
    if (!clip) begin();
    clip.playingAt ??= performance.now();
    if (!callback && video.requestVideoFrameCallback) callback = video.requestVideoFrameCallback(tick);
  });
  for (const event of ['pause', 'ended', 'emptied']) video.addEventListener(event, () => {
    if (clip) clip.quality = quality();
    stop();
  });
  return { snapshot: () => ({ supported: typeof video.requestVideoFrameCallback === 'function',
    state:bufferedState(),clips: clips.map(c => ({ ...c, events:c.events.map(e=>({...e})),frames: c.frames.map(f => ({ ...f })) })) }) };
}

if (typeof document !== 'undefined' && new URLSearchParams(location.search).has('phoneDiag')) {
  const video = document.getElementById('movie');
  if (video) window.__phoneVideo = attachVideoFrameDiagnostics(video);
}
