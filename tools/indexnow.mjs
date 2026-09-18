#!/usr/bin/env node
// indexnow.mjs — デプロイで変わったページを IndexNow に通知する（Bing / Yandex / Naver など）。
//
//   node tools/indexnow.mjs            … 直前のコミットで変わったページだけ通知
//   node tools/indexnow.mjs --all      … sitemap.xml の全URLを通知（初回や大きな改修のあと）
//   node tools/indexnow.mjs --dry      … 送らずに対象URLだけ表示
//
// なぜ要るのか:
//   Googleには Search Console があるが、Bing側には何の通知も行っていなかった。
//   ChatGPT検索や Copilot は Bing のインデックスを引くので、Bingに載っていないページは
//   AIの回答にも出てこない。IndexNow はアカウント登録不要で、鍵ファイルを置いて
//   URLをPOSTするだけで届く。
//
// 鍵について:
//   public/<KEY>.txt は公開される前提のもので秘密ではない（所有確認用。中身も鍵と同じ文字列）。
//   消すと通知が 403 になる。
//
// デプロイを止めないこと:
//   通知の失敗はサイトの公開とは無関係なので、どんな失敗でも exit 0 で抜ける。

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { repoRoot, ORIGIN } from './lib/site.mjs';

const KEY = 'd2a2bd4f281ed57440b1fdda791a10d5';
const HOST = new URL(ORIGIN).host;
const ALL = process.argv.includes('--all');
const DRY = process.argv.includes('--dry');

if (!fs.existsSync(path.join(repoRoot, 'public', `${KEY}.txt`))) {
  console.log(`[IndexNow] 鍵ファイル public/${KEY}.txt が無いので送らない`);
  process.exit(0);
}

const sitemap = fs.readFileSync(path.join(repoRoot, 'public/sitemap.xml'), 'utf8');
const inSitemap = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

/** public/ 配下のファイルパス → 公開URL（cleanUrls に合わせる）。ページでなければ null */
function toUrl(file) {
  const m = file.match(/^public\/(.+)\.html$/);
  if (!m) return null;
  const p = m[1];
  if (p === 'index') return `${ORIGIN}/`;
  if (p === '404') return null;
  return `${ORIGIN}/${p.replace(/\/index$/, '')}`;
}

let urls;
if (ALL) {
  urls = [...inSitemap];
} else {
  let changed = [];
  try {
    changed = execSync('git diff --name-only HEAD~1 HEAD -- public', { cwd: repoRoot, encoding: 'utf8' })
      .split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    console.log('[IndexNow] 直前のコミットと比較できない（fetch-depth が足りない？）。送らない');
    process.exit(0);
  }
  // main.js / style.css だけが変わった場合、HTMLは ?v= の更新で必ず一緒に変わるので拾える
  urls = [...new Set(changed.map(toUrl).filter(Boolean))]
    // sitemap に無いURL（noindex や下書き）は通知しない
    .filter((u) => inSitemap.has(u));
}

if (!urls.length) { console.log('[IndexNow] 通知するページはありません'); process.exit(0); }
console.log(`[IndexNow] ${urls.length}件${DRY ? '（--dry: 送信しない）' : ''}`);
urls.forEach((u) => console.log('  ' + u));
if (DRY) process.exit(0);

try {
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList: urls })
  });
  // 200=受理 / 202=受理（鍵の確認は後で） / 403=鍵が見つからない / 422=URLがホストと不一致 / 429=送りすぎ
  console.log(`[IndexNow] HTTP ${r.status}${r.status === 200 || r.status === 202 ? '（受理）' : '（未受理。サイトの公開には影響しない）'}`);
} catch (e) {
  console.log(`[IndexNow] 送信に失敗: ${e.message}（サイトの公開には影響しない）`);
}
process.exit(0);
