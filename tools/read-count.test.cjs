const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const index = read('public/index.html');
const countOf = (html) => Number(html.match(/<dt data-stat-reads>(\d+)<\/dt>/)?.[1]);
const cardCount = (html) => (html.match(/<article class="read-card\b/g) || []).length;

function fixture(t, html) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kmn-read-count-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  for (const subdir of ['tools/lib', 'public/read']) {
    fs.mkdirSync(path.join(dir, subdir), {recursive: true});
  }
  for (const file of ['tools/build-read-hub.mjs', 'tools/lib/site.mjs']) {
    fs.copyFileSync(path.join(root, file), path.join(dir, file));
  }
  const home = path.join(dir, 'public/index.html');
  const hub = path.join(dir, 'public/read/index.html');
  fs.writeFileSync(home, html);
  return {
    home, hub,
    run: () => spawnSync(process.execPath, [path.join(dir, 'tools/build-read-hub.mjs')], {
      cwd: dir, encoding: 'utf8'
    })
  };
}

test('initial homepage count agrees with source cards, read hub and RSS', () => {
  const expected = cardCount(index);
  assert.ok(expected > 0);
  assert.equal(countOf(index), expected);
  const hub = read('public/read/index.html');
  assert.equal(cardCount(hub), expected);
  const graphs = [...hub.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((match) => { const data = JSON.parse(match[1]); return data['@graph'] || [data]; });
  const itemList = graphs.find((entry) => entry['@type'] === 'ItemList');
  assert.equal(itemList.numberOfItems, expected);
  assert.equal(itemList.itemListElement.length, expected);
  assert.equal((read('public/feed.xml').match(/<item>/g) || []).length, expected);
});

test('generator corrects a stale count and remains idempotent', (t) => {
  const stale = index.replace(/(<dt data-stat-reads>)\d+/, '$10');
  const f = fixture(t, stale);
  let result = f.run();
  assert.equal(result.status, 0, result.stderr);
  const corrected = fs.readFileSync(f.home, 'utf8');
  const firstHub = fs.readFileSync(f.hub, 'utf8');
  assert.equal(countOf(corrected), cardCount(index));
  assert.equal(corrected, index);
  result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(f.home, 'utf8'), corrected);
  assert.equal(fs.readFileSync(f.hub, 'utf8'), firstHub);
});

test('additions and removals follow the read list, ignoring unrelated headings', (t) => {
  const extra = '<article class="read-card read-card--essay"><h3><a href="/read/count-test">件数検証用</a></h3></article>';
  const unrelated = '<h3><a href="/read/not-in-list">一覧外のリンク</a></h3>';
  const html = index.replace('<div class="read-list">', unrelated + '<div class="read-list">' + extra);
  const f = fixture(t, html);
  let result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(countOf(fs.readFileSync(f.home, 'utf8')), cardCount(index) + 1);
  assert.equal(cardCount(fs.readFileSync(f.hub, 'utf8')), cardCount(index) + 1);
  fs.writeFileSync(f.home, fs.readFileSync(f.home, 'utf8').replace(extra, ''));
  result = f.run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(countOf(fs.readFileSync(f.home, 'utf8')), cardCount(index));
});

test('missing or duplicate count targets fail before writing either page', (t) => {
  const cases = [
    index.replace('data-stat-reads', 'data-unused'),
    index.replace('<dt data-stat-reads>', '<dt data-stat-reads>0</dt><dt data-stat-reads>')
  ];
  for (const html of cases) {
    const f = fixture(t, html);
    const result = f.run();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /data-stat-reads は1か所必要/);
    assert.equal(fs.readFileSync(f.home, 'utf8'), html);
    assert.equal(fs.existsSync(f.hub), false);
  }
});
