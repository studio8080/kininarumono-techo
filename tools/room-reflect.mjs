// room-reflect.mjs — 楽天itemcode 1件をサイトPICKSへ反映する（案A: ROOM投稿と同時に使う想定 / 承認方式=PR前提）
// 既存 tools/rakuten-pick.mjs の強化版。追加点:
//   (1) 重複チェック（同一itemCode/商品URLが既にPICKSにあればスキップ）
//   (2) 各エントリに code:"shop:id" を保存（将来の在庫チェックを全件確実に）
//   (3) availability(在庫)を取得して 0 のときは警告
//   (4) 健康/美容カテゴリは薬機法の注意を表示
// 実行環境: GitHub Actions(Linux)/ローカルLinux。Windowsローカルは fetch が落ちる事があるので tools/rakuten-pick.mjs(curl版) を使うか Actions で。
// 認証: 環境変数 RAKUTEN_APP_ID/RAKUTEN_ACCESS_KEY/RAKUTEN_AFFILIATE_ID or tools/.rakuten.json
//
// 使い方:
//   node tools/room-reflect.mjs --itemcode "shop:id" --cat interior --brand "..." --name "..." --blurb "..." --motif m-chair --insert
// --insert 無し＝生成物の確認のみ。--insert 付き＝main.js の PICKS 先頭に追加＋?vを+1。
// ※ 承認方式のため、実運用では main へ直接pushせず「ブランチ作成→コミット→PR作成」で使う（下部の PRステップ参照）。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const arg = (n, d = null) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const has = (n) => argv.includes('--' + n);

function loadCfg() {
  const e = process.env;
  if (e.RAKUTEN_APP_ID && e.RAKUTEN_ACCESS_KEY && e.RAKUTEN_AFFILIATE_ID)
    return { applicationId: e.RAKUTEN_APP_ID, accessKey: e.RAKUTEN_ACCESS_KEY, affiliateId: e.RAKUTEN_AFFILIATE_ID };
  const p = path.join(__dirname, '.rakuten.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  console.error('[エラー] 認証情報がありません'); process.exit(1);
}
const cfg = loadCfg();

const cat = arg('cat'); const itemCode = arg('itemcode');
const CATS = ['gadget', 'interior', 'goods', 'fashion'];
if (!CATS.includes(cat)) { console.error('[エラー] --cat は ' + CATS.join(' | ')); process.exit(1); }
if (!itemCode) { console.error('[エラー] --itemcode "shop:id" が必要'); process.exit(1); }

const HEALTH = ['ボディソープ','スクラブ','歯みがき','コスメ','美容','サプリ','医薬部外品','化粧'];

const mainPath = path.join(repoRoot, 'public', 'js', 'main.js');
let src = fs.readFileSync(mainPath, 'utf8');

// 重複チェック: 同一itemCode(code:) or 商品URL(item.rakuten.co.jp/shop/…)が既にあるか
const [shop, id] = itemCode.split(':');
if (src.includes(`code:"${itemCode}"`) || (shop && src.includes(`item.rakuten.co.jp%2F${shop}%2F`))) {
  console.log(`[スキップ] ${itemCode} は既にPICKSに存在するようです。`); process.exit(0);
}

async function fetchItem(code) {
  const params = new URLSearchParams({ applicationId: cfg.applicationId, accessKey: cfg.accessKey, affiliateId: cfg.affiliateId, format: 'json', hits: '1', itemCode: code });
  const url = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?' + params.toString();
  const r = await fetch(url, { headers: { 'Referer': 'https://kininarumono.jp/', 'Origin': 'https://kininarumono.jp', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' } });
  const j = await r.json();
  if (j.error) { console.error('[APIエラー]', j.error, j.error_description || ''); process.exit(1); }
  return j.Items && j.Items[0] && j.Items[0].Item;
}

const item = await fetchItem(itemCode);
if (!item) { console.error('[エラー] 商品が見つかりません（itemCode誤り or 販売終了）:', itemCode); process.exit(1); }
if (item.availability !== 1) console.warn(`[注意] この商品は在庫切れ(availability=${item.availability})です。反映を保留するか要確認。`);

// 販促バッジが濃い店舗は画像をサイト図案にフォールバック（img:null）
const BADGE_SHOPS = ['auc-youstyle', 'kobe-beauty-labo'];
let img = (item.mediumImageUrls && item.mediumImageUrls[0] && item.mediumImageUrls[0].imageUrl) || null;
if (img) img = img.replace(/\?_ex=\d+x\d+$/, '?_ex=500x500');
if (BADGE_SHOPS.includes(shop)) img = null;

const name = arg('name', item.itemName);
const blurb = arg('blurb', '');
if (HEALTH.some(w => (name + blurb).includes(w)))
  console.warn('[薬機法注意] 健康/美容カテゴリ。blurbで効果効能を断定しないこと（デザイン/使用シーン訴求に）。');

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const lit =
  '    { cat:"' + esc(cat) + '", date:"' + esc(arg('date', new Date().toISOString().slice(0,10).replace(/-/g,'.'))) +
  '", motif:"' + esc(arg('motif', 'm-chair')) + '", brand:"' + esc(arg('brand', item.shopName || '')) +
  '", name:"' + esc(name) + '", code:"' + esc(itemCode) + '", url:"' + item.affiliateUrl +
  '", img:' + (img ? '"' + img + '"' : 'null') + ',\n      blurb:"' + esc(blurb) + '" },';

console.log('\n=== 取得 ===');
console.log('  名称:', item.itemName);
console.log('  価格:', '¥' + Number(item.itemPrice).toLocaleString('ja-JP'));
console.log('  在庫:', item.availability === 1 ? 'あり' : '切れ');
console.log('  画像:', img || '(図案フォールバック)');
console.log('\n=== 生成エントリ ===\n' + lit);

if (has('insert')) {
  const anchor = 'const PICKS = [';
  const at = src.indexOf(anchor) + anchor.length;
  src = src.slice(0, at) + '\n' + lit + src.slice(at);
  fs.writeFileSync(mainPath, src);
  // ?v を +1（index.html + read/*.html）
  const bump = (p) => { if (!fs.existsSync(p)) return; let t = fs.readFileSync(p, 'utf8'); t = t.replace(/([?&]v=)(\d+)/g, (m, a, n) => a + (parseInt(n, 10) + 1)); fs.writeFileSync(p, t); };
  bump(path.join(repoRoot, 'public', 'index.html'));
  const readDir = path.join(repoRoot, 'public', 'read');
  if (fs.existsSync(readDir)) for (const f of fs.readdirSync(readDir)) if (f.endsWith('.html')) bump(path.join(readDir, f));
  console.log('\n[OK] PICKS先頭に追加＋?vを+1しました。');
  console.log('--- 承認方式(PR)での反映手順（例）---');
  console.log('  git switch -c ingest/' + itemCode.replace(/[^a-zA-Z0-9]/g, '-'));
  console.log('  git add -A && git commit -m "反映: ' + name + '"');
  console.log('  git push -u origin HEAD && gh pr create --fill   # PRを本人がレビュー→マージで本番反映');
} else {
  console.log('\n（--insert で main.js に追加します）');
}
