import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const prefix = '../../../'

const footerNav = `
    <div class="g-footer-nav">
      <ul class="g-footer-nav__list">
        <li class="g-footer-nav__item">
          <a class="g-footer-nav__link" href="${prefix}list/info/about/" data-en="About Us">私たちについて</a>
        </li>
        <li class="g-footer-nav__item">
          <a class="g-footer-nav__link" href="${prefix}list/info/privacypolicy/" data-en="Privacy Policy">プライバシーポリシー</a>
        </li>
        <li class="g-footer-nav__item">
          <a class="g-footer-nav__link" href="${prefix}list/info/cookiepolicy/" data-en="Cookie Policy">クッキーポリシー</a>
        </li>
        <li class="g-footer-nav__item">
          <a class="g-footer-nav__link" href="${prefix}list/info/copyright/" data-en="Copyright">著作権</a>
        </li>
        <li class="g-footer-nav__item">
          <a class="g-footer-nav__link" href="${prefix}list/info/contact/" data-en="Contact">お問い合わせ</a>
        </li>
        <li class="g-footer-nav__item">
          <a class="g-footer-nav__link" href="${prefix}list/info/advertise/" data-en="Advertise With Us">広告掲載について</a>
        </li>
      </ul>
    </div>`

const header = `
<header class="g-header js-header">
  <div class="g-header__inner">
    <div class="g-header-top">
      <div class="g-header-top__inner">
        <div class="g-header-info">
          <div class="g-header-info__nav">
            <ul class="g-header-info__list"></ul>
          </div>
        </div>
        <div class="g-header-logo">
          <a class="g-header-logo__link" href="${prefix}index.html">
            <img class="g-header-logo__img" src="${prefix}assets/logo.svg" width="180" height="60" loading="eager" alt="ARK KYOTO NEWS">
          </a>
        </div>
      </div>
    </div>
    <div class="g-header-bottom js-header-bottom">
      <nav class="g-header-nav">
        <ul class="g-header-nav__list">
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/news/" data-en="Latest">最新</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/news/japan/" data-en="Japan">日本</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/partners/spotlightjapan/" data-en="Spotlight">スポットライト</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/news/travel-tourism/" data-en="Travel/Tourism">旅行・観光</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/news/world/" data-en="World">世界</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/news/\tasian-games/" data-en="Asian Games">アジア競技大会</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/news/sumo/" data-en="Sumo">相撲</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/news/feature/" data-en="Feature">特徴</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/news/arts/" data-en="Arts">芸術</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/news/podcast/" data-en="Podcast">ポッドキャスト</a>
          </li>
          <li class="g-header-nav__item">
            <a class="g-header-nav__link js-header-nav-link" href="${prefix}list/info/about/" data-en="About us">私たちについて</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</header>`

function p(en, ja) {
  return `<p data-en="${en.replace(/"/g, '&quot;')}">${ja}</p>`
}

const pages = [
  {
    slug: 'about',
    titleEn: 'About Us',
    titleJa: '私たちについて',
    body: [
      p(
        'Connecting the world through trust, sparking your curiosity.',
        '信頼で世界をつなぎ、好奇心に火をつける。',
      ),
      p(
        'Japan Wire by Ark Kyoto News delivers timely, accurate coverage of Japan—politics, the economy, diplomacy, security, society, and sports—from a fair, independent perspective. Together with partner media, we publish visually rich stories on Japanese and Asian culture, travel, lifestyle, and technology.',
        'Japan Wire by アーク京都ニュースは、政治、経済、外交、安全保障、社会、スポーツなど、日本の重要ニュースを公平で偏りのない視点から迅速かつ正確にお届けします。パートナーメディアと連携し、日本とアジアの文化、旅行、ライフスタイル、テクノロジーに関するビジュアル豊かなコンテンツも提供しています。',
      ),
      p(
        'Ark Kyoto News is a leading news organization rooted in Kyoto and serving readers worldwide in English. Japan Wire carries forward a long tradition of helping international audiences understand Japan with depth and context.',
        'アーク京都ニュースは京都に根ざし、英語で世界の読者にサービスを提供する主要なニュース組織です。Japan Wire は、国際的な読者が日本を深く理解するための長い伝統を引き継いでいます。',
      ),
      p(
        'Our editorial team works to verify facts, attribute sources clearly, and explain why stories matter—so you can follow developments in Japan with confidence.',
        '編集チームは事実確認、情報源の明示、ニュースの背景説明に努め、読者が安心して日本の動向を追えるよう支援します。',
      ),
    ],
  },
  {
    slug: 'privacypolicy',
    titleEn: 'Privacy Policy',
    titleJa: 'プライバシーポリシー',
    body: [
      p(
        'Ark Kyoto News ("we," "us") respects your privacy. This policy describes how Japan Wire by Ark Kyoto News handles information when you visit our site.',
        'アーク京都ニュース（当社）は、お客様のプライバシーを尊重します。本ポリシーは、Japan Wire by アーク京都ニュースをご利用いただく際の情報の取り扱いについて説明します。',
      ),
      p(
        'We may collect technical data such as browser type, pages viewed, and approximate region derived from IP addresses to improve site performance and security. We do not sell personal information to third parties.',
        '当社は、サイトの性能とセキュリティ向上のため、ブラウザの種類、閲覧ページ、IPアドレスから推定されるおおよその地域などの技術データを収集する場合があります。個人情報を第三者に販売することはありません。',
      ),
      p(
        'If you contact us by email, we use your message only to respond and maintain a record of correspondence as needed.',
        'メールでお問い合わせいただいた場合、返信および必要な記録保持の目的でのみメッセージを使用します。',
      ),
      p(
        'We may update this policy from time to time. Continued use of the site after changes constitutes acceptance of the revised policy.',
        '本ポリシーは随時更新される場合があります。変更後もサイトを利用された場合、改定後のポリシーに同意したものとみなします。',
      ),
    ],
  },
  {
    slug: 'cookiepolicy',
    titleEn: 'Cookie Policy',
    titleJa: 'クッキーポリシー',
    body: [
      p(
        'This site may use cookies and similar technologies to remember preferences, measure traffic, and keep the service secure.',
        '当サイトでは、設定の記憶、トラフィックの測定、サービスの安全確保のために、クッキーおよび類似技術を使用する場合があります。',
      ),
      p(
        'Essential cookies are required for basic functions such as page navigation. Analytics cookies help us understand how visitors use the site so we can improve content and layout.',
        '必須クッキーはページ閲覧などの基本機能に必要です。分析用クッキーは、訪問者の利用状況を把握し、コンテンツやレイアウトを改善するために役立ちます。',
      ),
      p(
        'You can control cookies through your browser settings. Disabling certain cookies may limit some features.',
        'ブラウザの設定でクッキーを管理できます。一部のクッキーを無効にすると、機能が制限される場合があります。',
      ),
    ],
  },
  {
    slug: 'copyright',
    titleEn: 'Copyright',
    titleJa: '著作権',
    body: [
      p(
        'Text, photographs, graphics, and other content on Japan Wire by Ark Kyoto News are protected by copyright and related rights unless otherwise noted.',
        'Japan Wire by アーク京都ニュース上の文章、写真、グラフィックその他のコンテンツは、特に記載がない限り著作権および関連権により保護されています。',
      ),
      p(
        'Unauthorized reproduction, redistribution, or commercial use of our content without permission is prohibited. Limited quotation for news reporting or personal reference may be permitted when properly attributed to Ark Kyoto News.',
        '許可なくコンテンツを複製、再配布、商用利用することは禁止されています。アーク京都ニュースへの適切な出典表示がある場合、報道目的や個人的参照の範囲での引用が認められることがあります。',
      ),
      p(
        'Third-party trademarks and media remain the property of their respective owners.',
        '第三者の商標およびメディアは、それぞれの権利者に帰属します。',
      ),
    ],
  },
  {
    slug: 'contact',
    titleEn: 'Contact',
    titleJa: 'お問い合わせ',
    body: [
      p(
        'For editorial tips, corrections, or general inquiries about Japan Wire by Ark Kyoto News, please reach out using the details below.',
        'Japan Wire by アーク京都ニュースに関する取材情報、訂正、一般的なお問い合わせは、下記までご連絡ください。',
      ),
      p(
        'Email: newsroom@ark-kyoto.net (editorial tips and corrections) · press@ark-kyoto.net (media inquiries)',
        'メール： newsroom@ark-kyoto.net（取材情報・訂正） · press@ark-kyoto.net（報道関係のお問い合わせ）',
      ),
      p(
        'Postal address: Japan Wire Desk, Ark Kyoto News, Shimogyo-ku, Kyoto 600-8001, Japan',
        '郵送先：〒600-8001 京都府京都市下京区 Japan Wire 編集部（アーク京都ニュース）',
      ),
      p(
        'We aim to respond to verified correction requests within a reasonable time. For urgent safety-related information, please clearly mark your message as time-sensitive.',
        '確認済みの訂正依頼には合理的な期間内に回答するよう努めます。緊急の安全に関する情報は、件名に「至急」と明記してください。',
      ),
    ],
  },
  {
    slug: 'advertise',
    titleEn: 'Advertise With Us',
    titleJa: '広告掲載について',
    body: [
      p(
        'Japan Wire by Ark Kyoto News offers advertising and sponsored content opportunities for brands seeking to reach international audiences interested in Japan.',
        'Japan Wire by アーク京都ニュースでは、日本に関心を持つ国際的な読者層へのリーチを求めるブランド向けに、広告およびスポンサードコンテンツの掲載枠を提供しています。',
      ),
      p(
        'Packages may include display placements, newsletter mentions, and custom storytelling aligned with our editorial standards. All sponsored material is clearly labeled.',
        '掲載プランには、ディスプレイ広告、ニュースレター掲載、編集方針に沿ったカスタムストーリーテリングなどが含まれる場合があります。スポンサー提供のコンテンツはすべて明示的に表示されます。',
      ),
      p(
        'For rate cards and availability, contact: advertising@ark-kyoto.net · +81-75-555-0140 (weekdays 10:00–18:00 JST)',
        '料金表および空き状況： advertising@ark-kyoto.net · 電話 +81-75-555-0140（平日 10:00–18:00 日本時間）',
      ),
    ],
  },
]

function renderPage({ slug, titleEn, titleJa, body }) {
  const bodyHtml = body.join('\n')
  return `<!DOCTYPE html><html lang="ja" class="i18n-pending"><head><style>html.i18n-pending body{visibility:hidden}</style>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title data-en="${titleEn} | Japan Wire by Ark Kyoto News">${titleJa} | Japan Wire by アーク京都ニュース</title>
<meta name="description" content="${titleJa}" data-en-content="${titleEn}">
<link rel="shortcut icon" href="https://english-kyodo.ismcdn.jp/common/images/favicon.ico">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300..800&amp;display=swap">
<link rel="stylesheet" href="https://english-kyodo.ismcdn.jp/resources/kyodonews/css/pc/leafs.css?rd=202609031611">
<link rel="canonical" href="${prefix}list/info/${slug}/">
</head><body class="i18n-pending">
<div class="l-wrap">
${header}
<div class="l-content">
  <main class="l-article">
    <div class="article-header">
      <h1 class="article-ttl" data-en="${titleEn}">${titleJa}</h1>
    </div>
    <div class="article-body">
      <div class="article-body__inner">
        ${bodyHtml}
      </div>
    </div>
  </main>
</div>
<footer class="g-footer">
  <div class="g-footer__inner">
${footerNav}
    <small class="g-footer-copy" data-en="© Ark Kyoto News.">©アーク京都ニュース.</small>
  </div>
</footer>
</div>
<script src="${prefix}assets/display-en.js"></script></body></html>`
}

for (const page of pages) {
  const dir = path.join(root, 'list', 'info', page.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), renderPage(page), 'utf8')
}

console.log(`Wrote ${pages.length} info pages under list/info/`)
