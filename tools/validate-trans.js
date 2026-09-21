// Usage: node validate-trans.js <chunk.json> <trans.json>
const fs = require('fs');

const [chunkPath, transPath] = process.argv.slice(2);
const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
const trans = JSON.parse(fs.readFileSync(transPath, 'utf8'));

let errors = 0;
const fail = (m) => { errors++; console.log('ERROR ' + m); };

if (trans.chapter !== chunk.chapter) fail(`chapter mismatch: ${trans.chapter}`);
if (trans.chunk !== chunk.chunk) fail(`chunk mismatch: ${trans.chunk}`);
if (!Array.isArray(trans.items)) fail('items is not an array');
if (trans.items.length !== chunk.items.length) {
  fail(`item count ${trans.items.length} != ${chunk.items.length}`);
}

const en = new Map(chunk.items.map((it) => [it.i, it.en]));

for (const it of trans.items) {
  if (!en.has(it.i)) { fail(`unexpected i=${it.i}`); continue; }
  if (typeof it.zh !== 'string' || !it.zh.trim()) fail(`i=${it.i} missing zh`);
  if (!Array.isArray(it.notes) || it.notes.length < 1 || it.notes.length > 3) {
    fail(`i=${it.i} notes count ${it.notes && it.notes.length}`);
  }
  if (!Array.isArray(it.vocab) || it.vocab.length < 2 || it.vocab.length > 5) {
    fail(`i=${it.i} vocab count ${it.vocab && it.vocab.length}`);
  }
  for (const v of it.vocab || []) {
    for (const k of ['w', 'p', 't', 'z']) {
      if (typeof v[k] !== 'string') fail(`i=${it.i} vocab missing ${k}: ${JSON.stringify(v)}`);
    }
    if (typeof v.w === 'string' && !en.get(it.i).includes(v.w)) {
      fail(`i=${it.i} vocab not literal in EN: ${JSON.stringify(v.w)}`);
    }
  }
}

for (const it of chunk.items) {
  if (!trans.items.some((t) => t.i === it.i)) fail(`missing i=${it.i}`);
}

console.log(errors === 0 ? `OK items=${trans.items.length}` : `FAILED errors=${errors}`);
process.exit(errors === 0 ? 0 : 1);
