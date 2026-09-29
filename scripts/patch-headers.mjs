import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { applyHeaderEdits } from './process-page.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function walkIndexHtml(dir, acc) {
  if (!fs.existsSync(dir)) return
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walkIndexHtml(p, acc)
    else if (ent.name === 'index.html') acc.push(p)
  }
}

const files = [path.join(root, 'index.html')]
walkIndexHtml(path.join(root, 'list'), files)
walkIndexHtml(path.join(root, 'articles', '-'), files)

for (const file of files) {
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'), { decodeEntities: false })
  applyHeaderEdits($)
  fs.writeFileSync(file, $.html(), 'utf8')
}
console.log(`Patched header on ${files.length} pages`)
