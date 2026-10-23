const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const publisherId = 'ca-pub-5958158070981810';
const adsenseHost = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

test('homepage contains one complete AdSense loader for the expected publisher', () => {
  const html = read('public/index.html');
  assert.equal((html.match(new RegExp(adsenseHost.replaceAll('.', '\\.'), 'g')) || []).length, 1);
  assert.match(html, new RegExp(`client=${publisherId}`));
  assert.match(html, /crossorigin="anonymous"/);
});

test('policy and utility pages do not load scripts that require consent', () => {
  for (const file of ['public/privacy.html', 'public/about.html', 'public/404.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /pagead2\.googlesyndication\.com|googlefc|adsbygoogle/);
  }
});

test('privacy disclosure describes AdSense data use and regional choices without assuming dashboard button configuration', () => {
  const html = read('public/privacy.html');
  assert.match(html, /制定・改定 2026-10-23/);
  assert.match(html, /Google AdSense/);
  assert.match(html, /Cookie等の識別子/);
  assert.match(html, /広告に関する選択/);
  assert.doesNotMatch(html, /同意しない・同意する・設定を管理する/);
  assert.match(html, /policies\.google\.com\/technologies\/partner-sites/);
  assert.match(html, /policies\.google\.com\/privacy/);
});
