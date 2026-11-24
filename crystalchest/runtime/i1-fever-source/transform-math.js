(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LUCKY_FEVER_TRANSFORM_MATH = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const MATRIX_FIELDS = Object.freeze(['a', 'b', 'c', 'd', 'e', 'f']);

  function component(value, key) {
    if (!value || typeof value !== 'object') return NaN;
    const raw = value[key] ?? value[key.toUpperCase()];
    return raw === undefined || raw === null ? NaN : Number(raw);
  }

  function normalizeVector(value, label) {
    const normalized = {
      x: component(value, 'x'),
      y: component(value, 'y'),
      z: component(value, 'z')
    };
    for (const axis of ['x', 'y', 'z']) {
      if (!Number.isFinite(normalized[axis])) {
        throw new RangeError(`${label}.${axis} is missing or non-finite`);
      }
    }
    return normalized;
  }

  function assertFiniteMatrix(matrix, label) {
    for (const field of MATRIX_FIELDS) {
      if (!Number.isFinite(matrix[field])) {
        throw new RangeError(`${label} matrix.${field} is non-finite`);
      }
    }
    return matrix;
  }

  function localMatrix(positionValue, scaleValue, rotationValue, label) {
    const position = normalizeVector(positionValue, `${label}.position`);
    const scale = normalizeVector(scaleValue, `${label}.scale`);
    const rotation = rotationValue || { z: 0, w: 1 };
    const z = component(rotation, 'z');
    const w = component(rotation, 'w');
    if (!Number.isFinite(z) || !Number.isFinite(w)) {
      throw new RangeError(`${label}.rotation.z/w is missing or non-finite`);
    }
    const angle = 2 * Math.atan2(z, w);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return assertFiniteMatrix({
      a: cos * scale.x,
      b: -sin * scale.x,
      c: sin * scale.y,
      d: cos * scale.y,
      e: position.x,
      f: -position.y
    }, label);
  }

  function multiply(parent, local, label) {
    assertFiniteMatrix(parent, `${label}.parent`);
    assertFiniteMatrix(local, `${label}.local`);
    return assertFiniteMatrix({
      a: parent.a * local.a + parent.c * local.b,
      b: parent.b * local.a + parent.d * local.b,
      c: parent.a * local.c + parent.c * local.d,
      d: parent.b * local.c + parent.d * local.d,
      e: parent.a * local.e + parent.c * local.f + parent.e,
      f: parent.b * local.e + parent.d * local.f + parent.f
    }, label);
  }

  function scalar(value) {
    return typeof value === 'number' ? value : Number(value);
  }

  function slopeComponent(value, key) {
    if (!value || typeof value !== 'object') return scalar(value);
    const raw = value[key] ?? value[key.toUpperCase()];
    return raw === undefined || raw === null ? 0 : Number(raw);
  }

  function finiteSlope(slope) {
    if (slope && typeof slope === 'object') {
      return ['x', 'y', 'z', 'w'].every(key => {
        if (!(key in slope || key.toUpperCase() in slope)) return true;
        return Number.isFinite(component(slope, key));
      });
    }
    return Number.isFinite(scalar(slope));
  }

  function isStep(left, right) {
    return !finiteSlope(left.outSlope) || !finiteSlope(right.inSlope);
  }

  function hermiteScalar(v0, v1, m0, m1, u, dt) {
    const u2 = u * u;
    const u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * dt * m0 +
      (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * dt * m1;
  }

  function interpolateValue(a, b, u, dt, left, right) {
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const result = {};
      for (const key of ['x', 'y', 'z', 'w']) {
        if (key in a || key.toUpperCase() in a) {
          result[key] = hermiteScalar(
            component(a, key), component(b, key),
            slopeComponent(left.outSlope, key), slopeComponent(right.inSlope, key), u, dt
          );
        }
      }
      return result;
    }
    return hermiteScalar(scalar(a), scalar(b), scalar(left.outSlope), scalar(right.inSlope), u, dt);
  }

  function sampleCurve(curve, time) {
    const keys = curve?.keys || [];
    if (!keys.length) return null;
    if (time <= keys[0].time) return keys[0].value;
    if (time >= keys[keys.length - 1].time) return keys[keys.length - 1].value;
    let index = 0;
    while (index < keys.length - 1 && keys[index + 1].time < time) index++;
    const left = keys[index];
    const right = keys[index + 1];
    if (Math.abs(time - left.time) < 1e-9) return left.value;
    if (Math.abs(time - right.time) < 1e-9) return right.value;
    const dt = right.time - left.time;
    if (dt <= 0 || isStep(left, right)) return left.value;
    const u = (time - left.time) / dt;
    return interpolateValue(left.value, right.value, u, dt, left, right);
  }

  return Object.freeze({
    MATRIX_FIELDS,
    component,
    normalizeVector,
    assertFiniteMatrix,
    localMatrix,
    multiply,
    sampleCurve
  });
});
