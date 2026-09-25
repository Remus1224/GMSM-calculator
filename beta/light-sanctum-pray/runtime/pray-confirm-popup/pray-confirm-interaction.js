(() => {
  'use strict';

  // Fix13 regression closure.
  // The popup is a Canvas reconstruction of the real NGUI prefab, so there are
  // no native DOM buttons to receive input.  P137's canvas hit-test path is kept
  // as a fallback, but these two transparent DOM hit targets use the *same proven
  // prefab geometry* and send the original child -> parent action messages.
  // No gameplay/cost/EXP state lives here.

  const scene = window.MAPLEM_UI_STATIC_SCENE || {};
  if (String(scene.rootName || '') !== 'PrayConfirmPopup') return;

  const canvas = document.getElementById('sceneCanvas');
  if (!canvas) return;

  const W = Number(scene.coordinateSystem && scene.coordinateSystem.referenceWidth) || 1280;
  const H = Number(scene.coordinateSystem && scene.coordinateSystem.referenceHeight) || 720;

  // Exported prefab evidence:
  // ButtonSet_2 children: Cancel local X=-147, Confirm local X=+147.
  // Both UISprites are 280x70.  P137 WebFix2 registers PopupFrame at scale 1.04
  // and local Y=-40.  ButtonSet Y is -49 - bodyHeight/2, where bodyHeight is
  // ListHeight + 40 and ListHeight=max(60, count*48+(count-1)*2).
  const FRAME_SCALE = 1.04;
  const FRAME_Y = -40;
  const ROOT_Y = -0.09965237;
  const BUTTON_WIDTH = 280;
  const BUTTON_HEIGHT = 70;
  const BUTTON_X = Object.freeze({ cancel: -147, confirm: 147 });

  let visibleCount = 1;
  let lastPointerActionAt = 0;

  function listHeight(count) {
    const n = Math.max(1, Math.min(5, Math.round(Number(count) || 1)));
    return Math.max(60, n * 48 + Math.max(0, n - 1) * 2);
  }

  function referenceRect(action) {
    const bodyHeight = listHeight(visibleCount) + 40;
    const buttonSetY = -49 - bodyHeight / 2;
    const cx = W / 2 + FRAME_SCALE * BUTTON_X[action];
    const worldY = ROOT_Y + FRAME_Y + FRAME_SCALE * buttonSetY;
    const cy = H / 2 - worldY;
    const width = BUTTON_WIDTH * FRAME_SCALE;
    const height = BUTTON_HEIGHT * FRAME_SCALE;
    return { x: cx - width / 2, y: cy - height / 2, width, height };
  }

  function positionTarget(target, action) {
    const cr = canvas.getBoundingClientRect();
    if (!cr.width || !cr.height) return;
    const rr = referenceRect(action);
    target.style.left = (cr.left + rr.x * cr.width / W) + 'px';
    target.style.top = (cr.top + rr.y * cr.height / H) + 'px';
    target.style.width = (rr.width * cr.width / W) + 'px';
    target.style.height = (rr.height * cr.height / H) + 'px';
  }

  function reposition() {
    positionTarget(cancelTarget, 'cancel');
    positionTarget(confirmTarget, 'confirm');
  }

  function send(action) {
    if (!window.parent || window.parent === window) return;
    window.parent.postMessage({ type: 'maplem-pray-confirm-action', action }, '*');
  }

  function makeTarget(action, label) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'pray-confirm-dom-hit-target';
    el.dataset.action = action;
    el.setAttribute('aria-label', label);
    el.title = label;
    Object.assign(el.style, {
      position: 'fixed',
      zIndex: '2147483647',
      margin: '0',
      padding: '0',
      border: '0',
      borderRadius: '0',
      background: 'transparent',
      opacity: '0.001',
      cursor: 'pointer',
      pointerEvents: 'auto',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent'
    });

    // pointerup gives desktop mouse, touch and pen one deterministic path.
    el.addEventListener('pointerup', (ev) => {
      if (ev.button !== undefined && ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      lastPointerActionAt = performance.now();
      send(action);
    });

    // Keyboard activation and browsers that synthesize click without PointerEvent.
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (performance.now() - lastPointerActionAt < 500) return;
      send(action);
    });
    return el;
  }

  const cancelTarget = makeTarget('cancel', '取消');
  const confirmTarget = makeTarget('confirm', '確認');
  document.body.append(cancelTarget, confirmTarget);

  window.addEventListener('message', (ev) => {
    const d = ev && ev.data || {};
    if (d.type !== 'maplem-pray-confirm-state') return;
    const slotCount = Math.max(0, Math.min(5, Math.round(Number(d.slotCount) || 0)));
    const locks = Array.isArray(d.locks) ? d.locks : [];
    let unlocked = 0;
    for (let i = 0; i < slotCount; i++) if (!Boolean(locks[i])) unlocked++;
    visibleCount = Math.max(1, unlocked);
    requestAnimationFrame(reposition);
  });

  window.addEventListener('resize', reposition, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', reposition, { passive: true });
    window.visualViewport.addEventListener('scroll', reposition, { passive: true });
  }

  requestAnimationFrame(reposition);

  window.__MAPLEM_PRAY_CONFIRM_INTERACTION__ = Object.freeze({
    version: 'Fix13',
    source: 'PrayConfirmPopup prefab ButtonSet_2 geometry + P137 WebFix2 registration',
    ownership: 'input relay only; parent P137 remains sole gameplay owner'
  });
})();