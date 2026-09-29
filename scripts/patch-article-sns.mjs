import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { applyArticleEdits } from './process-page.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function walkIndexHtml(dir, acc) {
  if (!fs.existsSync(dir)) return
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walkIndexHtml(p, acc)
    else if (ent.name === 'index.html') acc.push(p)
  }
}

const files = []
walkIndexHtml(path.join(root, 'articles', '-'), files)

for (const file of files) {
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'), { decodeEntities: false })
  applyArticleEdits($)
  fs.writeFileSync(file, $.html(), 'utf8')
}

console.log(`Removed article share buttons on ${files.length} article pages`)
