import {fetchResource as fetch,loadImage} from './resource-loader.mjs';
// Source-derived Canvas2D candidate. Particle randomness, projection and tint
// quantization require player comparison against the retained Unity backend.
import { hermite, makeRandom } from './r44-p1-canvas-math.mjs';

function curve(source, time, random) {
  const value = source.scalar;
  if (source.minMaxState === 0) return value;
  if (source.minMaxState === 3) return source.minScalar + (value - source.minScalar) * random;
  const maximum = value * hermite(source.maxCurve.m_Curve, time);
  if (source.minMaxState === 1) return maximum;
  const minimum = source.minScalar * hermite(source.minCurve.m_Curve, time);
  return minimum + (maximum - minimum) * random;
}

function gradient(source, time, channel) {
  const alpha = channel === 'a';
  const count = source[alpha ? 'm_NumAlphaKeys' : 'm_NumColorKeys'];
  const prefix = alpha ? 'atime' : 'ctime';
  for (let i = 1; i < count; i++) {
    const end = source[prefix + i] / 65535;
    if (time > end) continue;
    const start = source[prefix + (i - 1)] / 65535;
    const amount = Math.max(0, Math.min(1, (time - start) / (end - start || 1)));
    return source['key' + (i - 1)][channel] * (1 - amount) + source['key' + i][channel] * amount;
  }
  return source['key' + (count - 1)][channel];
}

export function createParticleRoot({ redraw, appSnapshot, root }) {
  let config, haloImage, particleTints, circleTints;
  let ready = false, error = null, disposed = false, scope = null;
  let started = 0, nextBirth = 0, particles = [], random = makeRandom();
  let frame = 0, revision = 0;
  const diagnostic = new URLSearchParams(location.search).has('phoneDiag');
  const stats = { blackKeyFrames: 0, drawnFrames: 0, renderedFrames: 0, starts: 0, clears: 0 };
  const active = () => ready && !error && !disposed && !!scope?.targets?.length;

  async function texture(name) {
    return loadImage(new URL('../assets/p32-canvas/' + name, import.meta.url).href);
  }

  // Tint original small textures once. No full-stage readback during playback.
  function tint(image, rgb, alpha = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i] *= rgb.r;
      pixels.data[i + 1] *= rgb.g;
      pixels.data[i + 2] *= rgb.b;
      pixels.data[i + 3] *= alpha;
    }
    context.putImageData(pixels, 0, 0);
    return canvas;
  }

  function spawn(birth) {
    const source = config.particle;
    const phase = ((birth % 10) + 10) % 10 / 10;
    const color = source.initialModule.startColor;
    const blend = random();
    const width = 180 * source.shape.m_Scale.x;
    const height = 180 * source.shape.m_Scale.y;
    // Serialized shape16 emits on the box perimeter.
    const distance = random() * 2 * (width + height);
    let x, y;
    if (distance < width) { x = distance - width / 2; y = -height / 2; }
    else if (distance < width + height) { x = width / 2; y = distance - width - height / 2; }
    else if (distance < 2 * width + height) { x = width / 2 - (distance - width - height); y = height / 2; }
    else { x = -width / 2; y = height / 2 - (distance - 2 * width - height); }
    return {
      birth,
      life: curve(source.lifetime, phase, random()),
      size: curve(source.startSize, phase, random()) * 180,
      x,
      y,
      rotation: curve(source.startRotation, phase, random()),
      colorBin: Math.round(blend * 7),
      alpha: color.maxColor.a * (1 - blend) + color.minColor.a * blend
    };
  }

  function advance(age) {
    const source = config.particle;
    const interval = 1 / source.emission.rateOverTime.scalar;
    // Large gaps rebuild only the last lifetime of the prewarmed system.
    if (age - nextBirth > 2) {
      particles = [];
      nextBirth = age - Math.max(source.lifetime.scalar, source.lifetime.minScalar);
    }
    for (; nextBirth <= age; nextBirth += interval) {
      particles = particles.filter(particle => nextBirth - particle.birth < particle.life);
      if (particles.length < source.maxParticles) particles.push(spawn(nextBirth));
    }
    particles = particles.filter(particle => age - particle.birth < particle.life);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function schedule() {
    if (active() && !document.hidden && !frame) frame = requestAnimationFrame(tick);
  }

  function tick(now) {
    frame = 0;
    if (!active() || document.hidden) return;
    advance((now - started) / 1000);
    stats.renderedFrames++;
    redraw();
    schedule();
  }

  function syncScene({ result }) {
    if (disposed) return;
    const next = result?.targets?.length ? result : null;
    if (next?.run !== scope?.run) {
      stop();
      particles = [];
      revision++;
      if (next) {
        const seed = new Uint32Array(1);
        crypto.getRandomValues(seed);
        random = makeRandom(seed[0]);
        started = performance.now();
        nextBirth = 0;
        stats.starts++;
      } else stats.clears++;
    }
    scope = next;
    if (!scope) stop();
    schedule();
  }

  function paint(context) {
    if (!active() || document.hidden) return;
    const age = (performance.now() - started) / 1000;
    advance(age);
    const mount = config.mount;
    const velocityY = config.particle.activeModuleData.VelocityModule.y.scalar * 180;
    const color = config.particle.activeModuleData.ColorModule.gradient.maxGradient;
    const paintStarted = diagnostic ? performance.now() : 0;
    context.save();
    try {
      context.beginPath();
      context.rect(0, 0, 1280, 720);
      for (const box of scope.occluders || []) context.rect(box.x, box.y, box.width, box.height);
      context.clip('evenodd');
      context.globalCompositeOperation = 'lighter';
      for (const target of scope.targets) {
        if (!target.revealed) continue;
        context.save();
        context.translate(target.center.x, target.center.y);
        const scale = (target.reviewScale ?? 1) * mount;
        context.scale(scale, scale);
        const opacity = target.reviewOpacity ?? 1;
        // Root2 circle order250 precedes particle1536 and halo1563.
        if (circleTints) {
          const circle = config.circle;
          const elapsed = age + circle.lifetime.scalar;
          const life = (elapsed % circle.lifetime.scalar) / circle.lifetime.scalar;
          const colors = circle.activeModuleData.ColorModule.gradient.maxGradient;
          const startColor = circle.initialModule.startColor.maxColor;
          context.save();
          context.translate(-3, 1);
          context.rotate(-elapsed * circle.activeModuleData.RotationModule.curve.scalar);
          context.globalAlpha = opacity * startColor.a * gradient(colors, life, 'a');
          context.drawImage(circleTints[Math.min(63, Math.round(life * 63))], -250, -250, 500, 500);
          context.restore();
        }
        for (const particle of particles) {
          const elapsed = Math.max(0, age - particle.birth);
          const life = Math.min(1, elapsed / particle.life);
          context.save();
          context.translate(particle.x, -(particle.y + velocityY * elapsed));
          context.rotate(-particle.rotation);
          context.globalAlpha = opacity * particle.alpha * gradient(color, life, 'a');
          const bin = Math.min(15, Math.round(life * 15));
          context.drawImage(particleTints[particle.colorBin][bin], -particle.size / 2, -particle.size / 2, particle.size, particle.size);
          context.restore();
        }
        context.globalAlpha = opacity;
        context.drawImage(haloImage, -133 + config.haloOffset.x, -142 - config.haloOffset.y, 266, 284);
        context.restore();
      }
      stats.drawnFrames++;
    } finally {
      context.restore();
      if (diagnostic) {
        const elapsed = performance.now() - paintStarted;
        stats.phonePaintCalls = (stats.phonePaintCalls || 0) + 1;
        stats.phonePaintTotalMs = (stats.phonePaintTotalMs || 0) + elapsed;
        stats.phonePaintMaxMs = Math.max(stats.phonePaintMaxMs || 0, elapsed);
      }
    }
  }

  function snapshot() {
    return { backend: 'P7_CANVAS2D_ROOT', classification: 'SOURCE_DERIVED_VISUAL_APPROXIMATION', ready, error,
      gpuInstance: false, scope, effectiveMask: active() ? 1 : 0, mount: 1.18,
      particles: particles.length, age: scope ? (performance.now() - started) / 1000 : 0,
      revision, ...stats, app: appSnapshot() };
  }

  async function prepare() {
    try {
      const response = await fetch(new URL('./p7-root' + root + '-config.json', import.meta.url));
      if (!response.ok) throw Error('P7_ROOT_CONFIG_' + response.status);
      config = await response.json();
      const [halo, particle] = await Promise.all([texture('Effect_Unique.png'), texture('Effect_UniqueParticel.png')]);
      if (disposed) return;
      const haloColor = config.halo.initialModule.startColor.maxColor;
      haloImage = tint(halo, haloColor, haloColor.a);
      const initial = config.particle.initialModule.startColor;
      const colors = config.particle.activeModuleData.ColorModule.gradient.maxGradient;
      particleTints = Array.from({ length: 8 }, (_, colorBin) => Array.from({ length: 16 }, (_, bin) => {
        const rgb = {};
        for (const channel of ['r', 'g', 'b']) {
          const start = initial.maxColor[channel] + (initial.minColor[channel] - initial.maxColor[channel]) * colorBin / 7;
          rgb[channel] = start * gradient(colors, bin / 15, channel);
        }
        // Legacy additive material has TintColor=(.5,.5,.5,.5), RGB multiplier 2.
        return tint(particle, rgb);
      }));
      if (config.circle) {
        const image = await texture('Effect_Radial.png');
        if (disposed) return;
        const circle = config.circle;
        const initial = circle.initialModule.startColor.maxColor;
        const colors = circle.activeModuleData.ColorModule.gradient.maxGradient;
        circleTints = Array.from({ length: 64 }, (_, bin) => {
          const rgb = {};
          for (const channel of ['r', 'g', 'b']) rgb[channel] = initial[channel] * gradient(colors, bin / 63, channel);
          return tint(image, rgb);
        });
      }
      ready = true;
      schedule();
      redraw();
    } catch (reason) { error = String(reason); redraw(); }
  }

  const onVisibility = () => { if (document.hidden) stop(); else schedule(); };
  document.addEventListener('visibilitychange', onVisibility);
  function dispose() {
    disposed = true;
    stop();
    scope = null;
    document.removeEventListener('visibilitychange', onVisibility);
    for (const canvas of [haloImage, ...(particleTints || []).flat(), ...(circleTints || [])]) {
      if (canvas) canvas.width = canvas.height = 1;
    }
    particles = [];
  }
  window.addEventListener('pagehide', dispose, { once: true });
  const preparation = prepare();
  return Object.freeze({ syncScene, paint, snapshot, ensurePrepared: () => preparation,
    readMemoryDiagnostics: () => ({ backend: 'P7_CANVAS2D_ROOT', nativeMemory: 'NOT_APPLICABLE' }), dispose });
}
