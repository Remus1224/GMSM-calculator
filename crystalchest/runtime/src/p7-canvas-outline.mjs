import { createParticleRoot } from './p7-particle-root.mjs';

export function createCardOutlineFixture({ redraw, appSnapshot }) {
  let scope = null;
  let owner = null;
  let mask = 0;
  let revision = 0;
  let disposed = false;
  let drawnFrames = 0;
  const roots = [1, 2].map(root => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 720;
    const context = canvas.getContext('2d');
    const player = createParticleRoot({ root, redraw, appSnapshot: () => ({}) });
    return { root, canvas, context, player };
  });

  function syncScene({ result }) {
    if (disposed) return;
    const nextMask = result ? result.revealedMask & 3 : 0;
    const nextOwner = result ? String(result.run) : null;
    const changed = nextOwner !== owner || nextMask !== mask;
    scope = result;
    if (!changed) return;
    owner = nextOwner;
    mask = nextMask;
    revision++;
    // Original Apply clears and restarts both active roots when the mask changes.
    for (const item of roots) {
      item.player.syncScene({ result: mask & (1 << (item.root - 1)) ? {
        run: owner + ':' + revision,
        targets: [{ root: 1, slot: 1, revealed: true,
          center: { x: 320 + (item.root === 2 ? 5 : 0), y: 360 },
          reviewOpacity: 1, reviewScale: 1 }],
        occluders: []
      } : null });
    }
  }

  function paint(context) {
    if (disposed || document.hidden || !scope || !mask) return;
    // One shared source per root, then original half-surface projection to cards.
    for (const item of roots) {
      if (!(mask & (1 << (item.root - 1)))) continue;
      item.context.clearRect(0, 0, 640, 720);
      item.player.paint(item.context);
    }
    context.save();
    try {
      context.globalCompositeOperation = 'lighter';
      for (const target of scope.targets || []) {
        if (!target.revealed || !(mask & (1 << (target.root - 1)))) continue;
        const item = roots[target.root - 1];
        if (!item) continue;
        const scale = target.reviewScale ?? 1;
        context.globalAlpha = (target.reviewOpacity ?? 1) * (target.root === 2 ? .60 : 1);
        context.drawImage(item.canvas, 0, 0, 640, 720,
          target.center.x - 320 * scale, target.center.y - 360 * scale,
          640 * scale, 720 * scale);
      }
      drawnFrames++;
    } finally { context.restore(); }
  }

  function snapshot() {
    const state = roots.map(item => item.player.snapshot());
    return { backend: 'P7_CANVAS2D', classification: 'SOURCE_DERIVED_VISUAL_APPROXIMATION',
      ready: state.every(item => item.ready), error: state.find(item => item.error)?.error ?? null,
      gpuInstance: false, effectiveMask: mask, scope, revision, root2Contribution: .60,
      blackKeyFrames: 0, drawnFrames, roots: state, app: appSnapshot() };
  }

  function dispose() {
    if (disposed) return;
    syncScene({ result: null });
    disposed = true;
    for (const item of roots) {
      item.player.dispose();
      item.canvas.width = item.canvas.height = 1;
    }
  }
  window.addEventListener('pagehide', dispose, { once: true });
  return Object.freeze({ syncScene, paint, snapshot, dispose,
    observeIdleScene() {},
    ensurePrepared: () => Promise.all(roots.map(item => item.player.ensurePrepared())),
    readMemoryDiagnostics: () => ({ backend: 'P7_CANVAS2D', nativeMemory: 'NOT_APPLICABLE' }) });
}
