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
  repoRoot, ORIGIN, CAT, esc, readPicks, makeIsNew, cardHtml,
  cacheVersion, head, header, footer, disclosure, addToSitemap, writeIfChanged, adSlot, AD_BY_PAGE
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
    shareImage: 'article-share-gift.jpg',
    cats: ['goods', 'kitchen', 'beauty'],   // 記事末尾のカテゴリ導線
    published: '2026-08-27',   // 公開日。動かさない（modified を足せば更新日だけ変えられる）
    modified: '2026-10-10',
    tag: 'ギフト', tagColor: 'violet-deep',
    titleBase: 'プチギフトに選ぶ、毎日使う雑貨',
    desc: 'プチギフトや手土産の候補を、使う頻度・置き場所・相手の好みから考えます。文具、グラス、ソープなど8点を紹介。価格や容量は購入前に販売ページで確認してください。',
    lead: 'ちょっとしたお礼に何を渡すか。値段だけで候補を絞る前に、相手がすでに使っている道具と、家に持ち帰ったあとの置き場所を考えます。サイトに掲載している雑貨から、文具・食器・ケア用品を集めました。',
    intentGuide: 'プチギフトや手土産を探している人向け。使う頻度、置き場所、好みが分からないときの確認点を整理します。掲載商品の価格上限は保証していません。容量・セット数・送料も含め、販売ページで予算に収まるか確認してください。',
    intro: [
      '「その場で気が利いて見えるか」だけでは、持ち帰ってから使うかどうかは分かりません。机で書く、飲み物を飲む、手を洗うなど、相手の日常のどこに入るかを先に考えると候補を比べやすくなります。',
      '毎日か毎週使う場面があるか、新しい置き場所が必要か、相手の好みを確認できるか。この3つを見ます。弁当箱は弁当を持つ習慣、香りのある用品は香りの好みが分かる相手向けです。分からない場合は、渡す前に確認するか別の候補を選びます。'
    ],
    sections: [
      {
        h2: '机の上で毎日使うもの',
        body: '文具は、すでに使っているものと用途が重ならないかを確認します。ポーチなら入れたいもの、ペンなら書く場面、手帳なら紙で予定を管理する習慣があるか。見た目に加えて、使う場面を一つ挙げられるものを候補にします。',
        items: [
          ['DELFONICS', 'キトリ ポーチM', 'マチのない平たいポーチ。文具や小物をまとめたい人向けの候補です。入れたいものの厚みと本体寸法を比べ、普段のバッグに収まるか確認してください。'],
          ['suck UK', 'DRUM STICK PEN（ドラムスティック型ボールペン）', '見た目が完全にドラムスティックで、机に転がっていると何度も説明したくなる類。話のきっかけになるギフトが欲しいときに。'],
          ['HIGHTIDE / nahe', '2027 スクエア マンスリー手帳', '月間予定を紙で一覧したい人向けの候補です。贈る時期に合う年版と開始月を確認し、すでに使っている手帳と役割が重ならないか考えます。']
        ]
      },
      {
        h2: '台所とテーブルまわり',
        body: 'グラスは、よく飲むものに合う容量と、食器棚に収まる高さ・個数で比べます。二人暮らしでも同じグラスを使うとは限りません。すでに持っている食器や弁当箱を確認し、置き場所と使う習慣に合うものを選びます。',
        items: [
          ['DURALEX', 'ピカルディ', '容量を選ぶときは、相手がよく飲むものと、一度に注ぐ量を確認します。販売ページで選択中の容量とセット数を照合してから予算を考えてください。'],
          ['bodum', 'ダブルウォールグラス PAVINA 250ml 2個セット', '250mlのグラス2個セット。二重構造の見た目に加えて、持ちやすい寸法か、2個分の置き場所があるかを確認します。対応する洗い方や扱い方も販売ページで確かめてください。'],
          ['竹中', 'mayu ランチボックス M 680ml', '容量680mlのランチボックス。弁当を持ち歩く人向けの候補です。普段使う容量と、持ち歩くバッグに収まる寸法かを購入前に確認してください。']
        ]
      },
      {
        h2: '香りと手ざわりで選ぶ',
        body: '使い切れる用品でも、香りや肌との相性は人によって違います。ソープやバームは、相手が普段使う種類や香りを確認できるときの候補です。好みが分からない場合に無条件で選べるものではありません。',
        items: [
          ['COMPAGNIE DE PROVENCE', 'リキッドマルセイユソープ EXTRA PUR', '香りの好みが分かる相手向けの候補です。選択中の香りと容量、ボトルを置く場所の寸法を確認してください。肌との相性が分からない場合は、普段使う種類を先に聞きます。'],
          ['Jurlique', 'ローズ ラブバーム', '缶入りのバームで、ポーチに転がしておける大きさ。持ち歩くものを贈りたいときに。']
        ]
      }
    ],
    closing: '候補を選んだら、使う場面・置き場所・好みの3点をもう一度確認します。最後に販売ページで容量、セット数、送料込みの総額を見て予算と照合してください。どの相手にも合うと決めつけず、分からない条件が残るものは候補から外して考えます。',
    related: ['gift-no-erabikata', 'zakka-no-asobigokoro']
  },

  {
    slug: 'hitorigurashi-kaden-akari',
    shareImage: 'article-share-room.jpg',
    cats: ['gadget', 'interior', 'kitchen'],   // 記事末尾のカテゴリ導線
    published: '2026-08-27',   // 公開日。動かさない（modified を足せば更新日だけ変えられる）
    modified: '2026-10-10',
    tag: '一人暮らし', tagColor: 'teal-deep',
    titleBase: '小さな部屋で検討したい、家電と灯り',
    desc: '小さな部屋の家電・照明を、置き場所と使用条件から考える7つの候補。本体寸法だけでなく、トースターの必要な空間、ランプの屋外使用、スピーカーの充電条件を確認します。',
    lead: '棚に本体が収まっても、その場所で使えるとは限りません。熱を出す家電には周囲の空間が必要で、持ち運べる機器にも水濡れや充電の条件があります。灯り、台所、音の3つに分け、買う前に確認したい点を並べました。',
    intentGuide: '小さい部屋に家電・照明・スピーカーを増やしたい人向け。寸法、配線、使用環境を照合するための候補集です。掲載品をすべて実際に設置・使用したレビューではありません。',
    intro: [
      'この記事では、まず手元やベッドサイドなど、灯りを足したい位置を決める順番を提案します。必要な明るさに加え、台座やコードの置き場所も考えておきます。',
      '台所では、置く面の幅と奥行き、上の棚までの高さ、扉を開く空間、コンセントの位置を測ります。そのうえで、候補の取扱説明書にある設置条件と照合します。'
    ],
    sections: [
      {
        h2: '灯りは、高さと使う場所を決める',
        body: '天井から吊るす照明と、台に置く照明では必要な場所が違います。充電式でも充電場所は必要です。SOMPEXのLULUは公式情報で屋内・屋外用、使用温度0〜40℃と案内されています。雨や雪に長時間さらさず、充電は乾いた平らな場所で行う条件もあります。ベランダで使う前に、購入品の説明書と置く場所を照合してください。',
        sources: [['SOMPEX LULU公式製品情報（英語）', 'https://www.sompex.de/en_de/lulu-grun-metallic-akku-tischleuchte.html']],
        items: [
          ['abode', 'STRAW ペンダントランプ', '色付きのストローを束ねただけの構造。灯すと隙間から光が抜けるので、天井まわりの表情が変わります。'],
          ['INTERFORM', 'テーブルライト ペルナ', '木を削り出した脚にプリーツの布セード。ベッドサイドに置いたときの灯りの落ち方がやわらかいタイプです。'],
          ['SOMPEX', 'LULU テーブルランプ', 'コードをつながずに置ける充電式。置く台の広さと、充電する場所をセットで決めたい候補です。']
        ]
      },
      {
        h2: '台所は、本体寸法と周囲の空間を分けて測る',
        body: 'CAT-G8Aの本体は約幅21.8×奥行25.4×高さ21.1cm。説明書の設置図では、木製の壁・家具などの可燃物から上面10cm以上、側面・後面4.5cm以上を離し、右側か左側の片面を開放するよう案内されています。水のかかる場所や火気の近くでは使えません。コンロ脇の幅だけを見て置けると判断せず、扉の開閉や作業に使う場所も残せるか確認します。',
        sources: [['Aladdin CAT-G8A取扱説明書（PDF・冊子2ページ）', 'https://aladdin-aic.com/web-contents/wp-content/uploads/2025/10/CAT-G8A.pdf']],
        items: [
          ['Aladdin', 'グラファイトトースター 1枚焼き CAT-G8A', '食パン1枚用。設置条件を満たす場所を確保したうえで、必要な調理量に合うかを考えます。'],
          ['bodum', 'ダブルウォールグラス PAVINA 250ml 2個セット', '家電と一緒に使う食器の候補。グラスを置く面と収納場所、容量とセット数を購入前に確かめます。']
        ]
      },
      {
        h2: '音は、置き場所とセットで考える',
        body: '棚に据え置くか、部屋の中で持ち運ぶかを先に考えます。EMBERTON IIIはIP67の防塵・防水仕様ですが、それだけで浴室の熱・蒸気・洗剤への対応まで判断はできません。公式説明書は流水で洗わず、充電前に本体を完全に乾かすよう案内しています。この記事では浴室利用を勧める候補にはせず、置き場所と充電場所を確認します。',
        sources: [['Marshall EMBERTON III公式仕様（英語）', 'https://www.marshall.com/fi/en/product/emberton-iii?pid=1006884'], ['Marshall EMBERTON III取扱説明書（英語PDF・5〜6ページ）', 'https://www.marshall.com/on/demandware.static/-/Library-Sites-SharedLibrary-Marshall/default/dwe0dadd06/images/cms-pages/user/Marshall_Emberton_III_OLM_R1_1_en.pdf']],
        items: [
          ['Sonos', 'Era 100 スマートスピーカー', '円筒をそのまま立てたような形で、棚に1台置くだけで済む大きさ。あとから2台にして左右に振り分けることもできます。'],
          ['Marshall', 'EMBERTON III', '持ち運べるスピーカー。使う環境と充電時の乾燥条件を確認してから、机や棚のどこに置くかを考えます。']
        ]
      }
    ],
    closing: '候補を絞るときは、使う場所を決め、本体寸法と必要な周囲の空間を照合し、配線と手入れの動作まで確かめる。この順番で考えると、棚に収まるかだけでは見えなかった条件を整理できます。照明にも台座や充電場所が必要なので、増やす前に置き場所を決めておきたいと思います。',
    related: ['hitorigurashi-no-heyazukuri', 'kagu-brand-no-erabikata']
  },

  {
    slug: 'hokuo-design-teiban',
    shareImage: 'article-share-room.jpg',
    cats: ['kitchen', 'interior'],   // 記事末尾のカテゴリ導線
    published: '2026-08-27',   // 公開日。動かさない（modified を足せば更新日だけ変えられる）
    modified: '2026-10-10',
    tag: '北欧', tagColor: 'green-deep',
    titleBase: '北欧デザインの定番、どれから買うか',
    desc: '北欧デザインの候補9点を、使う量・置く場所・椅子を使う姿勢から比べる。購入価格の一律の範囲を決めず、手持ちの道具に足す順番を考えます。',
    lead: '北欧デザインの定番が気になったら、食器、花瓶や小物、椅子のどこを変えたいかから考えます。すでに持っているものと比べる確認点を、サイトに掲載している9点と一緒に整理しました。',
    intentGuide: '何から検討するか迷っている人向けの候補集です。食器から始めるのは編集上の提案で、価格順や満足度の順位ではありません。全品の使用レビューではなく、購入する仕様・セット数・取扱条件は販売元で確認してください。',
    intro: [
      'まず、手持ちの食器を一つ出して、使う容量や収納の寸法を比べます。次に、花瓶や小物を置きたい場所を決める。椅子が必要なら、今のテーブルと使う姿勢に合うかを調べます。',
      'どこから買うかは、今足りないものと予算で変わります。名前を知っている定番でも、自分の暮らしに入る条件は商品ごとに確認します。'
    ],
    sections: [
      {
        h2: '1. 食器は、使う量と収納から比べる',
        body: 'よく飲むものと一度に注ぐ量を考え、手持ちの器と容量・高さを比べます。買い足すなら、色だけでなく個数と収納場所も確認します。同じシリーズでも、色やサイズによって購入できる組合せは変わります。',
        items: [
          ['iittala', 'ティーマ マグカップ 0.3L（アイスブルー）', '普段のマグと容量や持ち手の形を比べる候補です。購入する色と容量、取扱条件を確認します。'],
          ['HAY', 'TINT ワイングラス 2個セット', '手持ちの器と並べた色の組合せを考える候補。選択中のセット数と高さ、収納場所を照合します。']
        ]
      },
      {
        h2: '2. 花瓶と小物は、置く面を決める',
        body: '棚やテーブルの空いている面を測り、花を挿した状態も含めて高さを考えます。キャンドルホルダーは対応するキャンドルと設置・使用条件を確認します。形を飾ることと、火を使うことを分けて考えてください。',
        sources: [['Iittala・Alvar Aalto Collection 120mmの製品情報（英語）', 'https://www.iittala.com/en-gb/home-decor/vases-plant-pots/vases/alvar-aalto-collection-vase-120mm-clear-1007039']],
        items: [
          ['iittala', 'アアルト ベース 120mm', '波形の口と置く面の関係を見たい候補。120mmの高さだけでなく、幅と花を入れる量も確認します。'],
          ['HOLMEGAARD', 'FLORA ベース ロングネック 24cm', '口の形と飾りたい花の長さを比べます。棚の上の余裕と、水を替える動作まで考えて選びます。'],
          ['ferm LIVING', 'Komo Mini Vases 3個セット', '小さな花瓶を並べて使いたい場合の候補。販売元でセット内容と各点の寸法を確認し、並べる面を確保します。'],
          ['Georg Jensen', 'NENDO ティーライト キャンドルホルダー', '置いた形を楽しむことと、火を使う条件を分けて検討します。対応するキャンドルと取扱説明を確認してください。']
        ]
      },
      {
        h2: '3. 棚の小物と椅子は、使う場所を分けて考える',
        body: '棚に飾る小物と体を支える椅子では、確認する条件が違います。椅子は座面高や奥行き、テーブルとの関係を比べ、可能なら試座します。メーカー資料ではCH24はハンス・J・ウェグナー、セブンチェアはアルネ・ヤコブセンのデザインと確認できますが、来歴から自分の座り心地や使用年数まで決まるわけではありません。修理や張替えは購入品を扱う販売店に対応範囲を確認します。',
        sources: [['Carl Hansen & Søn・CH24のデザイナー情報（英語）', 'https://www.carlhansen.com/en/at/collection/chairs/dining-chairs/ch24/ch24-walnut-oil-natural-cord/variant/6906'], ['Fritz Hansen・Series 7のデザイナー情報（英語）', 'https://www.fritzhansen.com/en/categories/by-series/series%207/3107fru?market=gb&sku=3107FRU-CA855-STR983-CST_46-FN-LN-FS-LCN']],
        items: [
          ['KAY BOJESEN DENMARK', 'Monkey Mini（モンキー ミニ ブラック）', '棚に置く小物としての候補。選択中のサイズと色、安定して置ける面を確認します。'],
          ['Carl Hansen & Søn', 'CH24 Yチェア オーク／オイル仕上げ SH45cm', 'テーブルの高さと座面高、肘掛けの位置を比べます。木部の仕上げごとの手入れと、座面の修理窓口も購入前に確認します。'],
          ['Fritz Hansen', 'セブンチェア（正規）', '選択する仕様の座面高と仕上げを確認します。重ねて収納する場合は、その仕様の積載条件も確かめます。']
        ]
      }
    ],
    closing: '食器から小さく試すのも、必要な椅子から検討するのも選択肢です。使う量、置く面、体に合う寸法を確認し、送料や手入れも含めた予算で考えてみてください。定番という名前だけで、買う順番や満足する期間を決めない提案です。',
    related: ['kagu-brand-no-erabikata', 'burando-lineup-no-kijun']
  },

  {
    slug: 'fuyujitaku-no-dougu',
    shareImage: 'article-share-akibeya.jpg',
    cats: ['daily', 'fashion', 'kitchen'],   // 記事末尾のカテゴリ導線
    published: '2026-09-26',   // 公開日。動かさない（modified を足せば更新日だけ変えられる）
    modified: '2026-10-10',
    tag: '冬支度', tagColor: 'amber-deep',
    titleBase: '寒くなる前に揃えておきたい、冬支度の道具',
    desc: '本格的に寒くなる前に揃えておきたい冬支度の道具をまとめました。湯たんぽやルームシューズ、ウールのブランケットから、カシミヤのマフラー、温かいものを入れる台所の道具まで。',
    lead: '冬支度は、使う場面と手入れの手間を比べながら考えたいもの。布団を温める道具、室内で身に着けるもの、温かい飲みものを入れる器を、購入前の確認点と一緒に集めました。',
    intentGuide: '身のまわりの道具で冬に備えたい人向け。就寝前、室内、外出、台所の場面で使い方を整理します。湯たんぽの就寝前の取り出しを含め、購入品の取扱説明書を確認してください。掲載品すべての使用レビューではありません。',
    intro: [
      'この記事では、布団に入る前、室内で過ごすとき、外出するとき、台所で一杯淹れるときに分けて候補を見ます。必要なものは部屋の環境や過ごし方で変わるので、暖房器具の代わりになると一括して考えず、使う場面を決めて選びます。',
      '購入前には、準備と片付けまで続けられるかを確認したいと思います。湯たんぽならお湯を用意し、布団を温めたら取り出し、使用後に手入れするまで。衣類ならサイズと洗濯表示まで見ておくと、使い方を具体的に考えられます。'
    ],
    sections: [
      {
        h2: '布団を温めたら、湯たんぽを取り出して就寝する',
        body: 'NITEは、湯たんぽを就寝前に布団へ入れ、温まったら取り出すよう案内しています。カバーで包んでも、長時間体に触れると低温やけどを負うことがあります。入れるお湯の温度・量、カバー、手入れは購入品の説明書で確認してください。容量と準備・片付けの手間が、生活に合うかも確かめたいところです。',
        sources: [['NITE・低温やけどを防ぐ使い方（2023年11月28日）', 'https://www.nite.go.jp/jiko/chuikanki/mailmagazin/2023fy/vol441_231128.html']],
        items: [
          ['工房アイザワ', '18-8ステンレス ゆたんぽ 2.5L', '購入前に容量と注湯・手入れの方法を確認したい候補。布団を温める場合は就寝前に取り出し、入れたまま眠らない使い方を考えます。'],
          ['Francfranc', 'プードルボア ルームシューズ（グリーン）', 'フローリングの冷たさを足裏で受けないための一足。くすんだグリーンは、玄関に脱いだままでも部屋の色から浮きにくい色です。'],
          ['KLIPPAN', 'ウール シングルブランケット FLOOR', 'ソファで膝に掛けるのにちょうどいいシングルサイズ。ウールなので、寒い日にもう一枚重ねる役にも回せます。']
        ]
      },
      {
        h2: '出かけるときの首元と一枚目',
        body: '外出用は、手持ちのコートに重ねられるかを基準に考えます。マフラーの幅と長さ、ニットの身幅を確かめ、肌ざわりや洗濯表示も見て選びたいところです。必要な暖かさは気温や過ごし方で変わります。',
        items: [
          ['Johnstons of Elgin', 'カシミヤ タータンチェック マフラー', 'スコットランドの老舗のカシミヤ。無地のコートにタータンが一本入るだけで、冬の服の印象が変わります。'],
          ['SLOANE', '14G天竺 メリノウール クルーネック', 'シャツやコートに重ねる候補。重ね着する場合は、手持ちの服と身幅・袖まわりを比べて選びます。']
        ]
      },
      {
        h2: '温かいものを、台所で',
        body: '寒い季節は、温かい飲みものやご飯を口にする回数が自然と増えます。だから台所の道具は、毎日出すものを少しだけ良くするのがいちばん効きます。',
        items: [
          ['bodum', 'CHAMBORD ティーポット 1000ml', '淹れたい量と、使うカップの容量を照合したい候補。満水容量と普段使う湯量を分け、洗いやすさも確認します。'],
          ['Staub', 'ラ・ココット de GOHAN S（12cm）', '鍋でご飯を炊くための候補。炊飯量、対応熱源、調理中と食卓での置き場所を確認して選びます。'],
          ['Rörstrand', 'モナミ マグ 340ml', '濃いブルーの花柄は、冬の朝の白っぽい光の中でも沈まずに映えます。スープを入れても足りる容量です。']
        ]
      }
    ],
    closing: '使う場面を決めたら、準備と片付けの手間、収納場所、購入品の取扱条件を比べてみてください。湯たんぽは就寝前の取り出しまでを一つの動作に。身に着けるものは重ね方と手入れを、器は一度に使う量を確かめて選ぶ順番を提案します。',
    related: ['akibeya-no-totonoekata', 'hitorigurashi-no-heyazukuri']
  },

  {
    slug: 'gohan-no-dougu',
    shareImage: 'article-share-room.jpg',
    cats: ['kitchen'],   // 記事末尾のカテゴリ導線
    published: '2026-10-10',   // 公開日。動かさない（modified を足せば更新日だけ変えられる）
    tag: '台所', tagColor: 'green-deep',
    titleBase: '炊く・残す・食卓に出す、ご飯まわりの道具',
    desc: 'ご飯まわりの道具を、炊く・保存する・食卓に出すの3つの場面から考える候補集。土鍋と炊飯器、米びつと飯びつ、小鉢としょうゆさしを、熱源・炊く量・置き場所の確認点と一緒に並べます。',
    lead: '寒くなると、温かいご飯を炊く回数が増えるかもしれません。道具を替えるなら、炊く、残ったご飯をしまう、食卓に出すのどこを変えたいかを先に決めます。サイトに掲載している台所の道具から、場面ごとに選びました。',
    intentGuide: 'ご飯を炊く道具や、米・ご飯の保存道具を見直したい人向け。熱源、一度に炊く量、収納場所で候補を比べます。掲載品すべての使用レビューではありません。炊飯量や対応熱源は、購入する商品の販売ページと取扱説明書で確認してください。',
    intro: [
      '最初に、一度に炊く量と、使える熱源を確かめます。ガスの直火で炊く土鍋と、電源につなぐ炊飯器では、置き場所も手順も違います。今の炊飯器を置いている場所に、新しい道具が収まるかも測っておきます。',
      '炊いたあとのことも考えます。食べきれない分をどこに移すか、米をどこに置くか。ご飯の道具は、炊く1台だけでなく、前後の道具と一緒に見ると選びやすくなります。'
    ],
    sections: [
      {
        h2: '炊く：熱源と、一度に炊く量から',
        body: '土鍋はガス火で使うものが多く、IHや電子レンジに対応するかは商品ごとに違います。長谷園のかまどさん三合炊きは、販売ページで白米3合まで・玄米1〜2合まで、ガス直火用と案内されています。使い始めに目止めが必要とされている点も、購入前に知っておきたいところです。電気で炊く道具を選ぶなら、コンセントの位置と蒸気の逃げる上の空間を確認します。',
        items: [
          ['長谷園', 'かまどさん 三合炊き', 'ガスの直火で炊く伊賀焼の炊飯土鍋。炊く量が3合までに収まるか、コンロの五徳に載る大きさかを先に照合したい候補です。'],
          ['Vermicular', 'ライスポットミニ', '鋳物ホーロー鍋を内鍋にした炊飯器。炊ける量と設置に必要な寸法、蒸気の出る位置を販売ページで確認してから置き場所を決めます。']
        ]
      },
      {
        h2: '残す：米と、炊いたご飯の置き場所',
        body: '米びつは入れる量と置く場所の湿気、飯びつは一度に移すご飯の量で選びます。桐や素焼きは水分を吸ったり吐いたりする素材とよく言われますが、保存できる期間を道具だけで決めることはできません。ご飯は早めに食べきるか冷凍するかを、普段の量に合わせて考えます。',
        items: [
          ['東屋', '桐の米びつ 5kg', '無垢の桐材を釘を使わずに組んだ米びつ。5kgの袋がそのまま空けられるか、置く棚の奥行きと高さが足りるかを測っておきたい道具です。'],
          ['かもしか道具店', '陶の飯びつ ふつう（約1.5合）', '炊いたご飯を移しておく萬古焼の飯びつ。約1.5合の容量が、一回に残す量と合うかで選びます。']
        ]
      },
      {
        h2: '食卓に出す：小さな器と調味料',
        body: '炊く道具を替えたら、食卓の小物も一つ見直す選択肢があります。小鉢は副菜を盛る量、しょうゆさしは容量と注ぎ口の形を比べます。毎日出しっぱなしにするものは、洗いやすさも確かめておきます。',
        items: [
          ['iittala', 'カステヘルミ ボウル 230ml', '粒の模様が並ぶガラスの小鉢。230mlが漬物や副菜を盛る量に合うかを、手持ちの器と比べてみたい候補です。'],
          ['白山陶器', 'G型しょうゆさし（L）', '1958年から形を変えていない波佐見焼のしょうゆさし。容量と、注ぎ口を洗える形かどうかを確認して選びます。']
        ]
      }
    ],
    closing: '炊く量と熱源を決め、残すご飯と米の置き場所を考え、食卓に出す器を一つ足す。この順番で見ると、道具が増えすぎずに済みます。土鍋の目止めや炊飯器の設置条件など、使い始める前の手順も購入前に確かめておきたいと思います。',
    related: ['fuyujitaku-no-dougu', 'ii-mono-no-kijun']
  },

  {
    slug: 'fuyu-no-oto-no-dougu',
    shareImage: 'article-share-heya-2jiku.jpg',
    cats: ['gadget'],   // 記事末尾のカテゴリ導線
    published: '2026-10-24',   // 公開日。動かさない（modified を足せば更新日だけ変えられる）
    tag: '音', tagColor: 'purple-deep',
    titleBase: '冬の夜に部屋で音を流す、ラジオ・スピーカー・イヤホン',
    desc: '冬の夜に部屋で音を流す道具を、置いて鳴らす・部屋を移りながら鳴らす・自分の耳だけで聴くの3つの場面に分けた候補集。テーブルラジオ、ポータブルスピーカー、ワイヤレスイヤホンとヘッドホンを、置き場所と電源の確認点と一緒に並べます。',
    lead: '日が短くなると、部屋でラジオや音楽を流す時間が長くなるかもしれません。音の道具を選ぶなら、どこで鳴らすか、誰と聴くかを先に決めます。サイトに掲載しているラジオ、スピーカー、イヤホンから、場面ごとに選びました。',
    intentGuide: '部屋で使う音の道具を探している人向け。置き場所、電源の取り方、まわりに音を出すかどうかで候補を比べます。掲載品すべての使用レビューではありません。対応する接続方式や再生時間、防水の等級は、購入する商品の販売ページと取扱説明書で確認してください。',
    intro: [
      '最初に決めるのは、音を出す場所が1か所か、部屋を移るかです。リビングの棚に置きっぱなしにするなら、コンセントの位置と棚の奥行きを測ります。台所や寝室にも持ち歩くなら、バッテリーで鳴らせるかどうかが分かれ目です。',
      'もう一つは、家族や隣の部屋に音を出してよい時間かどうか。夜に一人で聴く時間が長いなら、スピーカーではなくイヤホンやヘッドホンを選ぶ考え方もあります。'
    ],
    sections: [
      {
        h2: '置いて鳴らす：棚の一段に収まるか',
        body: '据え置きのラジオやスピーカーは、幅と奥行き、電源ケーブルの取り回しを先に確かめます。ラジオを聴くなら受信する放送の種類、スマートフォンから流すならBluetoothやWi-Fiのどちらでつなぐかも、販売ページで見ておきたいところです。',
        items: [
          ['Tivoli Audio', 'Model One BT テーブルラジオ', 'つまみ3つで操作するAM/ワイドFMのテーブルラジオに、Bluetoothスピーカーの機能を足した1台。幅21.3cmが、置きたい棚の内寸に収まるかを測ってから考えたい候補です。'],
          ['Sonos', 'Era 100 スマートスピーカー', 'ボタンの目立たない円筒形のスピーカー。1台で棚に置くか、あとから2台にして左右に振り分けるかで、置き場所の取り方が変わります。']
        ]
      },
      {
        h2: '部屋を移りながら鳴らす：バッテリーと防水の等級',
        body: '持ち運ぶスピーカーは、1回の充電で鳴らせる時間と、水まわりで使えるかを比べます。防水の等級が高くても、水で洗ってよいか、濡れたまま充電してよいかは別の話です。取扱説明書の条件を確認してから、台所や洗面所に置く使い方を考えます。',
        items: [
          ['LEXON', 'Tykho 3 FMラジオ ワイヤレススピーカー', 'FMラジオとBluetoothスピーカーをまとめた幅14cmの小型機。防滴仕様で、バッテリーは最大20時間と案内されているので、台所に持ち込む使い方と照らし合わせたい候補です。'],
          ['Marshall', 'EMBERTON III', 'ギターアンプを思わせる形のポータブルスピーカー。IP67の防塵・防水仕様でも、流水で洗わず、乾かしてから充電する点は購入前に押さえておきます。'],
          ['Bang & Olufsen', 'Beosound A1', '丸いアルミニウムの本体にレザーストラップを付けたスピーカー。リンク先の現行品は第3世代でIP67なので、世代の違いと充電の条件を確かめて選びます。']
        ]
      },
      {
        h2: '自分の耳だけで聴く：夜の時間と装着感',
        body: '夜に音を出しにくい部屋なら、イヤホンかヘッドホンが候補になります。耳に入れるか、耳を覆うか、ケースをどこに置くか。ノイズキャンセリングの有無や連続再生時間は商品ごとに違うので、使う時間の長さと合わせて比べます。',
        items: [
          ['Marshall', 'Motif II A.N.C. ノイズキャンセリングイヤホン', 'ノイズキャンセリング付きの完全ワイヤレスイヤホン。片耳約4.31gで、ケースと合わせてノイズキャンセリングをオンにしたまま約30時間という仕様が、使う時間に足りるかを見たい候補です。'],
          ['Nothing', 'Headphone(a)（ピンク）', '半透明のパーツにくすんだピンクを合わせた、耳を覆うワイヤレスヘッドホン。長く着けるなら、重さと側圧を販売ページの情報や店頭で確かめたいところです。'],
          ['Beats', 'Solo Buds ワイヤレスイヤフォン', 'ケースが小さいワイヤレスイヤフォン。4色の展開があり、ノイズキャンセリングの有無や再生時間は上の2つと違うので、用途を決めてから比べます。']
        ]
      }
    ],
    closing: '音を出す場所を1か所に決めるか、部屋を移るかを先に考え、夜に一人で聴く時間が長ければイヤホンやヘッドホンも並べて比べる。置き場所の寸法、電源の取り方、防水の条件を確かめてから選ぶ順番を提案します。',
    related: ['hitorigurashi-kaden-akari', 'akibeya-no-totonoekata']
  }
];

const ARTICLE_TITLES = {
  'zakka-no-mikata': '部屋と服のあいだで選ぶ、デザイン雑貨の見方',
  'trend-komono-rule': '強い色や柄の小物を、いつもの部屋や服に合わせる3つの試し方',
  'ii-mono-no-kijun': '実際に買ってよかったものに共通する、「良いモノ」の選び方',
  'zakka-no-asobigokoro': '小さな雑貨で、柄や形の遊び心を試す',
  'kagu-brand-no-erabikata': '家具を比べるときの3つの確認点',
  'burando-lineup-no-kijun': '定番から知らないブランドまで、モノを選ぶときの3つの視点',
  'gift-no-erabikata': 'プレゼント選びで見ている3つの基準',
  'hitorigurashi-no-heyazukuri': '一人暮らしの部屋づくりで最初に決める3つのこと',
  'akibeya-no-totonoekata': 'ソファは動かさない。秋の部屋を小物で整える4つの順番',
  'fuyujitaku-no-dougu': '寒くなる前に揃えておきたい、冬支度の道具',
  'hitorigurashi-kaden-akari': '小さな部屋で検討したい、家電と灯り'
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
  const shareImage = r.shareImage || 'read-editorial-cover-v2.jpg';
  const shareImageUrl = `${ORIGIN}/images/${shareImage}`;
  const shareImageAlt = `${r.title}のイメージ写真`;

  const sections = r.sections.map((s) => `<h2>${esc(s.h2)}</h2>
<p>${esc(s.body)}</p>
${s.sources ? `<p>確認資料：${s.sources.map(([label, href]) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`).join(' ／ ')}（2026年10月10日確認）</p>\n` : ''}<div class="grid grid--article">
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
        image: shareImageUrl,
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
        // 商品一覧は通常のItemList。単一商品向けProductスニペットとして扱わない。
        itemListElement: all.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${p.brand} ${p.name}`
        }))
      }
    ]
  };

  const html = `<!DOCTYPE html>
<html lang="ja">
${head({ title: fullTitle, desc: r.desc, url, ogType: 'article', vparam, ld, ogImage: shareImageUrl, ogImageAlt: shareImageAlt })}
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
<span class="article__date">${r.modified ? `公開 ${disp(r.published)} · 更新 ${disp(r.modified)}` : disp(r.published)}</span>
</div>

<h1>${esc(r.title)}</h1>

<figure class="article__hero"><img src="/images/${shareImage}" alt="${esc(shareImageAlt)}" loading="eager" /><figcaption class="article__hero-caption">記事の内容をイメージした写真。SNSで共有するとこの画像が表示されます。</figcaption></figure>

<p class="article__lead">${esc(r.lead)}</p>

<aside class="article__guide" aria-label="この記事で整理すること"><b>この記事で整理すること</b><p>${esc(r.intentGuide)}</p></aside>

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
${adSlot(AD_BY_PAGE[r.slug], `article-${r.slug}`)}
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
