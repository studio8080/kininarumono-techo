import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createNotebook,KEY} from '../public/js/notebook-store.mjs';
const product={id:'fixture:1',brand:'fixture brand',name:'fixture product',cat:'goods'};
function fixture(raw,blocked=false){const data=new Map(raw===undefined?[]:[[KEY,raw]]);return {data,store:createNotebook({getItem:k=>{if(blocked)throw Error();return data.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error();data.set(k,v);},removeItem:k=>{if(blocked)throw Error();data.delete(k);}})};}
test('save is idempotent; note/status survive fresh store/reload; export includes notes',()=>{
  const {store,data}=fixture();assert.ok(store.add(product).ok);store.add(product);assert.equal(store.read().state.items.length,1);
  assert.ok(store.update(product.id,'fixture memo <img src=x onerror=alert(1)>','passed').ok);
  const next=fixture(data.get(KEY)).store;assert.equal(next.read().state.items[0].status,'passed');assert.match(next.read().state.items[0].note,/fixture memo/);assert.equal(JSON.parse(next.export()).items[0].note,next.read().state.items[0].note);
  assert.deepEqual(Object.keys(JSON.parse(next.export()).items[0]).sort(),['brand','cat','id','name','note','savedAt','status']);
});
test('removing a product from the catalog never deletes user memo',()=>{
  const {store}=fixture();store.add(product);store.update(product.id,'keep after delisting','considering');assert.equal(store.read().state.items[0].note,'keep after delisting');
});
test('delete one / clear; failures surfaced; other localStorage keys preserved',()=>{
  const {store,data}=fixture();data.set('kmn_utm','untouched');store.add(product);store.add({...product,id:'fixture:2'});store.remove(product.id);assert.equal(store.read().state.items.length,1);store.clear();assert.equal(store.read().state.items.length,0);assert.equal(data.get('kmn_utm'),'untouched');
  const denied=fixture(undefined,true).store;assert.equal(denied.add(product).ok,false);assert.equal(denied.clear().ok,false);assert.ok(denied.read().issue);
});
test('corrupt/unknown formats are preserved until explicit reset; new save then works',()=>{
  for(const raw of ['{','null','[]','{"v":9,"items":[]}']){const {store,data}=fixture(raw);assert.ok(store.read().issue);assert.equal(store.add(product).ok,false);assert.equal(data.get(KEY),raw);store.clear();assert.ok(store.add(product).ok);}
});
test('bad fields, duplicate IDs, prototype keys and oversized notes are filtered',()=>{
  const partial=JSON.stringify({v:1,items:[null,{...product,note:'x',status:'considering',savedAt:1},{...product,note:'duplicate',status:'passed',savedAt:1},{...product,id:'__proto__'}, {...product,id:'fixture:2',note:'x'.repeat(2001),status:'considering',savedAt:1}]});const {store,data}=fixture(partial);assert.equal(store.read().state.items.length,1);assert.ok(store.read().issue);assert.equal(store.remove(product.id).ok,false);assert.equal(data.get(KEY),partial);
});
test('max note and 100 candidates enforced without truncating existing memos',()=>{
  const {store}=fixture();for(let n=0;n<100;n++)assert.ok(store.add({...product,id:`fixture:${n}`}).ok);assert.equal(store.add({...product,id:'fixture:101'}).ok,false);assert.ok(store.update('fixture:0','x'.repeat(2000),'passed').ok);assert.equal(store.update('fixture:0','x'.repeat(2001),'passed').ok,false);assert.equal(store.read().state.items[99].note.length,2000);
});
