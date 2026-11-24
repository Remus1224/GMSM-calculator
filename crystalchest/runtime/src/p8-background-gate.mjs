export const P8_BACKGROUND_WIDTH = 1280;
export const P8_BACKGROUND_HEIGHT = 720;

const byteView = value => ArrayBuffer.isView(value) && value.BYTES_PER_ELEMENT === 1;

export function captureP8GateOracle(canvas, cachedPixels, pending) {
  if (!pending) return { pixels: cachedPixels, pending: false, captured: false };
  if (!canvas || canvas.width !== P8_BACKGROUND_WIDTH || canvas.height !== P8_BACKGROUND_HEIGHT) {
    throw new Error('P8_GATE_SOURCE_STAGE_SIZE_INVALID');
  }
  const context = canvas.getContext('2d');
  if (!context) throw new Error('P8_GATE_SOURCE_CONTEXT_UNAVAILABLE');
  const pixels = context.getImageData(0, 0, P8_BACKGROUND_WIDTH, P8_BACKGROUND_HEIGHT).data;
  if (!byteView(pixels) || pixels.length !== P8_BACKGROUND_WIDTH * P8_BACKGROUND_HEIGHT * 4) {
    throw new Error('P8_GATE_SOURCE_PIXEL_DATA_INVALID');
  }
  return { pixels, pending: false, captured: true };
}

export function matchP8GateInput(inputs, frame, run, token, currentRun, currentToken, choice) {
  const input = inputs.get(frame);
  if (!input || currentRun !== run || currentToken !== token || choice === 'off' ||
      input.frame !== frame || input.run !== run || input.token !== token ||
      !byteView(input.pixels) || input.pixels.length !== P8_BACKGROUND_WIDTH * P8_BACKGROUND_HEIGHT * 4) {
    return null;
  }
  return input;
}

export function uprightP8Readback(raw, width = P8_BACKGROUND_WIDTH, height = P8_BACKGROUND_HEIGHT) {
  const expected = width * height * 4;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 ||
      !byteView(raw) || raw.length !== expected) {
    throw new Error('P8_GATE_READBACK_DATA_INVALID');
  }
  const out = new Uint8ClampedArray(expected), stride = width * 4;
  for (let y = 0; y < height; y++) out.set(raw.subarray((height - 1 - y) * stride, (height - y) * stride), y * stride);
  return out;
}

export function compareP8Rgb(input, readback, width = P8_BACKGROUND_WIDTH, height = P8_BACKGROUND_HEIGHT) {
  const expected = width * height * 4;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 ||
      !byteView(input) || !byteView(readback) || input.length !== expected || readback.length !== expected) {
    throw new Error('P8_GATE_PIXEL_DATA_INVALID');
  }
  let changedPixels = 0, oneLsbPixels = 0, maxDifference = 0, magentaPixels = 0;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let i = 0; i < expected; i += 4) {
    const d = Math.max(Math.abs(input[i] - readback[i]), Math.abs(input[i + 1] - readback[i + 1]), Math.abs(input[i + 2] - readback[i + 2]));
    maxDifference = Math.max(maxDifference, d);
    if (d === 1) oneLsbPixels++;
    if (readback[i] > 220 && readback[i + 1] < 20 && readback[i + 2] > 220) magentaPixels++;
    if (d > 1) {
      changedPixels++;
      const x = i / 4 % width, y = Math.floor(i / 4 / width);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  return { changedPixels, oneLsbPixels, maxDifference, magentaPixels,
    bounds: changedPixels ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null };
}

export function evaluateP8RgbGate(input, raw, width = P8_BACKGROUND_WIDTH, height = P8_BACKGROUND_HEIGHT) {
  const result = compareP8Rgb(input, uprightP8Readback(raw, width, height), width, height);
  return { accepted: result.maxDifference === 0, result };
}

// A21 opt-in experiment only. Never alters the input bytes or the strict oracle.
export function evaluateP8IosDiagnostic({inputs,frame,run,token,currentRun,currentToken,choice,raw,enabled=false}) {
  const identityValid=Boolean(matchP8GateInput(inputs,frame,run,token,currentRun,currentToken,choice));
  if(!identityValid)return {accepted:false,identityValid:false,strictAccepted:false,diagnosticAccepted:false,reason:'IDENTITY_OR_INPUT_INVALID',result:null};
  try {
    const {accepted:strictAccepted,result}=evaluateP8RgbGate(inputs.get(frame).pixels,raw);
    const diagnosticAccepted=enabled&&result.maxDifference<=1&&result.changedPixels===0&&result.magentaPixels===0&&result.oneLsbPixels<=1843;
    return {accepted:enabled?diagnosticAccepted:strictAccepted,identityValid:true,strictAccepted,diagnosticAccepted,result,reason:enabled?(diagnosticAccepted?'DIAGNOSTIC_ALLOWED':'DIAGNOSTIC_REJECTED'):(strictAccepted?'STRICT0_PASS':'STRICT0_FAIL')};
  }catch(e){return {accepted:false,identityValid:true,strictAccepted:false,diagnosticAccepted:false,reason:String(e),result:null};}
}
