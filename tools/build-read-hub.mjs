/**
 * /read（読みもの一覧）のハブページを生成する。
 * カードのHTMLは index.html の .read-list をそのまま抜き出して使うので、
 * トップの一覧に記事を足せばここにも自動で載る（二重管理しない）。
 * 再生成: node tools/build-read-hub.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CRLF = (s) => s.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
const V = 70;

const index = readFileSync(join(ROOT, "public", "index.html"), "utf8");

// --- .read-list をそのまま抜く（最後の </article> までを取り、div を閉じ直す） ---
const start = index.indexOf('<div class="read-list">');
if (start < 0) throw new Error("read-list not found in index.html");
const secEnd = index.indexOf("</section>", start);
const lastArticle = index.lastIndexOf("</article>", secEnd);
if (lastArticle < 0) throw new Error("no article in read-list");
let list = index.slice(start, lastArticle + "</article>".length) + "\r\n</div>";
// トップでは初期表示を絞る演出クラスが付くことがあるので、一覧ページでは落とす
list = list.replace(/ class="read-card ([^"]*?)\s*reveal"/g, ' class="read-card $1"');
// index 側は2段インデント。ハブでは素で置く。
list = list.replace(/^ {2}/gm, "");

// --- 記事メタ（ItemList schema 用）を抽出 ---
const items = [...index.matchAll(/<h3><a href="(\/read\/[^"]+)">([^<]+)<\/a><\/h3>/g)].map(
  (m, i) => ({ pos: i + 1, url: "https://kininarumono.jp" + m[1], name: m[2] })
);
if (!items.length) throw new Error("no read links found");

const TITLE = "読みもの — 買う前に整理するメモ｜気になるモノ手帖";
const DESC =
  "モノを選ぶときの基準をまとめた編集メモと、テーマ別に商品を紹介するまとめ記事の一覧。雑貨・インテリア・ガジェット・ギフト・一人暮らしの部屋づくりまで、買う前に一度立ち止まって考えたいことを書いています。";
const OG = "https://kininarumono.jp/images/ogp-2026-08.jpg";

const schema = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://kininarumono.jp/read#page",
      url: "https://kininarumono.jp/read",
      name: TITLE,
      description: DESC,
      inLanguage: "ja-JP",
      isPartOf: { "@id": "https://kininarumono.jp/#website" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://kininarumono.jp/read#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "気になるモノ手帖", item: "https://kininarumono.jp/" },
        { "@type": "ListItem", position: 2, name: "読みもの", item: "https://kininarumono.jp/read" },
      ],
    },
    {
      "@type": "ItemList",
      "@id": "https://kininarumono.jp/read#itemlist",
      name: "読みもの一覧",
      numberOfItems: items.length,
      itemListElement: items.map((it) => ({
        "@type": "ListItem",
        position: it.pos,
        name: it.name,
        url: it.url,
      })),
    },
  ],
});

const html = `<!DOCTYPE html>
<html lang="ja">
<head> <!-- Google tag (gtag.js) --> <script async src="https://www.googletagmanager.com/gtag/js?id=G-S4LRS2KCRZ"></script> <script> window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-S4LRS2KCRZ'); </script>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${TITLE}</title>
<meta name="description" content="${DESC}" />
<meta property="og:title" content="${TITLE}" />
<meta property="og:description" content="${DESC}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://kininarumono.jp/read" />
<link rel="canonical" href="https://kininarumono.jp/read" />
<meta property="og:site_name" content="気になるモノ手帖" />
<meta property="og:locale" content="ja_JP" />
<meta property="og:image" content="${OG}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${TITLE}" /><meta name="twitter:description" content="${DESC}" /><meta name="twitter:image" content="${OG}" />
<meta name="theme-color" content="#0A57FF" />
<link rel="icon" href="/favicon.ico" sizes="32x32" /><link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" /><link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" /><link rel="icon" type="image/png" sizes="192x192" href="/images/favicon-192x192.png" /><link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Noto+Sans+JP:wght@400;500&family=Zen+Maru+Gothic:wght@400;500;700;900&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yakuhanjp@3.4.1/dist/css/yakuhanjp.min.css" />
<!-- ?v= はキャッシュ破棄用。css/js を変更したら全ページで数字を上げること -->
<link rel="stylesheet" href="/css/style.css?v=${V}" />
<script type="application/ld+json">${schema}</script></head>
<body>

<header class="site-header" id="top">
<a href="/" class="wordmark" aria-label="気になるモノ手帖 トップへ">
<img class="wordmark__mark" src="/images/logo-mark.webp" alt="" width="320" height="320" decoding="async" />
<span class="wordmark__name">気になるモノ手帖</span>
<span class="wordmark__sub">MONO NOTE</span>
</a>
<nav class="site-nav" aria-label="メインナビ">
<a href="/#about">ムード</a>
<a href="/#select">ピック</a>
<a href="/read">読みもの</a>
<a href="/#channels">チャンネル</a>
</nav>
<a class="pill pill--room" href="https://room.rakuten.co.jp/totonou_note" target="_blank" rel="noopener">楽天ROOM →</a>
<button class="nav-toggle" aria-label="メニューを開閉" aria-expanded="false"><span></span><span></span><span></span></button>
</header>
<div class="mobile-menu" id="mobileMenu" hidden>
<a href="/#about">ムード</a>
<a href="/#select">ピック</a>
<a href="/read">読みもの</a>
<a href="/#channels">チャンネル</a>
<a href="https://room.rakuten.co.jp/totonou_note" target="_blank" rel="noopener">楽天ROOM →</a>
</div>

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

<footer class="site-footer" id="footer">
<div class="footer__brand">
<span class="wordmark wordmark--footer">
<img class="wordmark__mark" src="/images/logo-mark.webp" alt="" width="320" height="320" loading="lazy" decoding="async" />
<span class="wordmark__name">気になるモノ手帖</span>
<span class="wordmark__sub">MONO NOTE</span>
</span>
<p>デザインでアガる雑貨・インテリア・ガジェット。</p>
</div>
<nav class="catlinks catlinks--footer" aria-label="カテゴリ別ページ">
<span class="catlinks__label">カテゴリ別のページ</span>
<a href="/category/gadget">ガジェット</a>
<a href="/category/interior">インテリア</a>
<a href="/category/kitchen">食器・キッチン</a>
<a href="/category/beauty">コスメ・ケア</a>
<a href="/category/daily">日用品</a>
<a href="/category/goods">文具・雑貨</a>
<a href="/category/fashion">ファッション</a>
<a href="/read">読みもの一覧</a>
</nav>
<div class="footer__legal">
<p><strong>アフィリエイトについて</strong><br />当サイトは、アフィリエイトプログラム（楽天アフィリエイト・A8.net）を利用しています。掲載リンクから商品を購入されると、運営者に報酬が支払われる場合があります。価格・在庫は掲載時点のもので変動します。購入前にリンク先でご確認ください。</p>
<p class="footer__mini">運営者：気になるモノ手帖（お問い合わせは各SNSのDMまで）／掲載情報の正確性には努めますが内容を保証するものではありません。商品の購入・利用は各自のご判断でお願いします。</p>
</div>
<p class="footer__copy">© <span id="year"></span> 気になるモノ手帖</p>
</footer>

<button class="back-top" id="backTop" type="button" aria-label="ページトップへ戻る">↑</button>

<script src="/js/main.js?v=${V}" defer></script>
</body>
</html>
`;

const out = join(ROOT, "public", "read", "index.html");
writeFileSync(out, CRLF(html));
console.log(`wrote ${out} (${items.length} articles)`);
