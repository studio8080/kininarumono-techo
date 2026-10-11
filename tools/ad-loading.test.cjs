const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname,'../public/js/main.js'),'utf8');
test('offscreen ads remain unloaded after fallback, while each visible creative keeps its own label', () => {
  const handlers = {}, timers = [], removed = [];
  function slot(top) {
    const body = {children: [], append(...items) {this.children.push(...items);}};
    return {dataset: {ad: 'generate+pinkoi', adPlacement: 'home-mid'}, top, body,
      querySelector: () => body, getBoundingClientRect() {return {top:this.top,bottom:this.top+250};}};
  }
  const visible = slot(200), distant = slot(5000);
  function element(tag) {return {tag,attrs:{},setAttribute(k,v){this.attrs[k]=v;},appendChild() {}};}
  const context = {window: {innerHeight: 800, matchMedia: () => ({matches:true}),
    addEventListener: (name,fn) => {handlers[name]=fn;}, removeEventListener: name => removed.push('window:'+name)},
    document: {createElement: element, querySelectorAll: () => [visible,distant],
      addEventListener: (name,fn) => {handlers['document:'+name]=fn;}, removeEventListener: name => removed.push('document:'+name)},
    setTimeout: fn => timers.push(fn), requestAnimationFrame: fn => fn()};
  const start=source.indexOf('  // ---- A8.net 広告枠 ----');
  const end=source.indexOf('  document.addEventListener("click"',start);
  vm.runInNewContext(source.slice(start,end),context);
  assert.equal(visible.dataset.filled,'1'); assert.equal(distant.dataset.filled,undefined);
  assert.deepEqual(visible.body.children.filter(el=>el.tag==='a').map(el=>el.attrs['data-revenue-id']),['generate','pinkoi']);
  timers.forEach(fn=>fn()); assert.equal(distant.dataset.filled,undefined);
  distant.top=400; handlers.scroll(); assert.equal(distant.dataset.filled,'1');
  assert.ok(removed.includes('document:scroll'));
  handlers.scroll(); assert.equal(distant.body.children.length,4);
});
