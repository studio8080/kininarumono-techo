import { createNotebook, KEY } from './notebook-store.mjs?v=1';

export function initNotebook(picks) {
  const cards=[...document.querySelectorAll('.card[data-name][data-brand]')];
  if (!cards.length) return;
  // Only identity is snapshotted. No price/specification/retailer URL is copied into the notebook.
  const catalog=picks.map(p=>({id:p.code || `${p.brand}:${p.name}`,brand:p.brand,name:p.name,cat:p.cat}));
  let storage; try { storage=window.localStorage; } catch { storage={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}}; }
  const store=createNotebook(storage);
  const css=document.createElement('link'); css.rel='stylesheet'; css.href='/css/notebook.css?v=1'; document.head.append(css);
  const section=document.createElement('section'); section.className='mono-notebook'; section.id='my-notebook'; section.setAttribute('aria-labelledby','notebook-title');
  section.innerHTML=`<h2 id="notebook-title" tabindex="-1">候補の手帖</h2>
    <p>気になった候補を保存して、買う前に考えたいことをメモできます。</p>
    <p class="notebook-note">このブラウザだけに保存します。端末間の同期はありません。ブラウザのデータ削除・保存制限で失われるため、必要なメモは書き出してください。メモはGA4へ送りません。個人情報は記入しないでください。</p>
    <p data-notebook-message role="status" aria-live="polite"></p>
    <div class="notebook-toolbar"><label>表示 <select data-notebook-filter><option value="all">すべて</option><option value="considering">検討中</option><option value="passed">見送り</option></select></label><button type="button" data-notebook-export>JSONを書出し</button><button type="button" data-notebook-clear>手帖をすべて削除</button></div>
    <p data-notebook-count></p><div data-notebook-items></div>`;
  const grid=document.getElementById('pickGrid') || cards[0].closest('.grid') || cards[0];
  grid.before(section);
  const jump=document.createElement('a'); jump.href='#my-notebook'; jump.className='notebook-jump'; jump.textContent='候補の手帖を開く'; section.before(jump);
  const message=section.querySelector('[data-notebook-message]');
  const controls=[];
  cards.forEach(card=>{
    const product=catalog.find(p=>p.brand===card.dataset.brand && p.name===card.dataset.name && p.cat===card.dataset.cat);
    if (!product) return;
    const button=document.createElement('button'); button.type='button'; button.className='notebook-save';
    button.setAttribute('aria-label',`${product.name}を候補の手帖に保存`);
    button.addEventListener('click',()=>{ const result=store.add(product); paint(); message.textContent=result.ok ? '候補を保存しました。上の「候補の手帖」でメモを書けます。' : result.message; });
    (card.querySelector('.card__foot') || card).append(button); controls.push({button,product});
  });
  const filter=section.querySelector('[data-notebook-filter]');
  function paint() {
    const {state,issue}=store.read(); message.textContent=issue;
    controls.forEach(({button,product})=>{ const saved=state.items.some(item=>item.id===product.id); button.textContent=saved?'保存済み':'候補に保存'; button.setAttribute('aria-pressed',String(saved)); });
    section.querySelector('[data-notebook-count]').textContent=`保存 ${state.items.length}品 / 上限100品。メモ・状態は「メモと状態を保存」で確定します。`;
    const list=section.querySelector('[data-notebook-items]'); list.replaceChildren();
    state.items.filter(item=>filter.value==='all' || item.status===filter.value).forEach((item,index)=>{
      const row=document.createElement('article'); row.className='notebook-entry';
      const heading=document.createElement('h3'); heading.textContent=`${item.brand} / ${item.name}`;
      const availability=document.createElement('p'); availability.textContent=catalog.some(p=>p.id===item.id)?'掲載中の候補':'掲載終了・現在の一覧にない候補（メモは残っています）';
      const label=document.createElement('label'); label.textContent='検討メモ（2000文字まで）'; label.htmlFor=`notebook-note-${index}`;
      const note=document.createElement('textarea'); note.id=label.htmlFor; note.maxLength=2000; note.rows=3; note.value=item.note; note.autocomplete='off';
      const statusLabel=document.createElement('label'); statusLabel.textContent='状態 ';
      const select=document.createElement('select');
      for (const [value,text] of [['considering','検討中'],['passed','見送り']]) { const option=document.createElement('option'); option.value=value; option.textContent=text; select.append(option); }
      select.value=item.status; statusLabel.append(select);
      const actions=document.createElement('div'); actions.className='notebook-toolbar';
      const save=document.createElement('button'); save.type='button'; save.textContent='メモと状態を保存';
      const resultMessage=document.createElement('p'); resultMessage.setAttribute('role','status');
      save.addEventListener('click',()=>{ const result=store.update(item.id,note.value,select.value); resultMessage.textContent=result.ok?'メモと状態を保存しました。':result.message; if(result.ok) section.querySelector('[data-notebook-count]').textContent=`保存 ${store.read().state.items.length}品 / 上限100品。表示の絞り込みは再選択すると更新します。`; });
      const remove=document.createElement('button'); remove.type='button'; remove.textContent='候補とメモを削除'; remove.setAttribute('aria-label',`${item.name}の候補とメモを削除`);
      remove.addEventListener('click',()=>{ if(!confirm('この候補とメモを削除しますか？'))return; const result=store.remove(item.id); paint(); message.textContent=result.ok?'候補とメモを削除しました。':result.message; document.getElementById('notebook-title').focus(); });
      actions.append(save,remove); row.append(heading,availability,label,note,statusLabel,actions,resultMessage); list.append(row);
    });
    if (!list.children.length) list.textContent=state.items.length?'この状態の候補はありません。':'まだ候補がありません。商品カードの「候補に保存」から追加できます。';
  }
  filter.addEventListener('change',paint);
  section.querySelector('[data-notebook-clear]').addEventListener('click',()=>{ if(!confirm('手帖の候補とメモをすべて削除しますか？'))return; const result=store.clear(); paint(); message.textContent=result.ok?'手帖を削除しました。':result.message; });
  section.querySelector('[data-notebook-export]').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([store.export()],{type:'application/json;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='kininarumono-notebook.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    message.textContent='書出しファイルを作成しました。メモを含むため、保管先にご注意ください。';
  });
  window.addEventListener('storage',event=>{if(event.key===KEY || event.key===null) { message.textContent='別のタブで手帖が更新されました。入力中のメモを確認してから再読込してください。'; }});
  paint();
}
