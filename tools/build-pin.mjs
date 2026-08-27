#!/usr/bin/env node
/**
 * Pinterest用のカテゴリ誘導ピン画像（1000x1500 / 2:3）を7枚書き出す。
 *
 *   node tools/build-pin.mjs
 *   → tools/pins/pin-<cat>.png
 *
 * ★ 規約上の前提（変更するときは必ず読むこと）
 *
 * このピンは「楽天の商品画像を1枚も使わない」ことが設計の核。理由:
 *
 *   楽天アフィリエイトガイドラインは、リンク作成ページで提供される商品画像について
 *   「アフィリエイトリンクと一緒に掲載すること」「リンク先が楽天市場であることが
 *   わかる様な形で紹介すること」を条件にしている。
 *   このピンのリンク先は自サイト（kininarumono.jp/category/*）なので、
 *   楽天の商品画像を載せるとこの条件を満たせない。だから使わない。
 *
 *   また同ガイドラインは楽天提供画像への文字合成を禁じている（著作者人格権の保護）。
 *   このピンはサイト自身のデザイン資産（配色・書体・SVG図案）だけで作るので、
 *   その禁止の対象外になり、Pinterestで効くテキストオーバーレイを堂々と使える。
 *
 *   リンク先について: 同ガイドラインが禁じているのは「認定SNS"以外"へ、
 *   アフィリエイトリンクが掲載されたメディアのURLを掲載すること」。
 *   Pinterestは認定SNSに含まれるため、アフィリエイトリンクを含む自サイトのURLを
 *   ピンのリンク先にすることは禁止されていない。
 *
 * 商品そのものを紹介する従来のピン（楽天の商品画像＋ a.r10.to 直リンク）は
 * これまでどおり。こちらはカテゴリページへの誘導という別枠。
 *
 * レンダリング方法は tools/build-ogp.mjs と同じ（ヘッドレスChromeで撮って
 * PillowでLanczos縮小）。サイト本体のCSSを読むので、配色や書体を変えたときに
 * ピンだけ旧デザインで取り残されることがない。
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(ROOT, "tools", "pin-source.html");
const INDEX = join(ROOT, "public", "index.html");
const MAIN = join(ROOT, "public", "js", "main.js");
const OUTDIR = join(ROOT, "tools", "pins");

// label は main.js の CAT と対応させること
const PINS = {
  interior: {
    cvar: "teal", label: "インテリア",
    heading: "北欧の定番から、<br /><em>灯りと小さな</em><br />オブジェまで",
    lead: "部屋の印象は、大きな家具より<br />灯りと小物の積み重ねで変わる。",
    motifs: ["m-chair", "m-vase", "m-stand"]
  },
  kitchen: {
    cvar: "green", label: "食器・キッチン",
    heading: "毎日使うから、<br /><em>形と質感</em>で<br />選ぶ。",
    lead: "北欧食器の定番から波佐見焼、<br />燕三条のステンレス道具まで。",
    motifs: ["m-mug", "m-wineglass", "m-scale"]
  },
  gadget: {
    cvar: "purple", label: "ガジェット",
    heading: "机に置いた<br>ときの<em>顔</em>で<br />選ぶ。",
    lead: "スピーカー、キーボード、<br />カメラまわりの小物まで。",
    motifs: ["m-keyboard", "m-cable", "m-mixer"]
  },
  fashion: {
    cvar: "amber", label: "ファッション",
    heading: "普段の服に、<br /><em>一点だけ</em><br />足して効くもの",
    lead: "バッグ、スニーカー、<br />アクセサリー、雨の日の一枚。",
    motifs: ["m-sneaker", "m-tote", "m-polo"]
  },
  goods: {
    cvar: "coral", label: "文具・雑貨",
    heading: "机の上と、<br />カバンの中の<br /><em>定位置</em>",
    lead: "ペン、手帳まわり、ポーチ、<br />財布、カードケース。",
    motifs: ["m-book", "m-memo", "m-notebook"]
  },
  daily: {
    cvar: "violet", label: "日用品",
    heading: "生活感が<br />出やすいところ<br />ほど、<em>形を選ぶ</em>",
    lead: "収納ボックス、ティッシュまわり、<br />洗面所の小物。",
    motifs: ["m-crate", "m-tissue", "m-diffuser"]
  },
  beauty: {
    cvar: "pink", label: "コスメ・ケア",
    heading: "出しっぱなし<br />でも<em>気持ちの<br />いいもの</em>",
    lead: "ソープ、バーム、ヘアケア。<br />パッケージまで含めて選ぶ。",
    motifs: ["m-tube", "m-bottle", "m-pouch"]
  }
};

// ピンにも広告であることを示す。リンク先はアフィリエイトリンクを含むページなので、
// 景表法（ステマ規制）上、ピンの段階で分かるようにしておくのが安全側。
const NOTE = "PR・アフィリエイト広告を含みます";

// ---- PICKS の件数を main.js から数える（カテゴリページの件数と必ず一致させる） ----
// build-category.mjs と同じく式として評価する。`},` 区切りの正規表現で数えると、
// 配列の最後のエントリに末尾カンマが無いときに1件取りこぼす（実際に踏んだ）。
function countByCat() {
  const src = readFileSync(MAIN, "utf8");
  const start = src.indexOf("const PICKS = [");
  const end = src.indexOf("\n  ];", start);
  if (start < 0 || end < 0) throw new Error("main.js の PICKS が見つからない");
  const picks = new Function(`"use strict"; return [${src.slice(start + "const PICKS = [".length, end)}];`)();
  const counts = {};
  for (const p of picks) counts[p.cat] = (counts[p.cat] || 0) + 1;
  return counts;
}

// ---- index.html にインラインしてあるSVG図案スプライトを取り出す ----
// 図案はサイト自身の著作物。楽天の画像は一切使わない。
function readSprite() {
  const html = readFileSync(INDEX, "utf8");
  const start = html.indexOf('<svg xmlns="http://www.w3.org/2000/svg" style="display:none"');
  if (start < 0) throw new Error("index.html にSVGスプライトが見つからない");
  const end = html.indexOf("</svg>", html.lastIndexOf("</symbol>", html.length));
  if (end < 0) throw new Error("スプライトの終端が見つからない");
  return html.slice(start, end + "</svg>".length);
}

const chrome = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome"
].filter(Boolean).find((p) => existsSync(p));
if (!chrome) {
  console.error("Chromeが見つからない。CHROME_PATH で実行ファイルを指定する。");
  process.exit(1);
}

const counts = countByCat();
const sprite = readSprite();
const template = readFileSync(TEMPLATE, "utf8");
const work = join(tmpdir(), "kmn-pin");
mkdirSync(work, { recursive: true });
mkdirSync(OUTDIR, { recursive: true });

const only = process.argv[2];
for (const [cat, cfg] of Object.entries(PINS)) {
  if (only && only !== cat) continue;
  const n = counts[cat];
  if (!n) { console.log(`skip ${cat}（PICKSに該当なし）`); continue; }

  const motifs = cfg.motifs
    .map((id) => `<span class="m"><svg viewBox="0 0 64 64"><use href="#${id}"/></svg></span>`)
    .join("");

  const html = template
    .replaceAll("__CVAR__", cfg.cvar)
    .replace("__LABEL__", cfg.label)
    .replace("__HEADING__", cfg.heading)
    .replace("__LEAD__", cfg.lead)
    .replace("__COUNT__", String(n))
    .replace("__MOTIFS__", motifs)
    .replace("__NOTE__", NOTE)
    .replace("__SPRITE__", sprite);

  // テンプレートと同じ階層に置く（../public/css/style.css の相対パスを保つため）
  const tmpHtml = join(ROOT, "tools", `_pin-${cat}.html`);
  const raw = join(work, `pin-${cat}-raw.png`);
  const out = join(OUTDIR, `pin-${cat}.png`);
  writeFileSync(tmpHtml, html);
  try {
    execFileSync(chrome, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars",
      `--user-data-dir=${join(work, "chrome-profile")}`,
      "--window-size=1000,1500",
      "--force-device-scale-factor=2",
      "--virtual-time-budget=20000",
      `--screenshot=${raw}`,
      `file:///${tmpHtml.replace(/\\/g, "/")}`
    ], { stdio: "ignore" });

    execFileSync("python", ["-c", [
      "from PIL import Image",
      `im=Image.open(r'${raw}').convert('RGB').resize((1000,1500), Image.LANCZOS)`,
      `im.save(r'${out}','PNG',optimize=True)`
    ].join("\n")], { stdio: "inherit" });
  } finally {
    rmSync(tmpHtml, { force: true });
  }
  console.log(`+ ${out} (${Math.round(statSync(out).size / 1024)}KB) ${cfg.label} ${n}点`);
}
