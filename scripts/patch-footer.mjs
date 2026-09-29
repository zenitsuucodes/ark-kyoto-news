import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { applyFooterEdits } from './process-page.mjs'

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

const contactJa = 'お問い合わせ'
const advertiseJa = '広告掲載について'

for (const file of files) {
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'), { decodeEntities: false })
  applyFooterEdits($)
  $('.g-footer-nav__link[data-en="Contact"]').text(contactJa)
  $('.g-footer-nav__link[data-en="Advertise With Us"]').text(advertiseJa)
  fs.writeFileSync(file, $.html(), 'utf8')
}

console.log(`Patched footer on ${files.length} pages`)
