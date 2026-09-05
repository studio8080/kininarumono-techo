import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const arg = (name, def = null) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : def; };
const has = (name) => argv.includes('--' + name);
const cfgPath = path.join(__dirname, '.rakuten.json');
if (!fs.existsSync(cfgPath)) { console.error('tools/.rakuten.json がありません'); process.exit(1); }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
if (!cfg.applicationId || !cfg.accessKey || !cfg.affiliateId) { console.error('.rakuten.json を埋めてください'); process.exit(1); }
const cat = arg('cat'); const keyword = arg('keyword'); const itemCode = arg('itemcode');
const CATS = ['gadget', 'interior', 'goods', 'fashion'];
if (!CATS.includes(cat)) { console.error('--cat は ' + CATS.join(' | ')); process.exit(1); }
if (!keyword && !itemCode) { console.error('--keyword か --itemcode が必要'); process.exit(1); }
const params = new URLSearchParams({ applicationId: cfg.applicationId, accessKey: cfg.accessKey, affiliateId: cfg.affiliateId, format: 'json', hits: '3' });
if (itemCode) params.set('itemCode', itemCode);
if (keyword) params.set('keyword', keyword);
const endpoint = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?' + params.toString();
let out;
try { out = execFileSync('curl.exe', ['-sS','-H','Referer: https://kininarumono.jp/','-H','Origin: https://kininarumono.jp','-H','User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36', endpoint], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }); }
catch (e) { console.error('[curl実行エラー]', e.message); process.exit(1); }
let data;
try { data = JSON.parse(out); } catch (e) { console.error('[JSON解析エラー] 応答:', out.slice(0, 800)); process.exit(1); }
if (data.errors) { console.error('[APIエラー]', JSON.stringify(data.errors)); process.exit(1); }
const item = data.Items && data.Items[0] && data.Items[0].Item;
if (!item) { console.error('商品が見つかりません'); console.error(JSON.stringify(data).slice(0, 500)); process.exit(1); }
const imgs = (item.mediumImageUrls || []).map(o => o.imageUrl.replace(/\?_ex=\d+x\d+$/, '?_ex=500x500'));
console.log('\n=== 取得 ==='); console.log(' 名称:', item.itemName); console.log(' 価格: ¥' + Number(item.itemPrice).toLocaleString('ja-JP')); console.log(' 料率:', (item.affiliateRate != null ? item.affiliateRate + '%' : '-'));
console.log(' 画像候補:'); imgs.forEach((u, i) => console.log('   [' + i + '] ' + u));
const idx = parseInt(arg('imgidx', '0'), 10) || 0;
const img = arg('img', null) || imgs[idx] || imgs[0] || null;
console.log(' 採用画像:', img || '(なし)', arg('img', null) ? '(--img指定)' : ('[' + idx + ']'));
if (has('preview')) { console.log('\n（--preview のみ：追加していません）'); process.exit(0); }
const entry = { cat, date: arg('date', '2026.08.08'), motif: arg('motif', 'm-chair'), brand: arg('brand', item.shopName || ''), name: arg('name', item.itemName), price: '¥' + Number(item.itemPrice).toLocaleString('ja-JP'), url: item.affiliateUrl, img, blurb: arg('blurb', '') };
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
const lit = '    { cat:"' + esc(entry.cat) + '", date:"' + esc(entry.date) + '", motif:"' + esc(entry.motif) + '", brand:"' + esc(entry.brand) + '", name:"' + esc(entry.name) + '", price:"' + esc(entry.price) + '", url:"' + entry.url + '", img:' + (entry.img ? '"' + entry.img + '"' : 'null') + ',\n      blurb:"' + esc(entry.blurb) + '" },';
console.log('\n=== 生成PICKS ==='); console.log(lit);
if (has('insert')) {
  const mainPath = path.join(repoRoot, 'public', 'js', 'main.js');
  let src = fs.readFileSync(mainPath, 'utf8');
  const anchor = 'const PICKS = [';
  const i2 = src.indexOf(anchor);
  if (i2 < 0) { console.error('main.js に const PICKS = [ が無い'); process.exit(1); }
  const at = i2 + anchor.length;
  src = src.slice(0, at) + '\n' + lit + src.slice(at);
  fs.writeFileSync(mainPath, src);
  console.log('\n[OK] main.js に追加しました。');
  const readDir = path.join(repoRoot, 'public', 'read');
  const htmlFiles = [path.join(repoRoot, 'public', 'index.html')];
  if (fs.existsSync(readDir)) for (const f of fs.readdirSync(readDir)) if (f.endsWith('.html')) htmlFiles.push(path.join(readDir, f));
  const vm = fs.readFileSync(htmlFiles[0], 'utf8').match(/\?v=(\d+)/);
  if (vm) { const cur = parseInt(vm[1], 10), next = cur + 1; for (const f of htmlFiles) { const t = fs.readFileSync(f, 'utf8').split('?v=' + cur).join('?v=' + next); fs.writeFileSync(f, t); } console.log('[OK] ?v= を ' + cur + ' → ' + next + ' に更新。'); }
  console.log('  → git add -A && git commit -m "商品追加" && git push');
} else { console.log('\n（--insert で追加＋?v自動バンプ）'); }