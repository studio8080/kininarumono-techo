#!/usr/bin/env node
// プライバシー説明はこの生成元を編集する。改定日は内容を改めた日だけ更新する。
import path from 'node:path';
import { repoRoot, ORIGIN, CONTACT_URL, cacheVersion, head, header, footer, writeIfChanged, addToSitemap } from './lib/site.mjs';

const updated = '2026-10-16';
const vparam = cacheVersion();
const url = `${ORIGIN}/privacy`;
const title = 'プライバシーポリシー・Cookieと広告｜気になるモノ手帖';
const desc = '気になるモノ手帖のアクセス解析、Cookie、アフィリエイト広告、問い合わせ情報の取扱いについて。';
const html = `<!DOCTYPE html>
<html lang="ja">
${head({title, desc, url, vparam, ld: {'@context':'https://schema.org','@type':'WebPage',name:title,url,inLanguage:'ja-JP'}})}
<body>
${header}
<main><section class="cat-page">
<nav class="crumbs" aria-label="パンくず"><a href="/">気になるモノ手帖</a><span aria-hidden="true">›</span><span aria-current="page">プライバシーポリシー</span></nav>
<div class="section-head"><span class="eyebrow">PRIVACY</span><h1>プライバシーポリシー</h1><p class="section-sub">Cookie・アクセス解析・広告と、お問い合わせ情報の取扱いについて。制定・改定 ${updated}</p></div>
<div class="policy-grid">
<section class="policy-panel"><h2>運営とお問い合わせ</h2>
<p>気になるモノ手帖は、みかんココが個人で運営・編集しています。編集の考え方は<a href="/about">運営・編集方針</a>をご覧ください。</p>
<p>情報の確認・訂正・削除、掲載内容に関するご相談は、<a href="${CONTACT_URL}" target="_blank" rel="noopener">ここ企画の共通製品お問い合わせフォーム</a>で「気になるモノ手帖」を選択してご連絡ください。</p></section>
<section class="policy-panel"><h2>お問い合わせで取得する情報</h2>
<p>フォームでは、対象の製品、お問い合わせ内容、返信先メールアドレスを取得します。運営者と問い合わせを受け付けるここ企画が、内容の確認・返信・問題への対応のために利用します。</p>
<p>Googleフォームを利用するため、回答はGoogleのサービス上で処理・保存されます。<a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Googleのプライバシーポリシー</a>もご確認ください。回答は一般公開しません。パスワード、カード番号などの機密情報は入力しないでください。</p></section>
<section class="policy-panel"><h2>アクセス解析とCookie</h2>
<p>Googleアナリティクス4を利用し、閲覧ページ、参照元、閲覧日時、端末・ブラウザの種類、おおよその地域、Cookie等の識別子をGoogle LLCへ送信します。読まれている内容や導線を把握し、サイト改善に利用します。</p>
<p>広告のリンクが半分以上表示された状態が1秒続いた回数、広告の掲載位置・広告主の識別名・クリックをGoogleアナリティクスへ送信し、掲載内容の改善に利用します。広告事業者の請求対象となる表示回数とは異なります。入力内容、ライセンスキー、広告リンクの追跡パラメータはこの計測に含めません。Do Not Track・Global Privacy Controlの意思表示がある場合、この追加の広告計測は行いません。</p>
<p>Cookieはブラウザの設定で制限・削除できます。解析の停止には<a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener">Googleアナリティクスのオプトアウトアドオン</a>をご利用いただけます。Googleの取扱いは<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">Googleのパートナーサイト向け説明</a>をご確認ください。</p></section>
<section class="policy-panel"><h2>広告・アフィリエイト</h2>
<p>楽天アフィリエイト、A8.net、もしもアフィリエイトを利用しています。商品リンクを含むページや広告枠にはPRと表示し、リンク経由の購入・申込みによって運営者が報酬を受け取る場合があります。商品の販売・決済はリンク先の事業者が行います。</p>
<p>広告画像の表示時やリンクのクリック時に、IPアドレス、端末・ブラウザ情報、参照元ページ、表示・クリック情報、Cookie等の識別子が広告事業者に送信される場合があります。広告表示、成果計測、不正防止などに利用されます。</p>
<p>送信先と取扱い：<a href="https://privacy.rakuten.co.jp/" target="_blank" rel="noopener">楽天グループの個人情報保護方針</a>、<a href="https://www.a8.net/privacy.html" target="_blank" rel="noopener">A8.net（株式会社ファンコミュニケーションズ）</a>、<a href="https://moshimo.co.jp/privacy/" target="_blank" rel="noopener">もしもアフィリエイト（株式会社もしも）</a>。</p>
<p>Google AdSenseは審査申請中で、現時点では広告配信を有効にしていません。配信を開始する場合は、その前に情報の送信先・目的と必要な同意手段を本ページで案内します。</p></section>
<section class="policy-panel"><h2>表示に使う外部サービス</h2>
<p>サイト配信にはGoogleのFirebase Hosting、書体にはGoogle FontsとjsDelivr上のYakuHanJP、商品画像にはリンク先ショップ等の画像配信サービスを利用しています。これらへの読込時に、IPアドレス、ブラウザ情報、参照元などが各サービスへ送信される場合があります。ページや画像・書体を表示し、配信を維持するための通信です。</p>
<p>SNSやショップへの外部リンクを開いた後は、リンク先のポリシーが適用されます。</p></section>
<section class="policy-panel" data-koko-ask-privacy><h2>ChatGPTで質問する機能について</h2>
<p>この機能は、利用者が選んだ質問文と当サイトの公開ページへのリンクを端末のクリップボードへコピーします。入力済みのメニュー、図面、保存した学習記録を読み取ったり、運営者のサーバーへ質問を保存したりすることはありません。</p>
<p>「ChatGPTを開く」を押すとOpenAIのサイトへ移動します。質問文は自動送信されず、利用者がChatGPTへ貼り付けて送信したときにOpenAIへ提供されます。その内容とアカウント情報の取扱いはOpenAIの<a href="https://openai.com/policies/privacy-policy/" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a>および利用者のChatGPT設定に従います。機密情報は質問文へ含めないでください。</p></section>
<section class="policy-panel"><h2>保存・管理と改定</h2>
<p>問い合わせ情報は、対応と必要な記録管理のために保管します。開示・訂正・削除のご希望には、ご本人であることを確認したうえで対応します。法令上の保存義務がある記録は、その義務に従って取り扱います。</p>
<p>利用するサービスや情報の取扱いが変わった場合は、本ページを改定し、改定日を更新します。</p></section>
</div></section></main>
${footer(vparam)}
</body></html>
`;
const changed = writeIfChanged(path.join(repoRoot, 'public/privacy.html'), html);
addToSitemap(['/privacy'], updated, {priority:'0.3'});
console.log(`${changed ? '+' : '='} /privacy / ?v=${vparam}`);
