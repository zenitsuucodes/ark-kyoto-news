import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { stripExternalAnchors } from './process-page.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function detectPageKind(filePath) {
  const norm = filePath.replace(/\\/g, '/')
  if (norm.includes('/articles/-/')) return 'article'
  if (norm.includes('/list/')) return 'list'
  return 'index'
}

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
  stripExternalAnchors($, detectPageKind(file))
  fs.writeFileSync(file, $.html(), 'utf8')
}

console.log(`Stripped external links on ${files.length} pages`)
