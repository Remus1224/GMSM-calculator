const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const dir = path.join(root, 'Crystal-Treasure-Box');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const card = home.match(/<button\b[^>]*id="crystal-treasure-box-entry"[\s\S]*?<\/button>/)?.[0];
assert(card, 'Missing home entry');
assert(!/\sdisabled(?:\s|>)/.test(card) && !card.includes('aria-disabled="true"'));
assert(card.includes('Crystal-Treasure-Box/') && card.includes('markMenuToolBadgeAsRead'));
assert(card.includes('menu-badge-Crystal-Treasure-Box') && card.includes('app-status-badge-new'));
assert(home.indexOf('menu-badge-light-sanctum-pray') < home.indexOf(card));
assert(fs.existsSync(path.join(root, 'assets/menu/icon_Crystal-Treasure-Box.png')));
for (const file of ['index.html', 'runtime/index.html']) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  assert(html.includes('noindex,nofollow'));
  for (const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"[^>]*>/g)) {
    if (/^(?:[a-z]+:|\/\/)/i.test(m[1])) continue;
    assert(fs.existsSync(path.resolve(path.dirname(path.join(dir,file)),m[1])), `${file}: missing ${m[1]}`);
  }
}
assert(!fs.existsSync(path.join(root, 'crystalchest')), 'Obsolete duplicate route retained');
console.log('PASS Crystal Treasure Box canonical route, local links and active NEW entry');
