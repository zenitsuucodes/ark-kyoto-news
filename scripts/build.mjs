import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCache, saveCache, runPool, translateMany } from './translate.mjs'
import { fetchArticlesToDisk } from './fetch-articles.mjs'
import {
  extractArticleIds,
  articleOutDir,
  writePageFile,
  processHtmlToPage,
  gatherTranslatableStrings,
} from './process-page.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const sourcePath = path.join(root, '_source.html')
const indexPath = path.join(root, 'index.html')
const rawDir = path.join(root, '_articles', 'raw')

const FETCH_CONCURRENCY = 24
const BUILD_CONCURRENCY = 8
const force = process.argv.includes('--force')
const fetchOnly = process.argv.includes('--fetch-only')

function isUpToDate(rawPath, outPath) {
  if (force || !fs.existsSync(outPath) || !fs.existsSync(rawPath)) return false
  return fs.statSync(outPath).mtimeMs >= fs.statSync(rawPath).mtimeMs
}

async function buildArticle(id, cache) {
  const rawPath = path.join(rawDir, `${id}.html`)
  const outPath = path.join(articleOutDir(root, id), 'index.html')
  if (isUpToDate(rawPath, outPath)) {
    return { id, skipped: true }
  }

  const rawHtml = fs.readFileSync(rawPath, 'utf8')
  const pageHtml = await processHtmlToPage(rawHtml, {
    pageKind: 'article',
    assetPrefix: '../../../',
    canonicalHref: './',
    cache,
  })
  writePageFile(articleOutDir(root, id), pageHtml)
  return { id, skipped: false }
}

async function prewarmTranslationCache(sourceHtml, articleIds, cache) {
  const all = new Set()
  for (const s of gatherTranslatableStrings(sourceHtml, 'index')) all.add(s)
  for (const id of articleIds) {
    const rawPath = path.join(rawDir, `${id}.html`)
    if (!fs.existsSync(rawPath)) continue
    const rawHtml = fs.readFileSync(rawPath, 'utf8')
    for (const s of gatherTranslatableStrings(rawHtml, 'article')) all.add(s)
  }
  const list = [...all]
  const missing = list.filter((s) => !cache[s.trim()])
  if (!missing.length) return
  console.log(`Pre-translating ${missing.length} unique strings (cache hits: ${list.length - missing.length})…`)
  const t0 = Date.now()
  await translateMany(list, cache, 6)
  console.log(`Translations ready in ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

async function main() {
  const t0 = Date.now()
  const sourceHtml = fs.readFileSync(sourcePath, 'utf8')
  const articleIds = [...new Set(extractArticleIds(sourceHtml))]
  const cache = loadCache()

  console.log(`Articles on homepage: ${articleIds.length}`)

  await fetchArticlesToDisk(articleIds, { concurrency: FETCH_CONCURRENCY, force })

  if (fetchOnly) {
    console.log('Fetch-only mode (--fetch-only). Skipping HTML build.')
    return
  }

  await prewarmTranslationCache(sourceHtml, articleIds, cache)

  const indexHtml = await processHtmlToPage(sourceHtml, {
    pageKind: 'index',
    assetPrefix: './',
    canonicalHref: './index.html',
    cache,
  })
  fs.writeFileSync(indexPath, indexHtml, 'utf8')
  console.log('Wrote index.html')

  let built = 0
  let skipped = 0
  await runPool(articleIds, BUILD_CONCURRENCY, async (id) => {
    const result = await buildArticle(id, cache)
    if (result.skipped) skipped++
    else built++
  })

  saveCache(cache)
  const sec = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(
    `Done in ${sec}s — built ${built} articles, skipped ${skipped}, ${Object.keys(cache).length} translation entries`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
