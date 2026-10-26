#!/usr/bin/env node
// Export the WhaleHome listings for the Telegram bot: panama-crypto-homes/homes.json
// and a JPG cover per home in panama-crypto-homes/img/bot/ (Telegram needs JPG for photos by URL).
// HOMES in panama-crypto-homes/index.html stays the only source. Run from build_whalehome_lang.py.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = path.join(__dirname, '..', 'panama-crypto-homes');
const src = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const a = src.indexOf('const HOMES=['), b = src.indexOf('].sort(', a);
if (a < 0 || b < 0) throw new Error('HOMES block not found');
const T = (en, es, ru) => ({ en, es, ru });
const HOMES = new Function('T', 'return ' + src.slice(a + 'const HOMES='.length, b + 1))(T).sort((x, y) => x.p - y.p);
const out = HOMES.map(h => ({ k: h.k, t: h.t, a: h.a, s: h.s, p: h.p, from: !!h.from, d: h.d }));
fs.writeFileSync(path.join(dir, 'homes.json'), JSON.stringify(out));
fs.mkdirSync(path.join(dir, 'img', 'bot'), { recursive: true });
execFileSync('python3', ['-c', `
import sys
from PIL import Image
d=sys.argv[1]
for k in sys.argv[2:]:
    Image.open(f"{d}/img/homes/{k}-1.webp").convert("RGB").save(f"{d}/img/bot/{k}.jpg", quality=82)
`, dir, ...out.map(h => h.k)]);
console.log('homes.json:', out.length, 'homes');
