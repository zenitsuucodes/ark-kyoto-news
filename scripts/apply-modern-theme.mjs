import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function walkIndexHtml(dir, acc, skipDrafts = true) {
  if (!fs.existsSync(dir)) return
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (skipDrafts && ent.name === '_drafts') continue
      walkIndexHtml(p, acc, skipDrafts)
    } else if (ent.name === 'index.html') acc.push(p)
  }
}

function assetPrefixFor(file) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  const dir = path.dirname(rel)
  if (dir === '.') return './'
  const depth = dir.split('/').filter(Boolean).length
  return `${'../'.repeat(depth)}`
}

function scrapeItems($) {
  const seen = new Set()
  const items = []

  function push(href, title, dataEn, img, datetime, timeText, source) {
    if (!href || seen.has(href)) return
    seen.add(href)
    items.push({
      href,
      title: title || '',
      dataEn: dataEn || '',
      img: img || '',
      datetime: datetime || '',
      timeText: timeText || '',
      source: source || 'ARK KYOTO NEWS',
    })
  }

  $('.ark-card').each((_, el) => {
    const $el = $(el)
    const linkEl = $el.find('.ark-card__title a').first()
    push(
      linkEl.attr('href'),
      linkEl.text().trim(),
      linkEl.attr('data-en'),
      $el.find('.ark-card__media img').attr('src'),
      $el.find('time').attr('datetime'),
      $el.find('time').first().text().trim(),
      'ARK KYOTO NEWS',
    )
  })

  $('.m-article-item').each((_, el) => {
    const $el = $(el)
    const linkEl = $el.find('a.m-article-item-ttl__link').first()
    push(
      linkEl.attr('href'),
      linkEl.text().trim(),
      linkEl.attr('data-en'),
      $el.find('img.m-article-item__img').attr('src'),
      $el.find('time').attr('datetime'),
      $el.find('time').first().text().trim(),
      $el.find('.m-article-info__link').text().trim() || 'ARK KYOTO NEWS',
    )
  })

  return items
}

function scrapeHeroFromModern($) {
  const $hero = $('.ark-hero').first()
  if (!$hero.length) return null
  const $title = $hero.find('.ark-hero__title a').first()
  return {
    href: $title.attr('href'),
    title: $title.text().trim(),
    dataEn: $title.attr('data-en') || '',
    img: $hero.find('.ark-hero__media img').attr('src') || '',
    deck: $hero.find('.ark-hero__deck').text().trim(),
    deckEn: $hero.find('.ark-hero__deck').attr('data-en') || '',
  }
}

function scrapeHeroLegacy($) {
  const $main = $('.top-news-main').first()
  if (!$main.length) return null
  return {
    href:
      $main.find('a.top-news-main__link').attr('href') ||
      $main.find('a.top-news-main__cover').attr('href'),
    title: $main.find('a.top-news-main__link').text().trim(),
    dataEn: $main.find('a.top-news-main__link').attr('data-en') || '',
    img: $main.find('img.top-news-main__img').attr('src') || '',
    deck: $main.find('.top-news-main__text').text().trim(),
    deckEn: $main.find('.top-news-main__text').attr('data-en') || '',
  }
}

function scrapeRail($) {
  const items = []
  $('.ark-rail-item').each((_, el) => {
    const $el = $(el)
    const a = $el.find('a').first()
    items.push({
      href: a.attr('href'),
      title: a.text().trim(),
      dataEn: a.attr('data-en') || '',
      datetime: $el.find('time').attr('datetime') || '',
      timeText: $el.find('time').first().text().trim(),
    })
  })
  $('.top-news-sub__item').each((_, el) => {
    const $el = $(el)
    items.push({
      href: $el.find('a.top-news-sub__link').attr('href'),
      title: $el.find('a.top-news-sub__link').text().trim(),
      dataEn: $el.find('a.top-news-sub__link').attr('data-en') || '',
      datetime: $el.find('time').attr('datetime') || '',
      timeText: $el.find('time').first().text().trim(),
    })
  })
  return items.filter((i) => i.href)
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
}

const LANG_BTN =
  '<button type="button" class="ark-lang-btn" data-en="English" data-ja-label="日本語">English</button>'

function headBlock(titleJa, titleEn, descJa, descEn, assetPrefix, canonical) {
  return `<!DOCTYPE html><html lang="ja" class="ark-modern-root"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title data-en="${esc(titleEn)}" data-ja="${esc(titleJa)}">${esc(titleJa)}</title>
<meta name="description" content="${esc(descJa)}" data-en-content="${esc(descEn)}" data-ja-content="${esc(descJa)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${assetPrefix}assets/modern.css">
</head>`
}

function siteHeader(assetPrefix, bodyClass) {
  return `<body class="ark-modern ${bodyClass}">
<header class="ark-site-header">
  <div class="ark-site-header__inner">
    <a class="ark-site-header__logo" href="${assetPrefix}index.html"><img src="${assetPrefix}assets/logo.svg" width="200" height="40" alt="ARK KYOTO NEWS"></a>
    <nav class="ark-site-header__nav" aria-label="Primary">
      <a href="${assetPrefix}list/news/" data-en="Latest">最新</a>
      <a href="${assetPrefix}list/news/japan/" data-en="Japan">日本</a>
      <a href="${assetPrefix}list/news/world/" data-en="World">国際</a>
      <a href="${assetPrefix}list/news/sports/" data-en="Sports">スポーツ</a>
      <a href="${assetPrefix}list/news/feature/" data-en="Feature">特集</a>
    </nav>
    <div class="ark-site-header__tools">${LANG_BTN}</div>
  </div>
</header>`
}

function card(item) {
  return `<article class="ark-card">
  <a href="${esc(item.href)}" class="ark-card__media">${item.img ? `<img src="${esc(item.img)}" alt="" loading="lazy">` : ''}</a>
  <div class="ark-card__body">
    <h3 class="ark-card__title"><a href="${esc(item.href)}" data-en="${esc(item.dataEn)}">${esc(item.title)}</a></h3>
    <p class="ark-card__meta"><time datetime="${esc(item.datetime)}">${esc(item.timeText)}</time> · ${esc(item.source)}</p>
  </div>
</article>`
}

function footer(assetPrefix) {
  return `<footer class="ark-site-footer">
  <div class="ark-site-footer__inner">
    <nav class="ark-site-footer__links">
      <a href="${assetPrefix}list/info/about/" data-en="About">会社概要</a>
      <a href="${assetPrefix}list/info/contact/" data-en="Contact">お問い合わせ</a>
      <a href="${assetPrefix}list/info/privacypolicy/" data-en="Privacy">プライバシー</a>
    </nav>
    <small data-en="© Ark Kyoto News." data-ja="©アーク京都ニュース">©アーク京都ニュース</small>
  </div>
</footer>
<script src="${assetPrefix}assets/modern.js" defer></script>
<script src="${assetPrefix}assets/display-en.js"></script>
</body></html>`
}

function buildListPage({ file, titleJa, titleEn, headingJa, headingEn, items }) {
  const prefix = assetPrefixFor(file)
  const relDir = path.dirname(path.relative(root, file)).replace(/\\/g, '/')
  const canonical = `${prefix}${relDir}/`
  const html =
    headBlock(titleJa, titleEn, titleJa, titleEn, prefix, canonical) +
    siteHeader(prefix, 'ark-list ark-list-page') +
    `<main class="ark-main ark-list-page">
  <div class="ark-section-head"><h2 data-en="${esc(headingEn)}">${esc(headingJa)}</h2></div>
  <div class="ark-grid">${items.map(card).join('')}</div>
</main>` +
    footer(prefix)
  fs.writeFileSync(file, html, 'utf8')
}

function buildHeroSection(hero, rail) {
  if (!hero?.href) return ''
  return `<section class="ark-hero">
  <div class="ark-hero__lead">
    <p class="ark-kicker" data-en="Top story">トップ</p>
    <h1 class="ark-hero__title"><a href="${esc(hero.href)}" data-en="${esc(hero.dataEn)}">${esc(hero.title)}</a></h1>
    <p class="ark-hero__deck" data-en="${esc(hero.deckEn)}">${esc(hero.deck)}</p>
    <p class="ark-hero__meta">ARK KYOTO NEWS</p>
  </div>
  <a class="ark-hero__media" href="${esc(hero.href)}">${hero.img ? `<img src="${esc(hero.img)}" alt="">` : ''}</a>
  <aside class="ark-hero__side">${rail
    .slice(0, 5)
    .map(
      (r) =>
        `<article class="ark-rail-item"><h2 class="ark-rail-item__title"><a href="${esc(r.href)}" data-en="${esc(r.dataEn)}">${esc(r.title)}</a></h2><p class="ark-rail-item__meta"><time datetime="${esc(r.datetime)}">${esc(r.timeText)}</time></p></article>`,
    )
    .join('')}</aside>
</section>`
}

// —— Primary feed from list/news ——
const listPath = path.join(root, 'list', 'news', 'index.html')
const $feed = cheerio.load(fs.readFileSync(listPath, 'utf8'), { decodeEntities: false })
let allNews = scrapeItems($feed)
if (allNews.length < 5) {
  const $home = cheerio.load(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    decodeEntities: false,
  })
  allNews = scrapeItems($home)
}

const feedPath = path.join(root, '_data', 'article-feed.json')
fs.mkdirSync(path.dirname(feedPath), { recursive: true })
fs.writeFileSync(feedPath, JSON.stringify(allNews, null, 2) + '\n', 'utf8')

const heroSource = cheerio.load(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
  decodeEntities: false,
})
let hero = scrapeHeroFromModern(heroSource) || scrapeHeroLegacy(heroSource)
if (!hero && allNews[0]) {
  hero = {
    href: allNews[0].href,
    title: allNews[0].title,
    dataEn: allNews[0].dataEn,
    img: allNews[0].img,
    deck: '',
    deckEn: '',
  }
}
const rail = scrapeRail(heroSource).length ? scrapeRail(heroSource) : allNews.slice(1, 6)

// —— Homepage ——
const homeHtml =
  headBlock(
    'アーク京都ニュース | 最新ニュース',
    'Ark Kyoto News | Latest',
    '京都発のモダンなニュースサイト。日本と世界の最新記事をお届けします。',
    'Modern news from Kyoto — latest Japan and world stories.',
    './',
    './index.html',
  ) +
  siteHeader('./', 'ark-home') +
  `<main class="ark-main">${buildHeroSection(hero, rail)}
<section>
  <div class="ark-section-head"><h2 data-en="Latest">最新記事</h2><a href="./list/news/" data-en="View all">すべて見る</a></div>
  <div class="ark-grid">${allNews.slice(0, 24).map(card).join('')}</div>
</section>
</main>` +
  footer('./')
fs.writeFileSync(path.join(root, 'index.html'), homeHtml, 'utf8')

// —— Full latest list ——
buildListPage({
  file: listPath,
  titleJa: '最新記事一覧 | アーク京都ニュース',
  titleEn: 'Latest | Ark Kyoto News',
  headingJa: '最新記事',
  headingEn: 'Latest',
  items: allNews,
})

// —— Category lists under list/news ——
const newsDir = path.join(root, 'list', 'news')
for (const ent of fs.readdirSync(newsDir, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue
  const file = path.join(newsDir, ent.name, 'index.html')
  if (!fs.existsSync(file)) continue
  const $cat = cheerio.load(fs.readFileSync(file, 'utf8'), { decodeEntities: false })
  const items = scrapeItems($cat)
  if (!items.length) continue
  const label = ent.name.replace(/-/g, ' ')
  buildListPage({
    file,
    titleJa: `${label} | アーク京都ニュース`,
    titleEn: `${label} | Ark Kyoto News`,
    headingJa: label,
    headingEn: label,
    items,
  })
}

function cleanupLegacy($) {
  $('style')
    .filter((_, el) => $(el).text().includes('i18n-pending'))
    .remove()
  $('script[src*="english-kyodo.ismcdn.jp/resources/prod"]').remove()
  $('script[src*="leafs.prod"]').remove()
  $('script[src*="top.prod"]').remove()
  $('link[href*="english-kyodo.ismcdn.jp/resources/kyodonews/css"]').attr('media', 'not all')
  $('div.g-ad-full-banner, div.g-ad-rectangle-below, div.g-ad-overlay').remove()
}

function injectModern($, file) {
  const prefix = assetPrefixFor(file)
  if (!$('link[href*="modern.css"]').length) {
    $('head').append(
      `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="${prefix}assets/modern.css">`,
    )
  }
  const scripts = $('script[src*="modern.js"]')
  if (!scripts.length) {
    $('body').append(`<script src="${prefix}assets/modern.js" defer></script>`)
  } else {
    scripts.attr('src', `${prefix}assets/modern.js`)
  }
  const display = $('script[src*="display-en.js"]')
  if (display.length) display.attr('src', `${prefix}assets/display-en.js`)

  $('html').addClass('ark-modern-root')
  const $body = $('body')
  $body.addClass('ark-modern')
  if (file.includes(`${path.sep}articles${path.sep}`)) $body.addClass('ark-article')
  cleanupLegacy($)
}

const patchFiles = []
walkIndexHtml(root, patchFiles)
let patched = 0
for (const file of patchFiles) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  if (rel === 'index.html' || rel.startsWith('list/news/')) continue
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'), { decodeEntities: false })
  injectModern($, file)
  fs.writeFileSync(file, $.html(), 'utf8')
  patched++
}

console.log(
  `Modern theme OK: ${allNews.length} articles in feed, home + list/news rebuilt, ${patched} legacy pages patched.`,
)
