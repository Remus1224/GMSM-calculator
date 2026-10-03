const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const sharedCss = [
  'site-theme', 'glass', 'site-components', 'calculator-components',
  'hexa-decisions', 'hexa-progress', 'home', 'hyper-stat', 'ignore',
  'liberation', 'notice', 'rune', 'simulator-settings', 'standalone-tools', 'tool-shell',
];
const sharedJs = [
  'genesis-layout', 'glass', 'hexa-progress', 'simulator-settings',
  'site-pilot', 'standalone-tools', 'tool-shell',
];

for (const file of [
  ...sharedCss.map(name => `assets/css/${name}.css`),
  ...sharedJs.map(name => `assets/js/${name}.js`),
]) {
  assert.ok(fs.statSync(path.join(root, file)).isFile(), `Missing shared module: ${file}`);
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
}

for (const entry of ['index.html', '1204/index.html', 'light-sanctum-pray/index.html']) {
  const html = fs.readFileSync(path.join(root, entry), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const sharedReferences = new Set();
  for (const [tag] of html.matchAll(/<(?:script|link|iframe)\b[^>]*>/gi)) {
    const reference = attribute(tag, 'src') ?? attribute(tag, 'href');
    if (!reference || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) continue;
    const pathname = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    assert.ok(!pathname.split('/').includes('beta'), `${entry} references Beta: ${reference}`);
    const resolved = path.resolve(path.dirname(path.join(root, entry)), pathname);
    const relative = path.relative(root, resolved).split(path.sep).join('/');
    assert.ok(!relative.startsWith('../') && !path.isAbsolute(relative), `Reference outside repository: ${reference}`);
    assert.ok(fs.statSync(resolved).isFile(), `${entry} references missing file: ${reference}`);
    sharedReferences.add(relative);
  }
  for (const file of [
    'assets/css/site-theme.css', 'assets/css/glass.css', 'assets/css/site-components.css',
    'assets/css/calculator-components.css', 'assets/css/tool-shell.css',
    'assets/js/glass.js', 'assets/js/tool-shell.js',
  ]) {
    assert.ok(sharedReferences.has(file), `${entry} is missing shared reference: ${file}`);
  }
  if (entry === 'light-sanctum-pray/index.html') {
    const iframe = [...html.matchAll(/<iframe\b[^>]*>/gi)]
      .map(match => match[0]).find(tag => attribute(tag, 'id') === 'simulator-frame');
    // The approved UI synchronization preserves the formal runtime; update this
    // contract explicitly when a future runtime release is approved.
    assert.equal(attribute(iframe ?? '', 'src'), 'runtime/index.html?v=20260926-preset-r1',
      'Formal prayer runtime reference changed');
  }
  console.log(`PASS ${entry}: shared modules and formal references`);
}
