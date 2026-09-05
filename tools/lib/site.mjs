// site.mjs — 生成スクリプト（build-category.mjs / build-roundup.mjs）の共通部品。
//
// 商品カードのマークアップをここに集約しているのが要点。
// カードは main.js の描画と揃っている必要があり（data-* を affiliate_click 計測が読む）、
// 生成物ごとに書き写すと必ず片方だけ古くなる。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ORIGIN = 'https://kininarumono.jp';
export const OGP = `${ORIGIN}/images/ogp-2026-08.jpg`;
export const GA_ID = 'G-S4LRS2KCRZ';

// main.js の CAT と対応させること
export const CAT = {
  gadget:   { label: 'ガジェット',     cvar: 'purple' },
  interior: { label: 'インテリア',     cvar: 'teal' },
  kitchen:  { label: '食器・キッチン', cvar: 'green' },
  beauty:   { label: 'コスメ・ケア',   cvar: 'pink' },
  daily:    { label: '日用品',         cvar: 'violet' },
  goods:    { label: '文具・雑貨',     cvar: 'coral' },
  fashion:  { label: 'ファッション',   cvar: 'amber' }
};

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** public/js/main.js の PICKS を読む */
export function readPicks() {
  const src = fs.readFileSync(path.join(repoRoot, 'public/js/main.js'), 'utf8');
  const start = src.indexOf('const PICKS = [');
  if (start < 0) throw new Error('main.js に const PICKS = [ が見つからない');
  const end = src.indexOf('\n  ];', start);
  if (end < 0) throw new Error('PICKS 配列の終端が見つからない');
  const body = src.slice(start + 'const PICKS = ['.length, end);
  const picks = new Function(`"use strict"; return [${body}];`)();
  if (!Array.isArray(picks) || picks.length === 0) throw new Error('PICKS のパースに失敗');

  // tools/check-stock.mjs と tools/backfill-codes.mjs は `\{\s*cat:"..."\},` という
  // 「末尾カンマ付きブロック」の正規表現でPICKSを数えている。配列の最後のエントリに
  // 末尾カンマが無いと、その1件だけ在庫監査もitemCode付与も静かに素通りする（実際に起きていた）。
  const byRegex = (body.match(/\{\s*cat:"[\s\S]*?\},/g) || []).length;
  if (byRegex !== picks.length) {
    throw new Error(
      `PICKSの件数が数え方で食い違う（式評価=${picks.length} / 正規表現=${byRegex}）。\n` +
      '  配列の最後のエントリに末尾カンマが無いと思われる。`}` を `},` にすること。\n' +
      '  そのままだと check-stock.mjs / backfill-codes.mjs が最後の1件を取りこぼす。'
    );
  }
  return picks;
}

/** NEW バッジの判定。main.js の isNew と同じルールにする */
export function makeIsNew(allPicks) {
  const latestDate = allPicks.reduce((m, p) => (p.date > m ? p.date : m), '');
  const latestCount = allPicks.filter((p) => p.date === latestDate).length;
  return (p) => latestCount > 0 && latestCount < allPicks.length / 3 && p.date === latestDate;
}

/**
 * 商品カード1枚。main.js の描画と同じマークアップ・同じ data-* にする。
 * data-brand / data-name / data-cat は main.js の affiliate_click 計測が読むので必須。
 * reveal クラスは付けない（JSが落ちると opacity:0 のまま本文が消えるため）。
 */
export function cardHtml(p, isNew = false) {
  const meta = CAT[p.cat];
  if (!meta) throw new Error(`未知のカテゴリ: ${p.cat}`);
  const style = `--c:var(--${meta.cvar});--c-deep:var(--${meta.cvar}-deep);--c-soft:var(--${meta.cvar}-soft)`;
  return `<article class="card" data-cat="${esc(p.cat)}" data-brand="${esc(p.brand)}" data-name="${esc(p.name)}" style="${style}">
<div class="card__media"><img src="${esc(p.img)}" alt="${esc(p.brand)} ${esc(p.name)}" loading="lazy" /></div>
<div class="card__body">
<div class="card__meta"><span class="card__cat">${esc(meta.label)}</span>${isNew ? '<span class="card__new">NEW</span>' : ''}<span class="card__date">${esc(p.date)}</span></div>
<span class="card__brand">${esc(p.brand)}</span>
<h3 class="card__name">${esc(p.name)}</h3>
<p class="card__blurb">${esc(p.blurb || '')}</p>
<div class="card__foot"><a class="card__btn" href="${esc(p.url)}" target="_blank" rel="sponsored noopener nofollow">商品を見る</a></div>
</div>
</article>`;
}

/** index.html の ?v= に合わせる（キャッシュ破棄番号をページ間でずらさない） */
export function cacheVersion() {
  return (fs.readFileSync(path.join(repoRoot, 'public/index.html'), 'utf8')
    .match(/main\.js\?v=(\d+)/) || [, '1'])[1];
}

/** <head> の共通部分。ページ固有のメタとJSON-LDだけ差し込む */
export function head({ title, desc, url, ogType = 'website', vparam, ld, ogImage = OGP, ogImageAlt = '気になるモノ手帖のイメージ写真' }) {
  return `<head> <!-- Google tag (gtag.js) --> <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script> <script> window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}'); </script>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:url" content="${url}" />
<link rel="canonical" href="${url}" />
<meta property="og:site_name" content="気になるモノ手帖" />
<meta property="og:locale" content="ja_JP" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${esc(ogImageAlt)}" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${esc(title)}" /><meta name="twitter:description" content="${esc(desc)}" /><meta name="twitter:image" content="${ogImage}" />
<meta name="theme-color" content="#0A57FF" />
<link rel="icon" href="/favicon.ico" sizes="32x32" /><link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" /><link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" /><link rel="icon" type="image/png" sizes="192x192" href="/images/favicon-192x192.png" /><link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=Noto+Sans+JP:wght@400;500&family=Zen+Maru+Gothic:wght@400;500;700;900&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yakuhanjp@3.4.1/dist/css/yakuhanjp.min.css" />
<!-- ?v= はキャッシュ破棄用。css/js を変更したら全ページで数字を上げること -->
<link rel="stylesheet" href="/css/style.css?v=${vparam}" />
<script type="application/ld+json">${JSON.stringify(ld)}</script></head>`;
}

export const header = `<header class="site-header" id="top">
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
</div>`;

/**
 * 全ページのフッターに置くカテゴリ導線。カテゴリページは sitemap で priority 0.9 を
 * 振っているのに、これが無いとトップの本文からしかクロール経路が無い。
 * 手書きのページ（index.html / read/*.html）にも同じものを置いてある。
 */
export const footerCatlinks = `<nav class="catlinks catlinks--footer" aria-label="カテゴリ別ページ">
<span class="catlinks__label">カテゴリ別のページ</span>
<a href="/category/gadget">ガジェット</a>
<a href="/category/interior">インテリア</a>
<a href="/category/kitchen">食器・キッチン</a>
<a href="/category/beauty">コスメ・ケア</a>
<a href="/category/daily">日用品</a>
<a href="/category/goods">文具・雑貨</a>
<a href="/category/fashion">ファッション</a>
<a href="/read">読みもの一覧</a>
<a href="/about">運営・編集方針</a>
</nav>`;

export function footer(vparam) {
  return `<footer class="site-footer" id="footer">
<div class="footer__brand">
<span class="wordmark wordmark--footer">
<img class="wordmark__mark" src="/images/logo-mark.webp" alt="" width="320" height="320" loading="lazy" decoding="async" />
<span class="wordmark__name">気になるモノ手帖</span>
<span class="wordmark__sub">MONO NOTE</span>
</span>
<p>デザインでアガる雑貨・インテリア・ガジェット。</p>
</div>
${footerCatlinks}
<div class="footer__legal">
<p><strong>アフィリエイトについて</strong><br />当サイトは、アフィリエイトプログラム（楽天アフィリエイト・A8.net）を利用しています。掲載リンクから商品を購入されると、運営者に報酬が支払われる場合があります。価格・在庫は掲載時点のもので変動します。購入前にリンク先でご確認ください。</p>
<p class="footer__mini">運営者：気になるモノ手帖（お問い合わせは各SNSのDMまで）／掲載情報の正確性には努めますが内容を保証するものではありません。商品の購入・利用は各自のご判断でお願いします。</p>
</div>
<p class="footer__copy">© <span id="year"></span> 気になるモノ手帖</p>
</footer>

<button class="back-top" id="backTop" type="button" aria-label="ページトップへ戻る">↑</button>

<script src="/js/main.js?v=${vparam}" defer></script>`;
}

/**
 * A8.net の広告枠。バナーの実体（a8mat/aid/mid）は public/js/main.js の AD_TAGS にあり、
 * ここでは「どの素材を出すか」のキーだけを data-ad で渡す。タグを1か所にまとめておかないと、
 * 素材を差し替えるときに全ページを触ることになる。
 *
 * spec は "PC用|モバイル用"。820px未満では右側が使われる。右側が空ならその幅では出さない。
 * 728x90 はモバイルだと343x44まで縮んで文字が読めないので、必ずモバイル用を別に指定するか
 * 空にすること。300x250 は両方の幅で読めるので "lifepocket" のように片方だけでよい。
 *
 * placement は GA4 の ad_click イベントに乗る。どの位置の枠が効いたか後で見るために付ける。
 */
export function adSlot(spec, placement) {
  return `<aside class="ad-slot ad-slot--tail" aria-label="広告" data-ad="${spec}" data-ad-placement="${placement}">
<p class="ad-slot__label">PR</p>
<div class="ad-slot__body"></div>
</aside>`;
}

/**
 * ページごとに出す広告素材。記事・カテゴリの内容と噛み合うものを割り当てる。
 *
 * 現在A8で発行済みの素材は3つだけで、家具350は728x90しか無い。そのため家具・インテリア系の
 * ページはモバイルでLIFE POCKET（財布・革小物）に落としている。A8の管理画面で家具350の
 * 300x250を発行したら、main.js の AD_TAGS に kagu350_rect を足して、ここの
 * "kagu350|lifepocket" を "kagu350|kagu350_rect" に置き換えるだけでよい。
 */
export const AD_BY_PAGE = {
  // カテゴリ
  interior: 'kagu350|lifepocket',
  kitchen:  'kagu350|lifepocket',
  daily:    'kagu350|lifepocket',
  gadget:   'evering',
  goods:    'lifepocket',
  fashion:  'lifepocket',
  beauty:   'lifepocket',
  // 読みもの
  'read-hub':                  'kagu350|lifepocket',
  'gift-3000en-ika':           'lifepocket',
  'hitorigurashi-kaden-akari': 'kagu350|evering',
  'hokuo-design-teiban':       'kagu350|lifepocket',
};

/**
 * ステマ規制（景表法）対応の開示。商品リンクより「前」に置くこと（AGENTS.md 3-6）。
 * フッターの開示だけでは商品カードから遠すぎて機能しない。
 */
export const disclosure = `<p class="disclosure">
<span class="disclosure__tag">PR</span>
<span>当サイトはアフィリエイト広告を利用しています。以下の商品リンクから購入されると、運営者に報酬が支払われます。価格・在庫は変動するので、購入前にリンク先でご確認ください。</span>
</p>`;

/** sitemap に未登録のURLだけ足す。既存の lastmod は書き換えない（3-4b: 嘘のlastmodを作らない） */
export function addToSitemap(paths, today, { changefreq = 'monthly', priority = '0.8' } = {}) {
  const sitemapPath = path.join(repoRoot, 'public/sitemap.xml');
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  const eol = xml.includes('\r\n') ? '\r\n' : '\n';
  const missing = paths.filter((u) => !xml.includes(`<loc>${ORIGIN}${u}</loc>`));
  if (missing.length === 0) return 0;
  const lines = missing.map((u) =>
    `  <url><loc>${ORIGIN}${u}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`);
  xml = xml.replace('</urlset>', lines.join(eol) + eol + '</urlset>');
  fs.writeFileSync(sitemapPath, xml);
  return missing.length;
}

/** 改行コードの違いだけで「更新された」と出ないように正規化して比較する（core.autocrlf 対策） */
export function writeIfChanged(dest, html) {
  const prev = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
  const norm = (t) => t.replace(/\r\n/g, '\n');
  const same = prev !== null && norm(prev) === norm(html);
  if (!same) fs.writeFileSync(dest, html);
  return !same;
}
