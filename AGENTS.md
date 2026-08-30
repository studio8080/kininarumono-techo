# AGENTS.md — 気になるモノ手帖

このリポジトリで作業するAIエージェント向けの引き継ぎ資料。**着手前に必ず全部読むこと。**
デザイン規約は別ファイル [DESIGN.md](DESIGN.md) にある。UIを触るならそちらも必読。

---

## 1. これは何か

デザインの良い雑貨・インテリア・ガジェットを紹介する、個人運営のアフィリエイト・キュレーションサイト。
運営者は「みかんココ」。楽天アフィリエイトとA8.netで収益化している**本番稼働中のサイト**。

| 項目 | 値 |
|---|---|
| 公開URL | https://kininarumono.jp （`kininarumono-techo.web.app` も同じサイトを指す） |
| リポジトリ | https://github.com/studio8080/kininarumono-techo （public） |
| ローカル | `H:\共有ドライブ\ここ企画\案件\気になるモノ手帖\kininarumono-site` |
| ホスティング | Firebase Hosting（プロジェクトID `kininarumono-techo`、無料Sparkプラン） |
| GitHubアカウント | `studio8080`（2026-08-27に `mikan-koko` から譲渡） |
| Googleアカウント | `studio@kokokikaku.com`（2026-08-27に `mikan@kokokikaku.com` から移譲。GCPプロジェクトIDは変えていない） |

同じ親フォルダに `_zip展開直後の旧コピー_20260805/` がある。**これは配布zipの未編集コピーで、現行とは無関係。** 中身は本リポジトリに完全に取り込まれているので消してよい（判断は運営者に確認すること）。

---

## 2. 技術スタック

**ビルドステップは無い。** npm も bundler も使っていない。素のHTML/CSS/JSを直接編集して `firebase deploy` するだけ。

```
public/
├─ index.html      … 全マークアップ + SVGモチーフのスプライト（インライン）
├─ css/style.css   … 全スタイル
├─ js/main.js      … 商品データ(PICKS) + カード描画 + 絞り込み + 演出
├─ images/         … 商品写真3点 + ogp.png
├─ 404.html / robots.txt
firebase.json      … Hosting設定（publicを配信、css/jsに max-age=86400）
.firebaserc        … プロジェクトID
```

外部依存はCDNから3つだけ。いずれも `index.html` の `<head>`。
- Google Fonts（Dela Gothic One / Zen Maru Gothic / Outfit）
- YakuHanJP（和文約物の詰め）

---

## 3. 絶対に守ること

### 3-1. アフィリエイトリンクを絶対に捏造しない

`PICKS` の `url` は運営者のアフィリエイトIDが埋め込まれた実リンク。形式は2種類ある。

- `https://a.r10.to/xxxxxx` … 楽天の短縮リンク（初期10件）
- `https://hb.afl.rakuten.co.jp/hgc/<ID>/_RTroom06836859_<商品ID>_pc?pc=<商品URL>` … 楽天ROOM経由

**それらしいURLを推測で書いてはいけない。** リンク切れか、最悪まったく別の商品や他人のIDに飛ぶ。収益とユーザーの信頼が直接かかる。

新しい商品を追加するときは、運営者の楽天ROOM（https://room.rakuten.co.jp/totonou_note/items ）の**個別商品ページ**を開き、`楽天市場で見る` のリンクを取得する。

> **取り違え注意**: 同じページに `_RTroom06836859rp_` （`rp` 付き）のリンクが多数ある。これは「同じショップの関連商品」で**別商品**。本命は `rp` の付かない `_RTroom06836859_<商品ID>_pc` 1本だけ。商品IDは詳細URL `/totonou_note/1700<9桁>xxx` の9桁部分と一致する。

### 3-2. 楽天の商品画像をスクレイピングしない

ショップ側の著作物。ページから拾って `public/images/` に置くのは不可。
正規ルートは**楽天ウェブサービス（Rakuten Web Service）のAPI**。アプリID登録と規約確認が必要で、**まだ未着手**。

現状の `PICKS` はショップCDN（`shop.r10s.jp` / `tshop.r10s.jp`）の画像URLを直接参照している。
**どの画像を選ぶかには規約上の制約がある**（ランキング/割引/クーポン/受賞バッジ、比較表、コラージュは不可）。
判断基準の本体は親フォルダの `CLAUDE.md` 3章。実際に踏んだ失敗例は7章の
「コスメ系は商品を選ぶ前に画像ギャラリーを見る」を先に読むこと。

### 3-3. アクセシビリティ（WCAG AA）を落とさない

過去に、白文字 × アンバー/ティールで**コントラスト比2.07**という不適合を作り込んだ実績がある。カテゴリ色には必ず用途別の変数を使う（DESIGN.md 参照）。

**初期表示だけ測って合格としないこと。** チップの選択状態、ホバー、絞り込み後など、**状態を変化させてから**測る。過去のバグはまさにそこで見落とした。

### 3-4b. 商品や記事を足したら sitemap.xml の lastmod を直す

`public/sitemap.xml` の `lastmod` は手書き。**更新しても直さないと古い日付のまま残る**。
Googleは lastmod を再クロールの優先度判断に使うため、放置すると新しい内容が拾われにくい。

- 商品を追加した → トップの `lastmod` を当日に
- 記事を追加/改稿した → その記事の `lastmod` を当日に。`<url>` ごと追加も忘れずに
- **実際に変えていない日付を今日にしない**（嘘のlastmodは信用を落とすだけ）

### 3-4. `?v=` を必ず上げる

`firebase.json` が css/js に `max-age=86400` を設定している。`index.html` の

```html
<link rel="stylesheet" href="css/style.css?v=9" />
<script src="js/main.js?v=9" defer></script>
```

の数字を**css/jsを変更したら必ず両方上げる**。上げ忘れると、再訪問者に最大24時間「新しいHTML × 古いCSS」が配信されて表示が壊れる。

### 3-4c. OG画像は「同名で上書き」しない

`?v=` はcss/js用で、**OG画像には効かない**。X・Facebook/Threads・LINEはそれぞれ独自にOG画像を
キャッシュし、クエリ付きURLを嫌う実装もあるため、**差し替えるときは必ずファイル名を変える**
（`ogp-2026-08.jpg` のように年月を入れる）。同名で上書きすると各SNSに古い画像が数日〜数週間残る。

ファイル名を変えたら、**トップ + `read/*.html` の6ページすべて**で次の3か所を直す。
記事ページはJSON-LDにも `image` があるので忘れやすい。

- `og:image`
- `twitter:image`
- 記事ページのJSON-LD `"image"`

`og:image:alt` にキャッチコピーを書いているので、**コピーを変えたらaltも直す**。

### 3-4d. OG画像の作り直し方

```bash
firebase emulators:start --only hosting   # 別ターミナルで起動しておく
node tools/build-ogp.mjs
```

`tools/ogp-source.html` を1200x630でレンダリングして `public/images/ogp-YYYY-MM.jpg` を書き出す。
ソースHTMLは **`public/css/style.css` をそのまま読む** ので、カテゴリ色やフォントを変えても
OG画像だけ旧デザインで取り残されない。Pillowで直接描くと色・フォント・影を二重管理することになる。

見出しは `--display`（Dela Gothic One）ではなく **`--jp`（Zen Maru Gothic 900）**。
サイトの `h1,h2` がそちらなので、間違えると別のサイトに見える。

### 3-8. PICKS を触ったら カテゴリページを再生成する

`/category/<cat>`（7本）は **`tools/build-category.mjs` が生成した静的HTML**で、
商品カードがHTMLに焼き込まれている。生成物はリポジトリにコミットしてある。

```bash
node tools/build-category.mjs
node tools/build-roundup.mjs   # まとめ記事も PICKS を参照している（3-10）
```

- **`public/category/*.html` を直接編集しない。** 次の再生成で消える。
  文言を直すなら `tools/build-category.mjs` の `COPY` を編集して再生成する。
- PICKS に商品を足した／消した／画像やブラーブを直したら、必ず再生成してコミットする。
- 忘れた場合は **デプロイのワークフローが差分を検出して落ちる**
  （`.github/workflows/firebase-hosting-merge.yml` の「Check generated category pages are up to date」）。
  落ちたらローカルで上のコマンドを実行してコミットし直す。
- 何度実行しても同じ出力になる（冪等）。sitemap は未登録のカテゴリURLだけ追記し、
  既存の `lastmod` は書き換えない（3-4b の「嘘の lastmod を作らない」に合わせている）。

なぜ静的生成なのか: トップは商品をJSで描画し、初期表示6件以外は `display:none` にしている。
この状態だと「iittala ティーマ マグカップ」のような指名検索の受け皿が1URLも無い。
カテゴリページはJSが動かなくても本文として読める形にして、検索の入口を7本増やしている。

**カード側の注意**: 生成するカードのマークアップは `main.js` の描画と揃えること。
とくに `data-brand` / `data-name` / `data-cat` は `main.js` の `affiliate_click` 計測が読むので必須。
`reveal` クラスは付けない（JSが落ちると `opacity:0` のまま本文が消えるため）。

**`applyLimit()` の適用範囲**: `main.js` の「もっと見る」による件数制限は `#pickGrid` があるページ
（＝トップ）に限定してある。ここを全ページ対象に戻すと、「もっと見る」ボタンが無いカテゴリページで
7件目以降が `display:none` のまま二度と表示できなくなる。実際に作り込んで直した。

### 3-10. まとめ記事（/read/ の生成ページ）を直接編集しない

`/read/` には2種類ある。**混ぜないこと。**

| 種類 | 例 | アフィリエイトリンク | 実体 |
|---|---|---|---|
| 選び方エッセイ | `zakka-no-mikata` など8本 | **含まない** | 手書きのHTML |
| まとめ | `gift-3000en-ika` など3本 | **含む** | `tools/build-roundup.mjs` が生成 |

```bash
node tools/build-roundup.mjs
```

- **生成されたまとめ記事のHTMLを直接編集しない。** 次の再生成で消える。
  文言も商品も `tools/build-roundup.mjs` の `ROUNDUPS` を編集して再生成する。
- 商品は `[brand, name]` で PICKS を引いている。**PICKSから消えていると生成時にエラーで落ちる。**
  週次の在庫監査（`check-stock.mjs --fix`）が販売終了品を消したときに、
  記事側だけリンク切れで残るのを防ぐためにわざとそうしてある。落ちたら記事から外すか差し替える。
- 見出しの「N選」は商品点数から自動で作る。手書きにすると増減でズレる（実際にズレた）。
- 商品カードのマークアップは `tools/lib/site.mjs` の `cardHtml()` に集約してある。
  `build-category.mjs` と共有していて、`data-brand` / `data-name` / `data-cat` は
  `main.js` の `affiliate_click` 計測が読むので消さない。

**開示の位置**: まとめ記事は商品リンクを含むので、3-6のとおり**最初の商品カードより前**に
`.disclosure` を置いている（実測で197px上）。セクションを組み替えるときも順序を崩さないこと。
トップの「読みもの」セクションの説明文も、エッセイとまとめの違いを書いてある。
まとめ記事を増減させたらこの文言も実態に合っているか確認する。

**記事を増やしたとき**: `tools/build-roundup.mjs` の `ROUNDUPS` に足すと
`public/read/<slug>.html` と sitemap は自動で増えるが、**トップページの
「読みもの」カードは手書き**なので `public/index.html` に自分で足すこと。

### 3-11. 線画のSVGアイコン／図案を使わない（2026-08-27 本人指定）

**装飾目的の線画SVG・ピクトグラムは、サイトでもSNS用の画像でも一切使わない。**
どれだけ配色を揃えてもフリー素材のアイコンに見えて、サイト全体の質を下げる。
Pinterestのピンで図案を3つ並べたところ本人から「安っぽい」と指摘され、全面的に作り直した。

- `index.html` にあった `<symbol>` スプライト29種は **2026-08-27 に削除済み**。
  1件も `<use>` されておらず、8.8KB / 185行の死にコードだった。復活させない。
- 面を持たせたい / 空きを埋めたいときは、カテゴリ色のベタ面・方眼・網点・紙のグレインを使う（DESIGN.md 4章・7章）。
- 見出しの強さは図案ではなく**巨大な和文見出し（`--jp` = Zen Maru Gothic 900）**で出す。`--display`（Dela Gothic One）は主見出しには使わない（DESIGN.md 4章）。
- 商品を見せるときは必ず**写真**。SNS用の画像は `public/images/` のサイト自前のムード写真・イラストを使う。

**対象外**: ハンバーガー、矢印、閉じる、SNSロゴなどの**UI機能アイコン**。
これは装飾ではなく操作の記号なので必要なら使ってよい。

`PICKS` の `motif:"m-xxx"` フィールドはまだ残っているが、**どこからも参照していない**。
埋めても害は無いが意味も無い。

### 3-9. index.html の Pinterest 認証タグを消さない

トップの head にこれがある。

```html
<meta name="p:domain_verify" content="2a135f6c43dd72d10c11a3ea13ade90d" />
```

kininarumono.jp の Pinterest サイト認証（claim）用で、2026-08-27に認証済み。
**消すと認証が外れる**。外れると、サイトへリンクしているピンにアカウント名が出なくなり、
サイト宛ピンのアナリティクスも取れなくなる。head を整理するときに巻き込みやすいので注意。
Pinterestが見にくるのはトップだけなので、read/*.html や category/*.html には不要。

（DNSのTXTレコードでも認証できるが、kininarumono.jp のDNSはXserverにあり
Firebase Hosting向けのレコードと同居しているため、触らずに済むタグ方式を選んでいる。）

### 3-5. `prefers-reduced-motion` を尊重する

演出を追加したら必ず `@media (prefers-reduced-motion: reduce)` にも対応を書く。

### 3-7. A8の広告コードは「掲載サイト」を必ず確認してから取る

A8の広告リンク作成画面には「掲載サイト」のセレクトがあり、このアカウントには
4つ登録されている。**気になるモノ手帖は `wid=004`。**

| wid | サイト |
|---|---|
| 001 | note（しょうた＠ここ企画）※既定値 |
| 002 | 気になるモノ手帖（Pinterest） |
| 003 | 気になるモノ手帖（Instagram） |
| **004** | **気になるモノ手帖（このサイト）** |

**既定が001なので、何もしないと別サイトのコードが出る。**
しかも `a8mat`（クリック計測）もサイトごとに変わるため、取り違えると
インプレッションもクリックも全部よそのサイトに付く。

セレクトを変えて「広告リンクを表示」を押しただけでは**コードが再生成されない**
ことがある（選択は004なのに出力は001のまま、という状態を実際に踏んだ）。
確実なのはフォームごと送信する方法。

```js
const w = document.querySelector('select[name=websiteId]');
w.value = '004';
w.dispatchEvent(new Event('change', {bubbles:true}));
w.form.querySelector('input[name=prevWebsiteId]').value = '004';
w.form.submit();
```

**貼る前に必ず生成物の `wid=004` を目視で確認する。**
コードは画面から転記せず、テキストエリアの値を直接読み出すこと（転記ミスは計測不能に直結する）。

### 3-6. 広告・アフィリエイトの開示を「商品リンクより前」に置く

ステマ規制（景表法）は、一般消費者が広告だと**判別できる**ことを求める。
置いてあるだけでは足りず、**届く位置にあるか**で判断される。

このサイトの開示は2か所。

| 場所 | クラス | 役割 |
|---|---|---|
| ピック一覧の直前 | `.disclosure` | 商品カードを見る前に必ず目に入る |
| フッター | `.footer__legal` | サイト全体の説明 |

2026-08-19まではフッターだけだった。実測すると**最初の商品カードから4,104px下、
ページの96%地点**で、ピックを見て離脱する人には一度も見えていなかった。

- 商品リンクや広告枠を増やすときは、**開示がその前に来ているか**を必ず確認する
- 開示文の色を `--muted` まで薄くしない（読み飛ばされる薄さは「明瞭」ではない）。
  現在は `--ink-2` でコントラスト9.53:1
- A8などの広告枠には個別に `PR` ラベルを添える（`.pr-slot__label` / `.footer__ad-label`）

**掲載していないプログラムの開示文を書かない。** Amazonリンクが1本も無いのに
「Amazonのアソシエイトとして適格販売により収入を得ています」と掲げていた実例がある。
事実と異なる記載で、Amazonの運営規約でも景表法でも問題になる。開示文は**実態に追従させる**。

---

## 4. ローカル確認は Firebase エミュレータを使う

```bash
firebase emulators:start --only hosting     # http://127.0.0.1:5000
```

**`python -m http.server` を使わないこと。** `firebase.json` の `cleanUrls: true` を再現しないため、
本番と正規URLが逆になる。実際にこれで記事ページのURL設計を間違えた。

| | 拡張子なし `/read/xxx` | `.html` 付き |
|---|---|---|
| 本番 / エミュレータ | **200（正規）** | 301 |
| `python -m http.server` | 404 | 200 |

内部リンク・`og:url`・`canonical` はすべて**拡張子なし**で書く。

---

## 5. デプロイ手順

```bash
# 検証用（本番に影響しない一時URL・自動失効）
firebase hosting:channel:deploy design --expires 1d

# 本番
firebase deploy --only hosting

# 確認が済んだらプレビューチャンネルを消す
firebase hosting:channel:delete design --force
```

認証が切れていたら `firebase login --reauth`。**この再認証は対話的ターミナルでしか通らない**（AIエージェントの非対話シェルからは `Cannot run login in non-interactive mode` で失敗する）。運営者に実行してもらうこと。

`firebase login:list` は失効していても「ログイン中」と表示するので信用しない。`firebase projects:list` を叩いて実際に通るか確認する。

### 5-1. CIのデプロイ認証は Workload Identity Federation（鍵レス）

`main` へのpushで `.github/workflows/firebase-hosting-merge.yml` が走り、
`google-github-actions/auth@v2` が **Workload Identity Federation** でGCPに認証する。
サービスアカウントの鍵JSONもFIREBASE_TOKENも使っていない（旧 `FIREBASE_TOKEN` Secretは
残骸なので使わない・再登録しない）。

リポジトリのVariablesに入っている2つで動く:

| Variable | 値 |
|---|---|
| `WIF_PROVIDER` | `projects/810324229973/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider` |
| `WIF_SERVICE_ACCOUNT` | `firebase-adminsdk-fbsvc@kininarumono-techo.iam.gserviceaccount.com` |

**★この認証は「GitHubリポジトリのフルパス」に紐づいている。** サービスアカウントの
IAMポリシーに、こういう形のプリンシパルが `roles/iam.workloadIdentityUser` で入っている:

```
principalSet://iam.googleapis.com/projects/810324229973/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/studio8080/kininarumono-techo
```

つまり**リポジトリのオーナーや名前を変えると、この紐付けが一致しなくなりCIデプロイが必ず失敗する**。
リポジトリを移す・リネームするときは、必ずGCP側の以下2か所も直すこと（Cloud Console）:

1. サービスアカウント → 権限 → 上記プリンシパルの `attribute.repository/<owner>/<repo>` を新しい値に
2. Workload Identity プール → プロバイダ → 属性条件に `assertion.repository_owner == '...'` が
   あれば新しいオーナー名に

Variables自体もリポジトリ譲渡では引き継がれないので、譲渡後に再登録が必要
（値は上の表のとおり。秘密情報ではない）。

---

## 6. データモデル

商品は `public/js/main.js` の `PICKS` 配列。**2026-08-18時点で79件**、全件に実写真あり。

カテゴリは7つ（2026-08-18に4→7へ再編）。内訳はファッション19 / インテリア15 / ガジェット14 / 食器・キッチン10 / 文具・雑貨9 / コスメ・ケア6 / 日用品6。

```js
{ cat:"gadget",              // gadget|interior|kitchen|beauty|daily|goods|fashion
  motif:"m-cable",           // index.html のスプライト内 <symbol> のid
  brand:"Native Union",
  name:"POP CABLE USB-C 60W カールコード",
  price:"¥3,080〜",          // 通常価格。セール価格は書かない（期間終了で嘘になる）
  url:"https://a.r10.to/...",// 3-1参照
  img:"images/native-union.jpg", // 無ければ null → モチーフ表示
  blurb:"くるんと伸び縮みする…" }
```

- `img` があるカードは自動で2カラム占有の**フィーチャー扱い**になる（誌面のリズム用）
- 価格帯バッジ（¥ / ¥¥ / ¥¥¥）は `price` の数値から自動算出。手で書かない
- カテゴリのラベル・色は `main.js` 冒頭の `CAT` に集約

---

## 7. 過去に踏んだ罠

同じ穴に落ちないこと。

**インラインSVGの `<style>` に不等号を書くとCSSが全壊する**
`index.html` のスプライト内 `<style>` は raw text 要素ではないため、コメントに `<use>` と書いたらHTMLパーサーがタグとして解釈し、**CSSがルール0件でパースされ、全29図案が黒塗りになった。** あの中に `<` `>` を書かないこと。疑わしいときは `document.querySelector('svg style').sheet.cssRules.length` を見る。

**HTMLはキャッシュされる**
`?v=` を上げるのは css/js だけ。**HTML自体は別**。ブラウザで確認するときはURLにクエリを足すか強制再読み込みする。「直したのに反映されない」の原因はほぼこれ。

**View Transition の多重起動**
`document.startViewTransition()` の実行中に次のクリックが来ると `InvalidStateError` で未処理のPromise拒否になる。`main.js` の `vtBusy` ガードを外さないこと。

**スクリーンショットだけで判断しない**
プレビューの見た目だけでは寸法や重なりを誤読する。`getBoundingClientRect()` や `getComputedStyle()` で実測する。過去に「カード下半分が空洞」「装飾が本文に重なる」を実測で発見した。

**削除は検証の後**
スクリプトの挿入が失敗しているのに気づかず元ファイルを消して復旧に手間をかけた。`grep -c` などで結果を確認してから消す。

**HTMLのclassだけ残ってCSS定義が消える**
大きなCSS書き換えのあと、`.btn` `.btn--primary` `.btn--ghost` と `.topic-rail__track` の定義が失われ、
ヒーローの主要CTAとタグ群が「素のテキスト」で表示されていた。メディアクエリ内の上書きだけが
残っていたため気づきにくい。CSSを大きく触ったら次を必ず実行して照合すること。

```bash
node -e "const fs=require('fs');const h=fs.readFileSync('public/index.html','utf8'),c=fs.readFileSync('public/css/style.css','utf8');const u=new Set();[...h.matchAll(/class=\"([^\"]+)\"/g)].forEach(m=>m[1].trim().split(/\s+/).forEach(x=>x&&u.add(x)));const e=s=>s.replace(/[-\/\\^\$*+?.()|[\]{}]/g,'\\\$&');console.log([...u].filter(x=>!(new RegExp('\\\\.'+e(x)+'(?![\\\\w-])')).test(c)))"
```
※ `mo-b` `mo-a` `mo-i` はスプライト内 `style` で定義、`select` `read` `mood` はid/別名で当てているため、この4+3件は正常。

**`body{overflow-x:hidden}` は「はみ出し」を隠す**
`documentElement.scrollWidth === innerWidth` を見ても、要素が画面外にはみ出して切れている状態は検出できない。
各要素の `getBoundingClientRect().right > innerWidth` を個別に見ること。

**OG画像はデザイン刷新から取り残される**
`ogp.png` は2026-08-05に作ったきり一度も更新されず、リニューアル後も**旧デザインのまま
SNSに表示され続けていた**（キャッチコピーが「デザインで、毎日をアガる。」、カテゴリバッジが
旧4分類、ロゴが3つの丸のまま）。HTMLやCSSと違って**見た目の確認動線に乗らない**ので気づけない。
ヒーローのコピー・ロゴ・カテゴリ・ブランド色のどれかを変えたら、3-4dで作り直すこと。

**コスメ系は「商品を選ぶ前に画像ギャラリーを見る」**
楽天のコスメ系ショップは、ギャラリー画像そのものに販促テキストを焼き込んでいる店が非常に多い。
2026-08-18にLANEIGEのリップスリーピングマスクを載せようとして**ギャラリー17枚すべてがアウト**だった。
内訳は「第1位」「1000円OFFクーポン」「15%OFF」といったバッジ類と、
「唇が荒れる理由」「40.4%減少」のような効能訴求・グラフで、3章のNG項目に真正面から当たる。
結局その商品は掲載を見送った。

販促要素の少ない一枚を選ぶフォールバック（3章の但し書き）は使えるが、**コスメでは使わない方がよい**。
効能を示すテキストが画像内に残ると、投稿文で気をつけていても薬機法まわりのリスクが画像側に残るため。

手戻りを避けるには、**商品を決める前に画像を見る**。ギャラリーがクリーンなブランドを選ぶのが早い。
現時点で確認できているクリーンな例は `uka`・`SWAG`（公式ストアで、商品単体カットに文字を焼き込まない）。

**復刻・リプロダクトの線引き**
3章の「正規品のみ（リプロダクト/ジェネリック/〜風は不可）」は家具の意匠模倣を想定した規定だが、
アートポスターの復刻品のように判断が割れるものがある。2026-08-18にバウハウス1923年展ポスターの
復刻アートパネルで判断を仰ぎ、**外す**という結論になった。以後、復刻・リプロダクトを名乗る商品は
原則として載せない。迷ったら本人に確認する（質＞量）。

**固定ボタンはアフィリエイトCTAに重なる**
`.back-top` はスマホでカード右下の「楽天ROOMで見る」と重なっていた。収益リンクが押せなくなるので、
固定要素を足したら複数のスクロール位置で `a,button` との矩形交差を実測する。現在はスマホのみ左下に逃がしている。

---

## 8. 現状と残タスク

### 完了
- 商品32件、全リンク実在確認済み（商品ページに直接アクセスして200/301を確認）
- ポップ×エディトリアルのデザイン刷新、WCAG AA達成
- SVGモチーフ29種、版ズレ・網点の質感
- OGP画像、スクロール連動などの演出

### 未着手（優先度順）
1. **「読みもの」記事** — `index.html` の READ セクションは2件ともガワだけ（「準備中」「近日公開」）。アフィリンク不要で書けて、**楽天アフィリエイトのサイト登録で独自コンテンツとして効く**。最優先。
2. **商品写真** — 32件中29件が図案のまま。楽天ウェブサービスAPI（3-2）か運営者の撮影写真で置き換えるのが本筋。
3. **楽天アフィリエイトへのサイト登録** — 運営者本人の操作。サイトの中身が充実してから。
4. ~~Amazonアソシエイト~~ — 追わない方針。2026-08-19にサイトから開示文ごと撤去済み（README参照）。
5. 独自ドメイン（Firebaseコンソール → Hosting → カスタムドメイン）

### 運営者が自分でやること（エージェントは代行しない）
- 各種サービスへのログイン、アカウント設定変更
- アフィリエイトプログラムへの申請・メディア登録

---

## 9. 作業の進め方

1. UIを触るなら **DESIGN.md を先に読む**
2. セクション単位で進める。一度に全部作り変えない
3. プレビューチャンネルに出して、**スクリーンショットと実測の両方**で確認する
4. コントラストは状態を変えて測る（3-3）
5. `?v=` を上げる（3-4）
6. 本番デプロイ → 実URLを叩いて反映確認 → コミット＆push → プレビューチャンネル削除

コミットメッセージは日本語。何を直したかだけでなく**なぜそうしたか**を書く（既存のログを参照）。

---

## 10. 2026-08-06 Codex作業後の引き継ぎメモ

最新ローカル確認URL: `http://127.0.0.1:5178/?verify=21-final`。未デプロイ、未コミット。

この作業で大きく変わったこと:
- トップを `ITEM CURATION / DAILY DESIGN` の大きな背景ヒーローに再構築。
- `MOOD BOARD` / `EDITOR'S FILTER` / `HOW TO PICK` をスライドショー化。各スライドの生成イラストは背景として組み込み済み。
- 商品カードはカード番号を廃止し、投稿日 `2026.08.05` を表示。
- 商品一覧は初期6件表示、`.more-btn` で展開/折りたたみ。
- ブランドの横スクロール帯は削除。
- 右下にページトップへ戻る `.back-top` ボタンを追加。
- `?v=` は `21` まで更新済み。

新規/差し替え画像:
- `public/images/hero-pop-props.webp`
- `public/images/mood-standard.webp`
- `public/images/mood-room.webp`
- `public/images/mood-edge.webp`
- `public/images/mood-luxury.webp`
- `public/images/slide-mood-board.webp`
- `public/images/slide-editors-filter.webp`
- `public/images/slide-how-to-pick.webp`
- `public/images/editor-illustration.webp`（現在未参照。削除候補）

確認済み:
- `node --check public/js/main.js` OK
- CSS `{}` 数: open=218 / close=218 / balanced=True
- ローカルHTTPで `style.css?v=21` / `main.js?v=21` を確認
- `v=20` 残りなし

次にClaude Codeでやるなら:
1. ブラウザで `?verify=21-final` を見て、スライド上部余白・スマホ表示・トップ戻りボタンの重なりを目視/実測する。
2. 問題なければこの一連のデザイン変更をコミットする。
3. その後、最優先タスクはREAD記事の拡充。アフィリエイト審査向けに、リンクなしの独自記事を増やす。
4. 独自ドメインは、会社サブドメインより `kininarumono-techo.com` や `monotecho.jp` のような独立ドメインが推奨。ただし仮公開や会社企画として見せるなら `kininarumono.kokokikaku.com` も可。
---

## 11. 2026-08-17 GA4計測の設定状況

> 注：§8「現状と残タスク」は2026-08-06時点の記述で古い。商品は72件、読みもの記事は5本公開済み。

### 計測ID
`G-S4LRS2KCRZ`（プロパティ「気になるモノ手帖」／`a389817628p549228643`）。
`index.html` と `public/read/*.html` の全ページに gtag スニペットあり。

### 送信しているカスタムイベント（`public/js/main.js` の `track()`）
| イベント | パラメータ |
|---|---|
| `affiliate_click` | `item_brand` / `item_name` / `item_category` / `page_kind` |
| `sns_click` | `sns_name` |
| `share_click` | `share_to` |
| `article_open` | `article_path` |

`page_kind` は `/read/` 配下なら `article`、それ以外は `top`。
GA4のパラメータ値は100文字上限なので `track()` 内で `slice(0,100)` している。

### 登録済みのカスタムディメンション（すべて範囲=イベント）
商品ブランド/`item_brand`、商品名/`item_name`、商品カテゴリ/`item_category`、
流入元ページ種別/`page_kind`、SNS名/`sns_name`、シェア先/`share_to`、記事パス/`article_path`

### キーイベント登録（2026-08-19 完了）

`affiliate_click` をキーイベントとして登録済み。

このプロパティのUIには「新しいキーイベント」ボタンが無く、
**管理 → データの表示 → イベント → 最近のイベント** の一覧で
イベント名の左の**星をクリックする方式しかない**。
この一覧は処理済みデータを使うため、**イベント初回発火から反映まで最大24時間**かかる。
2026-08-18にテストイベントを発火させ、翌日に一覧へ現れたところで星を付けた。

今後 `sns_click` や `share_click` もキーイベントにしたくなったら、同じ手順を踏む。
新しいイベントを追加した当日には登録できないことを見込んでおくこと。

### 注意
- 動作確認でアフィリエイトリンクを実際にクリックしない。楽天の自己クリックになる。
  イベントだけ発火させたいときは、本番ページのコンソールで
  `gtag('event','affiliate_click',{...})` を直接呼ぶ。
- ブラウザの開発者ツールで `google-analytics.com/g/collect` が **503** に見えることがあるが、
  リアルタイムレポートには届いている。ステータスコードだけで失敗と判断しない。

---

## 12. 2026-08-17 Search Console のインデックス状況

**sitemap.xml の6URLはすべてインデックス登録済み**（URL検査で1件ずつ確認）。
サイトマップ `/sitemap.xml` も最終読み込み2026/08/16・ステータス「成功しました」・検出6ページ。

### 罠：ページのインデックス登録レポートは古い
`インデックス作成 → ページ` のレポートは「未登録0／登録済み3」と表示するが、
**最終更新日が2026/08/10で止まっている**。実際には6件すべて登録済み。
このレポートの数字だけを見て「3ページがGoogleに知られていない」と判断すると誤る。
**個別のURL検査が唯一の正確な確認方法。**
