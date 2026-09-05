#!/usr/bin/env node
// build-about.mjs — /about（運営・編集方針）を public/about.html に生成する。

import path from 'node:path';
import { repoRoot, ORIGIN, cacheVersion, head, header, footer, writeIfChanged } from './lib/site.mjs';

const url = `${ORIGIN}/about`;
const title = '運営・編集方針｜気になるモノ手帖';
const desc = '気になるモノ手帖の運営者情報、商品選定の考え方、アフィリエイト広告の扱い、画像・AI利用方針をまとめています。';
const vparam = cacheVersion();
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${url}#page`,
      url,
      name: title,
      description: desc,
      inLanguage: 'ja-JP',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      about: { '@id': `${ORIGIN}/#organization` }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '気になるモノ手帖', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: '運営・編集方針', item: url }
      ]
    }
  ]
};

const html = `<!DOCTYPE html>
<html lang="ja">
${head({ title, desc, url, vparam, ld, ogImage: `${ORIGIN}/images/read-editorial-cover-v2.jpg`, ogImageAlt: '気になるモノ手帖の編集方針イメージ写真' })}
<body>
${header}
<main>
<section class="cat-page">
<nav class="crumbs" aria-label="パンくず">
<a href="/">気になるモノ手帖</a><span aria-hidden="true">›</span><span aria-current="page">運営・編集方針</span>
</nav>
<div class="section-head">
<span class="eyebrow">ABOUT</span>
<h1>運営・編集方針</h1>
<p class="section-sub">気になるモノ手帖は、日常に馴染みつつ少し気分を上げてくれる雑貨・インテリア・ガジェットを記録する個人運営の編集メモです。</p>
</div>
<div class="policy-grid">
<article class="policy-panel">
<span class="policy-kicker">EDITORIAL</span>
<h2>どう選んでいるか</h2>
<p>商品は、見た目の強さだけでなく、置き場所、使う頻度、手入れのしやすさ、価格帯との釣り合いを見て掲載しています。ブランド名や流行だけで並べるのではなく、暮らしの中でどう使うかを本文で説明することを大切にしています。</p>
<ul>
<li>商品単体ではなく、部屋・服・持ち物との相性を見る</li>
<li>価格や在庫は変動するため、購入前にリンク先で確認する</li>
<li>販売元や商品内容に不安があるものは、無理に紹介しない</li>
</ul>
</article>
<article class="policy-panel">
<span class="policy-kicker">PR / AFFILIATE</span>
<h2>広告とアフィリエイト</h2>
<p>当サイトは楽天アフィリエイト、A8.netなどのアフィリエイトプログラムを利用しています。掲載リンクから商品を購入されると、運営者に報酬が支払われる場合があります。商品リンクを含むページでは、商品カードより前にPR表記を置きます。</p>
<p>広告収益の有無にかかわらず、掲載する理由が本文で説明できない商品は載せない方針です。</p>
</article>
<article class="policy-panel">
<span class="policy-kicker">IMAGES</span>
<h2>画像の扱い</h2>
<p>商品画像は、各ショップまたは公式に掲載されている画像を、商品確認のためにそのまま表示しています。装飾や文字の重ね加工は行いません。読みもののイメージ写真やSNS共有画像には、記事テーマを伝えるための生成画像を使う場合があります。</p>
</article>
<article class="policy-panel">
<span class="policy-kicker">CONTACT</span>
<h2>連絡先</h2>
<p>掲載内容の確認、削除依頼、その他のお問い合わせは、各SNSのDMからご連絡ください。内容の正確性には努めていますが、価格・仕様・在庫・販売条件は変わることがあります。</p>
<p><a class="article__crumb" href="/read">読みもの一覧へ</a></p>
</article>
</div>
</section>
</main>
${footer(vparam)}
</body>
</html>
`;

const changed = writeIfChanged(path.join(repoRoot, 'public/about.html'), html);
console.log(`${changed ? '+' : '='} /about / ?v=${vparam}`);