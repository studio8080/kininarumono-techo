export const KEY = 'kmn:notebook:v1';
const empty = () => ({ v: 1, items: [] });
const text = (s, max) => typeof s === 'string' && s.length > 0 && s.length <= max;
const validId = id => text(id, 240) && !['__proto__', 'constructor', 'prototype'].includes(id);
export function createNotebook(storage) {
  function read() {
    try {
      const raw = storage.getItem(KEY);
      if (!raw) return { state: empty(), issue: '' };
      const data = JSON.parse(raw);
      if (data?.v !== 1 || !Array.isArray(data.items)) return { state: empty(), issue: '保存形式を読めません。下の「手帖をすべて削除」で再開できます。' };
      const seen = new Set();
      const items = data.items.filter(item => {
        if (!item || !validId(item.id) || seen.has(item.id) || !text(item.brand, 200) || !text(item.name, 300) || !text(item.cat, 40) || typeof item.note !== 'string' || item.note.length > 2000 || !['considering', 'passed'].includes(item.status) || !Number.isSafeInteger(item.savedAt) || item.savedAt < 0) return false;
        seen.add(item.id); return true;
      }).slice(0, 100).map(({id,brand,name,cat,note,status,savedAt}) => ({id,brand,name,cat,note,status,savedAt}));
      return { state: { v: 1, items }, issue: data.items.length !== items.length ? '読めない項目を除いて表示しています。書出しで読めるメモを保存できます。' : '' };
    } catch { return { state: empty(), issue: '手帖を読めません。保存設定を確認するか、「手帖をすべて削除」で再開できます。' }; }
  }
  function write(state) {
    try { storage.setItem(KEY, JSON.stringify(state)); return { ok: true }; }
    catch { return { ok: false, message: '保存できませんでした。ブラウザの保存設定や空き容量を確認してください。' }; }
  }
  return {
    read,
    add(product) {
      if (!product || !validId(product.id) || !text(product.brand,200) || !text(product.name,300) || !text(product.cat,40)) return { ok:false, message:'商品情報を読めません。' };
      const {state, issue} = read();
      if (issue) return { ok:false, message:'保存データを確認してください。読めるメモを書き出してから手帖を削除すると再開できます。' };
      if (state.items.some(item => item.id === product.id)) return { ok:true };
      if (state.items.length >= 100) return { ok:false, message:'保存できる候補は100品までです。不要な候補を削除してください。' };
      state.items.unshift({id:product.id,brand:product.brand,name:product.name,cat:product.cat,note:'',status:'considering',savedAt:Date.now()});
      return write(state);
    },
    update(id, note, status) {
      if (typeof note !== 'string' || note.length > 2000 || !['considering','passed'].includes(status)) return {ok:false,message:'メモは2000文字以内で入力してください。'};
      const {state, issue} = read();
      if (issue) return {ok:false,message:'保存データの問題を確認してください。'};
      const item=state.items.find(item=>item.id===id);
      if (!item) return {ok:false,message:'この候補は削除されています。'};
      item.note=note; item.status=status; return write(state);
    },
    remove(id) { const {state,issue}=read(); if(issue)return {ok:false,message:'保存データの問題を確認してください。読めるメモを書き出し、手帖の全削除で再開できます。'}; return write({v:1,items:state.items.filter(item=>item.id!==id)}); },
    clear() { try { storage.removeItem(KEY); return {ok:true}; } catch { return {ok:false,message:'削除できませんでした。保存設定を確認してください。'}; } },
    export() { return JSON.stringify(read().state,null,2); },
  };
}
