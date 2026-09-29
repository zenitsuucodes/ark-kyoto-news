import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { loadCache, saveCache, translateMany, runPool } from './translate.mjs'
import {
  gatherTranslatableStrings,
  applyLocalization,
  injectEnglishDisplay,
} from './process-page.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function detectPageKind(filePath) {
  const norm = filePath.replace(/\\/g, '/')
  if (norm.includes('/articles/-/')) return 'article'
  if (norm.includes('/list/')) return 'list'
  return 'index'
}

function assetPrefixFor(filePath) {
  const dir = path.dirname(path.relative(root, filePath))
  if (!dir || dir === '.') return './'
  const depth = dir.split(path.sep).filter(Boolean).length
  return `${'../'.repeat(depth)}`
}

function collectSiteHtmlFiles() {
  const files = [path.join(root, 'index.html')]
  for (const base of ['list', path.join('articles', '-')]) {
    const abs = path.join(root, base)
    if (!fs.existsSync(abs)) continue
    walkIndexHtml(abs, files)
  }
  return files
}

function walkIndexHtml(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walkIndexHtml(p, acc)
    else if (ent.name === 'index.html') acc.push(p)
  }
}

async function main() {
  const t0 = Date.now()
  const cache = loadCache()
  const files = collectSiteHtmlFiles()
  console.log(`Localizing ${files.length} pages (Japanese source → English for visitors)…`)

  const allStrings = new Set()
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8')
    const kind = detectPageKind(file)
    for (const s of gatherTranslatableStrings(html, kind, { preprocess: false })) {
      allStrings.add(s)
    }
  }

  const list = [...allStrings]
  const missing = list.filter((s) => !cache[s.trim()])
  console.log(`Unique strings: ${list.length} (${missing.length} need translation)`)
  if (missing.length) {
    const t1 = Date.now()
    await translateMany(list, cache, 8)
    console.log(`Translation batch done in ${((Date.now() - t1) / 1000).toFixed(1)}s`)
  }

  let done = 0
  await runPool(files, 6, async (file) => {
    const html = fs.readFileSync(file, 'utf8')
    const kind = detectPageKind(file)
    const prefix = assetPrefixFor(file)
    const $ = cheerio.load(html, { decodeEntities: false })
    await applyLocalization($, cache, kind)
    injectEnglishDisplay($, prefix)
    fs.writeFileSync(file, $.html(), 'utf8')
    done++
    if (done % 50 === 0) console.log(`  …${done}/${files.length}`)
  })

  saveCache(cache)
  console.log(
    `Done — ${files.length} pages localized in ${((Date.now() - t0) / 1000).toFixed(1)}s (${Object.keys(cache).length} cache entries)`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
