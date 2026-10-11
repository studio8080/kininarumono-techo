/* 気になるモノ手帖 — base interactions */
(function () {
  "use strict";

  // ---- category meta ----
  // cvar=面 / deep=文字色(白地でWCAG AA) / soft=淡い面
  const CAT = {
    gadget:   { label: "ガジェット",     cvar: "var(--purple)", deep: "var(--purple-deep)", soft: "var(--purple-soft)" },
    interior: { label: "インテリア",     cvar: "var(--teal)",   deep: "var(--teal-deep)",   soft: "var(--teal-soft)" },
    kitchen:  { label: "食器・キッチン", cvar: "var(--green)",  deep: "var(--green-deep)",  soft: "var(--green-soft)" },
    beauty:   { label: "コスメ・ケア",   cvar: "var(--pink)",   deep: "var(--pink-deep)",   soft: "var(--pink-soft)" },
    daily:    { label: "日用品",         cvar: "var(--violet)", deep: "var(--violet-deep)", soft: "var(--violet-soft)" },
    goods:    { label: "文具・雑貨",     cvar: "var(--coral)",  deep: "var(--coral-deep)",  soft: "var(--coral-soft)" },
    fashion:  { label: "ファッション",   cvar: "var(--amber)",  deep: "var(--amber-deep)",  soft: "var(--amber-soft)" }
  };

  // ---- picks (real affiliate links already live on ROOM/Pinterest) ----
  // price/在庫は変動するためカードには描画していない（表示すると価格改定で嘘になる）。
  const PICKS = [
    // --- 2026.10.10 楽天ROOMから反映（16件・10/4〜10/10分） ---
    { cat:"kitchen", date:"2026.10.10", motif:"m-mug", brand:"Bialetti", name:"モカエキスプレス エクスクルーシブ", price:"¥9,900", code:"bialettishop:10000055", url:"https://hb.afl.rakuten.co.jp/hgc/585d507f.fae542ed.585d5080.c357ba61/_RTroom06836859_396396467_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbialettishop%2F0009055%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/bialettishop/cabinet/exclusive/item/excl_rosso.jpg",
      blurb:"1960年代のモカを思わせるダイヤ形のつまみに、光沢のある塗装を合わせた直火式のエスプレッソメーカー。レッドやブラックのほか、ミントやスカイブルーなどのパステルカラーも選べる。" },
    { cat:"interior", date:"2026.10.10", motif:"m-lamp", brand:"INTERFORM", name:"テーブルライト ヴィンケル", price:"¥16,280", code:"interform-inc:10004157", url:"https://hb.afl.rakuten.co.jp/hgc/56d20b36.a84ac64a.56d20b37.f4cfe622/_RTroom06836859_396396462_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Finterform-inc%2Flt-4720-1%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/interform-inc/cabinet/47/lt-4720-1_icon.jpg",
      blurb:"ワイヤーで組んだ斜めのフレームに、乳白のガラスの球を載せたテーブルライト。明かりを消している昼間も、棚の上でオブジェのように見える形。" },
    { cat:"fashion", date:"2026.10.10", motif:"m-tote", brand:"LOWRYS FARM", name:"ATステンカラーコート", price:"¥17,600", code:"stylife:15891451", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_396396460_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsy2131%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/131/sy2131-01_1.jpg",
      blurb:"撥水のナイロンに中綿を入れた、ユニセックスのロング丈ステンカラーコート。共地のフードは外してストールのように巻くこともできる。" },
    { cat:"interior", date:"2026.10.09", motif:"m-crate", brand:"BRITA SWEDEN", name:"PLASTIC RUGS 約70×100cm", price:"¥19,250", code:"shinwashop:10006166", url:"https://hb.afl.rakuten.co.jp/hgc/56739bc0.6c904c85.56739bc1.1c345c63/_RTroom06836859_396273352_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshinwashop%2Fbritasweden-plastic-rug-70x100%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/shinwashop/cabinet/br-rug_01.jpg",
      blurb:"スウェーデンの工場で織られた、プラスチック素材のラグ。水拭きできる素材なので、キッチンや玄関のように汚れやすい場所にも北欧の柄を敷ける。" },
    { cat:"fashion", date:"2026.10.09", motif:"m-tote", brand:"Dickies × 417 EDIFICE", name:"別注 ストレートパンツ", price:"¥19,800", code:"stylife:15917363", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_396273346_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Ftb2041%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/041/tb2041-04_1.jpg",
      blurb:"ディッキーズのワークパンツを、417 EDIFICEが微起毛の生地で仕立てた別注モデル。色をそろえたDカンとまっすぐなシルエットで、スラックスのようにも合わせられる。" },
    { cat:"kitchen", date:"2026.10.08", motif:"m-mug", brand:"長谷園", name:"かまどさん 三合炊き", price:"¥19,800", code:"nagatanienkamadosan-d:10000009", url:"https://hb.afl.rakuten.co.jp/hgc/584ef6ad.ec3ec5a1.584ef6b1.39e45949/_RTroom06836859_396142524_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fnagatanienkamadosan-d%2F1196168994%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/nagatanienkamadosan-d/cabinet/09948616/85075826_o29.jpg",
      blurb:"肉厚の伊賀焼と二重のふたで、火加減を調整せずに炊くことを前提にしたご飯用の土鍋。白米なら3合まで、玄米なら1〜2合までが目安になっている。" },
    { cat:"fashion", date:"2026.10.08", motif:"m-socks", brand:"To b. by agnès b.", name:"チェック マフラー", price:"¥10,890", code:"stylife:15917759", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_396142509_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsw2886%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/886/sw2886-01_1.jpg",
      blurb:"赤と深い緑にミントを差したチェック柄に、ふさふさのフリンジを付けたマフラー。大きめのブランドネームを赤いステッチで留めてあり、巻いたときのアクセントになる。" },
    { cat:"fashion", date:"2026.10.07", motif:"m-tote", brand:"PAPILLONNER", name:"ドットスウェード ショルダーバッグ", price:"¥25,300", code:"stylife:15755345", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_396030081_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsg7683%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/683/sg7683-01_1.jpg",
      blurb:"牛革スエードのフラップの下にファスナーを付け、内側をドット柄の裏地にしたショルダーバッグ。500mlのペットボトルやパスポートが入る大きさで、旅行の手荷物にも向く。" },
    { cat:"fashion", date:"2026.10.07", motif:"m-socks", brand:"adidas × atmos", name:"TOBACCO atmos KOYO", price:"¥17,600", code:"stylife:15888415", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_396030066_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsx8549%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/549/sx8549-01_1.jpg",
      blurb:"ネイビーのスエードに、イエローのベロアのスリーストライプスを合わせたTOBACCOの別注モデル。イチョウを思わせる配色で、木製のトレフォイルチャームと黄色の替えひもが付く。" },
    { cat:"fashion", date:"2026.10.07", motif:"m-socks", brand:"TRICOTE", name:"RIBBED GLOVES", price:"¥6,600", code:"stylife:15819090", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_396030063_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsh8172%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/172/sh8172-01_1.jpg",
      blurb:"アームカバーほど長い袖口を、折り返す長さで配色のバランスを変えられる日本製の手袋。指先はタッチパネルに対応していて、グリーン・ピンク・ベージュの3色がある。" },
    { cat:"gadget", date:"2026.10.06", motif:"m-cable", brand:"LEXON", name:"Tykho 3 FMラジオ ワイヤレススピーカー", price:"¥11,980", code:"kanjitsu-direct:10000481", url:"https://hb.afl.rakuten.co.jp/hgc/56594080.0ecfdfc2.56594082.5261f0e8/_RTroom06836859_395881064_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkanjitsu-direct%2F3660491210905%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/kanjitsu-direct/cabinet/lexon/tykho3/imgrc0095969992.jpg",
      blurb:"FMラジオとBluetoothスピーカーを1台にまとめた、幅14cmの小さなラジオ。防滴仕様でバッテリーは最大20時間なので、キッチンや洗面所にも持ち運んで置ける。" },
    { cat:"daily", date:"2026.10.06", motif:"m-crate", brand:"無印良品", name:"スチールタップ収納箱 フラップ式", price:"¥1,990", code:"mujirushi-ryohin:10005610", url:"https://hb.afl.rakuten.co.jp/hgc/57177ea9.c2f1e728.57177eaa.e234453a/_RTroom06836859_395881061_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmujirushi-ryohin%2F4550344596654%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/mujirushi-ryohin/cabinet/item25/4550344596654.jpg",
      blurb:"電源タップをまるごと収める、約幅32×奥行10×高さ14cmのスチールの箱。フタを開ければそのままプラグを抜き挿しでき、底には通風用のスリットがある。" },
    { cat:"fashion", date:"2026.10.06", motif:"m-tote", brand:"THE NORTH FACE", name:"リバーシブル エクストリーム パイル フリースジャケット", price:"¥31,350", code:"greenlabelrelaxing:10069827", url:"https://hb.afl.rakuten.co.jp/hgc/56e0ceaf.742b6423.56e0ceb0.484099c6/_RTroom06836859_395881053_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgreenlabelrelaxing%2Fsy2140%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/greenlabelrelaxing/cabinet/item/140/sy2140-01_1.jpg",
      blurb:"ボアの面とナイロンの面を、裏返してどちらでも着られるフリースジャケット。アイボリーとマッシュルームの配色で、秋冬の服に合わせやすい。" },
    { cat:"interior", date:"2026.10.05", motif:"m-vase", brand:"FLENSTED mobiles", name:"Balloon Mobile 5", price:"¥7,920", code:"chloros:10000637", url:"https://hb.afl.rakuten.co.jp/hgc/568f7c79.7d0e8053.568f7c7d.2410ab21/_RTroom06836859_395820450_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fchloros%2F1104090%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/chloros/cabinet/32x/32x078b.jpg",
      blurb:"赤や青や緑の5つの気球を、細いアームで釣り合わせた幅約62cmのモビール。部屋の空気が少し動くだけでゆっくり回るので、天井の余白が気になる部屋に向く。" },
    { cat:"interior", date:"2026.10.05", motif:"m-crate", brand:"ART OF BLACK", name:"ストライプ ラビットファー クッションカバー", price:"¥1,980", code:"artofblack:10006837", url:"https://hb.afl.rakuten.co.jp/hgc/5648b4a4.4a589db2.5648b4a5.ad3ed5d3/_RTroom06836859_395820434_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fartofblack%2Fcu-03145%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/artofblack/cabinet/05842376/12008450/cu-03145-4.jpg",
      blurb:"太い畝の入ったフェイクファーの面と、ベロアの面を組み合わせた45×45cmのクッションカバー。中身は付かないので、手持ちのクッションを冬向けに替えたいときの候補になる。" },
    { cat:"interior", date:"2026.10.05", motif:"m-crate", brand:"coloris tile × JOURNAL STANDARD FURNITURE", name:"別注 PLATE M（アクセサリートレー）", price:"¥4,620", code:"journalstandard:10023536", url:"https://hb.afl.rakuten.co.jp/hgc/569ab714.3dff9127.569ab719.c9d88756/_RTroom06836859_395820425_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjournalstandard%2Fhw7587%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/journalstandard/cabinet/item/587/hw7587-01_1.jpg",
      blurb:"淡いグリーンのタイルを手作業で並べた、約14.8cm角のアクセサリートレー。目地のわずかなゆらぎも含めて、玄関や棚の上で指輪や時計の置き場にできる。" },
    // --- 2026.10.03 楽天ROOMから反映（17件・9/27〜10/3分） ---
    { cat:"fashion", date:"2026.10.03", motif:"m-polo-knit", brand:"ADAM ET ROPE' FEMME", name:"ブラッシュドアルパカ ポロカラーカーディガン", price:"¥26,400", code:"stylife:15841137", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_395436628_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fst0123%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/123/st0123-03_1.jpg",
      blurb:"アルパカ78%の糸を起毛させた、毛足の長い襟付きカーディガン。襟元がほどよく開くので、羽織りにしても1枚で着てもかっちりしすぎない。" },
    { cat:"interior", date:"2026.10.03", motif:"m-vase", brand:"Hoptimist", name:"Soft Bumble S", price:"¥3,960", code:"keeshop:10003279", url:"https://hb.afl.rakuten.co.jp/hgc/5823fe86.fabdc403.5823fe87.2070d74f/_RTroom06836859_395436461_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkeeshop%2Fhoptimist-soft-bum-s%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/keeshop/cabinet/hoptimist/26088_env_1_2201_1.jpg",
      blurb:"とんがり帽子の小さな人形で、頭を指で押すとばねでしばらく揺れ続ける。高さ約7.5cmなので、本棚のすき間やデスクの端にも収まる。" },
    { cat:"kitchen", date:"2026.10.03", motif:"m-bottle", brand:"Blue Bottle Coffee × RIVERS", name:"モク ドリンクボトル 350ml", price:"¥5,720", code:"bluebottlecoffee:10000928", url:"https://hb.afl.rakuten.co.jp/hgc/5823fcca.8ea39285.5823fccb.f69c89a8/_RTroom06836859_395436276_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbluebottlecoffee%2Fg224332%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/bluebottlecoffee/cabinet/item/2026/imgrc0119591861.jpg",
      blurb:"白いステンレスのボトルに、アカシアの天然木のふたを合わせたコラボモデル。木目が1本ずつ違うので、同じ型でも持つ人ごとに少しずつ表情が変わる。" },
    { cat:"beauty", date:"2026.10.02", motif:"m-diffuser", brand:"NEAL'S YARD REMEDIES", name:"フランキンセンス・オーガニック 精油 5mL", price:"¥5,610", code:"nealsyard:10000492", url:"https://hb.afl.rakuten.co.jp/hgc/581d27e0.c598edb1.581d27e1.f4f1dae5/_RTroom06836859_395334289_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fnealsyard%2F02197%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/nealsyard/cabinet/pro_2019/aroma/02197_201907.jpg",
      blurb:"オマーン産の樹脂を水蒸気蒸留した、甘くスパイシーな乳香の精油。ディフューザーに1〜5滴が目安の小瓶で、部屋の香りを秋向けに変えたいときの選択肢になる。" },
    { cat:"fashion", date:"2026.10.02", motif:"m-tote", brand:"FREAK'S STORE", name:"リバーシブルライナーセット スタンドカラーブルゾン", price:"¥13,493", code:"stylife:15798255", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_395334287_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsn4340%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/340/sn4340-13_1.jpg",
      blurb:"ナイロンの外側とリバーシブルのフリースライナーを、重ねても単体でも着られる4wayのブルゾン。短丈のビッグシルエットで、ライナーの付け外しで秋口から真冬まで温度を調整できる。" },
    { cat:"fashion", date:"2026.09.30", motif:"m-socks", brand:"Carhartt WIP", name:"Acrylic Watch Hat", price:"¥4,950", code:"stylife:15896282", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_395097087_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsy6703%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/703/sy6703-01_1.jpg",
      blurb:"折り返しの中央にスクエアラベルを付けた、アクリル100%のリブ編みビーニー。素材名だけで肌あたりを決めず、額に触れる部分の感触とサイズを確かめたい候補です。" },
    { cat:"fashion", date:"2026.09.30", motif:"m-polo", brand:"FRED PERRY", name:"ティップライン オープンカラー スウェットシャツ", price:"¥22,000", code:"aranciato:10069210", url:"https://hb.afl.rakuten.co.jp/hgc/568f8d0b.1426d1c9.568f8d0d.5daec4d9/_RTroom06836859_395097083_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Faranciato%2Fg3140-fredperry%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/aranciato/cabinet/2026aw-8/g3140-m1.jpg",
      blurb:"襟端のティップラインと胸のローレルリースの刺しゅうを、オーバーサイズの裏毛に載せた1枚。スウェットの気軽さのまま、襟の分だけきちんとして見える。" },
    { cat:"fashion", date:"2026.09.30", motif:"m-polo-knit", brand:"BEAMS HEART", name:"ハート刺繍 ニット", price:"¥8,250", code:"beams:10099318", url:"https://hb.afl.rakuten.co.jp/hgc/56b1b0bd.4089e12f.56b1b0be.806b9300/_RTroom06836859_395097078_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbeams%2Fsp8093%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/beams/cabinet/item/093/sp8093-04_1.jpg",
      blurb:"胸元に小さなハートの刺しゅうを1つ入れただけの、ふっくらしたジャカード編みのプルオーバー。グレーには赤、ブラックには青のハートと、地色ごとに刺しゅうの色を変えている。" },
    { cat:"fashion", date:"2026.09.29", motif:"m-polo-knit", brand:"UMBRO × JEANS FACTORY", name:"別注 ワンポイントロゴ刺繍 モールニットプルオーバー", price:"¥17,600", code:"jf-clothes:10080920", url:"https://hb.afl.rakuten.co.jp/hgc/57e9981e.d153fe18.57e99820.8c8a376b/_RTroom06836859_394936972_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjf-clothes%2F118210504263001%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/jf-clothes/cabinet/2026aw_item_11/118210504263001_1.jpg",
      blurb:"ベロアのような光沢が出るモール糸を畔編みにした、ドロップショルダーのゆったりしたニット。胸の小さなダイヤのロゴだけで、スポーツブランドらしさを控えめに残している。" },
    { cat:"gadget", date:"2026.09.29", motif:"m-cable", brand:"Anker", name:"Nano Power Bank（30W, Built-In USB-C Cable）", price:"¥6,990", code:"nafco:10325751", url:"https://hb.afl.rakuten.co.jp/hgc/5803135a.4263a027.5803135b.0b43e631/_RTroom06836859_394936967_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fnafco%2Fn23747432%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/nafco/cabinet/item275/n23747432_1.jpg",
      blurb:"USB-Cケーブルを本体に内蔵した、10000mAh・最大30W出力のモバイルバッテリー。ケーブルを別に持ち歩かずに済むので、バッグの中の小物が1つ減る。" },
    { cat:"kitchen", date:"2026.09.29", motif:"m-mug", brand:"Kukka Lokki", name:"プレート 16.6cm", price:"¥990", code:"bisque-onlineshop:10006750", url:"https://hb.afl.rakuten.co.jp/hgc/57f44e04.dad41bec.57f44e05.2ed6815d/_RTroom06836859_394936965_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbisque-onlineshop%2F7063kkl04%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/bisque-onlineshop/cabinet/original/kukkalokki/7063kkl041.jpg",
      blurb:"北欧ヴィンテージの器を思わせる、青い小花の柄を全面に描いた美濃焼の取り皿。電子レンジと食洗機に対応していて、ケーキにも副菜にも使いやすい大きさ。" },
    { cat:"beauty", date:"2026.09.28", motif:"m-pouch", brand:"Afternoon Tea LIVING", name:"星空ケース付き アクリルスライドミラー", price:"¥1,650", code:"stylife:15473754", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_394809061_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fra6694%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/694/ra6694-01_1.jpg",
      blurb:"ラメ入りの紺色のアクリルに金色の北斗七星を描いた、横にずらすと鏡が出てくる手鏡。星のチャームと星柄の巾着が付いていて、ちょっとした贈りものにも向く。" },
    { cat:"fashion", date:"2026.09.28", motif:"m-polo-knit", brand:"BEAUTY&YOUTH UNITED ARROWS", name:"メランジ ミラノ スキッパー ニット", price:"¥13,970", code:"stylife:15834468", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_394809058_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsp6660%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/660/sp6660-05_1.jpg",
      blurb:"裾をリブで絞った丸みのあるシルエットに、ハリのあるミラノリブを合わせたスキッパーニット。キュプラとシルクを混ぜた細い糸でドライな肌ざわりに仕上げてあり、手洗いもできる。" },
    { cat:"interior", date:"2026.09.28", motif:"m-vase", brand:"Lyngby Porcelæn", name:"リュンビュー ベース 15cm ホワイト", price:"¥11,000", code:"shinwashop:10005200", url:"https://hb.afl.rakuten.co.jp/hgc/56739bc0.6c904c85.56739bc1.1c345c63/_RTroom06836859_394809048_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshinwashop%2Flyngby-lyngbyvase-white15%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/shinwashop/cabinet/renew/lyngbyvase-white15.jpg",
      blurb:"1936年に生まれた、縦の溝が入ったデンマークの白い磁器の花瓶。高さ15cmは一輪挿しにちょうどよく、花を挿さない日も棚に置いておける。" },
    { cat:"kitchen", date:"2026.09.27", motif:"m-crate", brand:"Iris Hantverk", name:"丸型ヘッドのディッシュブラシ（馬毛・柔らかめ）", price:"¥1,540", code:"chloros:10000140", url:"https://hb.afl.rakuten.co.jp/hgc/568f7c79.7d0e8053.568f7c7d.2410ab21/_RTroom06836859_394762931_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fchloros%2F08091405%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/chloros/cabinet/03x/03x1101-00.jpg",
      blurb:"ブナ材の柄に柔らかめの馬毛を植えた、スウェーデンの手仕事のディッシュブラシ。柄の先のフックでキッチンに掛けておけるので、使わないときも置き場所に困らない。" },
    { cat:"kitchen", date:"2026.09.27", motif:"m-mug", brand:"amabro", name:"TWO TONE STACKING MUG", price:"¥2,640", code:"eclity:10028001", url:"https://hb.afl.rakuten.co.jp/hgc/56a1b9a0.f579b806.56a1b9a1.5c8b6a5b/_RTroom06836859_394762925_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Feclity%2Fmra-two-t-s-mug-%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/eclity/cabinet/item/mra/etc/mra-two-t-s-mug-_b.jpg",
      blurb:"上下で色の違うガラスを重ねた耐熱ガラスのマグで、同じマグ同士をすっきり重ねてしまえる。グリーン×イエローやアンバー×グレーなど5通りの配色がある。" },
    { cat:"kitchen", date:"2026.09.27", motif:"m-crate", brand:"ChaoHaro", name:"ビーズコースター 10cm", price:"¥990", code:"bisque-onlineshop:10011383", url:"https://hb.afl.rakuten.co.jp/hgc/57f44e04.dad41bec.57f44e05.2ed6815d/_RTroom06836859_394762911_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbisque-onlineshop%2F0029chr00%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/bisque-onlineshop/cabinet/original/kitchen/0029chr002.jpg",
      blurb:"台湾のマジョリカタイルをモチーフにした花柄を、小さなガラスビーズで描いたコースター。裏に布が貼ってあり、柄違いで並べても色の組み合わせがまとまる。" },
    // --- 2026.09.26 楽天ROOMから反映（38件・9/14〜9/26分） ---
    { cat:"goods", date:"2026.09.26", motif:"m-notebook", brand:"TRAVELER'S notebook", name:"2027 月間リフィル（レギュラーサイズ）", price:"¥946", code:"office-vender:10043835", url:"https://hb.afl.rakuten.co.jp/hgc/57e927d3.55a7eaa4.57e927d4.42d705d2/_RTroom06836859_394557123_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Foffice-vender%2F4902805145015%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/office-vender/cabinet/11433432/4902805145015-1.jpg",
      blurb:"2026年12月始まりの見開き月間ブロックに、年間カレンダーと世界地図のページが付いたリフィル。中身だけを入れ替える仕組みなので、使い込んだカバーをそのまま翌年に持ち越せる。" },
    { cat:"fashion", date:"2026.09.26", motif:"m-polo-knit", brand:"URBAN RESEARCH DOORS", name:"UR TECH 200日ニット ポロ", price:"¥9,900", code:"stylife:15827279", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_394557119_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsr5460%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/460/sr5460-07_1.jpg",
      blurb:"洗濯機洗い・静電気防止・アンチピリングを特徴として案内するニットポロ。肌あたりは試着で確かめ、洗濯から乾燥まで購入品の品質表示タグに従います。" },
    { cat:"daily", date:"2026.09.26", motif:"m-tissue", brand:"BRID", name:"ACRYLIC & WOOD ティッシュケース", price:"¥2,970", code:"hotch-potch:10018498", url:"https://hb.afl.rakuten.co.jp/hgc/5656b4ef.86eb6137.5656b4f2.149257eb/_RTroom06836859_394557114_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhotch-potch%2F00015452-acryltissue%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/hotch-potch/cabinet/kago800_img3/00015452_1.jpg",
      blurb:"色つきのアクリルの箱に、木目のふたを重ねただけのティッシュケース。光を通す素材なので、置いた場所がそこだけ少し明るく見える。" },
    { cat:"kitchen", date:"2026.09.25", motif:"m-bottle", brand:"ALESSI", name:"TWERGI キャニスター", price:"¥13,750", code:"shinwashop:10010947", url:"https://hb.afl.rakuten.co.jp/hgc/56739bc0.6c904c85.56739bc1.1c345c63/_RTroom06836859_394432460_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshinwashop%2Falessi-es16%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/shinwashop/cabinet/11588124/alessi-es16-1.jpg",
      blurb:"エットレ・ソットサスのデザインで、ブナ材のふたに円盤と丸いつまみを重ねたガラスのキャニスター。中身が外から見えるので、豆やパスタの残りが一目でわかる。" },
    { cat:"fashion", date:"2026.09.25", motif:"m-polo-knit", brand:"Maison Kitsuné", name:"FOX HEAD レギュラー スウェットシャツ", price:"¥31,900", code:"stylife:15222256", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_394432453_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fpw9990%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/990/pw9990-01_1.jpg",
      blurb:"コットン100%のレギュラーカットに、胸元の小さなフォックスヘッドの刺しゅうだけを載せたスウェット。ポルトガル製で、ベージュのメランジは秋の服に馴染む色。" },
    { cat:"kitchen", date:"2026.09.25", motif:"m-mug", brand:"Rörstrand", name:"モナミ マグ 340ml", price:"¥4,400", code:"freedesign:10009666", url:"https://hb.afl.rakuten.co.jp/hgc/574bd937.345519e0.574bd938.89667079/_RTroom06836859_394432450_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ffreedesign%2Fsdrma001-mug%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/freedesign/cabinet/img36/sdrma001-image04.jpg",
      blurb:"マリアンヌ・ウェストマンの花柄を使い、1952年に発売されたモナミシリーズのマグ。白地に濃いブルーの柄で、電子レンジと食洗機に対応しています。" },
    { cat:"kitchen", date:"2026.09.24", motif:"m-mug", brand:"LODGE", name:"ロジック スキレット 8インチ", price:"¥4,510", code:"greenzone:10005998", url:"https://hb.afl.rakuten.co.jp/hgc/57d913c8.8bc291dc.57d913c9.ac142ab2/_RTroom06836859_394312859_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgreenzone%2F101024203020%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/greenzone/cabinet/it10102420/101024203020.jpg",
      blurb:"工場で油ならしを済ませてあるので、届いたその日から使える鋳鉄のスキレット。内径20.2cmでIHにも対応し、焼いたらそのまま食卓に出せる。" },
    { cat:"fashion", date:"2026.09.24", motif:"m-polo-knit", brand:"SLOANE", name:"14G天竺 メリノウール クルーネック", price:"¥26,400", code:"aimsgallery:10004883", url:"https://hb.afl.rakuten.co.jp/hgc/576ca430.ce5b5088.576ca431.e8d8db68/_RTroom06836859_394312854_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Faimsgallery%2F182634464%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/aimsgallery/cabinet/woman7/182634464_01.jpg",
      blurb:"エクストラファインメリノを14ゲージで編んだ日本製のクルーネック。パーツごとに編んでつなぐフルファッションなので、肩まわりの線がきれいに出る。" },
    { cat:"interior", date:"2026.09.24", motif:"m-stand", brand:"tidy", name:"TETTO 傘立て（ホワイト）", price:"¥26,400", code:"e-yamagiwa:10001807", url:"https://hb.afl.rakuten.co.jp/hgc/57bf0b37.45170585.57bf0b3b.91ea223b/_RTroom06836859_394312850_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fe-yamagiwa%2F996tnub2750007%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/e-yamagiwa/cabinet/goods03/996tnub2750007.jpg",
      blurb:"四角い箱に段違いの切り込みを入れただけに見えるスチールの傘立て。4.4kgあって倒れにくく、底には取り外せる水受けトレーが付く。" },
    { cat:"daily", date:"2026.09.22", motif:"m-crate", brand:"ideaco", name:"TUBELOR HOMME（チューブラー オム）", price:"¥5,500", code:"roomy:10000490", url:"https://hb.afl.rakuten.co.jp/hgc/568f9274.729f89ae.568f927c.b205ddd1/_RTroom06836859_394115101_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Froomy%2Ftubelorhomme%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/roomy/cabinet/500cart_all/500cart_11g/photo-5/idc1002-00009-0_gt02.jpg",
      blurb:"内側にゴミ袋をかけて外側をかぶせる二重構造で、袋のふちが外から見えないゴミ箱。約11.4Lの円筒形で色数が多く、リビングに出したままでも部屋の色に合わせやすい。" },
    { cat:"beauty", date:"2026.09.22", motif:"m-bottle", brand:"WELEDA", name:"スキンフード 75mL", price:"¥2,970", code:"natureswayshop:10002061", url:"https://hb.afl.rakuten.co.jp/hgc/57c8b4b6.0a8a1364.57c8b4b7.5ae95ada/_RTroom06836859_394115091_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fnatureswayshop%2F12023520%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/natureswayshop/cabinet/11000764/imgrc0116789690.jpg",
      blurb:"1926年から続く、ヒマワリ種子油とハーブエキスを配合した全身用のクリーム。手や肘、かかとにも顔にも使える、平たいチューブの一本。" },
    { cat:"fashion", date:"2026.09.21", motif:"m-tote", brand:"Hender Scheme", name:"assemble hand bag tall S", price:"¥19,800", code:"arknets:10066067", url:"https://hb.afl.rakuten.co.jp/hgc/57be49a1.7051a6b2.57be49a2.93d33dfa/_RTroom06836859_393932370_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Farknets%2F10066067%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/arknets/cabinet/11758067/12138721/imgrc0110208245.jpg",
      blurb:"革をリベットだけで組み立てた、縫い目がひとつも無いミニトート。艶のあるガラスレザーのふちに染めていない革の色がのぞき、黒でも重たく見えない。" },
    { cat:"goods", date:"2026.09.21", motif:"m-notebook", brand:"Kaweco", name:"フロステッドスポーツ 万年筆", price:"¥4,400", code:"penroom:10048510", url:"https://hb.afl.rakuten.co.jp/hgc/57be48ea.2ab62200.57be48ec.3a80da99/_RTroom06836859_393932361_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fpenroom%2F42008%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/penroom/cabinet/kaweco/42008_1.jpg",
      blurb:"キャップを閉じると106mm、後ろに挿すと133mmになる手のひらサイズの万年筆。パステルにミルキーホワイトを混ぜた半透明の軸で、ペンケースに色を一本足すのにちょうどいい。" },
    { cat:"interior", date:"2026.09.21", motif:"m-stand", brand:"&Tradition", name:"Flowerpot VP9 ポータブルランプ", price:"¥39,600", code:"shinwashop:10008255", url:"https://hb.afl.rakuten.co.jp/hgc/56739bc0.6c904c85.56739bc1.1c345c63/_RTroom06836859_393932356_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshinwashop%2Fand-fp-vp9%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/shinwashop/cabinet/12613238/vp9-100th-1.jpg",
      blurb:"ヴァーナー・パントンが1968年にデザインしたフラワーポットを、充電式にしたテーブルランプ。コードが無いので食卓からベッドサイドまで持ち運べて、明るさは3段階で落とせる。" },
    { cat:"fashion", date:"2026.09.21", motif:"m-socks", brand:"A.P.C.", name:"Will H リブソックス", price:"¥4,180", code:"stylifemen:10737556", url:"https://hb.afl.rakuten.co.jp/hgc/56430753.d3416592.56430757.a1dc5f63/_RTroom06836859_393919174_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylifemen%2Fgm2894%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylifemen/cabinet/item/894/gm2894-01_1.jpg",
      blurb:"綿80%のリブ編みに、小さくロゴを入れたクルー丈のソックス。足底だけパイル編みになっていて、革靴にもスニーカーにも合わせやすい。" },
    { cat:"fashion", date:"2026.09.21", motif:"m-socks", brand:"A.P.C.", name:"MIKE ソックス（シルク混）", price:"¥4,180", code:"news-web:10014437", url:"https://hb.afl.rakuten.co.jp/hgc/57b89cbe.26511017.57b89cbf.b8bdf7f5/_RTroom06836859_393919171_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fnews-web%2F10011840%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/news-web/cabinet/apc/mike-femme_mbtop.jpg",
      blurb:"レーヨンに絹を混ぜた、光沢のあるなめらかな生地のソックス。履き口の後ろにRUE MADAME PARISのロゴが編み込まれていて、きれいめの靴に合う。" },
    { cat:"daily", date:"2026.09.20", motif:"m-bottle", brand:"工房アイザワ", name:"18-8ステンレス ゆたんぽ 2.5L", price:"¥9,240", code:"kougeishop:10000335", url:"https://hb.afl.rakuten.co.jp/hgc/579d3147.ecf6e860.579d3148.23f74d20/_RTroom06836859_393791532_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkougeishop%2Faizawa280008%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/kougeishop/cabinet/aizawa/aizawa280008.jpg",
      blurb:"18-8ステンレスの湯たんぽ。購入前に容量と手入れ方法を確認し、布団を温めたら就寝前に取り出して使います。" },
    { cat:"daily", date:"2026.09.20", motif:"m-crate", brand:"松野屋", name:"トタン 豆バケツ L", price:"¥2,860", code:"tremolo:10001679", url:"https://hb.afl.rakuten.co.jp/hgc/5793cd1e.a04dee17.5793cd1f.acf266cf/_RTroom06836859_393791525_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftremolo%2F10001679%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/tremolo/cabinet/02076064/5111na3.jpg",
      blurb:"直径20cm・容量3.6Lの、東京の荒物問屋がつくる小さなトタンバケツ。370gと軽く、掃除にも園芸にも小物入れにも回せて、くすむほど味が出る。" },
    { cat:"kitchen", date:"2026.09.20", motif:"m-vase", brand:"能作", name:"KAGO ローズ S", price:"¥4,950", code:"shopnousaku:10000084", url:"https://hb.afl.rakuten.co.jp/hgc/57b4bd20.8e96df0e.57b4bd21.f48fe8be/_RTroom06836859_393791518_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshopnousaku%2F501412%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/shopnousaku/cabinet/product_white/501412_21.jpg",
      blurb:"錫100%で、手で引っ張ると形が変わる直径12cmのかご。広げれば果物を盛るかごに、平らなままならトレーとして使える。" },
    { cat:"interior", date:"2026.09.19", motif:"m-vase", brand:"ferm LIVING", name:"Vitto センテッドキャンドル", price:"¥8,580", code:"kozlife:10012124", url:"https://hb.afl.rakuten.co.jp/hgc/56d1d5d9.628a490d.56d1d5da.af3e4210/_RTroom06836859_393676127_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkozlife%2Ffl-vitto%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/kozlife/cabinet/db/fermliving/object/fl-vittoa.jpg",
      blurb:"ワックスの95%を菜種由来にした、直径10cmのガラス入りキャンドル。香りはブラウンシュガーとフィグ＆ベルガモットの2種類で、燃え尽きたあとのガラスは小物入れになる。" },
    { cat:"kitchen", date:"2026.09.19", motif:"m-crate", brand:"東屋", name:"桐の米びつ 5kg", price:"¥11,000", code:"iraka:10001022", url:"https://hb.afl.rakuten.co.jp/hgc/57ae33ba.ee509c41.57ae33bb.92a444f0/_RTroom06836859_393676121_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Firaka%2Fazmaya-komebitsu5kg%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/iraka/cabinet/kanban/azmaya/imgrc0062656720.jpg",
      blurb:"埼玉県春日部市の松田桐箱が、厚い無垢の桐材を釘を使わずに組んだ米びつ。湿気を吸ったり吐いたりする桐の性質を活かしたつくりで、一合升が付いてくる。" },
    { cat:"interior", date:"2026.09.19", motif:"m-vase", brand:"Kähler", name:"オマジオ フラワーベース 12.5cm", price:"¥6,050", code:"kirariointerior:10003282", url:"https://hb.afl.rakuten.co.jp/hgc/56be294d.f20caa8c.56be2957.14ac844a/_RTroom06836859_393676114_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkirariointerior%2F10003278%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/kirariointerior/cabinet/05611737/06196437/kahleroma12-r-top.jpg",
      blurb:"1839年創業のデンマークの窯で、職人がボーダーの線を一本ずつ手描きしているフラワーベース。線の太さも色の濃さも一つずつ違い、花を挿さない日でも棚の上で絵になる。" },
    { cat:"daily", date:"2026.09.18", motif:"m-crate", brand:"無印良品", name:"木製トレー収納 2段引き出し", price:"¥2,590", code:"mujirushi-ryohin:10004488", url:"https://hb.afl.rakuten.co.jp/hgc/57177ea9.c2f1e728.57177eaa.e234453a/_RTroom06836859_393520785_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmujirushi-ryohin%2F4550344310229%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/mujirushi-ryohin/cabinet/item14/4550344310229.jpg",
      blurb:"オーク材突板で仕上げた、幅25.2cmの2段の引き出し。トレー式で引き出さなくても中身が見渡せ、文房具や腕時計をジャンルごとに分けておける。" },
    { cat:"goods", date:"2026.09.18", motif:"m-notebook", brand:"suck UK", name:"スクラッチマップ（世界地図）", price:"¥1,980", code:"colorfulbox:10192776", url:"https://hb.afl.rakuten.co.jp/hgc/56c5c11f.e68ab3a6.56c5c122.dcbdf50f/_RTroom06836859_393520777_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcolorfulbox%2F537288%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/colorfulbox/cabinet/maker_entrex11/537288cb.jpg",
      blurb:"コインで削ると色が現れる、A3サイズの世界地図のポスター。ヨーロッパとカリブ海は拡大図が別にあり、行った国を塗りながら記録できる。" },
    { cat:"beauty", date:"2026.09.18", motif:"m-bottle", brand:"COMPAGNIE DE PROVENCE", name:"リキッドマルセイユソープ カリテ 300ml", price:"¥3,300", code:"richcandle:10006523", url:"https://hb.afl.rakuten.co.jp/hgc/56e0cee5.4fd041f3.56e0ceea.3db7344d/_RTroom06836859_393520770_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frichcandle%2Fcp-karite-02%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/richcandle/cabinet/gpp5/karite-rs-aiim-01.jpg",
      blurb:"シアバターを配合した、釜炊き製法のフランス製リキッドソープ。アーモンドブロッサムとホワイトムスクの香りで、洗面所に置いたボトルの佇まいもいい。" },
    { cat:"kitchen", date:"2026.09.17", motif:"m-crate", brand:"家事問屋", name:"干しかご 2段", price:"¥7,700", code:"kougeishop:10000441", url:"https://hb.afl.rakuten.co.jp/hgc/579d3147.ecf6e860.579d3148.23f74d20/_RTroom06836859_393409015_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkougeishop%2Fkajidonya40115%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/kougeishop/cabinet/kajidonya/kajidonya40115.jpg",
      blurb:"ザルに食材を並べて重ね、ふたをするだけの2段の干しかご。燕三条のオールステンレスで、取り込むときに形が崩れず、食洗機にも入れられる。" },
    { cat:"interior", date:"2026.09.17", motif:"m-crate", brand:"COLLEND", name:"ワイヤーバスケットトロリー 15L", price:"¥8,800", code:"collend:10000051", url:"https://hb.afl.rakuten.co.jp/hgc/576ca46e.5915c03e.576ca482.fd1c6a54/_RTroom06836859_393409004_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcollend%2Fww-wbtrl-15l%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/collend/cabinet/items/cart/ww-wbtrl-15l.jpg",
      blurb:"幅29×奥行39cmのキャスター付きワイヤーバスケット。同じサイズ同士で積み重ねられるので、パントリーや植物置き場で縦に増やしていける。" },
    { cat:"interior", date:"2026.09.17", motif:"m-crate", brand:"COLLEND", name:"ワイヤーワゴン（レギュラー・シングル）", price:"¥8,360", code:"collend:10000000", url:"https://hb.afl.rakuten.co.jp/hgc/576ca46e.5915c03e.576ca482.fd1c6a54/_RTroom06836859_393408999_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcollend%2Fww-ww-rs%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/collend/cabinet/items/cart/ww-ww-rs.jpg",
      blurb:"本や雑誌を積んだまま動かせる、2段の低いワイヤーワゴン。鉄の風合いを残したクリア塗装で、溶接の跡や色ムラがそのまま表情になる。" },
    { cat:"fashion", date:"2026.09.16", motif:"m-tote", brand:"CITEN", name:"パデッド トートバッグ", price:"¥3,960", code:"stylife:13998534", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_393320078_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fhj8337%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/337/hj8337-41_1.jpg",
      blurb:"三角形のステッチでキルティングした、ハンドルまで中綿入りのトート。A4がしっかり入り、肩に掛けても持ち手が食い込みにくい。" },
    { cat:"fashion", date:"2026.09.16", motif:"m-tote", brand:"CITEN", name:"モコモコトートバッグ S", price:"¥3,520", code:"stylife:15795325", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_393320069_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsk2739%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/739/sk2739-02_1.jpg",
      blurb:"ふわふわの生地に太めのハンドルを合わせた小さめのトート。内ポケットがあるので、鍵と携帯を入れて近所の買い物に出られる。" },
    { cat:"fashion", date:"2026.09.16", motif:"m-tote", brand:"CITEN", name:"ロゴ ステートメント プリントバッグ", price:"¥2,322", code:"stylife:14166642", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_393320061_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fjb9363%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/363/jb9363-05_1.jpg",
      blurb:"片面にロゴ、もう片面にブランドのステートメントを刷ったキャンバストート。マチ付きでA4の書類が縦に入り、内ポケットでスマホと鍵を分けられる。" },
    { cat:"fashion", date:"2026.09.16", motif:"m-pouch", brand:"CITEN", name:"クシュクシュマイクロトート S", price:"¥1,980", code:"stylife:15666850", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_393320052_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Frw8367%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/367/rw8367-05_1.jpg",
      blurb:"ハンドルの下の小さな袋に、本体ごと押し込めるポケッタブルのミニトート。袋のゴムコードで、手持ちのバッグにチャームのように下げられる。" },
    { cat:"fashion", date:"2026.09.16", motif:"m-pouch", brand:"CITEN", name:"くるくるパッチン エコバッグ（ブロックチェック）", price:"¥1,980", code:"stylife:15840283", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_393320040_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsr6829%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/829/sr6829-01_1.jpg",
      blurb:"使い終わったら巻いてスナップで留めるだけのエコバッグ。縦長でマチがあり、パンや牛乳パックもそのまま入る。" },
    { cat:"goods", date:"2026.09.16", motif:"m-crate", brand:"SyuRo", name:"角缶 大", price:"¥3,850", code:"tremolo:10000789", url:"https://hb.afl.rakuten.co.jp/hgc/5793cd1e.a04dee17.5793cd1f.acf266cf/_RTroom06836859_393283645_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftremolo%2F10000789%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/tremolo/cabinet/02332755/1301a24.jpg",
      blurb:"約22×12×6cmの、ふた付きのブリキ缶。錆び止めをしていないぶん、鍵やペンやケーブルを放り込んで使ううちに色が変わっていく。" },
    { cat:"kitchen", date:"2026.09.15", motif:"m-mug", brand:"Staub", name:"ラ・ココット de GOHAN S（12cm）", price:"¥12,620", code:"osharecafe:10078219", url:"https://hb.afl.rakuten.co.jp/hgc/568f957a.bee95e77.568f9582.132aca18/_RTroom06836859_393228794_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fosharecafe%2F6043592%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/osharecafe/cabinet/product/download_2/6043592.jpg",
      blurb:"羽釜の丸みを鋳物ホーローで形にした、1合炊きのご飯鍋。ふたの裏に並んだ突起が蒸気を水滴に戻す仕組みで、一人分がちょうど炊ける大きさ。" },
    { cat:"fashion", date:"2026.09.15", motif:"m-sneaker", brand:"Timberland", name:"6インチ プレミアム ウォータープルーフ ブーツ", price:"¥30,800", code:"timberland:10015468", url:"https://hb.afl.rakuten.co.jp/hgc/578aae93.d2ae7c7a.578aae94.20fd4369/_RTroom06836859_393169958_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftimberland%2F10061%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/timberland/cabinet/25l/10061_713_d00-1.jpg",
      blurb:"1973年に生まれた、縫い目をシームシーリングした6インチの防水ブーツ。ウィートヌバックの起毛と足首の黒いパッドが、当時のままの顔で残っている。" },
    { cat:"kitchen", date:"2026.09.15", motif:"m-mug", brand:"bodum", name:"CHAMBORD ティーポット 1000ml", price:"¥4,400", code:"bodumshop:10000111", url:"https://hb.afl.rakuten.co.jp/hgc/568998e6.cb0dfdd0.568998e7.8065f4ed/_RTroom06836859_393169102_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbodumshop%2F1975%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/bodumshop/cabinet/item/chambord/1975.jpg",
      blurb:"ステンレスのフレームと耐熱ガラスを組み合わせたティーポット。好みの濃さになったら、ふたを外してフィルターを取り出す使い方です。" },
    { cat:"kitchen", date:"2026.09.14", motif:"m-wineglass", brand:"iittala", name:"カステヘルミ ボウル 230ml", price:"¥3,300", code:"scope:10005346", url:"https://hb.afl.rakuten.co.jp/hgc/565540e7.eef737ca.565540e8.3f8d2bf2/_RTroom06836859_393027861_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fscope%2Fiitkasbo230%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/scope/cabinet/iittala/iia49_a_im02.jpg",
      blurb:"1964年から作られている、露のしずくの粒をプレスガラスで並べたボウル。光が当たると影の形まで変わり、230mlはヨーグルトにも小鉢にも使える。" },
    // --- 2026.09.14 楽天ROOMから反映（10件） ---
    { cat:"fashion", date:"2026.09.14", motif:"m-sneaker", brand:"adidas", name:"Samba OG", price:"¥15,950", code:"adidas:10206786", url:"https://hb.afl.rakuten.co.jp/hgc/57609c04.763468c9.57609c09.98fb1480/_RTroom06836859_393026194_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fadidas%2Fb75806%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/adidas/cabinet/p1/b75806_l.jpg",
      blurb:"1950年代のインドアサッカーシューズが、ほぼそのままの形で残っている一足。白レザーにスエードのTトゥとガムソールで、薄い底のぶん足裏の感覚が近い。" },
    { cat:"interior", date:"2026.09.14", motif:"m-crate", brand:"Garden Trading", name:"ウォールラック（オーク）", price:"¥10,120", code:"sarahgraceshop:10004721", url:"https://hb.afl.rakuten.co.jp/hgc/578359d1.2ba3a204.578359d2.97080b3c/_RTroom06836859_393025485_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsarahgraceshop%2F000000028004%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/sarahgraceshop/cabinet/sg40/40507-01r.jpg",
      blurb:"オーク材の板に鋳物のフックを留めただけのウォールラック。黒い鉄と木目の対比が効いていて、帽子もコートも玄関の床に置かずに済む。" },
    { cat:"fashion", date:"2026.09.14", motif:"m-pouch", brand:"KAKSI", name:"Flap Mini Shoulder Pouch", price:"¥2,090", code:"zakkashop:10015952", url:"https://hb.afl.rakuten.co.jp/hgc/568f8dfe.eb2aa4d5.568f8e07.11acaea8/_RTroom06836859_392926768_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fzakkashop%2F31321%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/zakkashop/cabinet/imagebox33/31321-1-z.jpg",
      blurb:"丸いフラップが付いた2wayのミニショルダー。ベルトを外すとポーチになり、背面のクリアポケットはスマホを入れたまま画面を触れる。" },
    { cat:"fashion", date:"2026.09.14", motif:"m-pouch", brand:"KAKSI", name:"ミニ ショルダーポーチ（横型）", price:"¥2,090", code:"zakkashop:10019780", url:"https://hb.afl.rakuten.co.jp/hgc/568f8dfe.eb2aa4d5.568f8e07.11acaea8/_RTroom06836859_392926440_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fzakkashop%2F41594%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/zakkashop/cabinet/imagebox57/41594-1.jpg",
      blurb:"前と後ろにポケットを付けた横型のミニショルダー。幅23cmで長財布が寝かせて入り、背面のクリアポケットにはスマホの定位置がある。" },
    { cat:"fashion", date:"2026.09.14", motif:"m-tote", brand:"master-piece", name:"クリアポケット キャンバストート", price:"¥14,300", code:"galleria-annex:10036450", url:"https://hb.afl.rakuten.co.jp/hgc/56be2647.2eb6b3b0.56be2654.b1f3c846/_RTroom06836859_392903220_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgalleria-annex%2Fmsp00525%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/galleria-annex/cabinet/000264/msp00525.jpg",
      blurb:"前面が透明なポケットになった帆布のトート。入れたものがそのまま柄として見えるので、中身を替えるたびに表情が変わる。" },
    { cat:"fashion", date:"2026.09.14", motif:"m-polo-knit", brand:"LACOSTE", name:"ワントーン クルーネック 鹿の子ニット", price:"¥13,860", code:"lacoste:10008764", url:"https://hb.afl.rakuten.co.jp/hgc/577b30ab.dba46fbe.577b30ac.69b553bb/_RTroom06836859_392902497_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Flacoste%2Fmr8754%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/lacoste/cabinet/item/754/mr8754-34_1.jpg",
      blurb:"ポロシャツの鹿の子をそのままクルーネックにした一枚。ワニのワッペンまで同色にしてあり、近づかないと気づかない程度に沈めてある。" },
    { cat:"interior", date:"2026.09.14", motif:"m-crate", brand:"string", name:"string pocket（ストリング ポケット）", price:"¥21,890", code:"scope:10009536", url:"https://hb.afl.rakuten.co.jp/hgc/565540e7.eef737ca.565540e8.3f8d2bf2/_RTroom06836859_392902299_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fscope%2Fst-sp5015%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/scope/cabinet/string/sta11c11_a_im01-2.jpg",
      blurb:"1949年にスウェーデンで生まれた棚が、同じ形のまま売られている。細いワイヤーのラダーに棚板を掛けるだけなので、壁から棚が浮いて見える。" },
    { cat:"fashion", date:"2026.09.14", motif:"m-polo", brand:"GRAMICCI", name:"GRAMICCI PANT（オーガニックコットン ツイル）", price:"¥14,300", code:"moonloid:10001131", url:"https://hb.afl.rakuten.co.jp/hgc/5732ad04.2e3d3495.5732ad0b.d8aeeb7d/_RTroom06836859_392804173_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmoonloid%2F8657%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/moonloid/cabinet/2608/g102-ogt-ar2.jpg",
      blurb:"ウエストのガチャベルトだけでサイズが決まる定番のクライミングパンツ。股下に三角の布が入っていて、しゃがんでも膝まわりが突っ張らない。" },
    { cat:"daily", date:"2026.09.14", motif:"m-tissue", brand:"IKEUCHI ORGANIC", name:"オーガニック120 バスタオル 72×145cm", price:"¥5,280", code:"luastyle:10000699", url:"https://hb.afl.rakuten.co.jp/hgc/5773796b.686fbc68.5773796c.e52d613b/_RTroom06836859_392802583_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fluastyle%2F611410-447%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/luastyle/cabinet/zz/item61/imgrc0077539110.jpg",
      blurb:"今治で織るオーガニックコットン100%のバスタオル。糸の量を増やして織ってあるのに生地は薄手で、ベランダに干しても乾くまでが短い。" },
    { cat:"kitchen", date:"2026.09.14", motif:"m-bottle", brand:"白山陶器", name:"G型しょうゆさし（L）", price:"¥2,200", code:"natural69:10000045", url:"https://hb.afl.rakuten.co.jp/hgc/577374b9.4eceb602.577374ba.c9e3ceb8/_RTroom06836859_392790451_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fnatural69%2F10000045%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/natural69/cabinet/shohin01/thumbnail_wakunashi/gsyo_l_t0.jpg",
      blurb:"1958年から形を変えていない波佐見焼のしょうゆさし。注ぎ口の先を薄く切り上げてあるので、最後の一滴が垂れずに止まる。" },
    // --- 2026.09.11 楽天ROOMから反映（24件） ---
    { cat:"kitchen", date:"2026.09.11", motif:"m-crate", brand:"山崎実業 tower", name:"前が開く 隠せる調味料ラック", price:"¥11,000", code:"toolandmeal:10026502", url:"https://hb.afl.rakuten.co.jp/hgc/576a3b7a.b66630c8.576a3b7b.50cf52d0/_RTroom06836859_392670132_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftoolandmeal%2F105077031%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/toolandmeal/cabinet/yamajitsu/10281-1.jpg",
      blurb:"扉が手前に開く、閉じたまま置ける調味料ラック。上段は保存容器、下段はボトルが4本並ぶ二段構えで、隠しても取り出す手数が増えない。" },
    { cat:"kitchen", date:"2026.09.11", motif:"m-mug", brand:"Arabia", name:"アピラ プレート 21cm", price:"¥6,600", code:"scope:10107266", url:"https://hb.afl.rakuten.co.jp/hgc/565540e7.eef737ca.565540e8.3f8d2bf2/_RTroom06836859_392522865_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fscope%2Fara81b12111%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/scope/cabinet/arabia2/ara81b12111_a_im01.jpg",
      blurb:"クローバー柄を全面に散らした21cmのプレート。取り皿にも朝食の一枚にも届く径で、白い食卓に緑が一枚入るだけで軽く見える。" },
    { cat:"fashion", date:"2026.09.11", motif:"m-tote", brand:"PORTER", name:"BOYFRIEND TOTE トートバッグ(M)", price:"¥26,400", code:"galleria:10002419", url:"https://hb.afl.rakuten.co.jp/hgc/56ce67e8.1e3d48ed.56ce67f2.67050a66/_RTroom06836859_392522855_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgalleria%2F739-08514%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/galleria/cabinet/000064/739-08514.jpg",
      blurb:"撥水キャンバスに革のハンドルを合わせた日本製のトート。A4が縦に入る幅なのに口が広がりすぎず、中身が外から見えにくい。" },
    { cat:"fashion", date:"2026.09.11", motif:"m-socks", brand:"decka Quality socks", name:"ヘビーウエイト プレーン クルーソックス", price:"¥2,640", code:"rococostore:10027480", url:"https://hb.afl.rakuten.co.jp/hgc/564736a3.ee9171be.564736ab.eb9ebd96/_RTroom06836859_392520370_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frococostore%2F19719%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/rococostore/cabinet/acce17/19719_2_r1.jpg",
      blurb:"日本製の太い糸を、あえてゆるいローゲージで編んだクルーソックス。生地に厚みがあるので、素足に一枚で足元の重心が決まる。" },
    { cat:"interior", date:"2026.09.11", motif:"m-chair", brand:"artek", name:"スツール 60（コントラスティ）", price:"¥39,600", code:"scope:10073785", url:"https://hb.afl.rakuten.co.jp/hgc/565540e7.eef737ca.565540e8.3f8d2bf2/_RTroom06836859_392518749_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fscope%2Fata80a11111%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/scope/cabinet/artek/ata80a11111_a_im01.jpg",
      blurb:"アアルトが1933年に設計した、脚が天板に吸い込まれていく三本脚のスツール。重ねて隅に寄せれば、来客用の椅子とサイドテーブルを一つで兼ねる。" },
    { cat:"kitchen", date:"2026.09.11", motif:"m-tissue", brand:"Georg Jensen Damask", name:"エジプト ティータオル ハーフ", price:"¥1,500", code:"scope:10064853", url:"https://hb.afl.rakuten.co.jp/hgc/565540e7.eef737ca.565540e8.3f8d2bf2/_RTroom06836859_392518336_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fscope%2Fgea12a11%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/scope/cabinet/other/gea12a11_a_im02.jpg",
      blurb:"厚手のワッフル織りで、洗った食器をのせておくだけで水気が引くティータオル。水切りカゴを置いていた場所ごと空けられる。" },
    { cat:"fashion", date:"2026.09.11", motif:"m-sneaker", brand:"CAMPER", name:"RUNNER UP レザースニーカー", price:"¥25,300", code:"camper:10000035", url:"https://hb.afl.rakuten.co.jp/hgc/5754c851.5bbe32aa.5754c852.9a2c9049/_RTroom06836859_392383055_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcamper%2Fae8490%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/camper/cabinet/item/490/ae8490-01_1.jpg",
      blurb:"マヨルカ島のブランドがつくる、余計な線を足さない白いレザースニーカー。脱いだときに覗く赤いインソールだけが遊びになっている。" },
    { cat:"interior", date:"2026.09.11", motif:"m-polo-knit", brand:"KLIPPAN", name:"ウール シングルブランケット FLOOR", price:"¥37,400", code:"risoukyou:10273969", url:"https://hb.afl.rakuten.co.jp/hgc/5754cd3b.010c8c95.5754cd3c.30501239/_RTroom06836859_392364743_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frisoukyou%2Fmka-6085%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/risoukyou/cabinet/item/item0065/mka-6085_9.jpg",
      blurb:"スウェーデンの織元が織るエコウールのブランケット。130×180cmあるので、ソファに掛けても寝室に持ち込んでも足りる大きさ。" },
    { cat:"fashion", date:"2026.09.11", motif:"m-polo-knit", brand:"JOHN SMEDLEY", name:"HARCOURT モックネック ニット 30ゲージ", price:"¥29,000", code:"mb:10264120", url:"https://hb.afl.rakuten.co.jp/hgc/5642f255.dfdaa4f2.5642f256.e4ad01cd/_RTroom06836859_392364101_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmb%2Fharcourt%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/mb/cabinet/img476/harcourt02.jpg",
      blurb:"英国製30ゲージのエクストラファインメリノを使ったモックネック。首まわりが詰まりすぎない高さで、シャツの上から着ても襟が喧嘩しない。" },
    { cat:"kitchen", date:"2026.09.11", motif:"m-mug", brand:"かもしか道具店", name:"陶の飯びつ ふつう（約1.5合）", price:"¥5,500", code:"designers-and-labo:10004824", url:"https://hb.afl.rakuten.co.jp/hgc/571780a2.0cb41460.571780a3.c261aad2/_RTroom06836859_392353110_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fdesigners-and-labo%2F1499-0127-02%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/designers-and-labo/cabinet/kamoshika/meshi/1499-0127-02.jpg",
      blurb:"炊いたごはんをそのまま入れておく萬古焼の飯びつ。蓋の裏が素焼きのままなので、余分な水分をそこが受け止める。" },
    { cat:"interior", date:"2026.09.11", motif:"m-vase", brand:"Paper Collective", name:"アートポスター Composition 01", price:"¥9,900", code:"kozlife:10009814", url:"https://hb.afl.rakuten.co.jp/hgc/56d1d5d9.628a490d.56d1d5da.af3e4210/_RTroom06836859_392350284_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkozlife%2F15097%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/kozlife/cabinet/db/papercollective/15098d.jpg",
      blurb:"美術館の複製画と同じジークレー印刷で刷った一枚。12色の顔料インクと中性紙の組み合わせで、飾りっぱなしにしても色が沈みにくい。" },
    { cat:"interior", date:"2026.09.11", motif:"m-stand", brand:"HAY", name:"PC ポータブル ランプ", price:"¥19,800", code:"attract:10018680", url:"https://hb.afl.rakuten.co.jp/hgc/56516bb8.0d3eef81.56516bb9.281574a0/_RTroom06836859_392267949_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fattract%2Fhay_pc-portable%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/attract/cabinet/hay/pcp_00.jpg",
      blurb:"充電式なのでコードの行き先を考えずに置けるポータブルランプ。全6色どれも彩度が控えめで、屋外に持ち出しても浮かない。" },
    { cat:"goods", date:"2026.09.11", motif:"m-notebook", brand:"MOLESKINE", name:"2027年 手帳 不思議の国のアリス ウィークリー ラージ", price:"¥5,170", code:"moleskine:10000768", url:"https://hb.afl.rakuten.co.jp/hgc/574bd9d8.6e6278ab.574bd9d9.67cbc7c6/_RTroom06836859_392267432_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmoleskine%2Fdhal12wn3y27%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/moleskine/cabinet/newitems_4/dhal12wn3y27_00.jpg",
      blurb:"2027年1月始まりのウィークリーに、今年はアリス柄の限定版。ピンクのハードカバーにステッカーが付いて、書き始める前から楽しい。" },
    { cat:"kitchen", date:"2026.09.11", motif:"m-mug", brand:"Lisa Larson", name:"パパ／pappa マグ", price:"¥3,850", code:"freedesign:10007901", url:"https://hb.afl.rakuten.co.jp/hgc/574bd937.345519e0.574bd938.89667079/_RTroom06836859_392220163_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ffreedesign%2Fdillpp001%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/freedesign/cabinet/img09/dillpp001-image01-sq.jpg",
      blurb:"リサ・ラーソンの顔の絵付けが効いた陶器のマグ。ぽってりした厚みで、手のひらに収まったときの重さに安心感がある。" },
    { cat:"interior", date:"2026.09.11", motif:"m-crate", brand:"MOEBE", name:"ギャラリーシェルフ 115cm", price:"¥20,405", code:"ko-jo:10002342", url:"https://hb.afl.rakuten.co.jp/hgc/56328232.eede3f62.56328233.565dd845/_RTroom06836859_392219907_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fko-jo%2Fmoebe-gallery-shelf-115%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/ko-jo/cabinet/moebe/gallery-shelf-115-7.jpg",
      blurb:"壁に取り付けるだけの奥行8cmの棚。ポスターも本も立てかけるだけで、部屋の壁がそのままギャラリーになる。" },
    { cat:"fashion", date:"2026.09.11", motif:"m-polo-knit", brand:"Johnstons of Elgin", name:"カシミヤ タータンチェック マフラー", price:"¥58,300", code:"stylife:15321812", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_392103180_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fqh5616%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/616/qh5616-03_1.jpg",
      blurb:"スコットランドで織られたカシミヤのタータンマフラー。首に一巻きするだけで顔まわりに色が集まる配色になっている。" },
    { cat:"daily", date:"2026.09.11", motif:"m-socks", brand:"Francfranc", name:"プードルボア ルームシューズ（グリーン）", price:"¥2,700", code:"stylife:15053406", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_392100861_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fpb9323%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/323/pb9323-01_1.jpg",
      blurb:"足を入れると沈むプードルボアのルームシューズ。前が開いているので蒸れにくく、秋の初めから春先まで長く履ける。" },
    { cat:"interior", date:"2026.09.11", motif:"m-stand", brand:"Lemnos", name:"Campagne 掛け時計 電波 30cm", price:"¥11,000", code:"hotch-potch:10015167", url:"https://hb.afl.rakuten.co.jp/hgc/5656b4ef.86eb6137.5656b4f2.149257eb/_RTroom06836859_392072236_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhotch-potch%2F00009810_campagne%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/hotch-potch/cabinet/kago800_img1/00009810_1.jpg",
      blurb:"ブナ材の縁が丸い直径30cmの掛け時計。秒針を省いてあるので音がなく、寝室にも書斎にも掛けられる。" },
    { cat:"fashion", date:"2026.09.11", motif:"m-pouch", brand:"coen", name:"レザーライク 巾着ショルダーバッグ", price:"¥3,603", code:"stylife:15174255", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_392059218_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fps3189%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/189/ps3189-09_1.jpg",
      blurb:"口を絞るだけで形が決まるレザーライクの巾着ショルダー。手持ちにも肩がけにもなり、置いたときにくたっと崩れる表情がある。" },
    { cat:"interior", date:"2026.09.11", motif:"m-stand", brand:"DRAW A LINE", name:"Tension Rod C（Vertical）ブラック", price:"¥7,590", code:"heianshindo:10000023", url:"https://hb.afl.rakuten.co.jp/hgc/57420df5.6ed329b1.57420df6.f84dca85/_RTroom06836859_392057089_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fheianshindo%2Fd-c-bk%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/heianshindo/cabinet/08085141/d-c-bk/imgrc0130585997.jpg",
      blurb:"床から天井まで一本通すだけの縦の収納。取付寸法は200〜275cmで、棚やフックを足せば本も上着も床から浮かせられる。" },
    { cat:"interior", date:"2026.09.11", motif:"m-chair", brand:"Helinox", name:"チェアワン", price:"¥15,800", code:"canpanera:10047132", url:"https://hb.afl.rakuten.co.jp/hgc/56643b4b.084520fc.56643b54.501da41b/_RTroom06836859_391926265_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcanpanera%2Fh04046%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/canpanera/cabinet/item262/item_h04046_0.jpg",
      blurb:"畳むと35cmまで縮むアウトドアチェア。960gと軽いのに耐荷重は145kgあって、ベランダにも部屋にも置きっぱなしにできる。" },
    { cat:"interior", date:"2026.09.11", motif:"m-vase", brand:"AYTM", name:"GLOBE フラワーポット S（ブラック）", price:"¥8,800", code:"chloros:10015748", url:"https://hb.afl.rakuten.co.jp/hgc/568f7c79.7d0e8053.568f7c7d.2410ab21/_RTroom06836859_391926243_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fchloros%2F2020100218%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/chloros/cabinet/107x/107x504670050012.jpg",
      blurb:"真鍮のリングに載った球体のフラワーポット。直径21cmで、観葉植物の鉢カバーにも花器にも振れる。" },
    { cat:"kitchen", date:"2026.09.11", motif:"m-wineglass", brand:"Sghr（スガハラ）", name:"ディンプル 9オンス オールドグラス 280ml", price:"¥2,200", code:"receno:10017908", url:"https://hb.afl.rakuten.co.jp/hgc/566a652b.e5da1afb.566a652d.fb4e4fef/_RTroom06836859_391924604_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Freceno%2Fdimplegl%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/receno/cabinet/glass/dimplegl/img/0000053242020.jpg",
      blurb:"手吹きガラスのくぼみが光を拾うオールドグラス。280mlで氷を入れてもゆとりがあり、水割りにもアイスコーヒーにも回せる。" },
    { cat:"kitchen", date:"2026.09.11", motif:"m-tissue", brand:"fog linen work", name:"リネン キッチンクロス 45×65cm", price:"¥2,090", code:"receno:10017552", url:"https://hb.afl.rakuten.co.jp/hgc/566a652b.e5da1afb.566a652d.fb4e4fef/_RTroom06836859_391913094_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Freceno%2Ffog-kc%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/receno/cabinet/apron/fog-kc/img/0000050531020.jpg",
      blurb:"リトアニアのリネンを使った45×65cmのキッチンクロス。洗うほど柔らかくなる生地で、食器拭きにもランチョンマットにも回せる。" },
    // --- 2026.09.05 楽天ROOMから反映（26件） ---
    { cat:"gadget", date:"2026.09.05", motif:"m-mixer", brand:"±0", name:"スチーム式加湿器 H220", price:"¥24,200", code:"hotch-potch:10017675", url:"https://hb.afl.rakuten.co.jp/hgc/5656b4ef.86eb6137.5656b4f2.149257eb/_RTroom06836859_391572178_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhotch-potch%2F00014485-xqkh220%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/hotch-potch/cabinet/kago_img12/00014485_5.jpg",
      blurb:"上から注ぐだけで給水できるスチーム式。フィルターが無いので洗うのはタンクとフタだけで、3Lの容量でも手入れの手数が増えない。" },
    { cat:"kitchen", date:"2026.09.05", motif:"m-mug", brand:"yumiko iihoshi porcelain × 木村硝子店", name:"dishes 220 plate（moss gray matte）", price:"¥4,180", code:"prokitchen:10015600", url:"https://hb.afl.rakuten.co.jp/hgc/5695d10f.ebf4c29f.5695d111.c35e5d7b/_RTroom06836859_391571923_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fprokitchen%2Fki-dish220p-mgm%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/prokitchen/cabinet/kimuraglass/ki-dish220p-mgm_img1.jpg",
      blurb:"直径22cmで、リムが深めに立ち上がったプレート。マットな釉薬のぶん、汁気のあるおかずを盛っても縁のラインが残る。" },
    { cat:"fashion", date:"2026.09.05", motif:"m-tote", brand:"STANDARD SUPPLY", name:"SIMPLICITY 2ウェイ ドローストリングトート", price:"¥18,700", code:"standardsupply:10000109", url:"https://hb.afl.rakuten.co.jp/hgc/57204858.ac8a1b37.57204859.a6283d29/_RTroom06836859_391571429_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstandardsupply%2F4100615%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/standardsupply/cabinet/41001/10804505/4100615.jpg",
      blurb:"口元を絞れる巾着仕様のナイロントート。ストラップを外すと手持ちに変わり、両サイドのボトルポケットで中身の定位置が決まる。" },
    { cat:"interior", date:"2026.09.05", motif:"m-chair", brand:"中川政七商店", name:"招福 招き猫 みくじ（白・黒セット）", price:"¥1,188", code:"designers-and-labo:10005296", url:"https://hb.afl.rakuten.co.jp/hgc/571780a2.0cb41460.571780a3.c261aad2/_RTroom06836859_391448230_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fdesigners-and-labo%2Fmikuji-manekineko-s%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/designers-and-labo/cabinet/nakagawa/mikuji-manekoneko-s.jpg",
      blurb:"中におみくじが仕込まれた陶製の招き猫。引いたあとは置物として残る作りで、白と黒を並べると顔つきの差が出る。" },
    { cat:"kitchen", date:"2026.09.05", motif:"m-mug", brand:"STANLEY", name:"カフェトゥーゴー トラベルマグ 0.23L", price:"¥3,300", code:"hotch-potch:10015578", url:"https://hb.afl.rakuten.co.jp/hgc/5656b4ef.86eb6137.5656b4f2.149257eb/_RTroom06836859_391448080_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhotch-potch%2F00010353_ms_mug023l%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/hotch-potch/cabinet/kago800_img1/00010353.jpg",
      blurb:"上部に持ち手を付けた真空断熱のマグ。0.23Lの手のひらサイズで蓋は密閉式、バッグに立てずに入れられる形をしている。" },
    { cat:"daily", date:"2026.09.05", motif:"m-crate", brand:"無印良品", name:"ポリプロピレン 収納ストッカー キャスター付2（幅18cm）", price:"¥4,990", code:"mujirushi-ryohin:10008404", url:"https://hb.afl.rakuten.co.jp/hgc/57177ea9.c2f1e728.57177eaa.e234453a/_RTroom06836859_391447850_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmujirushi-ryohin%2F4550583832131%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/mujirushi-ryohin/cabinet/item43/4550583832131.jpg",
      blurb:"幅18cmの隙間に差し込めるキャスター付きのストッカー。引き出しの深さが段ごとに違うので、入れるものの高さで段を選べる。" },
    { cat:"interior", date:"2026.09.05", motif:"m-stand", brand:"ARTWORKSTUDIO", name:"テーブルランプ Nocturne LED-table lamp", price:"¥40,700", code:"artworkstudio:10002329", url:"https://hb.afl.rakuten.co.jp/hgc/57177d7a.48810faa.57177d7b.98dccafc/_RTroom06836859_391447529_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fartworkstudio%2Faw-0686%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/artworkstudio/cabinet/desk_lamp/aw-0686/0686-image-1.jpg",
      blurb:"真鍮のメッシュシェード越しに光が抜ける充電式のランプ。スタンドを外すと卓上サイズになるので、置き場所を後から決められる。" },
    { cat:"fashion", date:"2026.09.05", motif:"m-sneaker", brand:"SUBU", name:"ウィンターサンダル（冬のサンダル）", price:"¥5,280", code:"geostyle:10010268", url:"https://hb.afl.rakuten.co.jp/hgc/570b4fa9.f89e5108.570b4faa.e1e6bce5/_RTroom06836859_391432274_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgeostyle%2F4977468%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/geostyle/cabinet/subu/subu23_d1.jpg",
      blurb:"冬用のサンダル。撥水加工だけで雨の日の使用条件を決めず、購入するタイプの案内を確認します。公式FAQは水につけての丸洗いと洗濯機の使用を避けるよう案内しています。" },
    { cat:"goods", date:"2026.09.05", motif:"m-pouch", brand:"土屋鞄製造所", name:"ナチューラ ヌメ革Lファスナー", price:"¥11,000", code:"takuminowaza:10000589", url:"https://hb.afl.rakuten.co.jp/hgc/570b4e59.cc1d7e16.570b4e5a.d0762a1d/_RTroom06836859_391432087_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftakuminowaza%2Fna2401%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/takuminowaza/cabinet/sku/na/na3724-001.jpg",
      blurb:"染料仕上げのヌメ革をL字ファスナーでまとめた財布。札とカードと小銭が入るのに、畳んでもポケットの厚みが出にくい。" },
    { cat:"interior", date:"2026.09.05", motif:"m-polo-knit", brand:"LAPUAN KANKURIT × B:MING by BEAMS", name:"LAMMAS ブランケット（別注）", price:"¥9,900", code:"beams:10089988", url:"https://hb.afl.rakuten.co.jp/hgc/56b1b0bd.4089e12f.56b1b0be.806b9300/_RTroom06836859_391431996_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbeams%2Fef7198%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/beams/cabinet/item/198/ef7198-01_1.jpg",
      blurb:"フィンランドの織元による羊柄のブランケット。コットンなので夏も出しておける厚みで、ソファに掛けたときの柄の出方がいい。" },
    { cat:"daily", date:"2026.09.05", motif:"m-bottle", brand:"KINTO", name:"SCHALE ガラスケース 100×85mm（フロスト）", price:"¥2,660", code:"livingut:10187108", url:"https://hb.afl.rakuten.co.jp/hgc/56a0e0e6.306a1ea3.56a0e0eb.fdabbeb8/_RTroom06836859_391260931_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Flivingut%2F421235%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/livingut/cabinet/maker_kinto8/421235.jpg",
      blurb:"すりガラス調のフロスト仕上げをした耐熱ガラスのケース。洗面まわりの小物を入れる候補です。熱い状態で急冷したり、濡れた場所へ置いたりしないようにします。" },
    { cat:"interior", date:"2026.09.05", motif:"m-chair", brand:"Bloomingville", name:"Cory クッション 50×50cm", price:"¥9,900", code:"chloros:10027417", url:"https://hb.afl.rakuten.co.jp/hgc/568f7c79.7d0e8053.568f7c7d.2410ab21/_RTroom06836859_391149490_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fchloros%2F260731002%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/chloros/cabinet/15x/15x82069372.jpg",
      blurb:"緑の濃淡をタフティングで起こしたストライプのクッション。毛足に高低差があるぶん、光の角度で縞の見え方が変わる。" },
    { cat:"fashion", date:"2026.09.05", motif:"m-watch", brand:"agete", name:"K10ダイヤモンドピアス", price:"¥27,720", code:"stylife:12644681", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_391145129_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fbb3662%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/662/bb3662-01_1.jpg",
      blurb:"透かし彫りのモチーフの真ん中に、ダイヤを一粒だけ留めたピアス。7mm角ほどの小ささなので、光る面積のわりに主張しない。" },
    { cat:"interior", date:"2026.09.05", motif:"m-vase", brand:"Flying Tiger Copenhagen", name:"キャンドルホルダー（リス）", price:"¥495", code:"flyingtigercopenhagen:10009089", url:"https://hb.afl.rakuten.co.jp/hgc/57033ffe.87bbff5f.57033fff.82763b88/_RTroom06836859_391145027_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fflyingtigercopenhagen%2F3073321%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/flyingtigercopenhagen/cabinet/ai2026_1/3073321_01.jpg",
      blurb:"どんぐりを抱えたリスの陶器で、頭のくぼみにティーライトを立てる作り。6.5×9.5cmと小さいので、棚の隅の余白に置ける。" },
    { cat:"gadget", date:"2026.09.05", motif:"m-pouch", brand:"moshi", name:"Pluma Pouch", price:"¥2,970", code:"mjsoft:10006408", url:"https://hb.afl.rakuten.co.jp/hgc/57033f77.9bf72dc2.57033f78.0a5433ca/_RTroom06836859_391144894_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmjsoft%2F091506-op%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/mjsoft/cabinet/item-images30/091506-op-1.jpg",
      blurb:"ヘリンボーンの織り地にマチを付けた箱型のポーチ。中で機材が泳がないので、充電器とケーブルをまとめたまま持ち出せる。" },
    { cat:"kitchen", date:"2026.09.05", motif:"m-scale", brand:"家事問屋", name:"ディッシュスタンド 26", price:"¥3,630", code:"prokitchen:10019920", url:"https://hb.afl.rakuten.co.jp/hgc/5695d10f.ebf4c29f.5695d111.c35e5d7b/_RTroom06836859_391144561_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fprokitchen%2Fkd41645%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/prokitchen/cabinet/kd/kd41645_img1r.jpg",
      blurb:"燕三条のステンレスで組んだ皿立て。仕切りは9枚分あって、平皿を立てたままシンク下の高さを縦に使える。" },
    { cat:"fashion", date:"2026.09.05", motif:"m-tote", brand:"HIPPOPOTAMUS × TEMBEA", name:"バケットトート ミニ 15×25cm", price:"¥18,700", code:"hippopotamus:10001085", url:"https://hb.afl.rakuten.co.jp/hgc/56fc3991.aea1f7c8.56fc3992.d43e6e2e/_RTroom06836859_391021213_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhippopotamus%2Ftotb10%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/hippopotamus/cabinet/products/13127762/imgrc0147934786.jpg",
      blurb:"オーガニックコットンとバンブーのパイル地で仕立てたタオル地のトート。15×25cmと小さく、ネイビーとローズの2色がある。" },
    { cat:"daily", date:"2026.09.05", motif:"m-crate", brand:"MOHEIM", name:"SWING BIN", price:"¥8,030", code:"ko-jo:10001464", url:"https://hb.afl.rakuten.co.jp/hgc/56328232.eede3f62.56328233.565dd845/_RTroom06836859_391021151_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fko-jo%2Fmoheim_swingbin_s%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/ko-jo/cabinet/moheim/swing-bin/0.jpg",
      blurb:"円筒のボディに木の蓋を載せたスイング式のダストボックス。中身も袋の口も隠れるので、リビングの見える場所に置ける。" },
    { cat:"goods", date:"2026.09.05", motif:"m-notebook", brand:"LEUCHTTURM1917", name:"バウハウス エディション A5 ハードカバー", price:"¥5,500", code:"heiwado-online:10000032", url:"https://hb.afl.rakuten.co.jp/hgc/56fc385c.b2b7a841.56fc385d.b652276f/_RTroom06836859_391020976_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fheiwado-online%2Flt-bauhaus-a5-hc%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/heiwado-online/cabinet/leuchtturm/item-img/lt-bh_img.jpg",
      blurb:"赤・レモン・ロイヤルブルー・黒の4色で出したドット方眼のノート。原色の表紙なので、机に積んでも下から探し当てられる。" },
    { cat:"beauty", date:"2026.09.05", motif:"m-tube", brand:"SABON", name:"バターハンドクリーム 30ml", price:"¥1,980", code:"sabon:10000213", url:"https://hb.afl.rakuten.co.jp/hgc/56588ed0.34b0deb0.56588ed4.5e7e33c9/_RTroom06836859_391020489_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsabon%2Fs0179%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/sabon/cabinet/prd/s0179/s0179_1.jpg",
      blurb:"ポーチに入る30mlのチューブ。香りが8種類あるので、季節や気分で選び直せる大きさに収めてある。" },
    { cat:"daily", date:"2026.09.05", motif:"m-chair", brand:"BLUNT", name:"CLASSIC 長傘", price:"¥23,100", code:"caetla:10000401", url:"https://hb.afl.rakuten.co.jp/hgc/56f62108.47e19d9a.56f62109.f0772cfe/_RTroom06836859_390946606_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcaetla%2Fcoblunt_cla%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/caetla/cabinet/10827759/imgrc0111657172.jpg",
      blurb:"骨の先端まで丸く収めた耐風設計の長傘。面のまま風を受ける構造で、メドウグリーンとオーシャンブルーは雨の日ほど色が立つ。" },
    { cat:"fashion", date:"2026.09.05", motif:"m-watch", brand:"TIMEX", name:"ウィークエンダー 37mm", price:"¥16,500", code:"worldwidewatch:10001516", url:"https://hb.afl.rakuten.co.jp/hgc/56f6203d.cecc00ff.56f6203e.7b058626/_RTroom06836859_390946148_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fworldwidewatch%2Ftx-v-wk37%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/worldwidewatch/cabinet/item/tx02/tx-v-wk37-3.jpg",
      blurb:"38mmから1mm、ラグ幅は2mm削った新しいウィークエンダー。ベルトが引き通しからNATOに変わり、文字盤には日付が増えた。" },
    { cat:"kitchen", date:"2026.09.05", motif:"m-mug", brand:"HARIO", name:"V60ドリッパー NEO 01/02", price:"¥1,980", code:"hario-onlinestore:10001556", url:"https://hb.afl.rakuten.co.jp/hgc/56ed7ee4.0f796b40.56ed7ee5.6b6706ca/_RTroom06836859_390890349_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhario-onlinestore%2Fvdn-b%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/hario-onlinestore/cabinet/items/imgrc0112370792.jpg",
      blurb:"スパイラルリブを立てた円錐ドリッパー。湯の抜けが速くなる構造で、1〜2杯用と1〜4杯用のサイズが選べる。" },
    { cat:"fashion", date:"2026.09.05", motif:"m-sneaker-trail", brand:"HOKA", name:"CLIFTON 11 WIDE", price:"¥19,800", code:"alpen:10521399", url:"https://hb.afl.rakuten.co.jp/hgc/56e6d018.45e91554.56e6d019.0601aca4/_RTroom06836859_390719735_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Falpen%2F4304235716%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/alpen/cabinet/img/1010/4304235716_7.jpg",
      blurb:"ソールまで黒で通したクリフトンのワイド。厚いミッドソールのわりに色が締まっているので、普段着に混ぜても運動靴に寄りにくい。" },
    { cat:"daily", date:"2026.09.05", motif:"m-diffuser", brand:"APOTHEKE FRAGRANCE", name:"インセンス 25本入", price:"¥2,750", code:"diginc:10000357", url:"https://hb.afl.rakuten.co.jp/hgc/56e6d15b.b70d3ad5.56e6d15c.f86b47c7/_RTroom06836859_390682365_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fdiginc%2Fapotheke-02%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/diginc/cabinet/apotheke/incense1-main.jpg",
      blurb:"1本あたり約100分燃える日本製のお香が25本。クラフト紙のチューブに収めただけの素っ気ない見た目で、出しておいても浮かない。" },
    { cat:"interior", date:"2026.09.05", motif:"m-stand", brand:"BRAUN", name:"アラームクロック BC02XW", price:"¥5,280", code:"nordicfeeling:10000094", url:"https://hb.afl.rakuten.co.jp/hgc/56e6d10f.62812c8a.56e6d110.d143554b/_RTroom06836859_390673021_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fnordicfeeling%2Fbc02xw%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/nordicfeeling/cabinet/image_thumb/braun/bc02xw_ic2.jpg",
      blurb:"白い文字盤に、黄色の秒針とノブだけが差し色で入った置き時計。ディーター・ラムスの流れをくむ面の構成が5,000円台にある。" },
    // --- 2026.08.27 楽天ROOMから反映（28件） ---
    { cat:"fashion", date:"2026.08.27", motif:"m-watch", brand:"agete", name:"K10アメジスト×パール ピアスチャーム", code:"stylife:14200988", price:"¥23,100", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_390566177_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fjg6089%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/089/jg6089-01_1.jpg",
      blurb:"K10のチェーンに、アメジストとパールを一粒ずつ。揺れるたびに紫と白が入れ替わって見えるつくりが面白い。" },
    { cat:"fashion", date:"2026.08.27", motif:"m-polo-knit", brand:"TOMORROWLAND", name:"diotima メリノメッシュ ストライプ タートルネックニット", code:"stylife:15667954", price:"¥76,560", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_390557925_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Frx6654%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/654/rx6654-02_1.jpg",
      blurb:"メッシュ編みと詰まった編み地を切り替えたコラボニット。首まわりは覆うのに腕は透ける、その温度差が効いている。" },
    { cat:"beauty", date:"2026.08.27", motif:"m-bottle", brand:"COMPAGNIE DE PROVENCE", name:"リキッドマルセイユソープ EXTRA PUR", code:"entresquare:10015251", price:"¥2,750", url:"https://hb.afl.rakuten.co.jp/hgc/56dfe8af.c6c53506.56dfe8b0.ec4ffc4f/_RTroom06836859_390557886_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fentresquare%2F3551780000102%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/entresquare/cabinet/07543139/3551780000102_42.jpg",
      blurb:"植物由来のマルセイユ石けんを液体にしたソープ。300ml・495ml・1000mlと並ぶ細身のボトルは、洗面台に出したままでも気にならない。" },
    { cat:"goods", date:"2026.08.27", motif:"m-cable", brand:"GEORG JENSEN", name:"ELLIPSE キーリング", code:"stylifemen:10982601", price:"¥6,600", url:"https://hb.afl.rakuten.co.jp/hgc/56430753.d3416592.56430757.a1dc5f63/_RTroom06836859_390557816_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylifemen%2Fmr8056%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylifemen/cabinet/item/056/mr8056-01_1.jpg",
      blurb:"楕円のリングに、ステンレスの粒がひとつ。鍵をまとめるだけの道具なのに、置いてあるだけで様になる形をしている。" },
    { cat:"kitchen", date:"2026.08.27", motif:"m-mug", brand:"iittala", name:"ティーマ マグカップ 0.3L（アイスブルー）", price:"¥3,630", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_390449599_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fpx9225%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/225/px9225-01_1.jpg",
      blurb:"カイ・フランクの定番マグに、淡いアイスブルー。持ち手が細めなので、別の色と重ねて置いてもうるさくならない。" },
    { cat:"fashion", date:"2026.08.27", motif:"m-tote", brand:"PORTER", name:"FORCE ショルダーバッグ(S)", code:"galleria:10018189", price:"¥35,200", url:"https://hb.afl.rakuten.co.jp/hgc/56ce67e8.1e3d48ed.56ce67f2.67050a66/_RTroom06836859_390449635_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgalleria%2F855-05457%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/galleria/cabinet/porter-h5/855-05457.jpg",
      blurb:"ミリタリー由来のナイロンで組んだ小さめのショルダー。斜めがけしても厚みが出ないので、上着の内側にも収まりそう。" },
    { cat:"fashion", date:"2026.08.27", motif:"m-sneaker", brand:"PUMA", name:"スピードキャット OG", code:"puma:10061409", price:"¥15,400", url:"https://hb.afl.rakuten.co.jp/hgc/56d9135f.4fcc6a5a.56d91360.700870df/_RTroom06836859_390449047_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fpuma%2F398846_01%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/puma/cabinet/202410_3/398846_01_mod01.jpg",
      blurb:"レーシングシューズ由来の薄いソールで、足の輪郭がそのまま出る一足。裾の長いパンツに合わせたときの細さが効く。" },
    { cat:"beauty", date:"2026.08.27", motif:"m-tube", brand:"Jurlique", name:"ローズ ラブバーム", code:"stylife:14403371", price:"¥2,090", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_390447782_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fke3447%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/447/ke3447-01_1.jpg",
      blurb:"ローズの香りをまとった缶入りのバーム。唇にも指先にも使える形で、ポーチに転がしておける大きさ。" },
    { cat:"fashion", date:"2026.08.27", motif:"m-tote", brand:"Marmot", name:"Highlander バックパック 28L", code:"galleria:10045351", price:"¥14,850", url:"https://hb.afl.rakuten.co.jp/hgc/56ce67e8.1e3d48ed.56ce67f2.67050a66/_RTroom06836859_390442658_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgalleria%2Fmar00048%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/galleria/cabinet/202608_1/mar00048.jpg",
      blurb:"B4が入って28Lある通勤向けのバックパック。撥水生地だけれど表情は控えめで、アウトドア色が出すぎない。" },
    { cat:"interior", date:"2026.08.27", motif:"m-vase-wave", brand:"ferm LIVING", name:"Komo Mini Vases 3個セット", code:"kozlife:10011546", price:"¥8,030", url:"https://hb.afl.rakuten.co.jp/hgc/56d1d5d9.628a490d.56d1d5da.af3e4210/_RTroom06836859_390312380_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkozlife%2F1104269711%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/kozlife/cabinet/db/fermliving/object/1104269711a.jpg",
      blurb:"口の細い小さな花瓶が3つ。高さも釉薬の出方も少しずつ違うので、一輪ずつ挿して並べると陰影が出る。" },
    { cat:"interior", date:"2026.08.27", motif:"m-stand", brand:"INTERFORM", name:"テーブルライト ペルナ", code:"interform-inc:10003984", price:"¥17,270", url:"https://hb.afl.rakuten.co.jp/hgc/56d20b36.a84ac64a.56d20b37.f4cfe622/_RTroom06836859_390307124_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Finterform-inc%2Flt-4327-9%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/interform-inc/cabinet/4/lt-4327-9_icon.jpg",
      blurb:"木を削り出した脚に、プリーツの布セード。ベッドサイドに置いたときの灯りの落ち方がやわらかい。" },
    { cat:"fashion", date:"2026.08.27", motif:"m-sneaker", brand:"BEAMS × BIRKENSTOCK", name:"別注 BOSTON “BONE PATTERN”", code:"beams:10095921", price:"¥28,600", url:"https://hb.afl.rakuten.co.jp/hgc/56b1b0bd.4089e12f.56b1b0be.806b9300/_RTroom06836859_390307067_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbeams%2Frq8447%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/beams/cabinet/item/447/rq8447-01_1.jpg",
      blurb:"スムースレザーを黒一色でまとめた別注のボストン。コルクの底まで暗く落としてあるので、サンダルなのに重心が低く見える。" },
    { cat:"interior", date:"2026.08.27", motif:"m-vase", brand:"Georg Jensen", name:"NENDO ティーライト キャンドルホルダー", code:"shinwashop:10010570", price:"¥12,100", url:"https://hb.afl.rakuten.co.jp/hgc/56739bc0.6c904c85.56739bc1.1c345c63/_RTroom06836859_390306936_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshinwashop%2Fgeo-10019649%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/shinwashop/cabinet/10973454/geo-10019649-1.jpg",
      blurb:"佐藤オオキが手がけた、ステンレスを折り曲げただけのようなキャンドルホルダー。火を入れると鏡面のほうにも炎が映る。" },
    { cat:"kitchen", date:"2026.08.27", motif:"m-bottle", brand:"Kiyokyou", name:"マットウォーターボトル 420ml", code:"kiyokyou:10001537", price:"¥2,280", url:"https://hb.afl.rakuten.co.jp/hgc/56cf31cd.fd0e44b3.56cf31ce.43ac74c4/_RTroom06836859_390259710_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkiyokyou%2Fky-natu018%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/kiyokyou/cabinet/iw202401/11729031/ky-natu018-1.jpg",
      blurb:"曇りガラスの胴に、くぼみだけのハンドル。氷を入れても持つところがふさがらないので、麦茶ポットとしても置いておけそう。" },
    { cat:"goods", date:"2026.08.27", motif:"m-pouch", brand:"Bellroy", name:"SLIM SLEEVE 二つ折り財布", code:"moccasin:10019622", price:"¥11,850", url:"https://hb.afl.rakuten.co.jp/hgc/56cbce2d.3de04726.56cbce2e.a1a13119/_RTroom06836859_390188906_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmoccasin%2Fblrywssb%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/moccasin/cabinet/main06/blrywssb.jpg",
      blurb:"小銭入れを省いて、札とカードだけに絞った二つ折り。畳んでもポケットのラインが崩れない薄さで、色数も多い。" },
    { cat:"kitchen", date:"2026.08.27", motif:"m-mixer", brand:"Aladdin", name:"グラファイトトースター 1枚焼き CAT-G8A", code:"patie:10115259", price:"¥15,180", url:"https://hb.afl.rakuten.co.jp/hgc/56cba4d8.0e16b6c7.56cba4d9.ab6aa1b4/_RTroom06836859_390188889_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fpatie%2Fgoods-01836%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/patie/cabinet/product/aladdin/sub_goods-01836_s5.jpg",
      blurb:"食パン1枚用の、丸みのあるトースター。本体幅は約21.8cmですが、設置には周囲の空間も必要。火気や水のかかる場所を避け、説明書の設置条件を確認してください。" },
    { cat:"kitchen", date:"2026.08.27", motif:"m-scale", brand:"家事問屋", name:"横口付き ボウル・ザルセット 15/20/26cm", code:"e-goods:10018354", price:"¥4,950", url:"https://hb.afl.rakuten.co.jp/hgc/56cb79ae.36f30f53.56cb79af.b52305a4/_RTroom06836859_390188839_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fe-goods%2Fry1103337%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/e-goods/cabinet/th/ry1103337_th.jpg",
      blurb:"縁に注ぎ口が付いた燕三条のステンレスボウルとザル。3サイズが入れ子になるので、下ごしらえの道具を一か所にまとめられる。" },
    { cat:"gadget", date:"2026.08.27", motif:"m-stand", brand:"Sonos", name:"Era 100 スマートスピーカー", code:"superdeal:10002901", price:"¥32,800", url:"https://hb.afl.rakuten.co.jp/hgc/56cb4760.33675c19.56cb4761.bbeba3aa/_RTroom06836859_390188738_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsuperdeal%2F12509sonosera1002303%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/superdeal/cabinet/09061004/09771979/8717755779663_2.jpg",
      blurb:"円筒をそのまま立てたような、ボタンの目立たないスピーカー。棚に1台置くだけで済む大きさなのに、2台で左右に振り分けられる。" },
    { cat:"kitchen", date:"2026.08.27", motif:"m-wineglass", brand:"guzzini", name:"ティファニー サラダボウル L", price:"¥7,090", url:"https://hb.afl.rakuten.co.jp/hgc/56cac1f7.1dd62873.56cac1f8.de4a6448/_RTroom06836859_390173475_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fwebby%2F50552657%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/webby/cabinet/04957557/8008392267638.jpg",
      blurb:"表面が粒立ったクリアのボウル。盛るとその凹凸が光をひろうので、サラダでも果物でも見え方が変わる。" },
    { cat:"daily", date:"2026.08.27", motif:"m-tissue", brand:"DULTON", name:"TISSUE DISPENSER", code:"westream:10002775", price:"¥3,960", url:"https://hb.afl.rakuten.co.jp/hgc/5656b4c9.9db36b3c.5656b4d4.1beaaf81/_RTroom06836859_390077740_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fwestream%2Fdulton-100160c%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/westream/cabinet/dulton/dulton-100160c_3.jpg",
      blurb:"スチールの箱にペーパーを収めるだけのディスペンサー。壁付けでも据え置きでも使えて、色は5種類から選べる。" },
    { cat:"fashion", date:"2026.08.27", motif:"m-sneaker-trail", brand:"UNITED ARROWS green label relaxing", name:"＜On＞クラウド エックス 5", code:"stylife:15795172", price:"¥22,000", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_390077667_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsn0985%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/985/sn0985-01_1.jpg",
      blurb:"Onのクラウドソールを、白と黒だけに絞ったWEB限定色。正面から見てもソールの穴の並びが揃っているのが気持ちいい。" },
    { cat:"goods", date:"2026.08.27", motif:"m-pouch", brand:"DELFONICS", name:"キトリ ポーチM", code:"8989usagiya:10036891", price:"¥1,265", url:"https://hb.afl.rakuten.co.jp/hgc/56e16492.ac3e861b.56e16493.6727d1f5/_RTroom06836859_390077574_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2F8989usagiya%2F10036891%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/8989usagiya/cabinet/826/imgrc0094741339.jpg",
      blurb:"マチのない平たいポーチで、カバンの中で立てて差せる薄さ。全10色あるので、中身ごとに色を分けたくなる。" },
    { cat:"kitchen", date:"2026.08.27", motif:"m-mug", brand:"DURALEX", name:"ピカルディ", code:"accessiimonoshop:10011207", price:"¥229", url:"https://hb.afl.rakuten.co.jp/hgc/56c498ed.7fc0ea23.56c498ee.6c16ed1e/_RTroom06836859_390077465_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Faccessiimonoshop%2Fpicardieall%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/accessiimonoshop/cabinet/biiino/item/main-image/20241015170212_2.jpg",
      blurb:"フランス製の強化ガラスタンブラー。90mlから500mlまでサイズが刻んであるので、用途ごとに足していける。" },
    { cat:"fashion", date:"2026.08.27", motif:"m-polo", brand:"KiU", name:"レインポンチョ ニュースタンダード", code:"wpc-worldparty:10003299", price:"¥5,890", url:"https://hb.afl.rakuten.co.jp/hgc/568f8e81.624fe955.568f8e8c.0e4b3e0a/_RTroom06836859_390077144_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fwpc-worldparty%2Fk163-r%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/wpc-worldparty/cabinet/2024ss/kiu/0000/k163-r_model.jpg",
      blurb:"袖の付いたポンチョ型のレインウェア。自転車でも腕が泳がず、たたむと手のひらに乗る大きさになる。" },
    { cat:"kitchen", date:"2026.08.27", motif:"m-mug", brand:"BIRDS’ WORDS", name:"PATTERNED BOWL ペア2点セット（波佐見焼）", code:"f423238-hasami:10005109", price:"¥22,000", url:"https://hb.afl.rakuten.co.jp/hgc/56c1e641.a53cc89f.56c1e642.0f9db6fc/_RTroom06836859_390015605_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ff423238-hasami%2Fcf023%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/f423238-hasami/cabinet/item/cf/cf023.jpg",
      blurb:"スコールグレーとイエローを組み合わせた波佐見焼のペアボウル。彫った模様が内側まで回り込んでいて、空のときの表情がいい（ふるさと納税の返礼品）。" },
    { cat:"kitchen", date:"2026.08.27", motif:"m-mug", brand:"古伊万里酒造", name:"NOMANNE 黄 180ml", code:"umeshu:10010741", price:"¥1,760", url:"https://hb.afl.rakuten.co.jp/hgc/56b3ffdb.c21127bf.56b3ffdc.b2471c84/_RTroom06836859_389786150_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fumeshu%2F1233-26-0180%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/umeshu/cabinet/t_rpg/1233/1233-26-0180.jpg",
      blurb:"器に酒を詰めた、飲み終えると焼きものが残るカップ酒。黄の地に散らした花柄は、そのまま湯呑みとして使える顔をしている。" },
    { cat:"goods", date:"2026.08.27", motif:"m-book", brand:"小学館", name:"永遠のソール・ライター", code:"book:19859711", price:"¥2,750", url:"https://hb.afl.rakuten.co.jp/hgc/56170c50.4afdfd95.56170c51.f6a9976e/_RTroom06836859_389749539_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbook%2F16146246%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/book/cabinet/3255/9784096823255_1_3.jpg",
      blurb:"ソール・ライターのカラー作品を集めた一冊。雨や窓ガラス越しの、輪郭がほどけた街の見え方が続く。" },
    { cat:"daily", date:"2026.08.27", motif:"m-crate", brand:"BEAMS JAPAN × リングスター", name:"別注 スーパー バスケット S", code:"stylife:14918542", price:"¥2,640", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_389729567_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fnn0860%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/860/nn0860-01_1.jpg",
      blurb:"工具箱メーカーの樹脂バスケットを、ネイビーとオレンジで別注した一台。持ち手が倒れるので、重ねたまま置いておける。" },
    // --- 2026.08.20 楽天ROOMから反映（14件） ---
    { cat:"daily", date:"2026.08.20", motif:"m-crate", brand:"THOR", name:"ミニトート ウィズ リッド（フタ付き収納ボックス）", code:"foranew:10005375", price:"¥1,100", url:"https://hb.afl.rakuten.co.jp/hgc/56bff53d.813c7bc5.56bff53e.18d74679/_RTroom06836859_389996447_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fforanew%2Fthormini%2F%3Fscid%3Droom_pc_id_reg", img:"https://room.r10s.jp/d/strg/ctrl/22/a3495a5872075b50d94a5f3a2a859ea0fea54d6d.02.9.22.3.jpg",
      blurb:"フタ付きでスタッキングできる収納ボックス。カラー展開が豊富で、デスクまわりの細々したものをまとめて隠せそう。" },
    { cat:"daily", date:"2026.08.20", motif:"m-tissue", brand:"BANACO", name:"テリールームスリッパ", code:"banaco:10000002", price:"¥3,740", url:"https://hb.afl.rakuten.co.jp/hgc/56ac12f3.57edd084.56ac12f4.d3b387d2/_RTroom06836859_389623019_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbanaco%2F131355%2F%3Fscid%3Droom_pc_id_reg", img:"https://room.r10s.jp/d/strg/ctrl/22/ef5aae5a123811fe90bbf6454a468b83b0c4e642.02.9.22.3.jpg",
      blurb:"タオル地の厚みで歩くときの足音が響きにくいルームスリッパ。もこもこした質感と、ビビッドな5色展開が気になる。" },
    { cat:"interior", date:"2026.08.20", motif:"m-stand", brand:"HAY", name:"TABLE CLOCK（Recycled）", code:"zuiun7:10012735", price:"¥14,300", url:"https://hb.afl.rakuten.co.jp/hgc/565217e8.22c6b474.565217ea.5370cba1/_RTroom06836859_389946153_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fzuiun7%2Fhay-tableclock-re%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/zuiun7/cabinet/04643587/04645123/04645149/t-clock-r-00.jpg",
      blurb:"ジャスパー・モリソンがデザインした置き時計。リサイクル素材のマットな質感と、はっきりした文字盤の存在感が気になっている。" },
    { cat:"fashion", date:"2026.08.20", motif:"m-tote", brand:"KiU", name:"パデッドドロストトートバッグ", code:"wpc-worldparty:10004404", price:"¥2,926", url:"https://hb.afl.rakuten.co.jp/hgc/568f8e81.624fe955.568f8e8c.0e4b3e0a/_RTroom06836859_389842718_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fwpc-worldparty%2Fk475%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/wpc-worldparty/cabinet/2025fw/kiu/0000/k475_01.jpg",
      blurb:"はっ水加工を施したキルティング生地の2WAYトート。開口部をドローコードで絞れる形で、入れる荷物の量と口の開き方を比べたい候補です。" },
    { cat:"goods", date:"2026.08.20", motif:"m-book", brand:"suck UK", name:"DRUM STICK PEN（ドラムスティック型ボールペン）", price:"¥1,474", url:"https://hb.afl.rakuten.co.jp/hgc/56af0d0b.119c0a8e.56af0d0c.746c3f47/_RTroom06836859_389686518_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frinkydink%2Fsuckukdrumstickballpen%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/rinkydink/cabinet/general/stationery/ydrumstickballpen.jpg",
      blurb:"見た目は完全にドラムスティックなのに、グリップ側の先端にペン芯が仕込まれた一本。ブラック・ブルーの2色展開。" },
    { cat:"goods", date:"2026.08.20", motif:"m-pouch", brand:"DIGAWEL", name:"リングカードケース（牛革）", code:"stylife:15650215", price:"¥15,400", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_389581689_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Frf8954%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/954/rf8954-01_1.jpg",
      blurb:"リング金具を開くとカードが扇状に並ぶつくりのカードケース。牛革の質感と、無駄のないシルエットが気になっている。" },
    { cat:"gadget", date:"2026.08.20", motif:"m-mixer", brand:"Beats", name:"Solo Buds ワイヤレスイヤフォン", code:"rakutenmobile-store:10001862", price:"¥13,800", url:"https://hb.afl.rakuten.co.jp/hgc/56330ee4.b098d204.56330eee.e17b5922/_RTroom06836859_389810485_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frakutenmobile-store%2Fapple-rm2512017%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/rakutenmobile-store/cabinet/item/apple-rm2512017/pc/main_01.jpg",
      blurb:"ケースが小さくてポケットに収まりそうなワイヤレスイヤフォン。カラー展開が4色あって、どれにするか迷う。" },
    { cat:"goods", date:"2026.08.20", motif:"m-memo", brand:"HIGHTIDE", name:"ニューレトロ ダイカットシールセット（ニッポン）", code:"htdd:10011013", price:"¥990", url:"https://hb.afl.rakuten.co.jp/hgc/56298ccd.94853ac7.56298cce.1a120fe7/_RTroom06836859_389675531_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhtdd%2Fcl105%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/htdd/cabinet/option22/cl105-img1.jpg",
      blurb:"富士山や招き猫、お相撲さんまでニッポンモチーフを詰め込んだダイカットシール。ノートやスマホケースに1枚貼るだけで目印になりそう。" },
    { cat:"beauty", date:"2026.08.20", motif:"m-tube", brand:"NEMOHAMO", name:"Whole Plant Aging Care Cream 40g", price:"¥7,150", url:"https://hb.afl.rakuten.co.jp/hgc/56a78a86.7d28f4d9.56a78a87.2ae6619c/_RTroom06836859_389558510_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgoodnaturestation%2F8802000000107%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/goodnaturestation/cabinet/products/nemohamo/8802000000107-3.jpg",
      blurb:"植物由来のオイルとオタネニンジンをまるごと配合したクリーム。オレンジのチューブと、青地に高麗人参を描いた箱の配色が良い。" },
    { cat:"goods", date:"2026.08.20", motif:"m-pouch", brand:"KAKSI", name:"リール付きパスケース", code:"smsta:10024606", price:"¥1,650", url:"https://hb.afl.rakuten.co.jp/hgc/56b9d695.3ba29184.56b9d696.aac1566d/_RTroom06836859_389911650_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsmsta%2Fsnfsn00044%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/smsta/cabinet/2015/4/150419/snfsn00044_5.jpg",
      blurb:"リールが伸びるので、バッグに付けたまま改札を通れるパスケース。カラー展開も多く、鍵などを収納できるキーリング付き。" },
    { cat:"fashion", date:"2026.08.20", motif:"m-tote", brand:"THEATRE PRODUCTS × MAISON SPECIAL", name:"Collaboration Multiway Travel Bag", code:"stylife:15673047", price:"¥13,200", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_389642004_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Frx9952%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/952/rx9952-01_1.jpg",
      blurb:"ロープ調のコードとテープハンドルを組み合わせた異素材ミックスのトラベルバッグ。1〜2泊なら十分な収納力がありそう。" },
    { cat:"beauty", date:"2026.08.20", motif:"m-bottle", brand:"NEMOHAMO", name:"Whole Plant Booster Oil Smooth 30ml", price:"¥6,380", url:"https://hb.afl.rakuten.co.jp/hgc/56a78a86.7d28f4d9.56a78a87.2ae6619c/_RTroom06836859_389557939_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgoodnaturestation%2F8802000000060%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/goodnaturestation/cabinet/products/nemohamo/8802000000060_1.jpg",
      blurb:"植物由来のオイルで肌を整えるブースターオイル。化粧水の前の一滴として取り入れたい、イエローのしずく形ボトル。" },
    { cat:"fashion", date:"2026.08.20", motif:"m-sneaker", brand:"Nike × LABELHOOD", name:"Shox Z Calistra（Black University Red）", price:"¥60,800", url:"https://hb.afl.rakuten.co.jp/hgc/56b9e7eb.0957afe9.56b9e7ec.268bd370/_RTroom06836859_389878727_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fasty-shop%2Fe3-237jorfvym-1e51%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/asty-shop/cabinet/naall12a6/e3-237jorfvym-1e51.jpg",
      blurb:"スニーカーなのに、バレエシューズのような顔つき。パテントレザーの光沢と赤い差し色が効いている。" },
    { cat:"interior", date:"2026.08.20", motif:"m-vase", brand:"SOMPEX", name:"LULU テーブルランプ", code:"biccamera:15584559", price:"¥35,200", url:"https://hb.afl.rakuten.co.jp/hgc/56643b4a.10693acb.56643b53.39188fdf/_RTroom06836859_389625766_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbiccamera%2F4029599123521%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/biccamera/cabinet/product/18605/00000015407720_a01.jpg",
      blurb:"タッチ操作で無段階調光できる充電式テーブルランプ。屋外で使う前に、使用温度・水濡れ・充電場所の条件を説明書で確認してください。" },
    // --- 2026.08.18 楽天ROOMから反映（9件） ---
    { cat:"interior", date:"2026.08.18", motif:"m-vase", brand:"abode", name:"STRAW ペンダントランプ", code:"three-s-s-s:10000057", price:"¥11,000", url:"https://hb.afl.rakuten.co.jp/hgc/56a65193.c64cb797.56a65194.22a424eb/_RTroom06836859_389519034_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fthree-s-s-s%2Fabd-m10%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/three-s-s-s/cabinet/abode/abode01/abode008/pendant_white_on.jpg",
      blurb:"色付きのストローを束ねただけの構造でできたペンダントライト。灯すと隙間から光が抜けて、天井まわりの表情が変わります。" },
    { cat:"gadget", date:"2026.08.18", motif:"m-cable", brand:"Peak Design", name:"フォームロープ スタンダード 119cm", code:"mitsuba:10018916", price:"¥8,910", url:"https://hb.afl.rakuten.co.jp/hgc/56967333.9768b1a2.56967334.8bf534f4/_RTroom06836859_389231217_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmitsuba%2Fpeakdesign-formrope-standard%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/mitsuba/cabinet/peak-design/formrope-standard-1.jpg",
      blurb:"金具のジャラつきがない、一本仕立てのカメラストラップ。伸縮する芯材が入っていて肩当たりがやわらかいタイプです。" },
    { cat:"daily", date:"2026.08.18", motif:"m-crate", brand:"tower × JOURNAL STANDARD FURNITURE", name:"マグネット＆引っ掛けバケツ 7.5L", price:"¥2,640", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_389305805_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fma6582%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/582/ma6582-01_1.jpg",
      blurb:"洗濯機の側面にマグネットで留められるバケツ。洗剤やネットのストックをまとめて浮かせられるので、洗面まわりの床が空きます。" },
    { cat:"goods", date:"2026.08.18", motif:"m-record", brand:"Domi & JD Beck", name:"Who Asked?（オリーブグリーン・ヴァイナル 2枚組LP）", price:"¥7,920", url:"https://hb.afl.rakuten.co.jp/hgc/56a7125b.5af013ed.56a7125c.b52b55f5/_RTroom06836859_389529165_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhmvjapan%2F17035497%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/hmvjapan/cabinet/a70/36000/17035497.jpg",
      blurb:"鍵盤とドラムのデュオによる2作目。オリーブグリーンの盤に絵画のようなジャケットで、棚に立てておきたくなる2枚組です。" },
    { cat:"fashion", date:"2026.08.18", motif:"m-sneaker", brand:"GRISE", name:"VIBRAM メリージェーン スニーカー", code:"stylife:15726244", price:"¥18,700", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_389527331_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fsd2247%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/247/sd2247-01_1.jpg",
      blurb:"甲のストラップで留めるメリージェーンに、ゴツっとしたVibramソールを合わせた一足。上品な形と武骨な足元の落差が効いています。" },
    { cat:"fashion", date:"2026.08.18", motif:"m-polo", brand:"TOGA ARCHIVES × UMBRO", name:"Track jacket UMBRO SP", price:"¥75,900", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_389467640_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Frh7914%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/914/rh7914-01_1.jpg",
      blurb:"袖に走る刺繍テープが効いた、TOGAとUMBROの初コラボ。スポーティな型なのに、配色と生地の質感で上品に落ち着きます。" },
    // --- 2026.08.17 楽天ROOMから反映（10件） ---
    { cat:"kitchen", date:"2026.08.17", motif:"m-mug", brand:"嶺陽茶行", name:"ジャスミン茶 テトラ型ティーバッグ 14袋入り", code:"twdirect:10002917", price:"¥3,397〜", url:"https://hb.afl.rakuten.co.jp/hgc/56a144f3.a9cc5647.56a144f4.27f5377e/_RTroom06836859_389423634_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftwdirect%2Fgeowyongtea-015%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/twdirect/cabinet/geowyongtea/geowyongtea-1/geowyongtea-015_01.jpg",
      blurb:"台湾の老舗・嶺陽茶行のジャスミン茶。テトラ型のティーバッグで気軽に淹れられて、花柄の缶は置いておくだけで絵になります。" },
    { cat:"kitchen", date:"2026.08.17", motif:"m-crate", brand:"竹中", name:"mayu ランチボックス M 680ml", code:"hitoiro:10002409", price:"¥2,420", url:"https://hb.afl.rakuten.co.jp/hgc/568fd4dd.94633fef.568fd4df.63bd6584/_RTroom06836859_389410548_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhitoiro%2F387849%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/hitoiro/cabinet/maker_takenaka/387849.jpg",
      blurb:"ころんと丸いフォルムのランチボックス。継ぎ目が少なくて洗いやすく、並べるとお弁当箱よりインテリア雑貨みたい。" },
    { cat:"interior", date:"2026.08.17", motif:"m-chair", brand:"Kartell", name:"PRINCE AHA（プリンス アハ）スツール", price:"¥22,500", url:"https://hb.afl.rakuten.co.jp/hgc/5647efbc.ee8761c9.5647efc2.ad8c4a6e/_RTroom06836859_389324000_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmminterior%2F575585%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/mminterior/cabinet/03250003/06880268/imgrc0084752721.jpg",
      blurb:"フィリップ・スタルクが手がけた砂時計のようなフォルム。屋内でも屋外でも使えるので、テラスにひとつ置きたくなります。" },
    { cat:"beauty", date:"2026.08.17", motif:"m-bottle", brand:"uka", name:"ヘアオイル Rainy Walk 50ml", code:"ukaofficial:10000034", price:"¥4,400", url:"https://hb.afl.rakuten.co.jp/hgc/56968846.a8d2fad4.56968847.bd53c286/_RTroom06836859_389236421_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fukaofficial%2F4582328104418%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/ukaofficial/cabinet/hair_oil_mist/4582328104418x.jpg",
      blurb:"レモン・ユーカリ・ミントの香りに、アサイーとモリンガのオイルを配合。ボトルのイエローとパッケージのグリーンの色合わせも良い。" },
    { cat:"kitchen", date:"2026.08.17", motif:"m-mug", brand:"yumiko iihoshi porcelain × 木村硝子店", name:"dishes プレート L 20cm（サンドベージュ）", code:"receno:10018064", price:"¥3,630", url:"https://hb.afl.rakuten.co.jp/hgc/566a652b.e5da1afb.566a652d.fb4e4fef/_RTroom06836859_389216262_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Freceno%2Fdispl-l%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/receno/cabinet/plate2/displ/img/0000054304020.jpg",
      blurb:"艶を抑えたマットな質感で、和にも洋にも馴染む一枚。食卓の色を選ばないので、長く使えそうなプレートです。" },
    { cat:"gadget", date:"2026.08.17", motif:"m-mixer", brand:"Francfranc", name:"フレ ハンディファン ウェーブ（2026年モデル）", code:"stylifemen:11193543", price:"¥3,980", url:"https://hb.afl.rakuten.co.jp/hgc/56430753.d3416592.56430757.a1dc5f63/_RTroom06836859_388816757_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylifemen%2Frm4239%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylifemen/cabinet/item/239/rm4239-01_1.jpg",
      blurb:"手になじむ部分の波打つマーブル調の仕上げがメタリック。手に取った瞬間にテンションが上がるハンディファン。" },
    { cat:"gadget", date:"2026.08.17", motif:"m-stand", brand:"Kodak", name:"FunSaver 800 レンズ付きフィルム 27枚撮り", code:"ec-current:12829736", price:"¥2,376", url:"https://hb.afl.rakuten.co.jp/hgc/56996fa2.9daf1187.56996fa3.ebae6f21/_RTroom06836859_389355237_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fec-current%2F0041778617762%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/ec-current/cabinet/9131/0041778617762.jpg",
      blurb:"27枚を撮り切るまで写りが分からない不便さが、かえっていい。ISO800でフラッシュ内蔵だから夕方や室内でも気軽に。" },
    { cat:"fashion", date:"2026.08.17", motif:"m-polo-knit", brand:"JOURNAL STANDARD", name:"リネンナイロン ストレッチワイドパンツ", code:"stylife:15230091", price:"¥13,200", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_389243097_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fpy4401%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/401/py4401-01_1.jpg",
      blurb:"撥水・接触冷感・洗える・UVカットと機能は充分。レッドの発色が効いた、これからの季節のワイドパンツ。" },
    { cat:"fashion", date:"2026.08.17", motif:"m-socks", brand:"gelato pique", name:"レーヨンロゴT＆ボーダーショートパンツ セット", code:"shirohato:10225111", price:"¥11,550", url:"https://hb.afl.rakuten.co.jp/hgc/56951b20.39e2a5b7.56951b21.d7d9d019/_RTroom06836859_389211070_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshirohato%2Fb52pwct261365%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/shirohato/cabinet/001807/b52pwct261365.jpg",
      blurb:"レーヨン素材のひんやりした肌当たりが心地よい接触冷感のセットアップ。落ち着いたミントグリーンで、部屋着なのに主役級。" },
    { cat:"interior", date:"2026.08.14", motif:"m-chair", brand:"KAY BOJESEN DENMARK", name:"Monkey Mini（モンキー ミニ ブラック）", code:"belle-life:10007016", price:"¥16,500", url:"https://a.r10.to/hPIgoH", img:"https://shop.r10s.jp/belle-life/cabinet/02325296/imgrc0083882083.jpg",
      blurb:"デンマークの木工職人技が息づく、愛らしい表情のモンキー。日本正規代理店品でオーク材の温もりが魅力。" },
    { cat:"gadget", date:"2026.08.14", motif:"m-keyboard", brand:"NuPhy", name:"Air75 V3 メカニカルキーボード（Blush）", code:"r-kojima:11665960", price:"¥31,770", url:"https://a.r10.to/hF52M6", img:"https://shop.r10s.jp/r-kojima/cabinet/n0000001494/4570001397691_1.jpg",
      blurb:"黒ボディにミント・オレンジ・レッドのアクセントキーキャップが効いた、ホットスワップ対応のワイヤレスキーボード。" },
    { cat:"fashion", date:"2026.08.13", motif:"m-chair", brand:"METRONOME", name:"Resonance by METRONOME MINX C3 サングラス", code:"megane-douraku:10032685", price:"¥14,300", url:"https://a.r10.to/h5pgBW", img:"https://shop.r10s.jp/megane-douraku/cabinet/09527721/minx-c3-1.jpg",
      blurb:"クリップ式のブルーレンズを外すとクリアフレームに戻る、2WAY仕様のサングラス。マットクリアの軽やかな質感。" },
    { cat:"kitchen", date:"2026.08.13", motif:"m-wineglass", brand:"bodum", name:"ダブルウォールグラス PAVINA 250ml 2個セット", code:"bodumshop:10000041", price:"¥2,551", url:"https://a.r10.to/hka5Vv", img:"https://shop.r10s.jp/bodumshop/cabinet/item/pavina/4558-10_6.jpg",
      blurb:"二重構造で保温・保冷力が高く、見た目もすっきりしたダブルウォールグラス。北欧デンマーク発のキッチンウエア。" },
    { cat:"fashion", date:"2026.08.13", motif:"m-tote", brand:"and wander", name:"シル デイパック", code:"daigochi:10006198", price:"¥19,800", url:"https://a.r10.to/h5faNf", img:"https://shop.r10s.jp/daigochi/cabinet/item001/19242_3_shiro.jpg",
      blurb:"薄手のナイロン素材でくしゅっと畳める、軽さと携帯性を両立したパッカブルリュック。" },
    { cat:"interior", date:"2026.08.12", motif:"m-chair", brand:"Vitra", name:"スタンダードチェア（ジャン・プルーヴェ／ブレヴェール）", code:"vanilla1950:10000691", price:"¥138,600", url:"https://a.r10.to/hPJuIj", img:"https://shop.r10s.jp/vanilla1950/cabinet/product/000000011517-02.jpg",
      blurb:"1934年に学校用チェアとして誕生したジャン・プルーヴェのデザイン。無骨な脚と軽やかな座面のコントラストが魅力。" },
    { cat:"goods", date:"2026.08.12", motif:"m-pouch", brand:"KING JIM", name:"Flatty SHEER メッシュポーチ（Mサイズ）", code:"bellepo:10024225", price:"¥1,075", url:"https://a.r10.to/heEQgN", img:"https://shop.r10s.jp/bellepo/cabinet/kingjim/lezaface/5164m.jpg",
      blurb:"メッシュ素材で中身がうっすら見える、Flattyシリーズのシアータイプポーチ。小物探しがしやすい一枚。" },
    { cat:"daily", date:"2026.08.12", motif:"m-chair", brand:"because", name:"UMBRELLAS MINI クリアアンブレラ×Lipton", code:"shinotome-nakano:10000244", price:"¥3,190", url:"https://a.r10.to/h5YJ4D", img:"https://shop.r10s.jp/shinotome-nakano/cabinet/compass1748939855.jpg",
      blurb:"フルーツ柄が涼しげなLiptonコラボのクリアミニ傘。折りたたみでバッグにもすっと収まる。" },
    { cat:"daily", date:"2026.08.12", motif:"m-bottle", brand:"ZONE DENMARK", name:"ソープディスペンサー SOLO（ソフトグレー）", code:"shikama-intl:10001998", price:"¥7,040", url:"https://a.r10.to/hPJ4O8", img:"https://shop.r10s.jp/shikama-intl/cabinet/zone/34775/34775.jpg",
      blurb:"デンマーク発デザインブランドのソープディスペンサー。マットなソフトグレーが洗面台に馴染む。" },
    { cat:"gadget", date:"2026.08.11", motif:"m-keyboard", brand:"ロジクール(Logicool)", name:"Alto Keys K98M ワイヤレスメカニカルキーボード", code:"logicool:10000799", price:"¥16,900", url:"https://a.r10.to/hkzoDq", img:"https://shop.r10s.jp/logicool/cabinet/prd/kb/k98mgr/k98mgr_n.jpg",
      blurb:"半透明のガスケットボディ越しに内部構造が透けて見える、眺めて楽しいメカニカルキーボード。" },
    { cat:"gadget", date:"2026.08.10", motif:"m-stand", brand:"Nothing", name:"Headphone(a)（ピンク）", code:"nothingagent:10000111", price:"¥27,800", url:"https://a.r10.to/hP7Rgi", img:"https://shop.r10s.jp/nothingagent/cabinet/13067532/headphonea_main.jpg",
      blurb:"半透明パーツとくすみピンクの配色が目を引く、ハイレゾ対応のワイヤレスヘッドホン。" },
    { cat:"gadget", date:"2026.08.10", motif:"m-watch", brand:"MOFT", name:"Apple Watch用 マグネット式シリコンバンド（バイカラー）", code:"moft:10000113", price:"¥5,880", url:"https://a.r10.to/h8akBP", img:"https://shop.r10s.jp/moft/cabinet/product/12469098/12469099/imgrc0116113922.jpg",
      blurb:"内側と外側で色が切り替わるバイカラーのApple Watchバンド。マグネット留め具でサイズ調整もスムーズ。" },

    { cat:"fashion", date:"2026.08.09", motif:"m-socks", brand:"STANCE", name:"クルーソックス「currents」", code:"candymitt:10000828", price:"¥2,750", url:"https://a.r10.to/hPxxXb", img:"https://image.rakuten.co.jp/candymitt/cabinet/stance/st308y-curren-st.jpg",
      blurb:"足元にひとさじの色を。メキシカンブランケットみたいな多色ボーダーが主役級のクルーソックス。" },
    { cat:"interior", date:"2026.08.09", motif:"m-chair", brand:"天童木工", name:"バタフライスツール（ローズウッド）", code:"auc-designshop:10001011", price:"¥82,500", url:"https://a.r10.to/hg9pVY", img:"https://image.rakuten.co.jp/auc-designshop/cabinet/2101/2101000001702_0.jpg",
      blurb:"柳宗理の名作。2枚の成形合板が蝶の羽のように交わる、憧れの一脚。" },
    { cat:"interior", date:"2026.08.09", motif:"m-chair", brand:"Vitra", name:"イームズエレファント（スモール）", code:"shinwashop:10005703", price:"¥15,400", url:"https://a.r10.to/hYTaAq", img:"https://image.rakuten.co.jp/shinwashop/cabinet/kes6/vitra-215112-main.jpg",
      blurb:"イームズ夫妻が1945年に生んだ、ゾウをかたどった愛らしいプロダクト。" },
    { cat:"beauty", date:"2026.08.08", motif:"m-chair", brand:"YOLU", name:"ナイトケア ボディソープ", code:"bloomgreen:10536822", price:"¥1,029", url:"https://hb.afl.rakuten.co.jp/hgc/g00r9icn.z7k3182b.g00r9icn.z7k3295f/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbloomgreen%2F10327354%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fbloomgreen%2Fi%2F10536822%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/bloomgreen/cabinet/bg10755064/4582521689002.jpg",
      blurb:"夜の香りに包まれるバスタイム。とろみのあるテクスチャーで優しく洗い上げる。" },
    { cat:"beauty", date:"2026.08.08", motif:"m-chair", brand:"YOLU", name:"カームナイトリペア ボディソープ", code:"kobe-beauty-labo:10002671", price:"¥946", url:"https://hb.afl.rakuten.co.jp/hgc/g00r23nn.z7k3113e.g00r23nn.z7k326ee/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkobe-beauty-labo%2Fyol018%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fkobe-beauty-labo%2Fi%2F10002671%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/kobe-beauty-labo/cabinet/imgrc0108984420.jpg",
      blurb:"夜の香りに包まれるバスタイム。とろみのあるテクスチャーで優しく洗い上げる。" },
    { cat:"beauty", date:"2026.08.08", motif:"m-chair", brand:"YOLU", name:"ボディスクラブ", code:"kobe-beauty-labo:10002838", price:"¥1,738", url:"https://hb.afl.rakuten.co.jp/hgc/g00r23nn.z7k3113e.g00r23nn.z7k326ee/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkobe-beauty-labo%2Fyol035%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fkobe-beauty-labo%2Fi%2F10002831%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/kobe-beauty-labo/cabinet/1st_thum/yol035.jpg",
      blurb:"ジェラートみたいな質感でするする伸びるマイルドピーリング。優しい香りでご褒美のお手入れ時間に。" },
    { cat:"kitchen", date:"2026.08.08", motif:"m-chair", brand:"Snow Peak", name:"チタンダブルマグ 300", code:"canpanera:10084594", price:"¥5,280", url:"https://hb.afl.rakuten.co.jp/hgc/g00r4jvn.z7k31acb.g00r4jvn.z7k32368/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcanpanera%2Fs06-1200%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fcanpanera%2Fi%2F10084594%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/canpanera/cabinet/item207/item_s06-1200_0.jpg",
      blurb:"二重構造で保温・結露しにくく、チタンの軽さ。キャンプにも家にもなじむ無骨なマグ。" },
    { cat:"gadget", date:"2026.08.08", motif:"m-chair", brand:"Bang & Olufsen", name:"Beosound A1", code:"bang-olufsen:10000103", price:"¥58,000", url:"https://hb.afl.rakuten.co.jp/hgc/g00ts3vn.z7k31eca.g00ts3vn.z7k32b18/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbang-olufsen%2F17360%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fbang-olufsen%2Fi%2F10000103%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/bang-olufsen/cabinet/thum/17360/17360_01.jpg",
      blurb:"丸いアルミニウムの本体とレザーストラップ。リンク先の現行商品は第3世代で、防塵・防水等級はIP67。世代と使用・充電条件を確認して選びます。" },
    { cat:"gadget", date:"2026.08.08", motif:"m-chair", brand:"Marshall", name:"EMBERTON III", code:"marshall-official:10000035", price:"¥28,980", url:"https://hb.afl.rakuten.co.jp/hgc/g00u54tn.z7k31cb2.g00u54tn.z7k322ad/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmarshall-official%2F7340055399449%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fmarshall-official%2Fi%2F10000035%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/marshall-official/cabinet/portable_speakers/emberton3/imgrc0121215094.jpg",
      blurb:"アンプを思わせる形とロゴが目を引くポータブルスピーカー。IP67の防塵・防水仕様ですが、流水で洗わず、完全に乾かしてから充電します。" },
    { cat:"goods", date:"2026.08.08", motif:"m-chair", brand:"LAMY", name:"LAMY 2000 ボールペン", code:"auc-youstyle:10012653", price:"¥11,300", url:"https://hb.afl.rakuten.co.jp/hgc/g00qm7tn.z7k31d04.g00qm7tn.z7k32047/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fauc-youstyle%2Fl401%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fauc-youstyle%2Fi%2F10012653%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/auc-youstyle/cabinet/lamy/08809040/l401-naire-x-zt.jpg",
      blurb:"1966年生まれのバウハウス由来デザイン。ヘアライン加工のボディは指なじみよく、置くだけで気分が上がる。" },
    { cat:"kitchen", date:"2026.08.08", motif:"m-chair", brand:"Vermicular", name:"ライスポットミニ", code:"vermicular-rshop:10000004", price:"¥77,440", url:"https://hb.afl.rakuten.co.jp/hgc/g00ufh8n.z7k31c0f.g00ufh8n.z7k32caf/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fvermicular-rshop%2Frp19a-gy%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fvermicular-rshop%2Fi%2F10000004%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/vermicular-rshop/cabinet/11432399/rp19ry_01.jpg",
      blurb:"鋳物ホーロー鍋がそのまま内鍋に。一粒ずつ立つ炊きあがりで、無水・低温調理までこなす一台。" },
    { cat:"fashion", date:"2026.08.08", motif:"m-chair", brand:"FACTORY900", name:"RF-051 メガネ", code:"thebecos:10004570", price:"¥58,080", url:"https://hb.afl.rakuten.co.jp/hgc/g00uj10n.z7k312a6.g00uj10n.z7k32ef2/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fthebecos%2Fs0233-041%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fthebecos%2Fi%2F10004570%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/thebecos/cabinet/s0233/s0233-041-1.jpg",
      blurb:"鯖江で立体的に削り出した丸フレーム。クラシックなのに未来的で、顔まわりの印象が変わる一本。" },
    { cat:"kitchen", date:"2026.08.08", motif:"m-chair", brand:"HASAMI PORCELAIN", name:"プレート（波佐見焼）", code:"zuiun7:10012527", price:"¥4,400", url:"https://hb.afl.rakuten.co.jp/hgc/g00s5mvn.z7k311ce.g00s5mvn.z7k320d0/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fzuiun7%2Fhpm004%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fzuiun7%2Fi%2F10012527%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/zuiun7/cabinet/04643587/04645121/04645138/imgrc0104105919.jpg",
      blurb:"マットな黒に縁の素地が効いた波佐見焼。重ねて仕舞えて、和洋どちらの料理も映える一枚。" },
    { cat:"interior", date:"2026.08.08", motif:"m-chair-y", brand:"Carl Hansen & Søn", name:"CH24 Yチェア オーク／オイル仕上げ SH45cm", code:"connect:10003118", price:"¥168,300", url:"https://hb.afl.rakuten.co.jp/hgc/g00q2chn.z7k3151f.g00q2chn.z7k3251e/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fconnect%2Fchs_ch24_oo%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fconnect%2Fi%2F10003108%2F&rafcid=wsc_i_is_1e77fdda-9913-4278-80a5-14c97599cd28", img:"https://shop.r10s.jp/connect/cabinet/chs/ch24/chs_ch24_oor.jpg",
      blurb:"北欧の名作。流れるようなY字の背とペーパーコードの座面。オーク×オイルで使うほど風合いが増す。" },
    // --- gadget ---
    { cat:"gadget", date:"2026.08.05", motif:"m-cable", brand:"Native Union", name:"POP CABLE USB-C 60W カールコード", code:"kitcut:10145782", price:"¥3,080〜", url:"https://a.r10.to/h8MV9f", img:"images/native-union.jpg",
      blurb:"くるんと伸び縮みするカールコード。充電まわりの生活感を、むしろ主役に。" },
    { cat:"gadget", date:"2026.08.05", motif:"m-keyboard", brand:"HHKB (PFU)", name:"Professional HYBRID Type-S 墨", code:"pfudirect:10000710", price:"¥36,850", url:"https://a.r10.to/hPBwjc", img:"images/hhkb.jpg",
      blurb:"墨色の佇まいと“スッ”と沈む打鍵感。机に置くだけで気分が上がる憧れの一台。お値段は張りますが…。" },
    { cat:"gadget", date:"2026.08.05", motif:"m-mixer", brand:"Teenage Engineering", name:"EP-136 K.O. sidekick", code:"shimamuragakki:10281024", price:"¥29,700", url:"https://a.r10.to/hgnNqL", img:"https://shop.r10s.jp/shimamuragakki/cabinet/mt01955/mt0195586.jpg",
      blurb:"おもちゃみたいに可愛いのに本気の音楽ツール。眺めているだけで楽しい。" },
    { cat:"gadget", date:"2026.08.05", motif:"m-stand", brand:"Satechi", name:"マグネットウォレットスタンド", code:"princeton:10006169", price:"¥6,499", url:"https://a.r10.to/hgY16z", img:"https://shop.r10s.jp/princeton/cabinet/260804/pstvlw_m01.jpg",
      blurb:"カードを挟んでそのまま立てられる二役。マットな質感が机にも鞄にも馴染む。" },

    // --- interior ---
    { cat:"interior", date:"2026.08.05", motif:"m-chair", brand:"Fritz Hansen", name:"セブンチェア（正規）", code:"kproject:10006894", price:"¥128,000", url:"https://a.r10.to/hgn3KB", img:"https://shop.r10s.jp/kproject/cabinet/05264517/seluno38/imgrc0105036603.jpg",
      blurb:"言わずと知れた名作。薄い成形合板のしなりと佇まいに、いつか一脚だけでも。" },
    { cat:"interior", date:"2026.08.05", motif:"m-chair-y", brand:"Carl Hansen & Søn", name:"Yチェア CH24 ビーチ／ソープ仕上げ", price:"¥115,500", url:"https://hb.afl.rakuten.co.jp/hgc/56516bb8.0d3eef81.56516bb9.281574a0/_RTroom06836859_388014988_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fattract%2Fch24_bh_sp%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/attract/cabinet/carl_hansen2/000000000010-40-l.jpg",
      blurb:"ウェグナーが1950年に手がけた名作。流れるようなY字の背とペーパーコードの座面は、使うほど風合いが増していくそう。" },
    { cat:"interior", date:"2026.08.05", motif:"m-vase-wave", brand:"iittala", name:"アアルト ベース 120mm", code:"scope:10009902", price:"¥27,500", url:"https://hb.afl.rakuten.co.jp/hgc/565540e7.eef737ca.565540e8.3f8d2bf2/_RTroom06836859_388077094_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fscope%2Fiitaalv120%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/scope/cabinet/iittala/iia93a11_a_im01.jpg",
      blurb:"1936年生まれの波打つフォルム。花を活けても、お菓子をざっくり入れても様になる懐の深さ。" },
    { cat:"interior", date:"2026.08.05", motif:"m-vase", brand:"HOLMEGAARD", name:"FLORA ベース ロングネック 24cm", code:"belle-life:10008126", price:"¥9,350", url:"https://a.r10.to/hgsyWV", img:"https://shop.r10s.jp/belle-life/cabinet/01517232/12810465/4340841-main.jpg",
      blurb:"デンマークの吹きガラスの一輪挿し。花が無くても様になる透明感。" },
    { cat:"kitchen", date:"2026.08.05", motif:"m-wineglass", brand:"HAY", name:"TINT ワイングラス 2個セット", code:"s-deco:10005037", price:"¥6,160", url:"https://hb.afl.rakuten.co.jp/hgc/5648b0f9.c66dc8d7.5648b0fa.57960852/_RTroom06836859_388024197_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fs-deco%2Ftintwineglass_blue%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/s-deco/cabinet/10683009/tintwineglass_c.jpg",
      blurb:"青みがかった色ガラスに、飲みものの色が透ける。ボロシリケイトで見た目より軽やかな2脚セット。" },
    { cat:"interior", date:"2026.08.05", motif:"m-crate", brand:"HAY", name:"COLOUR CRATE L", price:"¥7,700", url:"https://hb.afl.rakuten.co.jp/hgc/56328232.eede3f62.56328233.565dd845/_RTroom06836859_387514617_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fko-jo%2Fhay_colour_crate_l_2023%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/ko-jo/cabinet/hay/colour-crate/l/cart-img.jpg",
      blurb:"スタッキングできて色も選べる折りたたみ収納。無造作に積んでもサマになるのが良いところ。" },
    { cat:"interior", date:"2026.08.05", motif:"m-mountain", brand:"BEAMS JAPAN", name:"別注 富士山 マルチマット", code:"stylife:15203115", price:"¥3,960", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_387045594_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fpv5249%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/249/pv5249-01_1.jpg",
      blurb:"玄関にちょこんと置くだけで気分が上がる赤富士。アクリル100%でふかふか、約45.5×61cm。" },
    { cat:"interior", date:"2026.08.05", motif:"m-chair", brand:"大川家具", name:"ダイニングチェア カレン（オーク無垢）", code:"f402125-okawa:10004535", price:"¥117,500", url:"https://hb.afl.rakuten.co.jp/hgc/5605cc79.d58c0fad.5605cc7a.ca2a5214/_RTroom06836859_386791943_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ff402125-okawa%2Fdd052%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/f402125-okawa/cabinet/frp_goods/frp027/8534764.jpg",
      blurb:"福岡・大川の職人がつくるオーク無垢の一脚。北欧テイストのグレー座面が心地いい。ふるさと納税の返礼品です。" },

    // --- goods ---
    { cat:"daily", date:"2026.08.05", motif:"m-tissue", brand:"PUEBCO", name:"アルミ ティッシュケース（Matte）", code:"zen-you:10005545", price:"¥3,300", url:"https://a.r10.to/h8jSTI", img:"https://shop.r10s.jp/zen-you/cabinet/04497754/12174158/imgrc0127611390.jpg",
      blurb:"生活感の出がちなティッシュを、無骨なアルミでそっけなく格上げ。" },
    { cat:"kitchen", date:"2026.08.05", motif:"m-scale", brand:"DULTON", name:"ダイエットスケール 100-126（赤）", code:"atease-br:10001619", price:"¥4,180", url:"https://a.r10.to/hYvA15", img:"https://shop.r10s.jp/atease-br/cabinet/00639267/05227710/100-126-00n.jpg",
      blurb:"レトロなアメリカン。赤の差し色でキッチンがぱっと華やぐ一台。" },
    { cat:"daily", date:"2026.08.05", motif:"m-diffuser", brand:"YCYK", name:"リードディフューザー 金木犀 120ml", code:"daily-store:10166645", price:"¥4,086", url:"https://hb.afl.rakuten.co.jp/hgc/564809b7.bb733817.564809b8.e99c3a77/_RTroom06836859_387853985_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fdaily-store%2Fgr-e9r8gqj5sn%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/daily-store/cabinet/g/36/e9r8gqj5sn-3.jpg",
      blurb:"金木犀のふわっと甘い残り香。家に帰るたび気分がほどける、玄関脇の定位置。" },
    { cat:"daily", date:"2026.08.05", motif:"m-bottle", brand:"VITAL MATERIAL", name:"ルーム&ファブリックミスト 深緑の森 120mL", code:"stylife:13681662", price:"¥4,180", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_387769332_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Ffu1829%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/829/fu1829-01_1.jpg",
      blurb:"名前のとおり、少しウッディで静かな香り。ミニマルなボトルは置いておくだけで様になる。" },
    { cat:"goods", date:"2026.08.05", motif:"m-notebook", brand:"HIGHTIDE / nahe", name:"2027 スクエア マンスリー手帳", code:"htdd:10007655", price:"¥825", url:"https://hb.afl.rakuten.co.jp/hgc/56298ccd.94853ac7.56298cce.1a120fe7/_RTroom06836859_387761139_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhtdd%2Fne1%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/htdd/cabinet/27diary/ne1-img1.jpg",
      blurb:"四角いフォルムとくすみ色の表紙が良い10月始まり。マンスリーでコンパクト、持ち歩きやすいサイズ。" },
    { cat:"goods", date:"2026.08.05", motif:"m-pouch", brand:"nahe", name:"ユーティリティケース ミニ", code:"htdd:10011146", price:"¥1,650", url:"https://hb.afl.rakuten.co.jp/hgc/56298ccd.94853ac7.56298cce.1a120fe7/_RTroom06836859_387370855_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fhtdd%2Fgb332%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/htdd/cabinet/option23/gb332-img1.jpg",
      blurb:"充電器やケーブルのごちゃつきをまとめて収納。きれいめなレザー調で、机でも鞄でも旅先でも。" },
    { cat:"beauty", date:"2026.08.05", motif:"m-tube", brand:"SWAG", name:"歯磨き粉 100g（選べる5フレーバー）", price:"¥1,980", url:"https://hb.afl.rakuten.co.jp/hgc/56298db5.931c5b07.56298db6.64299957/_RTroom06836859_387371153_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fswag-official%2Ftp%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/swag-official/cabinet/shosai01/swag/12794581/imgrc0107252124.jpg",
      blurb:"ビビッドなチューブが海外プロダクトみたい。洗面所に置くだけで気分が上がる一本。" },
    { cat:"beauty", date:"2026.08.05", motif:"m-tube", brand:"SWAG", name:"ホワイトニング歯磨き粉 100g", price:"¥2,530〜", url:"https://hb.afl.rakuten.co.jp/hgc/56298db5.931c5b07.56298db6.64299957/_RTroom06836859_387371343_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fswag-official%2Fhw%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/swag-official/cabinet/shosai01/swag/12794581/8.jpg",
      blurb:"清潔感のある白がかわいいホワイトニングタイプ。ブルーとおそろいで並べても◎。" },
    { cat:"goods", date:"2026.08.05", motif:"m-memo", brand:"表現社 / 沖野愛", name:"ブロックメモ 日本", code:"evisubungu:10011629", price:"¥605", url:"https://hb.afl.rakuten.co.jp/hgc/562211be.4a527ecd.562211bf.a3680a17/_RTroom06836859_387237364_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fevisubungu%2F22-888%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/evisubungu/cabinet/05227668/05229331/imgrc0097698411.jpg",
      blurb:"花火に屋台、新幹線、だるま。日本の“好き”が詰まったブロックメモ。ちょっとした贈り物にも。" },
    { cat:"goods", date:"2026.08.05", motif:"m-memo", brand:"表現社 / 沖野愛", name:"メモ帳＋付箋 京都", price:"¥550", url:"https://hb.afl.rakuten.co.jp/hgc/56220fb8.7673755a.56220fb9.71d3f94d/_RTroom06836859_387237289_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Faromage-store2%2F30003217%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/aromage-store2/cabinet/item19/30003217_1.jpg",
      blurb:"舞妓さんに京都タワー、五重塔。眺めるだけで旅気分になるメモ＋付箋のセット。" },
    { cat:"goods", date:"2026.08.05", motif:"m-record", brand:"The Durutti Column", name:"RENASCENT（LP）", price:"¥8,190", url:"https://hb.afl.rakuten.co.jp/hgc/56484ca7.b65dbd41.56484ca8.2c9e50b4/_RTroom06836859_387858616_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Famericanpie%2Flndn1725759vinyl%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/americanpie/cabinet/lp25/lndn1725759vinyl.jpg",
      blurb:"16年ぶりの新作LP。グラデーションと色面が重なるジャケットは、棚に立てかけておくだけで様になる。" },

    // --- fashion ---
    { cat:"fashion", date:"2026.08.05", motif:"m-socks", brand:"ROTOTO", name:"ダブルフェイス クルーソックス R1508", code:"belmani:10000786", price:"¥2,200", url:"https://a.r10.to/h5S9Jf", img:"https://shop.r10s.jp/belmani/cabinet/rototo02/r1508.jpg",
      blurb:"内側パイル・外側フラットの二重編み。足元の“ちょっといい”は結構効く。" },
    { cat:"fashion", date:"2026.08.05", motif:"m-watch", brand:"Swatch", name:"BLUEBERRY SKY SO29M702", code:"swatchofficial:10002904", price:"¥14,520", url:"https://hb.afl.rakuten.co.jp/hgc/565645a7.e2c108b6.565645a8.d2c738a8/_RTroom06836859_388096151_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fswatchofficial%2Fso29m702%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/swatchofficial/cabinet/product/2024-08/so29m702-s-01.jpg",
      blurb:"ライトブルーの文字盤とグレーのケースの淡い配色がきれい。41mmの大きめフェイスなのに軽やかに見えるのが良いところ。" },
    { cat:"goods", date:"2026.08.05", motif:"m-pouch", brand:"Marimekko", name:"ウニッコ柄 ポーチ", code:"glv:10107433", price:"¥5,599", url:"https://hb.afl.rakuten.co.jp/hgc/56329022.b6ed13bf.56329023.74ea77a3/_RTroom06836859_387515459_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fglv%2Fmri-en%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/glv/cabinet/newsingle202302/mri-enrak1si.jpg",
      blurb:"ぱっと明るい花柄。バッグを開けるたびに気分を上げてくれる小物入れ。" },
    { cat:"fashion", date:"2026.08.05", motif:"m-tote", brand:"Maison MIHARA YASUHIRO", name:"in・stru(men-tal). ビッグネームトート", code:"lli-femme:10019512", price:"¥8,800", url:"https://hb.afl.rakuten.co.jp/hgc/5606229a.d681058a.5606229b.d6295ad8/_RTroom06836859_386791868_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Flli-femme%2Fi12bg701%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/lli-femme/cabinet/cm38/i12bg701_brn.jpg",
      blurb:"やわらかいコットンキャンバスでA4も入る大きめ。手持ちと肩掛けの2wayで毎日使える。" },
    { cat:"fashion", date:"2026.08.05", motif:"m-polo", brand:"FRED PERRY", name:"ポロシャツ M12（英国製）", price:"¥13,200〜", url:"https://hb.afl.rakuten.co.jp/hgc/56560b24.81a4af99.56560b25.69852214/_RTroom06836859_388090896_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcoc%2Fm12n-black%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/coc/cabinet/fredperry/m12_1.jpg",
      blurb:"襟と袖口のツインティップに、胸の月桂樹。英国製の鹿の子はほどよい厚みで、襟もしっかり立つ。" },
    { cat:"fashion", date:"2026.08.05", motif:"m-polo-knit", brand:"JOHN SMEDLEY", name:"ADRIAN ニットポロ 30ゲージ", code:"mb:10261245", price:"¥26,000", url:"https://hb.afl.rakuten.co.jp/hgc/5642f255.dfdaa4f2.5642f256.e4ad01cd/_RTroom06836859_387768335_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmb%2Fadrian%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/mb/cabinet/260714_0002/adrian00.jpg",
      blurb:"シーアイランドコットンの上品な光沢と、なめらかな編み地。襟のあるニットは季節の変わり目にちょうどいい。" },
    { cat:"fashion", date:"2026.08.05", motif:"m-sneaker-trail", brand:"SALOMON", name:"XA PRO 3D", code:"stylife:14461808", price:"¥19,800", url:"https://hb.afl.rakuten.co.jp/hgc/56166504.3fb5399f.56166505.5b4d5fd4/_RTroom06836859_388072599_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fstylife%2Fkm2581%2F%3Fscid%3Droom_pc_id_reg", img:"https://tshop.r10s.jp/stylife/cabinet/item/581/km2581-01_1.jpg",
      blurb:"トレイル由来のごつっとした佇まいが、むしろ普段着のいい差し色に。Quicklaceのすっと締まる感じも good。" },
    { cat:"fashion", date:"2026.08.05", motif:"m-sneaker", brand:"On", name:"Cloud 6", price:"¥19,800", url:"https://hb.afl.rakuten.co.jp/hgc/564298ab.00744c4a.564298ac.d7858634/_RTroom06836859_387762742_pc?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsakaikututen%2Fcloud-m%2F%3Fscid%3Droom_pc_id_reg", img:"https://shop.r10s.jp/sakaikututen/cabinet/image1/compass1785939948.jpg",
      blurb:"雲の上のようと言われるクラウドソール。すっきりした見た目で、街履きにも軽い運動にも。" },
  ];

  // 掲載日の新しい順に並べる（同日は記述順を保つ安定ソート）
  PICKS.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // NEW は「最新の掲載日」かつ「その日付の商品が6件以下」のときだけ付ける。
  // 全件が同じ日付だと何が新しいとも言えないので、その場合は誰にも付かない。
  // 商品を1〜数件追加すると、その日付の商品にだけ自動で付く。
  const latestDate = PICKS.reduce((m, p) => (p.date > m ? p.date : m), "");
  const latestCount = PICKS.filter((p) => p.date === latestDate).length;
  const isNew = (p) => latestCount > 0 && latestCount < PICKS.length / 3 && p.date === latestDate;
  const INITIAL_VISIBLE = 6;

  // ---- render cards ----
  const grid = document.getElementById("pickGrid");
  const pickSearch = document.getElementById("pickSearch");
  const pickCount = document.getElementById("pickCount");
  const emptyState = document.getElementById("emptyState");
  const esc = (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const normalize = (s) => String(s || "").toLowerCase().normalize("NFKC");

  const band = (price) => {
    if (!price) return "";
    const n = Number(price.replace(/[^0-9]/g, ""));
    if (!n) return "";
    if (n < 2500) return "UNDER 2.5K";
    if (n < 7000) return "2.5K-7K";
    return "7K+";
  };

  const frag = document.createDocumentFragment();
  PICKS.forEach((p) => {
    const meta = CAT[p.cat];
    const el = document.createElement("article");
    el.className = "card reveal" + (p.feature ? " card--feature" : "");
    el.dataset.cat = p.cat;
    el.dataset.brand = p.brand;
    el.dataset.name = p.name;
    el.dataset.search = normalize([p.brand, p.name, p.blurb || p.desc || "", meta.label].join(" "));
    el.style.setProperty("--c", meta.cvar);
    el.style.setProperty("--c-deep", meta.deep);
    el.style.setProperty("--c-soft", meta.soft);

    const media = p.img
      ? `<div class="card__media"><img src="${p.img}" alt="${esc(p.brand)} ${esc(p.name)}" loading="lazy"></div>`
      : `<div class="card__media card__media--blank" aria-hidden="true"><span class="card__visual-word">${meta.label}</span><span class="card__visual-shape card__visual-shape--a"></span><span class="card__visual-shape card__visual-shape--b"></span></div>`;

    el.innerHTML = `
      ${media}
      <div class="card__body">
        <div class="card__meta">
          <span class="card__cat">${meta.label}</span>
          ${isNew(p) ? `<span class="card__new">NEW</span>` : ""}
          <span class="card__date">${esc(p.date)}</span>
        </div>
        <span class="card__brand">${esc(p.brand)}</span>
        <h3 class="card__name">${esc(p.name)}</h3>
        <p class="card__blurb">${esc(p.blurb || p.desc || "")}</p>
        <div class="card__foot">
          <a class="card__btn" href="${p.url}" target="_blank" rel="sponsored noopener nofollow">商品を見る</a>
        </div>
      </div>`;
    frag.appendChild(el);
  });
  // 読みもの等の商品グリッドが無いページでも同じmain.jsを読むため、存在確認する
  if (grid) grid.appendChild(frag);

  const statPicks = document.querySelector("[data-stat-picks]");
  const statReads = document.querySelector("[data-stat-reads]");
  const statLatest = document.querySelector("[data-stat-latest]");
  if (statPicks) statPicks.textContent = String(PICKS.length);
  if (statReads) statReads.textContent = String(document.querySelectorAll(".read-card").length);
  if (statLatest && latestDate) statLatest.textContent = latestDate.replace(/\./g, "/");

  let visibleCount = INITIAL_VISIBLE;
  const LOAD_STEP = 30;
  let totalMatches = 0;
  const togglePicks = document.getElementById("togglePicks");
  const applyLimit = () => {
    // カテゴリページ(/category/*)にも .card は並ぶが、あちらは全件表示が正なので触らない。
    // #pickGrid があるページ（＝トップ）に限定しないと、「もっと見る」の無いページで
    // 7件目以降が display:none のまま二度と出せなくなる。
    if (!grid) return;
    const activeChip = document.querySelector(".chip.is-active");
    const cat = activeChip?.dataset.cat || "all";
    const q = normalize(pickSearch?.value);
    let visibleIndex = 0;

    grid.querySelectorAll(".card").forEach((card) => {
      const matchesCat = cat === "all" || card.dataset.cat === cat;
      const matchesQuery = !q || card.dataset.search.includes(q);
      const matches = matchesCat && matchesQuery;
      if (!matches) {
        card.classList.add("is-hidden");
        return;
      }
      const collapse = visibleIndex >= visibleCount;
      card.classList.toggle("is-hidden", collapse);
      visibleIndex += 1;
    });
    totalMatches = visibleIndex;

    if (pickCount) {
      const catLabel = cat === "all" ? "すべて" : (CAT[cat]?.label || "選択中");
      pickCount.textContent = q ? `${catLabel} / ${totalMatches}件に絞り込み中` : `${catLabel} / ${totalMatches}件を表示`;
    }
    if (emptyState) emptyState.hidden = totalMatches !== 0;

  if (togglePicks) {
      const hasMore = totalMatches > visibleCount;
      const isExpanded = visibleCount > INITIAL_VISIBLE;
      togglePicks.hidden = !(hasMore || isExpanded);
      togglePicks.textContent = hasMore ? "もっと見る" : "閉じる";
      togglePicks.setAttribute("aria-expanded", String(isExpanded));
    }
  };

  if (pickSearch) {
    pickSearch.addEventListener("input", () => {
      visibleCount = INITIAL_VISIBLE;
      applyLimit();
    });
  }

  if (togglePicks) {
    togglePicks.addEventListener("click", () => {
      if (totalMatches > visibleCount) {
        visibleCount += LOAD_STEP;
      } else {
        visibleCount = INITIAL_VISIBLE;
      }
      applyLimit();
      if (visibleCount === INITIAL_VISIBLE) {
        document.getElementById("select")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  applyLimit();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- category filter ----
  let vtBusy = false;
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const apply = () => {
        chips.forEach((c) => { c.classList.remove("is-active"); c.setAttribute("aria-selected","false"); });
        chip.classList.add("is-active");
        chip.setAttribute("aria-selected","true");
        visibleCount = INITIAL_VISIBLE;
        applyLimit();
      };
      // 対応ブラウザでは絞り込みをクロスフェードさせる（未対応なら即時切替）。
      // 実行中に次のクリックが来ると中断されて Promise が reject するため、
      // 多重起動を防いだうえで拒否も握りつぶす。
      if (document.startViewTransition && !reduce && !vtBusy) {
        vtBusy = true;
        const t = document.startViewTransition(apply);
        const release = () => { vtBusy = false; };
        t.finished.then(release, release);
        t.ready.catch(() => {});
        t.updateCallbackDone.catch(() => {});
      } else {
        apply();
      }
    });
  });


  // ---- mood story slideshow ----
  const moodSlider = document.querySelector("[data-mood-slider]");
  if (moodSlider) {
    const slides = [...moodSlider.querySelectorAll(".mood-slide")];
    const dots = [...moodSlider.querySelectorAll("[data-mood-dot]")];
    let currentSlide = 0;
    let moodTimer = null;

    const showMood = (index) => {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === currentSlide;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentSlide);
      });
    };

    const startMood = () => {
      if (reduce || slides.length < 2 || moodTimer) return;
      moodTimer = window.setInterval(() => showMood(currentSlide + 1), 4600);
    };

    const stopMood = () => {
      if (!moodTimer) return;
      window.clearInterval(moodTimer);
      moodTimer = null;
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        stopMood();
        showMood(Number(dot.dataset.moodDot || 0));
        startMood();
      });
    });
    moodSlider.addEventListener("pointerenter", stopMood);
    moodSlider.addEventListener("pointerleave", startMood);
    showMood(0);
    startMood();
  }
  // ---- mobile menu ----
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.hasAttribute("hidden");
      if (open) { menu.removeAttribute("hidden"); menu.style.display = "flex"; }
      else { menu.setAttribute("hidden",""); menu.style.display = "none"; }
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      menu.setAttribute("hidden",""); menu.style.display = "none";
      toggle.setAttribute("aria-expanded","false");
    }));
  }

  // ---- motion ----
  // スクロール連動アニメが使えるブラウザではそちらに任せる（CSS側 html.sda）
  const sda = !reduce && window.CSS && CSS.supports && CSS.supports("animation-timeline", "view()");
  if (sda) document.documentElement.classList.add("sda");

  if (!reduce) {
    // マグネットボタン: ポインタに少し吸い寄せる
    document.querySelectorAll(".btn").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform =
          "translate(" + (e.clientX - r.left - r.width / 2) * 0.2 + "px," +
          (e.clientY - r.top - r.height / 2) * 0.28 + "px)";
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });

    // カードの傾き: --rx/--ry を渡すだけにして、CSS側の hover 移動と合成させる
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 7 + "deg");
        card.style.setProperty("--rx", (0.5 - (e.clientY - r.top) / r.height) * 7 + "deg");
      });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--rx");
        card.style.removeProperty("--ry");
      });
    });
  }

  // ---- editorial float: ムード面の大きいカードを軽く追従させる ----
  if (!reduce) {
    document.querySelectorAll("[data-float]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--fx", ((e.clientX - r.left) / r.width - 0.5) * 10 + "px");
        el.style.setProperty("--fy", ((e.clientY - r.top) / r.height - 0.5) * 10 + "px");
        el.style.transform = "translate(var(--fx), var(--fy))";
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
        el.style.removeProperty("--fx");
        el.style.removeProperty("--fy");
      });
    });
  }
  // ---- scroll reveal（スクロール連動が無いブラウザ向けのフォールバック） ----
  if (!reduce && !sda && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach((n) => io.observe(n));
  } else {
    document.querySelectorAll(".reveal").forEach((n) => n.classList.add("in"));
  }


  // ---- back to top ----
  const backTop = document.getElementById("backTop");
  if (backTop) {
    const toggleBackTop = () => {
      backTop.classList.toggle("is-visible", window.scrollY > 520);
    };
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    window.addEventListener("scroll", toggleBackTop, { passive: true });
    toggleBackTop();
  }
  // ---- share ----
  // Instagram は Web から投稿文を渡す仕組みが無いのでボタンを作れない。
  // 代わりに navigator.share が使える端末では OS の共有シートを出し、そこから選べるようにする。
  document.querySelectorAll("[data-share]").forEach((box) => {
    const url = location.href.split("#")[0].split("?")[0];
    const title = document.title;
    const media = document.querySelector('meta[property="og:image"]')?.content || "";
    const e = encodeURIComponent;
    const set = (sel, href) => { const a = box.querySelector(sel); if (a) a.href = href; };
    set("[data-share-x]",  "https://x.com/intent/tweet?text=" + e(title) + "&url=" + e(url));
    set("[data-share-line]","https://social-plugins.line.me/lineit/share?url=" + e(url));
    set("[data-share-fb]", "https://www.facebook.com/sharer/sharer.php?u=" + e(url));
    set("[data-share-pin]","https://pinterest.com/pin/create/button/?url=" + e(url) +
                           "&media=" + e(media) + "&description=" + e(title));

    const nat = box.querySelector("[data-share-native]");
    if (nat && navigator.share) {
      nat.hidden = false;
      nat.addEventListener("click", () => {
        navigator.share({ title, url }).catch(() => {});   // 共有中止は正常系なので握りつぶす
      });
    }
    const copy = box.querySelector("[data-share-copy]");
    if (copy) {
      copy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(url); }
        catch { return; }
        const before = copy.textContent;
        copy.textContent = "コピーしました";
        copy.classList.add("is-done");
        setTimeout(() => { copy.textContent = before; copy.classList.remove("is-done"); }, 1800);
      });
    }
  });


  // ---- クリック計測（GA4） ----
  // アフィリエイトリンクが押されているかを測れないと、どの商品が効いているか
  // 判断できないため、外部リンクのクリックをイベントとして送る。
  // 注意: パラメータはGA4の「カスタム定義」に登録しないとレポートに列として出ない。
  // 流入時の utm_source / utm_campaign をセッションに覚えておき、以降のイベントに載せる。
  // GA4自身もセッション単位で流入元を持つが、それは集客レポート側の話で、
  // 「week20260919のPinterest投稿から来た人が、どの商品を押したか」を
  // affiliate_click の行として並べるにはイベント側にも値が要る。
  // SNSのアプリ内ブラウザはリファラーを落とすので、UTMが無いと全部Directに潰れる。
  const utm = (() => {
    const KEY = "kmn_utm";
    const read = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch { return {}; } };
    const q = new URLSearchParams(location.search);
    const src = q.get("utm_source"), camp = q.get("utm_campaign");
    if (src || camp) {
      const v = { utm_source: src || "", utm_campaign: camp || "" };
      try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch { /* プライベートモード等 */ }
      return v;
    }
    return read();
  })();

  const track = (name, params) => {
    if (typeof window.gtag !== "function") return;
    const clean = {};
    Object.entries({ ...params, ...utm }).forEach(([k, v]) => {
      if (v == null || v === "") return;
      clean[k] = String(v).slice(0, 100);   // GA4のパラメータ値は100文字まで
    });
    window.gtag("event", name, clean);
  };
  const pageKind = location.pathname.startsWith("/read/") ? "article"
    : location.pathname.startsWith("/category/") ? "category"
    : "top";

  // ---- A8.net 広告枠 ----
  // a8mat / aid / mid は A8 が発行した値。書き換えると計測されないので触らないこと。
  // wid=004 は「気になるモノ手帖」のサイト登録ID。他媒体（note/Pinterest/Instagram）の
  // 値を貼ると成果がそちらに付く。
  //
  // 新しい広告素材を A8 で発行したら、ここに1件足して data-ad から参照するだけでよい。
  // 例: 家具350 の 300x250 を発行したら kagu350_rect を足し、
  //     data-ad="kagu350|lifepocket" を "kagu350|kagu350_rect" に変える。
  const AD_TAGS = {
    lifepocket: {
      w: 300, h: 250,
      alt: "LIFE POCKET｜なくさない財布のIoTレザーブランド",
      href: "https://px.a8.net/svt/ejp?a8mat=4B9X1B+2V02QY+4Q2I+64C3L",
      img: "https://www29.a8.net/svt/bgt?aid=260803199173&wid=004&eno=01&mid=s00000022041001028000&mc=1",
      px: "https://www12.a8.net/0.gif?a8mat=4B9X1B+2V02QY+4Q2I+64C3L"
    },
    evering: {
      w: 300, h: 250,
      alt: "EVERING｜Visaのタッチ決済に対応したスマートリング",
      href: "https://px.a8.net/svt/ejp?a8mat=4B9X1B+2QU1II+5C76+609HT",
      img: "https://www28.a8.net/svt/bgt?aid=260803199166&wid=004&eno=01&mid=s00000024909001009000&mc=1",
      px: "https://www13.a8.net/0.gif?a8mat=4B9X1B+2QU1II+5C76+609HT"
    },
    kagu350: {
      w: 728, h: 90,
      alt: "家具350｜おしゃれで機能的な家具通販",
      href: "https://px.a8.net/svt/ejp?a8mat=4BA2HE+6QBIAY+20EY+BX3J5",
      img: "https://www24.a8.net/svt/bgt?aid=260810258407&wid=004&eno=01&mid=s00000009385002002000&mc=1",
      px: "https://www18.a8.net/0.gif?a8mat=4BA2HE+6QBIAY+20EY+BX3J5"
    },
    kakko: {
      w: 300, h: 250,
      alt: "kakko｜北欧デザインの家具・インテリア",
      href: "https://px.a8.net/svt/ejp?a8mat=4B9X1B+FHCTM+51NQ+BXYE9",
      img: "https://www26.a8.net/svt/bgt?aid=260803199026&wid=004&eno=01&mid=s00000023543002006000&mc=1",
      px: "https://www10.a8.net/0.gif?a8mat=4B9X1B+FHCTM+51NQ+BXYE9"
    },
    andplants: {
      w: 300, h: 250,
      alt: "AND PLANTS｜パーソナル診断で選ぶ観葉植物",
      href: "https://px.a8.net/svt/ejp?a8mat=4B9X1B+2ZRJL6+4W8G+60OXD",
      img: "https://www25.a8.net/svt/bgt?aid=260803199181&wid=004&eno=01&mid=s00000022840001011000&mc=1",
      px: "https://www17.a8.net/0.gif?a8mat=4B9X1B+2ZRJL6+4W8G+60OXD"
    },
    pinkoi: {
      w: 300, h: 250,
      alt: "Pinkoi｜アジア最大級のデザイナーズ通販",
      href: "https://px.a8.net/svt/ejp?a8mat=4B9X1B+2HWJFU+5BXG+5YZ75",
      img: "https://www22.a8.net/svt/bgt?aid=260803199151&wid=004&eno=01&mid=s00000024874001003000&mc=1",
      px: "https://www12.a8.net/0.gif?a8mat=4B9X1B+2HWJFU+5BXG+5YZ75"
    },
    generate: {
      w: 300, h: 250,
      alt: "Generate Design｜デザイン雑貨・インテリアのセレクトショップ",
      href: "https://px.a8.net/svt/ejp?a8mat=4B9X1B+HV38Q+3BSS+61Z81",
      img: "https://www28.a8.net/svt/bgt?aid=260803199030&wid=004&eno=01&mid=s00000015526001017000&mc=1",
      px: "https://www13.a8.net/0.gif?a8mat=4B9X1B+HV38Q+3BSS+61Z81"
    },
    truetowel: {
      w: 300, h: 250,
      alt: "TRUE TOWEL｜今治産のタオル",
      href: "https://px.a8.net/svt/ejp?a8mat=4B9X1B+Q75PM+4ESE+63H8H",
      img: "https://www22.a8.net/svt/bgt?aid=260803199044&wid=004&eno=01&mid=s00000020579001024000&mc=1",
      px: "https://www16.a8.net/0.gif?a8mat=4B9X1B+Q75PM+4ESE+63H8H"
    },
    officecom: {
      w: 300, h: 250,
      alt: "オフィスコム｜机や椅子などのオフィス家具通販",
      href: "https://px.a8.net/svt/ejp?a8mat=4BC36L+FUYS8A+53JI+BXYE9",
      img: "https://www29.a8.net/svt/bgt?aid=260904477959&wid=004&eno=01&mid=s00000023787002006000&mc=1",
      px: "https://www12.a8.net/0.gif?a8mat=4BC36L+FUYS8A+53JI+BXYE9"
    }
  };

  // 728x90 が余白込みで収まる下限。これ未満では data-ad の「|」の右側（モバイル用）を使う。
  const AD_WIDE = "(min-width:820px)";

  // バナーをHTMLに直書きせずJSで挿す理由が2つある。
  //  (1) PC用とモバイル用を両方HTMLに置いてCSSで display:none すると、隠した側も
  //      画像が読み込まれてインプレッションだけが二重に立つ。
  //  (2) 枠が画面に近づいてから挿すことで、A8のインプレッション数が実際に見られた
  //      回数に近くなる。以前は最下部の枠でも即時に計測が走り、誰も見ていないのに
  //      インプレッションだけが積み上がっていた。
  const fillAdSlot = (slot) => {
    if (slot.dataset.adDone) return;
    slot.dataset.adDone = "1";              // 二重挿入＝インプレッション二重計上を防ぐ
    const spec = (slot.dataset.ad || "").split("|");
    const wide = window.matchMedia(AD_WIDE).matches;
    const key = wide ? spec[0] : (spec[1] !== undefined ? spec[1] : spec[0]);
    const body = slot.querySelector(".ad-slot__body");
    if (!key || !body) return;              // 空指定（その画面幅では出さない）

    // "a+b" で1枠に2本並べられる（トップの中段がこれ）。
    const tags = key.split("+").map((k) => ({ key: k, ...AD_TAGS[k] })).filter((tag) => tag.href);
    if (!tags.length) return;

    tags.forEach((tag) => {
      const a = document.createElement("a");
      a.href = tag.href;
      a.setAttribute("data-revenue", "affiliate");
      a.setAttribute("data-revenue-id", tag.key);
      a.setAttribute("data-revenue-provider", "a8");
      a.setAttribute("data-revenue-placement", slot.dataset.adPlacement);
      a.rel = "nofollow sponsored noopener";
      a.target = "_blank";
      const img = document.createElement("img");
      img.src = tag.img; img.alt = tag.alt;
      img.width = tag.w; img.height = tag.h;
      a.appendChild(img);

      const px = document.createElement("img");
      px.src = tag.px; px.alt = ""; px.width = 1; px.height = 1;
      px.className = "ad-slot__px";

      body.append(a, px);
    });
    slot.dataset.adKey = key;
    // CSS はこの属性を見て枠の余白・区切り線・PRラベルを出す。
    // hidden（display:none）で隠す方式にしないのは、JSが動かなかったときに
    // 「PR」ラベルと区切り線だけが残るのを防ぎつつ、枠自体は常にDOMに置いておくため。
    slot.dataset.filled = "1";
  };

  // 枠が画面の200px手前まで近づいたら挿す。IntersectionObserver を使わないのは、
  // IOが動かない環境に当たると広告が一切出なくなるため。rect の判定なら依存が無い。
  const pendingAds = Array.prototype.slice.call(document.querySelectorAll(".ad-slot[data-ad]"));
  if (pendingAds.length) {
    const MARGIN = 200;
    const checkAds = () => {
      for (let i = pendingAds.length - 1; i >= 0; i--) {
        const slot = pendingAds[i];
        const r = slot.getBoundingClientRect();
        if (r.top < window.innerHeight + MARGIN && r.bottom > -MARGIN) {
          pendingAds.splice(i, 1);
          fillAdSlot(slot);
        }
      }
      if (!pendingAds.length) {
        window.removeEventListener("scroll", onAdScroll);
        window.removeEventListener("resize", onAdScroll);
        document.removeEventListener("scroll", onAdScroll, true);
      }
    };
    let adTick = false;
    const onAdScroll = () => {
      if (adTick) return;
      adTick = true;
      requestAnimationFrame(() => { adTick = false; checkAds(); });
    };
    window.addEventListener("scroll", onAdScroll, { passive: true });
    window.addEventListener("resize", onAdScroll, { passive: true });
    // ページ内に別のスクロール領域がある場合、scroll は window まで上がってこない。
    // キャプチャ段階なら拾えるので保険で足す。
    document.addEventListener("scroll", onAdScroll, true);
    checkAds();
    // 遅れてレイアウトが確定した場合も位置を再確認する。画面外の枠は読み込まない。
    setTimeout(checkAds, 6000);
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || !a.href) return;

    // 広告バナーの表示・クリックは revenue-metrics.js が素材ごとに計測する。
    if (a.closest(".ad-slot")) return;

    // 商品リンク（アフィリエイト）
    const card = a.closest(".card");
    if (card && a.classList.contains("card__btn")) {
      track("affiliate_click", {
        item_brand: card.dataset.brand,
        item_name: card.dataset.name,
        item_category: card.dataset.cat,
        page_kind: pageKind
      });
      return;
    }
    // SNSチャンネル
    if (a.classList.contains("channel") || a.classList.contains("pill--room")) {
      track("sns_click", {
        sns_name: (a.querySelector(".channel__name")?.textContent || a.textContent || "").trim(),
        page_kind: pageKind
      });
      return;
    }
    // シェアボタン
    if (a.classList.contains("share__btn")) {
      track("share_click", { share_to: a.textContent.trim(), page_kind: pageKind });
      return;
    }
    // 記事への遷移
    if (a.classList.contains("read-card__more") || a.closest(".read-card h3")) {
      track("article_open", { article_path: new URL(a.href, location.href).pathname, page_kind: pageKind });
    }
  }, { passive: true });

  // シェアはボタン要素のものもあるので個別に拾う
  document.querySelectorAll("[data-share-native],[data-share-copy]").forEach((b) => {
    b.addEventListener("click", () => {
      track("share_click", { share_to: b.hasAttribute("data-share-native") ? "native" : "copy", page_kind: pageKind });
    }, { passive: true });
  });

  // ---- year ----
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
