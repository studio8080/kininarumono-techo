# 2026-11-07 週次ROOM反映とコーヒー記事

対象: studio8080/kininarumono-techo。サイト更新のみ。SNS投稿・既存予約/下書き・ROOMの変更はしない。

## 重複と対象期間

- 最新origin/mainを取得し、直近6日以内の「楽天ROOMの投稿」コミットは該当なし。前回はPR #68、2026-10-31反映。
- `room-reflect-weekly.mjs list --repo <隔離worktree> --since 2026-10-31` で未掲載9件。実際の候補は11/1〜11/6の公開ROOM投稿。未公開の入力待ち商品は対象に含めていない。
- 公開ROOMの対象プロフィール `totonou_note` / 気になるモノ手帖を現在確認。ブラウザはROOMログインを求める表示のため、ログイン先本人の照合済みとは扱わない。公開情報の読取りとGitHub経由のサイト更新に認証を追加条件としない。
- 同じ正式ChromeのGoogle表示は `studio@kokokikaku.com`。GitHub CLIの現在ユーザーは `studio8080`、remoteは対象リポジトリと一致。
- 既存PR #52/#66/#67/#69/#70は保持。特に#70の収納記事改稿・件数同期は今回へ混ぜない。

## 掲載4件

| itemcode | 掲載名 | 確認と画像 |
|---|---|---|
| elecom:10065621 | ELECOM USB-C 2ポートAC充電器 MPA-ACCP9430WH | エレコム直営店。販売2,288円、値下げ表示なし。提供画像の単体カットへ差替え。 |
| hario-onlinestore:10001569 | HARIO ドリップスタンドセット 麻の葉 DSS-ASN | 公式店。通常13,750円と販売13,750円一致。提供画像の麻の葉単体セットへ差替え、七宝と区別。 |
| hotch-potch:10017953 | cado STEM 500H HM-C500H | 出品ページに正規販売店の明記。販売38,500円、出品側の比較通常価格・セール表示なし。メーカー直販価格との一致を主張しない。提供画像の単体使用場面へ差替え。 |
| vanilla1950:10000519 | Vitra Uten.Silo RE 壁面収納 | vanillaのVitra正規販売店明記を確認。販売ページは2サイズで48,400〜58,300円。Iだけの名前に最安のII価格を結び付けず、シリーズ名で掲載。既定の提供画像を維持。 |

価格は選定検査用。記事本文・商品カードに価格を新設しない。在庫は公開ROOMのavailability=1、soldout=false、deleted=falseと販売ページを照合した観測値であり、数量や配送は保証しない。

すべて既存とは別itemcode・別商品。リンクはROOM個別ページの`rp`なし本命を補助スクリプトで直接取得し、書込み後に4件とも照合。アフィリエイトURLの実アクセスはしていない。

## 見送り・保留5件

| itemcode | 商品 | 理由 |
|---|---|---|
| penroom:10058008 | LAMY safari 2026限定万年筆 | 販売5,167円に対し参考価格5,940円の値下げ。セール品除外ルール。 |
| shopmarna:10004256 | マーナ K536 | 提供画像は販促テキスト、比較/組合せ、他ツールを含む場面。確認したギャラリーで今回のサイト用のクリーンな単体写真を確保できず。SNS側の採用を取り消す判断ではない。 |
| shinwashop:10004415 | MOEBE FRAME A5 | 通常価格と販売価格は一致（アッシュ6,600円、オーク7,700円）。ただし提供画像は複数枠・サイズ混在、コラージュ、全体が収まらないモデル写真等で、A5単体の適合写真を確認できず。セール扱いにはしない。 |
| roomy:10010590 | MOHEIM MUG 380 | 提供画像・販売2,970円は確認。今回の出品元について正規取扱を直接示す現在の記載を確認できず保留。偽物と断定しない。 |
| shinwashop:10010131 | DUENDE TILL | 通常/販売15,400円一致、単体の使用場面写真あり。今回の出品元の正規取扱明記を確認できず保留。メーカー店舗一覧にないことだけで非正規と断定しない。 |

見送り履歴は移行先の正本support/excluded.mdへ日付付き追記。サイトの既存商品は削除しない。日次の新規3商品枠を補充するタスクではないため、未公開商品やROOM未掲載品を代替してサイトへ加えない。

## 読みもの

- 題名: 冬のコーヒー道具、単体・セット・直火で比べる 3選
- URL: https://kininarumono.jp/read/fuyu-no-coffee-dougu
- 前回の選び方エッセイと交互のまとめ記事。3カードとItemListの3点を一致させ、公開日を2026-11-07に固定。
- 新規HARIOセットと既掲載のV60 NEO/Bialettiから、手持ちの器具、注ぐ空間、熱源と抽出量を比較。既存2商品の販売ページも値下げ表示なし・isSoldOut=falseを現在確認。
- 使用レビュー、味の優劣、効能、所有・購入体験は主張しない。カバーはサイト自前の既存写真で、商品写真とは明記して区別。
- PR開示は最初の商品カードより前、広告は既存のキッチン用generate/zackhausを割当て。

## 一次資料と出品元の資料

- https://room.rakuten.co.jp/totonou_note/items
- https://item.rakuten.co.jp/elecom/4549550333894/
- https://item.rakuten.co.jp/hario-onlinestore/dss/
- https://item.rakuten.co.jp/hotch-potch/00014915-cadostem350/
- https://cado.com/pages/stem-500h
- https://item.rakuten.co.jp/vanilla1950/gd7188/
- https://vanilla-kagu.com/c/060vitra
- https://item.rakuten.co.jp/hario-onlinestore/vdn-b/
- https://item.rakuten.co.jp/bialettishop/0009055/
- https://item.rakuten.co.jp/penroom/48557/
- https://item.rakuten.co.jp/shopmarna/k536/
- https://item.rakuten.co.jp/shinwashop/moebe-frame-a5/
- https://item.rakuten.co.jp/roomy/pts19jan09h04/
- https://item.rakuten.co.jp/shinwashop/due-till/
- https://linernotes.duende.jp/pages/shop-list
- https://moheim.pro/jp/shops/

提供画像の取得根拠は既存daily/2026-11-01・02・03・06のギャラリー/原本記録も確認。今回選んだ4画像をブラウザで実表示し、追加の加工・切抜き・文字合成をしていない。

## 検証

- 商品269件・読みもの20本、cache v=99。
- 既存18テスト合格。構文・リンク転送先の静的照合・商品重複・3点の構造化データ・関連リンク・商品前開示を検証。
- Firebase Hostingエミュレータで新記事/トップ/変更3カテゴリを375px・1280pxで測定し、要素の横はみ出し0、商品前PR開示を確認。商品画像はcontain。遅延読込前のnaturalWidth=0を画像切れと混同せず、読込後を別確認する。
- 全生成処理を再実行し、2回目の出力差分0を確認してから公開する。
- sitemapのlastmodを当日にするのはトップ/read/変更3カテゴリ/新記事のみ。その他はキャッシュ参照のみ変更。
- ローカルFirebaseの認証失効メッセージと、認証不要のローカルHosting表示成功は別。公開は既存GitHub ActionsのWIF経路を利用し、公開CIと本番HTTP/内容を別途読戻す。

検証原本: automation-4/runs/2026-11-07（公開商品データ・画像確認・検証結果）。公開結果はAutomationの実行記録に保存する。
