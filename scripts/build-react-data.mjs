import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import { normalizeArticleSlug, slugifyTitle } from './slugify-title.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const articlesRoot = path.join(root, 'articles', '-')
const outDir = path.join(root, 'app', 'public', 'data')
const publicAssets = path.join(root, 'app', 'public', 'assets')

function normalizeImage(src) {
  if (!src) return ''
  if (src.startsWith('http')) return src
  return src
    .replace(/^(\.\.\/)+assets\//, '/assets/')
    .replace(/^\.\/assets\//, '/assets/')
    .replace(/^assets\//, '/assets/')
}

function parseArticle(id, html) {
  const $ = cheerio.load(html, { decodeEntities: false })
  const titleJa = $('.article-ttl').first().text().trim()
  const titleEn = $('.article-ttl').first().attr('data-en') || titleJa
  const datetime =
    $('.article-header-info__time').attr('datetime') ||
    $('.article-footer-info__time').attr('datetime') ||
    ''
  const image = normalizeImage(
    $('.article-header-img-main img').attr('src') ||
      $('meta[property="og:image"]').attr('content') ||
      '',
  )
  const categories = []
  $('.article-header-cate__link').each((_, el) => {
    const href = $(el).attr('href') || ''
    const m = href.match(/list\/news\/([^/]+)/)
    if (m) categories.push(m[1])
    else if (href.includes('/list/news/')) categories.push('latest')
  })

  const bodyJa = []
  const bodyEn = []
  $('.article-body__inner p').each((_, el) => {
    const ja = $(el).text().trim()
    const en = $(el).attr('data-en') || ja
    if (ja) bodyJa.push(ja)
    if (en) bodyEn.push(en)
  })

  const slugOverride = $('meta[name="article-slug"]').attr('content')
  const slug = slugOverride
    ? normalizeArticleSlug(slugOverride, id)
    : slugifyTitle(titleEn, id)

  return {
    id,
    slug,
    titleJa,
    titleEn,
    publishedAt: datetime.length === 16 ? `${datetime}:00+09:00` : datetime,
    image,
    categories: categories.length ? categories : ['latest'],
    excerptJa: bodyJa[0]?.slice(0, 220) || titleJa,
    excerptEn: bodyEn[0]?.slice(0, 220) || titleEn,
    bodyJa,
    bodyEn,
  }
}

const articles = []
if (fs.existsSync(articlesRoot)) {
  for (const ent of fs.readdirSync(articlesRoot, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue
    const id = ent.name
    const file = path.join(articlesRoot, id, 'index.html')
    if (!fs.existsSync(file)) continue
    try {
      articles.push(parseArticle(id, fs.readFileSync(file, 'utf8')))
    } catch (e) {
      console.warn(`Skip ${id}:`, e.message)
    }
  }
}

articles.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(
  path.join(outDir, 'articles.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), articles }, null, 0),
  'utf8',
)

fs.mkdirSync(publicAssets, { recursive: true })
const srcArticlesAssets = path.join(root, 'assets', 'articles')
const destArticlesAssets = path.join(publicAssets, 'articles')
if (fs.existsSync(srcArticlesAssets)) {
  fs.mkdirSync(destArticlesAssets, { recursive: true })
  for (const f of fs.readdirSync(srcArticlesAssets)) {
    fs.copyFileSync(path.join(srcArticlesAssets, f), path.join(destArticlesAssets, f))
  }
}
const logoSrc = path.join(root, 'assets', 'logo.svg')
if (fs.existsSync(logoSrc)) {
  fs.copyFileSync(logoSrc, path.join(publicAssets, 'logo.svg'))
}

console.log(`React data: ${articles.length} articles -> app/public/data/articles.json`)
