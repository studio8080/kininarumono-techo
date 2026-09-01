#!/usr/bin/env node
// build-roundup.mjs — テーマ別のまとめ記事を public/read/ に生成する。
//
//   node tools/build-roundup.mjs
//
// ★ PICKS を編集したら再生成すること（デプロイのワークフローが差分で検出して落とす）
//
// なぜ生成するのか:
//   まとめ記事は特定の商品を名指しで紹介する。商品をベタ書きすると、
//   週次の在庫監査（check-stock.mjs --fix）が販売終了品をPICKSから消したときに、
//   記事側だけリンク切れのまま残る。ここでは brand + name で PICKS を引くので、
//   消えていれば **生成時にエラーで落ちる**。気づけるようにするのが目的。
//
// 既存の「読みもの」（選び方エッセイ）との違い:
//   エッセイはアフィリエイトリンクを含まない編集メモ。まとめ記事は商品リンクを含む。
//   そのため各記事で商品カードより前に開示（AGENTS.md 3-6）を必ず置く。

import fs from 'node:fs';
import path from 'node:path';
import {
  repoRoot, ORIGIN, OGP, CAT, esc, readPicks, makeIsNew, cardHtml,
  cacheVersion, head, header, footer, disclosure, addToSitemap, writeIfChanged
} from './lib/site.mjs';

// 記事からカテゴリページへ戻す導線。これが無いと、検索の入口になる記事から
// 商品を並べたページへ流れず、リンクが片側にしか通らない。
const CAT_LABEL = {
  gadget: 'ガジェット', interior: 'インテリア', kitchen: '食器・キッチン',
  beauty: 'コスメ・ケア', daily: '日用品', goods: '文具・雑貨', fashion: 'ファッション'
};
const catNavHtml = (cats) => `<h2>このテーマの商品を見る</h2>
<nav class="catnav" aria-label="関連カテゴリ">
${cats.map((c) => `<a class="catnav__link" href="/category/${c}" style="--c:var(--${CAT[c].cvar}-deep)">${esc(CAT_LABEL[c])}</a>`).join('\n')}
</nav>`;

// 日付は ROUNDUPS の published/modified に固定で持たせる。
// ここで new Date() を使うと、実行した日が datePublished に焼き込まれてしまい、
// 「翌日に再生成すると必ず差分が出る」＝ CI の生成物チェック（.github/workflows）が
// その日以降ずっと落ちる、という状態になる（実際に2026-08-30に踏んだ）。
// 構造化データとしても、datePublished が再生成のたびに動くのは誤りなので固定する。
const disp = (d) => d.replace(/-/g, '.');

// 商品は [brand, name] で PICKS を引く。表記を1文字でも間違えたら生成時に落ちる。
const ROUNDUPS = [
  {
    slug: 'gift-3000en-ika',
    cats: ['goods', 'kitchen', 'beauty'],   // 記事末尾のカテゴリ導線
    published: '2026-08-27',   // 公開日。動かさない（modified を足せば更新日だけ変えられる）
    tag: 'ギフト', tagColor: 'violet-deep',
    titleBase: '3,000円以下で贈って外さない雑貨',
    desc: '予算3,000円以下で、プチギフトや手土産に贈って外さない雑貨をまとめました。文具、グラス、ソープまで、もらった人が毎日使えるものだけを選んでいます。',
    lead: '3,000円という予算は、贈る側にとっては気を遣わせない額で、もらう側にとっては「自分では選ばないけど、あれば使う」がちょうど成立する帯です。プチギフトや手土産、ちょっとしたお礼に渡せるものを、実際にサイトに載せている中から集めました。',
    intro: [
      'この価格帯で失敗するのは、たいてい「その場で気が利いて見えるもの」を選んだときです。もらった直後は盛り上がるけれど、翌週には引き出しの奥に入っている。逆に外さないのは、相手がすでに毎日使っている道具の、ちょっといい版です。',
      '選ぶ基準は3つだけにしています。毎日か毎週は手に取るものか、置き場所を新しく作らなくていいか、相手の好みが分からなくても成立する形か。以下はその3つを通ったものです。'
    ],
    sections: [
      {
        h2: '机の上で毎日使うもの',
        body: '文具は「もう持っている」と思われがちですが、実際に持っているのは量販店のものであることが多い帯です。同じ用途で素材や作りが一段上がると、実用品なのにギフトとして成立します。',
        items: [
          ['DELFONICS', 'キトリ ポーチM', 'マチが無いぶんカバンの中で立てて差せます。中身を選ばないので、渡す相手の使い方を想像しなくていいのが楽なところ。'],
          ['suck UK', 'DRUM STICK PEN（ドラムスティック型ボールペン）', '見た目が完全にドラムスティックで、机に転がっていると何度も説明したくなる類。話のきっかけになるギフトが欲しいときに。'],
          ['HIGHTIDE / nahe', '2027 スクエア マンスリー手帳', '月間だけに絞った薄い手帳。すでに手帳を持っている人にも、サブとして渡しやすい厚みです。']
        ]
      },
      {
        h2: '台所とテーブルまわり',
        body: '食器は好みが出るので避けられがちですが、定番の形をしたガラスは例外です。すでにある食器と並べても喧嘩せず、割れても買い足せる。ギフトとして一番安全な棚だと思っています。',
        items: [
          ['DURALEX', 'ピカルディ', 'フランス製の強化ガラス。サイズが細かく刻んであるので、2つ3つ組み合わせて渡す使い方ができます。'],
          ['bodum', 'ダブルウォールグラス PAVINA 250ml 2個セット', '二重構造で、外側に水滴が付きにくいグラス。2個セットなので、贈る相手が誰かと使う前提でも成立します。'],
          ['竹中', 'mayu ランチボックス M 680ml', '木の質感を残したランチボックス。毎日の弁当箱を新調するきっかけとして渡せる大きさです。']
        ]
      },
      {
        h2: '香りと手ざわりで選ぶ',
        body: '好みが読めないときほど、消えものは強い選択肢になります。使い切れば残らないので、置き場所を相手に強いることもありません。',
        items: [
          ['COMPAGNIE DE PROVENCE', 'リキッドマルセイユソープ EXTRA PUR', '細身のボトルなので、洗面台の縁に出したままにできます。サイズ展開があるので予算に合わせやすいのも良いところ。'],
          ['Jurlique', 'ローズ ラブバーム', '缶入りのバームで、ポーチに転がしておける大きさ。持ち歩くものを贈りたいときに。']
        ]
      }
    ],
    closing: '3,000円以下は「安く済ませる」帯ではなく、相手に気を遣わせずに毎日の道具を1つ入れ替えられる帯です。価格を上げるより、相手がすでに使っているものを一段上げるほうが、結局よく使われます。',
    related: ['gift-no-erabikata', 'zakka-no-asobigokoro']
  },

  {
    slug: 'hitorigurashi-kaden-akari',
    cats: ['gadget', 'interior', 'kitchen'],   // 記事末尾のカテゴリ導線
    published: '2026-08-27',   // 公開日。動かさない（modified を足せば更新日だけ変えられる）
    tag: '一人暮らし', tagColor: 'teal-deep',
    titleBase: '一人暮らしの部屋に置ける、小さな家電と灯り',
    desc: '一人暮らしのワンルームでも置ける、小さな家電と照明をまとめました。幅を取らないトースター、コードレスのテーブルランプ、1台で完結するスピーカーまで。',
    lead: 'ワンルームで家電を増やすときに効くのは、性能の差より置き場所の差です。同じ機能でも、幅が5cm違うだけで置けるか置けないかが決まる。ここでは実際に幅と置き方から選んだものを並べました。',
    intro: [
      '一人暮らしの部屋づくりで最初に効くのは、家具を入れ替えることではなく、光の高さを変えることだと思っています。天井の照明だけで済ませていた部屋に、低い位置の灯りを1つ足す。それだけで夜の見え方が変わるので、まずそこから試すのが一番失敗が少ないところです。',
      '家電は逆に、置き場所の寸法から逆算します。カウンターの奥行き、コンセントの位置、扉を開ける方向。これを先に測っておくと、候補は驚くほど絞れます。'
    ],
    sections: [
      {
        h2: 'まず、低い位置の灯りを1つ',
        body: '天井の照明は部屋全体を均一に照らすので、どうしても手元だけが暗くなります。低い位置に1つ足すと影に高低差が生まれて、同じ部屋でも奥行きが出ます。',
        items: [
          ['abode', 'STRAW ペンダントランプ', '色付きのストローを束ねただけの構造。灯すと隙間から光が抜けるので、天井まわりの表情が変わります。'],
          ['INTERFORM', 'テーブルライト ペルナ', '木を削り出した脚にプリーツの布セード。ベッドサイドに置いたときの灯りの落ち方がやわらかいタイプです。'],
          ['SOMPEX', 'LULU テーブルランプ', '充電式のコードレスなので、コンセントの位置に縛られません。ベランダに持ち出せるのも一人暮らし向き。']
        ]
      },
      {
        h2: '台所は「幅」で決める',
        body: 'ワンルームのキッチンは、調理台がまな板1枚ぶんしかないことも珍しくありません。家電は機能より先に、置いたあとに何cm残るかで選びます。',
        items: [
          ['Aladdin', 'グラファイトトースター 1枚焼き CAT-G8A', '食パン1枚ぶんに割り切ったトースター。幅は22cm弱なので、コンロ脇の余白にも置けます。'],
          ['bodum', 'ダブルウォールグラス PAVINA 250ml 2個セット', '二重構造で結露しにくいので、コースターを置く場所すら惜しい狭い机でも使いやすいグラスです。']
        ]
      },
      {
        h2: '音は、置き場所とセットで考える',
        body: '棚に1台置くのか、持ち歩くのか。ここが決まると候補はかなり絞れます。ワンルームなら壁が近いぶん、大きな機種を無理に入れる必要はありません。',
        items: [
          ['Sonos', 'Era 100 スマートスピーカー', '円筒をそのまま立てたような形で、棚に1台置くだけで済む大きさ。あとから2台にして左右に振り分けることもできます。'],
          ['Marshall', 'EMBERTON III', '持ち運べるサイズで、部屋から風呂場、ベランダまで移動させて使える一台です。']
        ]
      }
    ],
    closing: '一人暮らしの部屋は、置ける量が決まっているぶん、1つ入れるたびに何かが押し出されます。だから増やす前に、いま置いてあるものと入れ替えられるかを考えるほうが早い。灯りから始めるのを勧めるのは、それが唯一「場所を取らずに増やせるもの」だからです。',
    related: ['hitorigurashi-no-heyazukuri', 'kagu-brand-no-erabikata']
  },

  {
    slug: 'hokuo-design-teiban',
    cats: ['kitchen', 'interior'],   // 記事末尾のカテゴリ導線
    published: '2026-08-27',   // 公開日。動かさない（modified を足せば更新日だけ変えられる）
    tag: '北欧', tagColor: 'green-deep',
    titleBase: '北欧デザインの定番、どれから買うか',
    desc: '北欧デザインの定番アイテムを、買う順番で整理しました。イッタラやHAYの食器から、アアルトベース、Yチェアやセブンチェアまで。価格帯ごとの入り口を紹介します。',
    lead: '北欧の定番と呼ばれるものは数が多く、しかも価格の幅が数千円から十数万円まであります。全部は無理でも、どれから手を付けると部屋が変わるのかには順番があると思っていて、それを価格帯ごとに整理しました。',
    intro: [
      '定番が定番であり続ける理由は、たいてい「他のものと並べても喧嘩しない」ことにあります。単体で見て一番かっこいいものが定番になるわけではなく、すでに部屋にあるものの隣に置いたときに成立するものが残っていく。だから買い足していく前提なら、結局そこに戻ってきます。',
      '順番としては、食器 → 花と灯り → 椅子の順で薦めています。前に行くほど安く、失敗しても取り返しがつき、しかも毎日手に取る回数が多いからです。'
    ],
    sections: [
      {
        h2: '1. まず食器から。毎日手に取る回数が一番多い',
        body: '数千円で買えて、毎日必ず使い、割れても買い直せる。北欧デザインの入り口としてこれ以上の条件は無いと思っています。定番の形は色を変えても揃って見えるので、少しずつ足していけます。',
        items: [
          ['iittala', 'ティーマ マグカップ 0.3L（アイスブルー）', 'カイ・フランクがデザインした定番。持ち手が細めなので、別の色と重ねて置いてもうるさくなりません。'],
          ['HAY', 'TINT ワイングラス 2個セット', '色付きのガラスを2個セットで。テーブルに1色入れるだけで印象が変わります。']
        ]
      },
      {
        h2: '2. 花と灯りで、部屋の空気を変える',
        body: '家具を買い替えなくても、花瓶とキャンドルの高さが入ると部屋に視線の止まる場所ができます。食器の次に効いて、まだ数千円から一万円台で届く帯です。',
        items: [
          ['iittala', 'アアルト ベース 120mm', 'アルヴァ・アアルトの波形。小さいサイズなら一輪挿しとして気軽に使えます。'],
          ['HOLMEGAARD', 'FLORA ベース ロングネック 24cm', '口の細いガラスなので、花を挿さずに置いてもオブジェとして成立します。'],
          ['ferm LIVING', 'Komo Mini Vases 3個セット', '高さも釉薬の出方も少しずつ違う3つセット。並べると陰影が出ます。'],
          ['Georg Jensen', 'NENDO ティーライト キャンドルホルダー', '佐藤オオキが手がけた、ステンレスを折り曲げただけのような形。火を入れると鏡面のほうにも炎が映ります。']
        ]
      },
      {
        h2: '3. 椅子は最後に、長く',
        body: '価格は跳ね上がりますが、座る時間の長さで割ると印象が変わる帯です。ここまで来たら、流行りではなく何十年も残っている形から選ぶほうが結局満足します。',
        items: [
          ['KAY BOJESEN DENMARK', 'Monkey Mini（モンキー ミニ ブラック）', '椅子の前に、小さいものでデンマークの木ものを1つ。棚の上に置くだけで空気が変わります。'],
          ['Carl Hansen & Søn', 'CH24 Yチェア オーク／オイル仕上げ SH45cm', 'ハンス・ウェグナーの代表作。座面のペーパーコードは張り替えられるので、長く使う前提が立ちます。'],
          ['Fritz Hansen', 'セブンチェア（正規）', '成形合板の薄さと重ねられる実用性。1脚から足していける定番です。']
        ]
      }
    ],
    closing: '北欧の定番は、安いものから順に買っても部屋が中途半端になりません。むしろ食器やガラスで色と質感の方向を決めてから大きいものに進むほうが、後から並べたときに揃います。急いで椅子から入る必要はないと思っています。',
    related: ['kagu-brand-no-erabikata', 'burando-lineup-no-kijun']
  }
];

const ARTICLE_TITLES = {
  'zakka-no-mikata': '部屋と服のあいだで選ぶ、デザイン雑貨の見方',
  'trend-komono-rule': 'トレンド小物を子どもっぽく見せないルール',
  'ii-mono-no-kijun': '実際に買ってよかったものに共通する、「良いモノ」の選び方',
  'zakka-no-asobigokoro': 'お手頃な雑貨だからこそ、遊び心を効かせる',
  'kagu-brand-no-erabikata': '家具ブランドは「どこに投資するか」で選ぶ',
  'burando-lineup-no-kijun': 'モノを選ぶときに見ている3つの視点',
  'gift-no-erabikata': 'プレゼント選びで見ている3つの基準',
  'hitorigurashi-no-heyazukuri': '一人暮らしの部屋づくりで最初に決める3つのこと'
};

// ---- ここから生成 ----
const picks = readPicks();
const isNew = makeIsNew(picks);
const vparam = cacheVersion();
const outDir = path.join(repoRoot, 'public/read');

const find = (brand, name, slug) => {
  const hit = picks.find((p) => p.brand === brand && p.name === name);
  if (!hit) {
    throw new Error(
      `[${slug}] PICKSに見つからない: ${brand} / ${name}\n` +
      '  在庫監査で消えたか、main.js側の表記が変わった可能性がある。\n' +
      '  記事から外すか、tools/build-roundup.mjs の表記を直すこと。'
    );
  }
  return hit;
};

let written = 0;
for (const r of ROUNDUPS) {
  // published を書き忘れると undefined が datePublished に入って構造化データが壊れる。
  // 静かに壊れるより落とす。
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.published || '')) {
    throw new Error(`${r.slug}: published が YYYY-MM-DD で入っていない（値: ${r.published}）。ROUNDUPSに公開日を書くこと。`);
  }
  const url = `${ORIGIN}/read/${r.slug}`;
  const all = r.sections.flatMap((s) => s.items.map(([b, n]) => find(b, n, r.slug)));
  // 見出しの「N選」は必ず実データから作る。手書きにすると商品の増減でズレる（実際にズレた）
  r.title = r.titleBase + ' ' + all.length + '選';
  const fullTitle = `${r.title}｜気になるモノ手帖`;

  const sections = r.sections.map((s) => `<h2>${esc(s.h2)}</h2>
<p>${esc(s.body)}</p>
<div class="grid grid--article">
${s.items.map(([b, n, note]) => {
    const p = find(b, n, r.slug);
    return `<div class="roundup__item">\n${cardHtml(p, isNew(p))}\n<p class="roundup__note"><strong>${esc(p.brand)}</strong>${esc(note)}</p>\n</div>`;
  }).join('\n')}
</div>`).join('\n\n');

  const related = r.related.map((slug) =>
    `<li><a href="/read/${slug}">${esc(ARTICLE_TITLES[slug] || slug)}</a></li>`).join('\n');

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: r.title,
        description: r.desc,
        image: OGP,
        datePublished: r.published,
        dateModified: r.modified || r.published,
        inLanguage: 'ja-JP',
        author: { '@id': `${ORIGIN}/#organization` },
        publisher: { '@id': `${ORIGIN}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '気になるモノ手帖', item: `${ORIGIN}/` },
          { '@type': 'ListItem', position: 2, name: r.title, item: url }
        ]
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#itemlist`,
        name: r.title,
        numberOfItems: all.length,
        itemListElement: all.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: `${p.brand} ${p.name}`,
            brand: { '@type': 'Brand', name: p.brand },
            image: p.img,
            description: p.blurb || undefined,
            category: CAT[p.cat].label
          }
        }))
      }
    ]
  };

  const html = `<!DOCTYPE html>
<html lang="ja">
${head({ title: fullTitle, desc: r.desc, url, ogType: 'article', vparam, ld })}
<body>

<!-- このページは tools/build-roundup.mjs が生成しています。直接編集しないこと。
     文言を直すなら tools/build-roundup.mjs の ROUNDUPS を編集して再生成する。 -->

${header}

<main>
<section>
<article class="article article--roundup">
<a class="article__crumb" href="/read">← 読みものへ戻る</a>

<div class="article__topline">
<span class="tag" style="--c:var(--${r.tagColor})">${esc(r.tag)}</span>
<span class="tag" style="--c:var(--ink)">まとめ</span>
<span class="article__date">${disp(r.modified || r.published)}</span>
</div>

<h1>${esc(r.title)}</h1>

<p class="article__lead">${esc(r.lead)}</p>

<div class="article__body">
${r.intro.map((t) => `<p>${esc(t)}</p>`).join('\n')}

${disclosure}

${sections}

<h2>まとめ</h2>
<p>${esc(r.closing)}</p>
<p>ここで挙げたもの以外は<a href="/#select">ピック一覧</a>から、価格帯や気分に合わせて探してみてください。</p>
</div>

<div class="share" data-share>
<span class="share__label">SHARE</span>
<button class="share__btn" type="button" data-share-native hidden>シェアする</button>
<a class="share__btn" data-share-x target="_blank" rel="noopener">X</a>
<a class="share__btn" data-share-line target="_blank" rel="noopener">LINE</a>
<a class="share__btn" data-share-fb target="_blank" rel="noopener">Facebook</a>
<a class="share__btn" data-share-pin target="_blank" rel="noopener">Pinterest</a>
<button class="share__btn" type="button" data-share-copy>リンクをコピー</button>
</div>

<p class="article__note">この記事は商品へのアフィリエイトリンクを含みます。掲載リンクから購入されると運営者に報酬が支払われる場合があります。価格・在庫は掲載時点のもので変動するため、購入前にリンク先でご確認ください。</p>

<h2>あわせて読む</h2>
<ul class="cat-related">
${related}
</ul>

${catNavHtml(r.cats)}
<div class="article__foot">
<a class="article__crumb" href="/read">← 読みものへ戻る</a>
<a class="article__crumb" href="/#select">ピック一覧を見る →</a>
</div>
</article>
</section>
</main>

${footer(vparam)}
</body>
</html>
`;

  const dest = path.join(outDir, `${r.slug}.html`);
  const changed = writeIfChanged(dest, html);
  if (changed) written++;
  console.log(`${changed ? '+' : '='} /read/${r.slug}  商品${all.length}点`);
}

// lastmod もその記事自身の日付を使う（実行日を入れると新記事追加のたびに非決定になる）
const added = ROUNDUPS.reduce((n, r) =>
  n + addToSitemap([`/read/${r.slug}`], r.modified || r.published, { priority: '0.8' }), 0);
console.log(`\n生成: ${ROUNDUPS.length}本 / 更新 ${written}件 / sitemapに追加 ${added}件 / ?v=${vparam}`);
