// build-ads.mjs — 手書きの読みもの記事（public/read/*.html）に A8 の広告枠を差し込む。
//
// なぜ専用ツールが要るのか:
//   カテゴリページ・まとめ記事・読みもの一覧はジェネレータ（build-category / build-roundup /
//   build-read-hub）が lib/site.mjs の adSlot() を呼んで枠を出している。一方この8本は手書きの
//   HTMLで、ジェネレータを通らない。手で貼ると貼り忘れ・書式ゆれが出るので、ここで一括管理する。
//
// 何を書き換えるか:
//   <!-- AD:A8 START --> 〜 <!-- AD:A8 END --> のブロックだけ。無ければ </main> の直前に作る。
//   すでにあれば中身を差し替える。何度実行しても結果は同じ（冪等）。
//
// 広告素材そのもの（a8mat / aid / mid）はここには無い。public/js/main.js の AD_TAGS が唯一の
// 置き場で、ここは「どのキーを出すか」を data-ad で指すだけ。素材を差し替えるときに
// 全ページを触らずに済むようにしてある。
//
//   node tools/build-ads.mjs

import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, adSlot } from './lib/site.mjs';

// ---- 記事ごとの割り当て ----
// spec は "PC用|モバイル用"。820px未満では右側が使われ、右側を省くと左側が両方に使われる。
// 家具350は728x90しか発行していないので、家具・インテリア寄りの記事はモバイルで
// LIFE POCKET（財布・革小物）に落としている。A8で家具350の300x250を発行したら、
// main.js の AD_TAGS に kagu350_rect を足して、ここを "kagu350|kagu350_rect" に変える。
const AD_BY_ARTICLE = {
  'kagu-brand-no-erabikata':    'kagu350|lifepocket',   // 家具ブランドの選び方
  'hitorigurashi-no-heyazukuri':'kagu350|lifepocket',   // 一人暮らしの部屋づくり
  'hokuo-design-teiban':        null,                   // build-roundup が生成するので対象外
  'burando-lineup-no-kijun':    'lifepocket',           // ブランドのラインナップの見方
  'ii-mono-no-kijun':           'lifepocket',           // いいモノの基準
  'gift-no-erabikata':          'lifepocket',           // ギフトの選び方
  'zakka-no-mikata':            'lifepocket',           // 雑貨の見方
  'zakka-no-asobigokoro':       'lifepocket',           // 雑貨の遊び心
  'trend-komono-rule':          'evering',              // トレンド小物（ガジェット寄り）
};

const START = '<!-- AD:A8 START -->';
const END = '<!-- AD:A8 END -->';

const readDir = path.join(repoRoot, 'public/read');
let written = 0;
let skipped = 0;

for (const [slug, spec] of Object.entries(AD_BY_ARTICLE)) {
  if (!spec) continue;
  const file = path.join(readDir, `${slug}.html`);
  if (!fs.existsSync(file)) {
    console.warn(`! 見つからない: read/${slug}.html`);
    continue;
  }

  const before = fs.readFileSync(file, 'utf8');
  // 元ファイルの改行に合わせる（手書き記事はCRLF、生成物はLF）
  const eol = (before.match(/\r\n/g) || []).length > (before.match(/\n/g) || []).length / 2 ? '\r\n' : '\n';
  const fix = (s) => s.replace(/\r?\n/g, eol);

  const block = fix(`${START}\n${adSlot(spec, `article-${slug}`)}\n${END}`);

  let after;
  const startAt = before.indexOf(START);
  if (startAt >= 0) {
    const endAt = before.indexOf(END, startAt);
    if (endAt < 0) throw new Error(`${slug}: ${START} はあるのに ${END} が無い`);
    after = before.slice(0, startAt) + block + before.slice(endAt + END.length);
  } else {
    const anchor = fix('</section>\n</main>');
    const at = before.indexOf(anchor);
    if (at < 0) throw new Error(`${slug}: </section></main> が見つからない。記事の構造が変わった？`);
    if (before.indexOf(anchor, at + 1) >= 0) throw new Error(`${slug}: </section></main> が複数ある`);
    after = before.slice(0, at) + fix('</section>\n') + block + fix('\n</main>') + before.slice(at + anchor.length);
  }

  if (after === before) { skipped++; console.log(`= /read/${slug}`); continue; }
  fs.writeFileSync(file, after);
  written++;
  console.log(`+ /read/${slug}  ${spec}`);
}

console.log(`\n手書き記事の広告枠: 更新 ${written}件 / 変更なし ${skipped}件`);
console.log('カテゴリ・まとめ記事・読みもの一覧は各ジェネレータ側で入るので、そちらも再生成すること。');
