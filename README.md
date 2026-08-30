# 気になるモノ手帖

**公開URL: https://kininarumono.jp**

- リポジトリ: https://github.com/studio8080/kininarumono-techo
- Firebase コンソール: https://console.firebase.google.com/project/kininarumono-techo/overview

デザインでアガる雑貨・インテリア・ガジェットのキュレーションサイト。
静的サイト（ビルド不要）。**GitHub → Firebase Hosting** で公開済み・稼働中。

> **AIエージェントで作業する場合は [AGENTS.md](AGENTS.md) を必ず先に読むこと。**
> UIを触るなら [DESIGN.md](DESIGN.md) も必読。アフィリンクの扱いなど、
> 壊すと収益に直結するルールが書いてあります。

## 構成
```
kininarumono-site/
├─ public/                 ← Firebase Hosting の公開ディレクトリ
│  ├─ index.html           ← トップページ（1枚もの）
│  ├─ 404.html
│  ├─ robots.txt
│  ├─ css/style.css        ← 全スタイル
│  ├─ js/main.js           ← 商品データ(PICKS)・描画・絞り込み・演出
│  └─ images/              ← 商品写真3点 + ogp.png
├─ firebase.json           ← Hosting 設定（public を配信）
├─ .firebaserc             ← Firebase プロジェクトID（kininarumono-techo）
├─ AGENTS.md               ← ★ AIエージェント向け引き継ぎ資料
├─ DESIGN.md               ← ★ デザイン規約
├─ .gitignore
└─ README.md

※ SVGモチーフ29種は index.html 冒頭にインラインしたスプライト。
```

## デザイン方針
詳細は **[DESIGN.md](DESIGN.md)**。要点だけ:
- 紙色の上に「墨の輪郭＋ぼかさないハード影」を通したステッカーの言語。影にblurを入れない。
- カラー: 紙白 `#FBF7EF` ／ 墨 `#17130E` ／ カテゴリ4色（ガジェット=パープル・インテリア=ティール・雑貨=コーラル・ファッション=アンバー）。
  カテゴリ色は面・文字・淡面で**3つ1組**。文字に面用の色を使うとWCAG AAを割る。
- フォント: 見出し `Dela Gothic One` ／ 本文UI `Zen Maru Gothic` ／ 欧文 `Outfit` ／ 約物 `YakuHanJP`。
- `prefers-reduced-motion` 対応。WCAG AA は実測で全項目通過（最低4.58）。

## セレクト商品の編集
`public/js/main.js` の `PICKS` 配列を編集します。現在32件。
各要素: `cat`(gadget/interior/goods/fashion) / `motif`(図案のid) / `brand` / `name` / `price` / `url`(アフィリンク) / `img`(画像パス or null) / `blurb`。
- アフィリンクは `rel="sponsored noopener nofollow"` を付与済み。
- **`url` は絶対に推測で書かないこと。** 楽天ROOMの個別ページから取得する（AGENTS.md 3-1）。
- `price` は通常価格。セール価格は期間終了で嘘になるので書かない。
- 画像がない商品は、`motif` のSVG図案＋カテゴリ色の面で表示されます。
- 価格帯バッジ（¥/¥¥/¥¥¥）は `price` から自動算出。手で書きません。
- **css/js を変更したら `index.html` の `?v=` を必ず上げること**（AGENTS.md 3-4）。

---

## 公開手順（実施済み・再構築時の参考）

現在は下記が完了済みです。日常のデプロイは `firebase deploy --only hosting` だけ。
検証は `firebase hosting:channel:deploy design --expires 1d` で一時URLに出してから。

### 1. GitHub に置く
```bash
cd kininarumono-site
git init
git add .
git commit -m "init: 気になるモノ手帖 site base"
# GitHub(みかんココ)で空リポジトリを作成してから：
git branch -M main
git remote add origin https://github.com/<みかんココのユーザー名>/kininarumono-techo.git
git push -u origin main
```

### 2. Firebase Hosting で公開
前提: Node.js が入っていること。
```bash
# 1) Firebase CLI
npm install -g firebase-tools
# 2) ログイン（ブラウザで本人が認証）
firebase login
# 3) Firebase コンソール(https://console.firebase.google.com)で新規プロジェクト作成 → そのプロジェクトIDを .firebaserc の "default" に記入
#    例: "default": "kininaru-techo"
# 4) デプロイ（このリポジトリのルートで）
firebase deploy --only hosting
```
→ `https://<プロジェクトID>.web.app` で公開されます。独自ドメインは Firebase コンソールの Hosting → カスタムドメインで後付け可能。

※ `firebase init` を自分で走らせたい場合は `firebase init hosting` を選び、public ディレクトリに `public`、SPA は「No」、既存 index.html は上書きしない、で進めてください（本リポジトリの firebase.json と同等になります）。

### 3.（任意）GitHub Actions で自動デプロイ
`firebase init hosting:github` を実行すると、push で自動デプロイする Actions を作れます（Firebase 側でサービスアカウントの Secret が自動設定されます）。

---

## Amazon アソシエイト（2026-08-19 撤去済み）

**追わない方針**（本人指定）。サイトからAmazonの開示文とリンクは全て削除した。

リンクを1本も置いていない状態で「Amazonのアソシエイトとして適格販売により収入を得ています」と
掲げていたのが、Amazonの運営規約でも景表法でも事実と異なる記載だったため。
再開するなら、**リンクを設置するのと同時に**開示文を戻すこと。順序を逆にしない。

## コンプライアンス
- アフィリエイト開示は**2か所**。ピック一覧の直前（`.disclosure`）とフッター（`.footer__legal`）。
  フッターだけだと商品カードから約4,000px下になり、ピックを見て離脱する人には届かない（実測値）。
  商品リンクを増やすときは、開示がその**前**に来ているか必ず確認する。
- 商品リンクは `rel="sponsored noopener nofollow"`。`sponsored` を落とさないこと。
- カードに価格は表示していない。表示すると価格改定のたびに嘘になるため、意図的に描画していない。
- 運営者名（実名 or 屋号）と連絡先は必要に応じて更新してください。
