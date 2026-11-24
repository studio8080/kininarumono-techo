#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, ORIGIN, head, header, footer, cacheVersion, writeIfChanged } from './lib/site.mjs';

const data = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/original-goods.json'), 'utf8'));
const products = data.products;
const esc = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const url = ORIGIN + '/original-goods';
const title = '食べもののTシャツとステッカー｜オリジナルグッズ｜気になるモノ手帖';
const desc = 'クリームソーダ、おでん、小籠包、フォー。ここ企画が制作した食べもの・飲みもののオリジナルデザイン。TシャツとステッカーをRedbubbleの商品ページで選べます。';
const assets = '<link rel="stylesheet" href="/css/original-goods.css?v=20261124"><script src="/js/original-goods.js?v=20261124" defer></script>';
const image = (p, eager = false) => '<img src="' + esc(p.image) + '" alt="' + esc(p.name + 'のデザイン原画') + '" width="' + p.width + '" height="' + p.height + '" loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async">';
const button = (p, kind, text) => '<a href="' + esc(p.links[kind]) + '" target="_blank" rel="noopener" data-rb-design="' + esc(p.id) + '" data-rb-name="' + esc(p.name) + '" data-rb-product="' + kind + '" aria-label="' + esc(p.name + 'の' + text + '（Redbubble・新しいタブ）') + '">' + text + ' ↗</a>';
const card = (p) => '<article class="goods-card" id="' + esc(p.id) + '" data-goods-group="' + p.group + '"><div class="goods-card__media">' + image(p) + '</div><div class="goods-card__body"><h2>' + esc(p.name) + '</h2><p class="goods-card__english" lang="en">' + esc(p.englishName) + '</p><p class="goods-card__desc">' + esc(p.description) + '</p><p class="goods-english" lang="en">' + esc(p.englishDescription) + '</p><p class="goods-card__placement">Tシャツ：' + esc(p.placement) + '</p><div class="goods-card__actions">' + button(p, 'tshirt', 'Tシャツを見る') + button(p, 'sticker', 'ステッカーを見る') + '</div></div></article>';
for (const p of products) {
  if (!fs.existsSync(path.join(repoRoot, 'public', p.image))) throw new Error('Image missing: ' + p.image);
  for (const kind of ['tshirt', 'sticker']) {
    const u = new URL(p.links[kind]);
    if (u.hostname !== 'www.redbubble.com' || !u.pathname.includes('/' + p.workId + '/')) throw new Error('Unverified product destination: ' + p.id);
  }
}
const ld = {
  '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': url, url, name: title, description: desc, inLanguage: ['ja', 'en'], isPartOf: { '@id': ORIGIN + '/#website' } },
    { '@type': 'ItemList', numberOfItems: products.length, itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: url + '#' + p.id })) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '気になるモノ手帖', item: ORIGIN + '/' }, { '@type': 'ListItem', position: 2, name: 'オリジナルグッズ', item: url }] }
  ]
};
const vparam = cacheVersion();
const pageHead = head({ title, desc, url, vparam, ld, ogImage: ORIGIN + '/images/original-goods-og-20261124.jpg', ogImageAlt: '食べもの・飲みものを描いたここ企画のオリジナルデザイン' }).replace('</head>', assets + '</head>');
const html = [
  '<!DOCTYPE html><html lang="ja">', pageHead, '<body>', header,
  '<main class="goods-page"><p class="goods-crumb"><a href="/">気になるモノ手帖</a> / オリジナルグッズ</p>',
  '<section class="goods-hero"><div><p class="goods-eyebrow">KOKOKIKAKU / ORIGINAL GOODS</p><h1>好きな一皿を、<br>毎日のそばに。</h1><p class="goods-hero__lead">喫茶店のおやつ、湯気の立つひと皿、アジアの屋台。食べものと飲みものを描いたデザインを、Tシャツとステッカーに。</p><p class="goods-english" lang="en">Food drawings for everyday life.<br>Original T-shirts &amp; stickers on Redbubble.</p></div><div class="goods-hero__art">' + image(products[0], true) + image(products[7], true) + '</div></section>',
  '<div class="goods-disclosure"><strong>自社制作・販売商品のご紹介</strong>ここ企画が生成AIを活用して制作したオリジナルデザインです。購入先はRedbubbleです。掲載画像はデザイン原画で、商品上の配置・色・仕様は各商品ページで確認できます。</div>',
  '<div class="goods-filters" aria-label="デザインを絞り込む"><button type="button" data-goods-filter="all" aria-pressed="true">すべて</button><button type="button" data-goods-filter="japan" aria-pressed="false">喫茶と食卓</button><button type="button" data-goods-filter="asia" aria-pressed="false">アジアのひと皿</button></div>',
  '<p class="goods-count" data-goods-count role="status" aria-live="polite">' + products.length + '作品を表示</p><div class="goods-grid">',
  products.map(card).join('\n'), '</div>',
  '<p class="goods-purchase-note">各ボタンはRedbubbleの商品ページを新しいタブで開きます。価格・在庫・サイズ・送料・配送予定は、移動先でご確認ください。</p>',
  '<section class="goods-guide"><h2>気になるデザインから、商品を選ぶ。</h2><ol><li>好きな絵柄の「Tシャツを見る」「ステッカーを見る」を選びます。</li><li>Redbubbleでサイズ・色・仕上げ・価格と配送条件を確認します。</li><li>購入する場合は、Redbubbleの案内に沿ってお手続きください。</li></ol><p class="goods-english" lang="en">Choose a design, open its T-shirt or sticker page, then check the options and delivery details on Redbubble.</p><p><a href="https://www.redbubble.com/people/KokoKikaku/shop" target="_blank" rel="noopener">KokoKikakuのショップ全体を見る ↗</a></p></section></main>',
  footer(vparam), '</body></html>\n'
].join('\n');
writeIfChanged(path.join(repoRoot, 'public/original-goods.html'), html);
const teaser = [
  '<!-- ORIGINAL GOODS START -->',
  '<section class="goods-teaser" aria-label="ここ企画のオリジナルグッズ"><div><span class="goods-teaser__label">自社商品 / KOKOKIKAKU ORIGINALS</span><h2>好きな一皿を、<br>毎日のそばに。</h2><p>喫茶店のおやつからアジアのひと皿まで。ここ企画のオリジナルデザインを、Tシャツとステッカーで。</p><a class="goods-teaser__link" href="/original-goods" data-goods-open>オリジナルグッズを見る →</a></div><div class="goods-teaser__art">' + [products[0], products[4], products[7]].map(p => image(p)).join('') + '</div></section>',
  '<!-- ORIGINAL GOODS END -->'
].join('\n');
const indexPath = path.join(repoRoot, 'public/index.html');
let index = fs.readFileSync(indexPath, 'utf8');
if (index.includes('<!-- ORIGINAL GOODS START -->')) index = index.replace(/<!-- ORIGINAL GOODS START -->[\s\S]*?<!-- ORIGINAL GOODS END -->/, teaser);
else index = index.replace('<!-- ============ MOOD / DISCOVER ============ -->', teaser + '\n\n<!-- ============ MOOD / DISCOVER ============ -->');
if (!index.includes('/css/original-goods.css')) index = index.replace('</head>', assets + '</head>');
writeIfChanged(indexPath, index);
const sitemapPath = path.join(repoRoot, 'public/sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
if (!sitemap.includes('<loc>' + url + '</loc>')) sitemap = sitemap.replace('</urlset>', '  <url><loc>' + url + '</loc><lastmod>' + data.updatedOn + '</lastmod><priority>0.8</priority></url>\n</urlset>');
sitemap = sitemap.replace(/(<loc>https:\/\/kininarumono\.jp\/<\/loc>\s*<lastmod>)[^<]+/, '$1' + data.updatedOn);
writeIfChanged(sitemapPath, sitemap);
if (process.argv.includes('--og-preview')) {
  const og = '<!doctype html><html lang="ja"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#fbf7ef;color:#17130e;padding:48px;font-family:Arial,"Yu Gothic",sans-serif}h1{font-size:55px;margin:18px 0 22px;line-height:1.4}p{font-size:23px;margin:0}.art{display:flex;gap:28px;position:absolute;right:45px;top:235px;left:45px;height:330px}.art img{width:calc((100% - 56px)/3);height:100%;object-fit:contain}small{font-size:18px;letter-spacing:2px}</style><small>気になるモノ手帖 × KOKOKIKAKU ORIGINALS</small><h1>好きな一皿を、毎日のそばに。</h1><p>食べもののTシャツとステッカー</p><div class="art">' + [products[0],products[4],products[7]].map(p => image(p,true)).join('') + '</div></html>';
  writeIfChanged(path.join(repoRoot, 'public/__original-goods-og.html'), og);
}
console.log('Original goods: ' + products.length + ' designs / ' + (products.length * 2) + ' verified purchase links');
