import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import {
  englishToJapanese,
  shouldSkipTranslation,
  translateMany,
} from './translate.mjs'

export const ORIGIN = 'https://english.kyodonews.net'
export const CDN = 'https://english-kyodo.ismcdn.jp'

export function rebrandText(s) {
  return s
    .replace(/KYODO NEWS/g, 'ARK KYOTO NEWS')
    .replace(/Kyodo News/g, 'Ark Kyoto News')
}

export function extractArticleIds(html) {
  const ids = new Set()
  const re = /\/articles\/-\/(\d+)/g
  let m
  while ((m = re.exec(html))) ids.add(m[1])
  return [...ids]
}

export function preprocessHtml(html) {
  html = rebrandText(html)

  html = html.replace(
    /<script type="text\/javascript" src="https:\/\/cdn01\.stright\.bizris\.com[\s\S]*?<!-- STRIGHT ONE Banner Script End -->/,
    '',
  )
  html = html.replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/g, '')
  html = html.replace(
    /<script async="async" src="https:\/\/securepubads\.g\.doubleclick\.net[\s\S]*?<\/script>\s*<script>\s*window\.googletag[\s\S]*?<\/script>/,
    '',
  )
  html = html.replace(
    /<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/,
    '',
  )
  html = html.replace(/<div class="g-ad-full-banner">[\s\S]*?<\/div>\s*(?=<div class="article-header")/, '')
  html = html.replace(/<div class="g-ad-overlay">[\s\S]*?(?=<\/div>\s*<\/div>\s*(?:<div class="measurement"|$))/g, '')
  html = html.replace(/<div class="measurement"[\s\S]*?(?=<\/body>|$)/g, '')

  html = html.replace(
    /src="https:\/\/english-kyodo\.ismcdn\.jp\/common\/images\/logo\.svg"/g,
    'src="__LOGO__"',
  )
  html = html.replace(/\ssrc="\/(mwimgs|common)\//g, ` src="${CDN}/$1/`)

  html = html.replace(
    /,"potentialAction":\{"@type":"SearchAction"[\s\S]*?"valueName":"fulltext"\}\}/,
    '}',
  )

  return html
}

export function applyHeaderEdits($) {
  $('.g-header-sns').remove()
  $('.g-header-login').remove()
  $('.g-header-info__item.--search').remove()
  $('.g-header-info__item.--language').remove()
}

export function applyFooterEdits($) {
  $('.g-footer-sns').remove()
}

export function applyArticleEdits($) {
  $('.article-sns').remove()
  $('.article-v-wrap').remove()
  $('.m-side-banner-wrap').remove()
}

export function linkHelpers(pageKind) {
  if (pageKind === 'index') {
    return {
      home: './index.html',
      article: (id) => `./articles/-/${id}/`,
      listPath: (p) => `./${p.replace(/^\//, '').replace(/\?.*$/, '')}/`,
    }
  }
  if (pageKind === 'list') {
    return {
      home: '../../../index.html',
      article: (id) => `../../../articles/-/${id}/`,
      listPath: (p) => {
        const clean = p.replace(/^\//, '').replace(/\?.*$/, '')
        return `../../../${clean}/`
      },
    }
  }
  return {
    home: '../../../index.html',
    article: (id) => `../${id}/`,
    listPath: (p) => `../../../${p.replace(/^\//, '').replace(/\?.*$/, '')}/`,
  }
}

/** Keep in-site article/list links; neutralize all other outbound URLs. */
export function stripExternalAnchors($, pageKind) {
  const links = linkHelpers(pageKind)

  $('a[href]').each(function () {
    const el = $(this)
    let href = (el.attr('href') || '').trim()
    if (!href || href === '#') return

    if (href.startsWith('//')) href = `https:${href}`

    if (
      href === '/' ||
      href === './index.html' ||
      href.endsWith('english.kyodonews.net/') ||
      href === links.home
    ) {
      el.attr('href', links.home)
      el.removeAttr('target').removeAttr('rel')
      return
    }

    let articleMatch = href.match(/\/articles\/-\/(\d+)\/?(?:[?#].*)?$/)
    if (articleMatch && (href.includes('kyodonews.net') || href.startsWith('/articles'))) {
      el.attr('href', links.article(articleMatch[1]))
      el.removeAttr('target').removeAttr('rel')
      return
    }

    const kyodoList = href.match(/english\.kyodonews\.net(\/list\/[^?#]*)/)
    if (kyodoList) {
      el.attr('href', links.listPath(kyodoList[1]))
      el.removeAttr('target').removeAttr('rel')
      return
    }

    if (!/^https?:\/\//i.test(href)) {
      if (href.startsWith('/articles/-/')) {
        articleMatch = href.match(/\/articles\/-\/(\d+)/)
        if (articleMatch) el.attr('href', links.article(articleMatch[1]))
      } else if (href.startsWith('/list/')) {
        el.attr('href', links.listPath(href.replace(/\?.*$/, '')))
      }
      return
    }

    el.attr('href', '#')
    el.removeAttr('target')
    el.removeAttr('rel')
  })
}

export function rewriteLinks($, { pageKind }) {
  stripExternalAnchors($, pageKind)
}

const INDEX_TEXT_SELECTORS =
  'a, h1, h2, h3, h4, h5, h6, time, button, small, .top-news-main__text, .m-article-pr__ttl, .m-article-pr__source'

const ARTICLE_TEXT_SELECTORS = [
  INDEX_TEXT_SELECTORS,
  '.article-ttl',
  '.article-body p',
  '.article-header-img-main__caption',
  '.article-body-bottom__ttl',
  '.related-item__link',
  'figcaption',
  '.article-header-info__link',
  '.article-header-cate__link',
].join(', ')

const LIST_TEXT_SELECTORS = [
  INDEX_TEXT_SELECTORS,
  '.list-ttl',
  '.m-list-heading',
  '.m-article-item-ttl__link',
  '.m-breadcrumb__link',
  '.m-pagination__link',
].join(', ')

const META_CONTENT =
  'description, og:title, og:description, og:site_name, twitter:title, twitter:description, apple-mobile-web-app-title, application-name'

export function gatherTranslatableStrings(html, pageKind, { preprocess = true } = {}) {
  if (preprocess) html = preprocessHtml(html)
  const $ = cheerio.load(html, { decodeEntities: false })
  return collectLocalizationWork($, pageKind).toTranslate
}

function selectorsFor(pageKind) {
  if (pageKind === 'article') return ARTICLE_TEXT_SELECTORS
  if (pageKind === 'list') return LIST_TEXT_SELECTORS
  return INDEX_TEXT_SELECTORS
}

function englishText(el, $, mode) {
  if (mode === 'meta') {
    const stored = el.attr('data-en-content')
    if (stored) return stored.trim()
    return (el.attr('content') || '').trim()
  }
  if (mode === 'alt') {
    const stored = el.attr('data-en-alt')
    if (stored) return stored.trim()
    return (el.attr('alt') || '').trim()
  }
  const stored = el.attr('data-en')
  if (stored) return stored.trim()
  return el.text().replace(/\s+/g, ' ').trim()
}

function collectLocalizationWork($, pageKind) {
  const textSelectors = selectorsFor(pageKind)
  const toTranslate = []
  const jobs = []

  const titleEl = $('title')
  if (titleEl.length) {
    const en = englishText(titleEl, $, 'title')
    if (en && !shouldSkipTranslation(en)) {
      toTranslate.push(en)
      jobs.push({ kind: 'title', en })
    }
  }

  for (const name of META_CONTENT.split(', ')) {
    const sel =
      name.startsWith('og:') || name.startsWith('twitter:')
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`
    const el = $(sel)
    if (!el.length) continue
    const en = englishText(el, $, 'meta')
    if (!en || shouldSkipTranslation(en)) continue
    toTranslate.push(en)
    jobs.push({ kind: 'meta', el, en })
  }

  $(textSelectors).each(function () {
    const el = $(this)
    if (el.children('a, span, img, time').length) return
    const en = englishText(el, $, 'text')
    if (!en || shouldSkipTranslation(en)) return
    toTranslate.push(en)
    jobs.push({ kind: 'text', el, en })
  })

  $('img[alt]').each(function () {
    const el = $(this)
    const en = englishText(el, $, 'alt')
    if (!en || shouldSkipTranslation(en)) return
    toTranslate.push(en)
    jobs.push({ kind: 'alt', el, en })
  })

  return { toTranslate, jobs, titleEl }
}

export function injectEnglishDisplay($, assetPrefix) {
  $('html').attr('lang', 'ja').addClass('i18n-pending')
  $('body').addClass('i18n-pending')
  $('head style')
    .filter((_, el) => $(el).text().includes('i18n-pending'))
    .remove()
  $('head').prepend('<style>html.i18n-pending body{visibility:hidden}</style>')
  $('script[src*="display-en.js"]').remove()
  $('body').append(`<script src="${assetPrefix}assets/display-en.js"></script>`)
}

export async function applyLocalization($, cache, pageKind) {
  const { toTranslate, jobs, titleEl } = collectLocalizationWork($, pageKind)
  await translateMany(toTranslate, cache, 6)

  for (const job of jobs) {
    const ja = await englishToJapanese(job.en, cache)
    if (job.kind === 'title') {
      titleEl.attr('data-en', job.en)
      titleEl.text(ja)
    } else if (job.kind === 'meta') {
      job.el.attr('data-en-content', job.en)
      job.el.attr('content', ja)
    } else if (job.kind === 'text') {
      job.el.attr('data-en', job.en)
      job.el.text(ja)
    } else if (job.kind === 'alt') {
      job.el.attr('data-en-alt', job.en)
      job.el.attr('alt', ja)
    }
  }
}

export function finalizePage($, { assetPrefix, pageKind, canonicalHref }) {
  applyHeaderEdits($)
  rewriteLinks($, { pageKind })

  $('img[src="__LOGO__"], img.g-header-logo__img').attr('src', `${assetPrefix}assets/logo.svg`)

  $('link[rel="canonical"]').attr('href', canonicalHref)

  $('html').attr('lang', 'ja').addClass('i18n-pending')
  $('body').addClass('i18n-pending')
  if (!$('head style').first().length || !$('head style').first().text().includes('i18n-pending')) {
    $('head').prepend('<style>html.i18n-pending body{visibility:hidden}</style>')
  }

  $('script[src="./assets/display-en.js"]').remove()
  $('body').append(`<script src="${assetPrefix}assets/display-en.js"></script>`)
}

export async function processHtmlToPage(html, options) {
  const { pageKind, assetPrefix, canonicalHref, cache, skipLocalize = false } = options
  html = preprocessHtml(html)
  const $ = cheerio.load(html, { decodeEntities: false })
  if (!skipLocalize) {
    await applyLocalization($, cache, pageKind)
  }
  finalizePage($, { assetPrefix, pageKind, canonicalHref })
  return $.html()
}

export function articleOutDir(root, id) {
  return path.join(root, 'articles', '-', id)
}

export function writePageFile(outDir, html) {
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8')
}
