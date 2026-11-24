const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'public/js/original-goods.js'), 'utf8');

function fixture(options = {}) {
  const calls = [], listeners = [];
  const context = {
    window: { gtag: (...args) => { if (options.throwGtag) throw Error('blocked'); calls.push(args); } },
    navigator: { doNotTrack: options.dnt, globalPrivacyControl: options.gpc },
    location: { hostname: options.host || 'kininarumono.jp', pathname: '/original-goods', href: 'https://kininarumono.jp/original-goods?private=secret#fragment' },
    localStorage: { getItem() { if (options.throwStorage) throw Error('blocked'); return options.optOut; } },
    document: { addEventListener: (_, fn) => listeners.push(fn), querySelectorAll: () => [], querySelector: () => null },
    URL,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  function click(overrides = {}) {
    const attributes = { 'data-rb-design': 'pho', 'data-rb-product': 'tshirt', 'data-rb-name': 'フォー', ...overrides };
    const link = { href: options.href || 'https://www.redbubble.com/i/t-shirt/Pho/185951640/z5wf', hasAttribute: key => key in attributes, getAttribute: key => attributes[key] ?? null };
    const event = { defaultPrevented: false, target: { closest: () => link } };
    for (const fn of listeners) fn(event);
    assert.equal(event.defaultPrevented, false);
  }
  return { calls, click, context, listeners };
}

test('own-product clicks contain public product fields and a query-free page URL', () => {
  const f = fixture(); f.click();
  assert.equal(f.calls.length, 1);
  const [type, name, params] = f.calls[0];
  assert.equal(type, 'event'); assert.equal(name, 'redbubble_click');
  assert.equal(params.page_location, 'https://kininarumono.jp/original-goods');
  assert.equal(params.page_referrer, ''); assert.equal(params.item_category, 'original_tshirt');
  assert.ok(!JSON.stringify(params).includes('secret'));
  assert.ok(!('link_url' in params));
});

test('DNT, GPC, opt-out and unavailable storage prevent measurement', () => {
  for (const options of [{ dnt: '1' }, { gpc: true }, { optOut: '1' }, { throwStorage: true }]) {
    const f = fixture(options); f.click(); assert.equal(f.calls.length, 0);
  }
});

test('local previews and invalid destinations never send events', () => {
  for (const options of [{ host: '127.0.0.1' }, { href: 'https://www.redbubble.com.evil.example/i/t-shirt/foo' }, { href: 'https://www.redbubble.com/account' }]) {
    const f = fixture(options); f.click(); assert.equal(f.calls.length, 0);
  }
});

test('measurement failures leave navigation available and repeated scripts do not double count', () => {
  const broken = fixture({ throwGtag: true }); assert.doesNotThrow(() => broken.click());
  const f = fixture(); vm.runInContext(source, f.context); f.click();
  assert.equal(f.listeners.length, 1); assert.equal(f.calls.length, 1);
});

test('home entry is distinguishable from a product destination', () => {
  const f = fixture(); f.click({ 'data-goods-open': '' });
  assert.equal(f.calls[0][1], 'original_goods_open');
  assert.equal(f.calls[0][2].placement, 'home');
});

test('every catalog work has two real destinations and a readable image', () => {
  const { products } = JSON.parse(fs.readFileSync(path.join(root, 'data/original-goods.json')));
  const page = fs.readFileSync(path.join(root, 'public/original-goods.html'), 'utf8');
  assert.equal(products.length, 8); assert.equal(new Set(products.map(p => p.id)).size, 8);
  assert.equal((page.match(/data-rb-product=/g) || []).length, 16);
  for (const p of products) {
    assert.ok(fs.existsSync(path.join(root, 'public', p.image)));
    for (const kind of ['tshirt', 'sticker']) {
      const u = new URL(p.links[kind]);
      assert.equal(u.hostname, 'www.redbubble.com'); assert.equal(u.protocol, 'https:');
      assert.ok(u.pathname.includes('/' + p.workId + '/'));
    }
    assert.ok(page.includes('id="' + p.id + '"'));
  }
  assert.ok(page.indexOf('自社制作・販売商品') < page.indexOf('data-rb-product='));
  assert.ok(!page.includes('"price"'));
});
