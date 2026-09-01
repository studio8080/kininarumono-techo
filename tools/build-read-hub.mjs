#!/usr/bin/env node
// build-read-hub.mjs — /read（読みもの一覧）を public/read/index.html に生成する。
//
//   node tools/build-read-hub.mjs
//
// ★ index.html の読みものカードを増減したら再生成すること（CIが差分で落とす）
//
// なぜ生成するのか:
//   記事カードのHTMLは index.html の .read-list をそのまま抜いて使う。
//   一覧を2か所に書くと、記事を足したときに片方だけ古くなるため。
//   トップに足す → ここを再生成、の順で運用する。
//
// 注意: 改行は LF のまま書く（他のジェネレータと同じ）。
//   CRLF で書くと、Windows の autocrlf でコミットされた LF の blob と
//   Linux の CI 上で全行差分になり、生成物チェックが必ず落ちる（2026-09-01に踏んだ）。

import fs from 'node:fs';
import path from 'node:path';
import {
  repoRoot, ORIGIN, cacheVersion, head, header, footer, writeIfChanged
} from './lib/site.mjs';

const url = `${ORIGIN}/read`;
const TITLE = '読みもの — 買う前に整理するメモ｜気になるモノ手帖';
const DESC =
  'モノを選ぶときの基準をまとめた編集メモと、テーマ別に商品を紹介するまとめ記事の一覧。' +
  '雑貨・インテリア・ガジェット・ギフト・一人暮らしの部屋づくりまで、買う前に一度立ち止まって考えたいことを書いています。';

const indexHtml = fs.readFileSync(path.join(repoRoot, 'public/index.html'), 'utf8');

// ---- index.html の .read-list を抜く（最後の </article> までを取り、div を閉じ直す） ----
const start = indexHtml.indexOf('<div class="read-list">');
if (start < 0) throw new Error('index.html に .read-list が無い');
const secEnd = indexHtml.indexOf('</section>', start);
const lastArticle = indexHtml.lastIndexOf('</article>', secEnd);
if (lastArticle < 0) throw new Error('.read-list に記事カードが無い');

let list = indexHtml.slice(start, lastArticle + '</article>'.length) + '\n</div>';
list = list
  .replace(/\r\n/g, '\n')
  // reveal はトップのスクロール演出用。一覧ページでは付けない
  .replace(/ class="read-card ([^"]*?)\s*reveal"/g, ' class="read-card $1"')
  // index 側は2段インデント。ここでは素で置く
  .replace(/^ {2}/gm, '');

const items = [...indexHtml.matchAll(/<h3><a href="(\/read\/[^"]+)">([^<]+)<\/a><\/h3>/g)]
  .map((m, i) => ({ position: i + 1, name: m[2], url: ORIGIN + m[1] }));
if (!items.length) throw new Error('index.html に読みもののリンクが無い');

const vparam = cacheVersion();

const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      url,
      name: TITLE,
      description: DESC,
      inLanguage: 'ja-JP',
      isPartOf: { '@id': `${ORIGIN}/#website` }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '気になるモノ手帖', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: '読みもの', item: url }
      ]
    },
    {
      '@type': 'ItemList',
      '@id': `${url}#itemlist`,
      name: '読みもの一覧',
      numberOfItems: items.length,
      itemListElement: items.map((it) => ({ '@type': 'ListItem', ...it }))
    }
  ]
};

const html = `<!DOCTYPE html>
<html lang="ja">
${head({ title: TITLE, desc: DESC, url, vparam, ld })}
<body>

${header}

<main>
<section class="read cat-page">

<nav class="crumbs" aria-label="パンくず">
<a href="/">気になるモノ手帖</a><span aria-hidden="true">›</span><span aria-current="page">読みもの</span>
</nav>

<div class="section-head">
<span class="eyebrow">READ</span>
<h1>読みもの — 買う前に整理するメモ</h1>
<p class="section-sub">買う前に少し立ち止まって、見た目・使い心地・置き場所を整理するメモ。「選び方」はアフィリエイトリンクなしの編集メモ、「まとめ」はテーマ別に商品を紹介する記事で、商品リンク（アフィリエイト）を含みます。</p>
</div>

${list}

<h2>カテゴリから商品を探す</h2>
<nav class="catnav" aria-label="カテゴリ">
<a class="catnav__link" href="/category/gadget" style="--c:var(--purple-deep)">ガジェット</a>
<a class="catnav__link" href="/category/interior" style="--c:var(--teal-deep)">インテリア</a>
<a class="catnav__link" href="/category/kitchen" style="--c:var(--green-deep)">食器・キッチン</a>
<a class="catnav__link" href="/category/beauty" style="--c:var(--pink-deep)">コスメ・ケア</a>
<a class="catnav__link" href="/category/daily" style="--c:var(--violet-deep)">日用品</a>
<a class="catnav__link" href="/category/goods" style="--c:var(--coral-deep)">文具・雑貨</a>
<a class="catnav__link" href="/category/fashion" style="--c:var(--amber-deep)">ファッション</a>
<a class="catnav__link" href="/#select">すべてのピック</a>
</nav>

<div class="share" data-share>
<span class="share__label">SHARE</span>
<button class="share__btn" type="button" data-share-native hidden>シェアする</button>
<a class="share__btn" data-share-x target="_blank" rel="noopener">X</a>
<a class="share__btn" data-share-line target="_blank" rel="noopener">LINE</a>
<a class="share__btn" data-share-fb target="_blank" rel="noopener">Facebook</a>
<a class="share__btn" data-share-pin target="_blank" rel="noopener">Pinterest</a>
<button class="share__btn" type="button" data-share-copy>リンクをコピー</button>
</div>

</section>
</main>

${footer(vparam)}
</body>
</html>
`;

const dest = path.join(repoRoot, 'public/read/index.html');
const changed = writeIfChanged(dest, html);
console.log(`${changed ? '+' : '='} /read  記事${items.length}本 / ?v=${vparam}`);
