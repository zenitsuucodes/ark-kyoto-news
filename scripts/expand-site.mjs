import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { Agent, fetch } from 'undici'
import { ORIGIN, extractArticleIds, articleOutDir, writePageFile } from './process-page.mjs'
import { fetchArticlesToDisk } from './fetch-articles.mjs'
import { runPool } from './translate.mjs'
import { processFastHtml, buildFastArticlePage } from './build-fast.mjs'
import { buildSyntheticArticleHtml } from './synthetic-article.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const sourcePath = path.join(root, '_source.html')
const indexPath = path.join(root, 'index.html')
const rawDir = path.join(root, '_articles', 'raw')

const dispatcher = new Agent({ connections: 48, keepAliveTimeout: 60_000 })

const CATEGORIES = [
  { path: 'list/news', title: 'Latest', pages: 2 },
  { path: 'list/news/japan', title: 'Japan', pages: 3 },
  { path: 'list/partners/spotlightjapan', title: 'Spotlight Japan', pages: 2 },
  { path: 'list/news/travel-tourism', title: 'Travel/Tourism', pages: 2 },
  { path: 'list/news/world', title: 'World', pages: 3 },
  { path: 'list/news/asian-games', title: 'Asian Games', pages: 2 },
  { path: 'list/news/sumo', title: 'Sumo', pages: 2 },
  { path: 'list/news/feature', title: 'Feature', pages: 2 },
  { path: 'list/news/arts', title: 'Arts', pages: 2 },
  { path: 'list/news/podcast', title: 'Podcast', pages: 2 },
]

async function fetchUrl(urlPath) {
  const res = await fetch(`${ORIGIN}/${urlPath.replace(/^\//, '')}`, {
    dispatcher,
    signal: AbortSignal.timeout(45_000),
  })
  if (!res.ok) throw new Error(`${urlPath} HTTP ${res.status}`)
  return res.text()
}

function parseListArticles(html, categoryTitle) {
  const $ = cheerio.load(html)
  const map = new Map()
  $('article.m-article-item').each(function () {
    const item = $(this)
    const link = item.find('a.m-article-item-ttl__link').first()
    const href = link.attr('href') || item.find('a.m-article-item__link').attr('href') || ''
    const m = href.match(/\/articles\/-\/(\d+)/)
    if (!m) return
    const id = m[1]
    const title = link.text().replace(/\s+/g, ' ').trim()
    const img = item.find('img.m-article-item__img').first()
    const image = img.attr('src') || ''
    const datetime = item.find('time').attr('datetime') || ''
    const timeLabel = item.find('time').text().replace(/\s+/g, ' ').trim()
    map.set(id, { id, title, image, datetime, timeLabel, category: categoryTitle })
  })
  return map
}

async function collectCatalog() {
  const catalog = new Map()
  for (const cat of CATEGORIES) {
    for (let page = 1; page <= cat.pages; page++) {
      const suffix = page === 1 ? '' : `?page=${page}`
      const urlPath = `${cat.path}${suffix}`
      try {
        const html = await fetchUrl(urlPath)
        const items = parseListArticles(html, cat.title)
        for (const [id, meta] of items) {
          if (!catalog.has(id)) catalog.set(id, meta)
        }
        if (page === 1) {
          const outDir = path.join(root, ...cat.path.split('/'))
          fs.mkdirSync(outDir, { recursive: true })
          const processed = processFastHtml(html, {
            pageKind: 'list',
            assetPrefix: '../../../',
          })
          fs.writeFileSync(path.join(outDir, 'index.html'), processed, 'utf8')
          console.log(`Wrote ${cat.path}/index.html`)
        }
      } catch (err) {
        console.warn(`Skip ${urlPath}: ${err.message}`)
      }
    }
  }
  return catalog
}

function patchIndexNav() {
  let html = fs.readFileSync(indexPath, 'utf8')
  const replacements = [
    [/href="https:\/\/english\.kyodonews\.net\/list\/news"/g, 'href="./list/news/"'],
    [/href="https:\/\/english\.kyodonews\.net\/list\/news\/japan"/g, 'href="./list/news/japan/"'],
    [
      /href="https:\/\/english\.kyodonews\.net\/list\/partners\/spotlightjapan"/g,
      'href="./list/partners/spotlightjapan/"',
    ],
    [
      /href="https:\/\/english\.kyodonews\.net\/list\/news\/travel-tourism"/g,
      'href="./list/news/travel-tourism/"',
    ],
    [/href="https:\/\/english\.kyodonews\.net\/list\/news\/world"/g, 'href="./list/news/world/"'],
    [
      /href="https:\/\/english\.kyodonews\.net\/list\/news\/\tasian-games"/g,
      'href="./list/news/asian-games/"',
    ],
    [/href="https:\/\/english\.kyodonews\.net\/list\/news\/sumo"/g, 'href="./list/news/sumo/"'],
    [/href="https:\/\/english\.kyodonews\.net\/list\/news\/feature"/g, 'href="./list/news/feature/"'],
    [/href="https:\/\/english\.kyodonews\.net\/list\/news\/arts"/g, 'href="./list/news/arts/"'],
    [/href="https:\/\/english\.kyodonews\.net\/list\/news\/podcast"/g, 'href="./list/news/podcast/"'],
  ]
  for (const [re, to] of replacements) html = html.replace(re, to)
  fs.writeFileSync(indexPath, html, 'utf8')
}

async function ensureArticle(id, meta, homepageIds) {
  const outPath = path.join(articleOutDir(root, id), 'index.html')
  if (homepageIds.has(id) && fs.existsSync(outPath)) return 'home-skip'

  const rawPath = path.join(rawDir, `${id}.html`)
  if (fs.existsSync(rawPath)) {
    writePageFile(articleOutDir(root, id), buildFastArticlePage(fs.readFileSync(rawPath, 'utf8')))
    return 'raw'
  }

  const synthetic = buildSyntheticArticleHtml(meta)
  writePageFile(
    articleOutDir(root, id),
    processFastHtml(synthetic, { pageKind: 'article', assetPrefix: '../../../' }),
  )
  return 'synthetic'
}

async function main() {
  const t0 = Date.now()
  const homepageIds = new Set(extractArticleIds(fs.readFileSync(sourcePath, 'utf8')))
  console.log(`Homepage articles (kept as-is): ${homepageIds.size}`)

  console.log('Fetching category listings…')
  const catalog = await collectCatalog()
  console.log(`Catalog: ${catalog.size} unique stories across categories`)

  const extraIds = [...catalog.keys()]
  await fetchArticlesToDisk(extraIds, { concurrency: 24 })

  let raw = 0
  let synthetic = 0
  let skipped = 0
  await runPool(extraIds, 12, async (id) => {
    const result = await ensureArticle(id, catalog.get(id), homepageIds)
    if (result === 'home-skip') skipped++
    else if (result === 'raw') raw++
    else synthetic++
  })

  patchIndexNav()
  console.log(
    `Articles: ${raw} from Kyodo HTML, ${synthetic} completed with listing images, ${skipped} homepage kept`,
  )
  console.log(`Expand finished in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
