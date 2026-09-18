#!/usr/bin/env node
// build-discovery.mjs — 検索エンジン以外の「見つけられ方」のためのファイルを生成する。
//
//   node tools/build-discovery.mjs
//
//   public/llms.txt  … AIアシスタント向けのサイト案内（https://llmstxt.org の書式）
//   public/feed.xml  … 読みもののRSS 2.0（フィードリーダー・各種クローラ向け）
//
// ★ index.html の読みものカードを増減したら再生成すること（CIが差分で落とす）
//
// なぜ生成するのか:
//   記事の一覧は index.html の .read-list が唯一の出どころ（/read の一覧も同じ所から作る）。
//   llms.txt と feed.xml を手で書くと、記事を足したときにここだけ古いまま残る。
//
// 日付の扱い:
//   new Date() を使わない。実行日が出力に入ると、翌日の再生成で必ず差分が出て
//   CIの生成物チェックが落ち続ける（build-roundup.mjs で 2026-08-30 に踏んだ）。
//   feed の lastBuildDate は「いちばん新しい記事の日付」にする。

import fs from 'node:fs';
import path from 'node:path';
import { repoRoot, ORIGIN, CAT, readPicks, writeIfChanged } from './lib/site.mjs';

const indexHtml = fs.readFileSync(path.join(repoRoot, 'public/index.html'), 'utf8').replace(/\r\n/g, '\n');

// ---- 読みもの: index.html の .read-card から拾う ----
const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const start = indexHtml.indexOf('<div class="read-list">');
if (start < 0) throw new Error('index.html に .read-list が無い');
const listHtml = indexHtml.slice(start, indexHtml.indexOf('</section>', start));

const articles = [...listHtml.matchAll(/<article class="read-card ([^"]*)">([\s\S]*?)<\/article>/g)].map(([, cls, body]) => {
  const pick = (re) => (body.match(re) || [, ''])[1].trim();
  const a = {
    kind: /roundup/.test(cls) ? 'まとめ' : '選び方',
    tag: unesc(pick(/<span class="tag"[^>]*>([^<]*)<\/span>/)),
    date: pick(/<span class="read-card__date">([^<]*)<\/span>/),          // 2026.09.14
    path: pick(/<h3><a href="(\/read\/[^"]+)">/),
    title: unesc(pick(/<h3><a href="[^"]+">([^<]*)<\/a><\/h3>/)),
    desc: unesc(pick(/<\/h3>\s*<p>([^<]*)<\/p>/)),
  };
  if (!a.path || !a.title || !/^\d{4}\.\d{2}\.\d{2}$/.test(a.date))
    throw new Error(`読みものカードを解釈できない: ${a.path || body.slice(0, 80)}`);
  return a;
});
if (!articles.length) throw new Error('読みものカードが1枚も無い');

// ---- カテゴリ: 生成済みページの title / description を読む（COPYを二重に持たない） ----
const picks = readPicks();
const categories = Object.keys(CAT).map((slug) => {
  const html = fs.readFileSync(path.join(repoRoot, `public/category/${slug}.html`), 'utf8');
  const desc = unesc((html.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1]);
  const count = picks.filter((p) => p.cat === slug).length;
  if (!desc) throw new Error(`category/${slug}.html に description が無い`);
  return { slug, label: CAT[slug].label, desc, count };
});

// ================= llms.txt =================
const roundups = articles.filter((a) => a.kind === 'まとめ');
const essays = articles.filter((a) => a.kind === '選び方');
const line = (a) => `- [${a.title}](${ORIGIN}${a.path}): ${a.desc}`;

const llms = `# 気になるモノ手帖

> デザインで選ぶ雑貨・インテリア・ガジェットのキュレーションサイト。北欧の定番から小さなブランドまで、「置いたあと、触ったあと、気分が続くか」を基準に選んだ商品${picks.length}点と、モノの選び方を整理した読みもの${articles.length}本を掲載しています。運営は個人で、日本語のサイトです。

商品は楽天市場などで購入できる正規品のみを扱い、リプロダクト品（意匠の模倣品）は掲載していません。商品ページへのリンクはアフィリエイトリンクで、商品リンクを含むページには商品より前にPR表記を置いています。価格と在庫は変動するため、サイト上には価格を表示していません。

## カテゴリ別の商品一覧

${categories.map((c) => `- [${c.label}（${c.count}点）](${ORIGIN}/category/${c.slug}): ${c.desc}`).join('\n')}

## 読みもの: テーマ別のまとめ

具体的な商品を挙げて紹介する記事です。商品リンク（アフィリエイト）を含みます。

${roundups.map(line).join('\n')}

## 読みもの: 選び方の編集メモ

モノを選ぶときの基準や考え方を整理した記事です。本文に商品リンクはありません。

${essays.map(line).join('\n')}

## サイトについて

- [運営・編集方針](${ORIGIN}/about): 商品の選定基準、広告とアフィリエイトの扱い、画像の扱い、掲載・貸出の相談窓口
- [読みもの一覧](${ORIGIN}/read): 全記事の一覧
- [RSSフィード](${ORIGIN}/feed.xml): 読みものの更新通知
`;

// ================= feed.xml (RSS 2.0) =================
// 公開時刻は持っていないので、各日の 09:00 JST に固定する
const rfc822 = (d) => {
  const [y, m, day] = d.split('.').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day, 0, 0, 0)); // 09:00 JST = 00:00 UTC
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getUTCDay()];
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1];
  return `${wd}, ${String(day).padStart(2, '0')} ${mo} ${y} 09:00:00 +0900`;
};
const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>気になるモノ手帖 — 読みもの</title>
<link>${ORIGIN}/read</link>
<atom:link href="${ORIGIN}/feed.xml" rel="self" type="application/rss+xml" />
<description>デザインで選ぶ雑貨・インテリア・ガジェット。モノの選び方の編集メモと、テーマ別のまとめ記事。</description>
<language>ja</language>
<lastBuildDate>${rfc822(sorted[0].date)}</lastBuildDate>
${sorted.map((a) => `<item>
<title>${xml(a.title)}</title>
<link>${ORIGIN}${a.path}</link>
<guid isPermaLink="true">${ORIGIN}${a.path}</guid>
<pubDate>${rfc822(a.date)}</pubDate>
<category>${xml(a.tag)}</category>
<description>${xml(a.desc)}</description>
</item>`).join('\n')}
</channel>
</rss>
`;

const c1 = writeIfChanged(path.join(repoRoot, 'public/llms.txt'), llms);
const c2 = writeIfChanged(path.join(repoRoot, 'public/feed.xml'), feed);
console.log(`${c1 ? '+' : '='} /llms.txt  カテゴリ${categories.length} / 記事${articles.length}本 / 商品${picks.length}点`);
console.log(`${c2 ? '+' : '='} /feed.xml  ${sorted.length}件（最新 ${sorted[0].date}）`);
