// backfill-codes.mjs — 既存PICKSでcode:未設定のエントリに現行itemCode(shop:id)を引き当てて付与する（一度きりの棚卸し用）
// 実行環境: GitHub Actions(Linux) / ローカルLinux。認証は環境変数 or tools/.rakuten.json（check-stock.mjsと同じ）。
// 使い方: node tools/backfill-codes.mjs        … main.js を書き換え、?vを+1（PR前提）／解決できない物はレポート。
// 仕組み: 各エントリの商品URL(item.rakuten.co.jp/<shop>/<urlcode>/)を求め、shopCode+keyword検索の結果から
//         itemUrlが /<shop>/<urlcode>/ に一致する商品のitemCodeを採用（誤マッチ防止）。a.r10.toはリダイレクト解決。
// ※ 必ずPRで内容確認すること（自動引き当てのため）。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadCfg() {
  const e = process.env;
  if (e.RAKUTEN_APP_ID && e.RAKUTEN_ACCESS_KEY && e.RAKUTEN_AFFILIATE_ID)
    return { applicationId: e.RAKUTEN_APP_ID, accessKey: e.RAKUTEN_ACCESS_KEY, affiliateId: e.RAKUTEN_AFFILIATE_ID };
  const p = path.join(__dirname, '.rakuten.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  console.error('[エラー] 認証情報がありません'); process.exit(1);
}
const cfg = loadCfg();
const H = { 'Referer': 'https://kininarumono.jp/', 'Origin': 'https://kininarumono.jp',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' };

const mainPath = path.join(repoRoot, 'public', 'js', 'main.js');
let src = fs.readFileSync(mainPath, 'utf8');
const start = src.indexOf('const PICKS = ['); const end = src.indexOf('];', start);
const blocks = (src.slice(start, end).match(/\{\s*cat:"[\s\S]*?\},/g) || []);

// 商品URL(shop, urlcode)を各エントリから求める
async function resolveShopUrlcode(block) {
  const urlM = block.match(/url:"([^"]*)"/); if (!urlM) return null;
  let url = urlM[1];
  // hb.afl の pc= に item.rakuten.co.jp/<shop>/<code>/ がある
  let dec = decodeURIComponent(url);
  let m = dec.match(/item\.rakuten\.co\.jp\/([^/]+)\/([^/?]+)\//);
  if (m) return { shop: m[1], urlcode: m[2] };
  // a.r10.to 短縮 → リダイレクト解決
  if (/a\.r10\.to/.test(url)) {
    try {
      const r = await fetch(url, { headers: H, redirect: 'follow' });
      let fin = decodeURIComponent(r.url || '');
      m = fin.match(/item\.rakuten\.co\.jp\/([^/]+)\/([^/?]+)\//) || fin.match(/pc=https?%3A%2F%2Fitem\.rakuten\.co\.jp%2F([^%]+)%2F([^%]+)%2F/);
      if (m) return { shop: m[1], urlcode: m[2] };
    } catch (e) { /* noop */ }
  }
  return null;
}

async function searchCode(shop, urlcode, name) {
  for (const kw of [urlcode, name]) {
    if (!kw) continue;
    const u = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?' + new URLSearchParams({
      applicationId: cfg.applicationId, accessKey: cfg.accessKey, affiliateId: cfg.affiliateId, format: 'json', hits: '10', shopCode: shop, keyword: kw });
    for (let a = 0; a < 4; a++) {
      const r = await fetch(u, { headers: H });
      if (r.status === 429) { await new Promise(x => setTimeout(x, 1500 * (a + 1))); continue; }
      const j = await r.json();
      const items = (j.Items || []).map(x => x.Item);
      // itemUrl が /<shop>/<urlcode>/ に一致するものを最優先。
      // ★ affiliateId を付けて呼ぶと itemUrl は hb.afl... のアフィリ経由URLになり、
      //   店舗/商品コードは ?pc= の中に %2F 区切りで入る。デコードしないと必ず外れる
      //   （これで91件中90件が「引当不可」になっていた）。
      const urlOf = (it) => { try { return decodeURIComponent(it.itemUrl || ''); } catch { return it.itemUrl || ''; } };
      const hit = items.find(it => urlOf(it).includes(`/${shop}/${urlcode}`)) ||
                  items.find(it => (it.itemCode || '').endsWith(`:${urlcode}`));
      if (hit) return hit.itemCode;
      break;
    }
    await new Promise(x => setTimeout(x, 1300));
  }
  return null;
}

const report = { resolved: [], unresolved: [] };
for (const b of blocks) {
  if (/code:"/.test(b)) continue; // 既にcodeあり
  const name = (b.match(/name:"([^"]*)"/) || [, ''])[1];
  const su = await resolveShopUrlcode(b);
  if (!su) { report.unresolved.push({ name, reason: '商品URL特定不可' }); continue; }
  const code = await searchCode(su.shop, su.urlcode, name);
  if (!code) { report.unresolved.push({ name, reason: `itemCode引当不可 (${su.shop}/${su.urlcode})` }); continue; }
  const nb = b.replace(/(name:"[^"]*",)/, `$1 code:"${code}",`);
  src = src.replace(b, nb);
  report.resolved.push({ name, code });
  await new Promise(x => setTimeout(x, 1300));
}

if (report.resolved.length) {
  src = src.replace(/([?&]v=)(\d+)/g, (m, a, n) => a + (parseInt(n, 10) + 1)); // 念のため
  fs.writeFileSync(mainPath, src);
  const bump = (p) => { if (!fs.existsSync(p)) return; let t = fs.readFileSync(p, 'utf8'); t = t.replace(/([?&]v=)(\d+)/g, (m, a, n) => a + (parseInt(n, 10) + 1)); fs.writeFileSync(p, t); };
  bump(path.join(repoRoot, 'public', 'index.html'));
  const rd = path.join(repoRoot, 'public', 'read');
  if (fs.existsSync(rd)) for (const f of fs.readdirSync(rd)) if (f.endsWith('.html')) bump(path.join(rd, f));
}
console.log(`=== バックフィル結果 ===`);
console.log(`付与: ${report.resolved.length} 件 / 未解決: ${report.unresolved.length} 件`);
report.resolved.forEach(r => console.log(`  + ${r.name} → ${r.code}`));
if (report.unresolved.length) { console.log('\n[未解決（手動確認）]'); report.unresolved.forEach(r => console.log(`  - ${r.name} : ${r.reason}`)); }
fs.writeFileSync(path.join(repoRoot, 'backfill-report.json'), JSON.stringify(report, null, 2));
console.log('\n[OK] main.js 更新 & backfill-report.json 出力（PRで確認してください）。');
