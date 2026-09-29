/**
 * Ultra-fast clone: download + regex/cheerio light processing, NO translation API.
 * English pages, local article links, ARK KYOTO branding.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { fetchArticlesToDisk } from './fetch-articles.mjs'
import { runPool } from './translate.mjs'
import {
  ORIGIN,
  CDN,
  rebrandText,
  extractArticleIds,
  applyHeaderEdits,
  articleOutDir,
  writePageFile,
  stripExternalAnchors,
  linkHelpers,
} from './process-page.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const sourcePath = path.join(root, '_source.html')
const indexPath = path.join(root, 'index.html')
const rawDir = path.join(root, '_articles', 'raw')

const BUILD_WORKERS = 16

function stripBloat(html) {
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
  html = html.replace(/href="\/(?!\/)/g, `href="${ORIGIN}/`)
  return html
}

function finalizeFast($, { pageKind, assetPrefix }) {
  applyHeaderEdits($)
  stripExternalAnchors($, pageKind)
  const links = linkHelpers(pageKind)

  $('img[src="__LOGO__"], img.g-header-logo__img').attr('src', `${assetPrefix}assets/logo.svg`)
  $('html').attr('lang', 'en').removeClass('i18n-pending')
  $('body').removeClass('i18n-pending')
  $('script[src*="display-en.js"]').remove()
  $('head style').filter((_, el) => $(el).text().includes('i18n-pending')).remove()
}

export function processFastHtml(html, options) {
  html = stripBloat(html)
  html = html.replace(/href="https:\/\/english\.kyodonews\.net\/"/g, 'href="__HOME__"')
  html = html.replace(
    /href="https:\/\/english\.kyodonews\.net\/articles\/-\/(\d+)\/?"/g,
    (_, id) => `href="__ARTICLE_${id}__"`,
  )

  const $ = cheerio.load(html, { decodeEntities: false })
  finalizeFast($, options)

  let out = $.html()
  const links = linkHelpers(options.pageKind)
  out = out.replace(/href="__HOME__"/g, `href="${links.home}"`)
  out = out.replace(/href="__ARTICLE_(\d+)__"/g, (_, id) => `href="${links.article(id)}"`)
  return out
}

export function buildFastArticlePage(rawHtml) {
  return processFastHtml(rawHtml, { pageKind: 'article', assetPrefix: '../../../' })
}

async function main() {
  const t0 = Date.now()
  const sourceHtml = fs.readFileSync(sourcePath, 'utf8')
  const articleIds = [...new Set(extractArticleIds(sourceHtml))]

  console.log(`Fast clone: ${articleIds.length} homepage articles (no translation)`)
  await fetchArticlesToDisk(articleIds, { concurrency: 24 })

  fs.writeFileSync(
    indexPath,
    processFastHtml(sourceHtml, { pageKind: 'index', assetPrefix: './' }),
  )
  console.log('Wrote index.html')

  let n = 0
  await runPool(articleIds, BUILD_WORKERS, async (id) => {
    const rawPath = path.join(rawDir, `${id}.html`)
    if (!fs.existsSync(rawPath)) return
    const html = processFastHtml(fs.readFileSync(rawPath, 'utf8'), {
      pageKind: 'article',
      assetPrefix: '../../../',
    })
    writePageFile(articleOutDir(root, id), html)
    n++
  })

  console.log(`Built ${n} article pages in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
