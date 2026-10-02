import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const id = '92001'
const draftDir = path.join(root, '_drafts', 'articles', '-', id)
const metaPath = path.join(draftDir, 'draft.json')

const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
const pub = meta.publishedAt?.slice(0, 16) ?? '2026-10-02T15:00'
const pubIso = pub.includes('+') ? meta.publishedAt : `${pub}:00+09:00`
const pubJaDate = pubIso.slice(0, 10).replace(/-/g, '年').replace(/年(\d+)年/, '年$1月').replace(/月(\d+)$/, '月$1日')
// 2026-10-01 -> 2026年10月1日
const [y, m, d] = pubIso.slice(0, 10).split('-')
const pubJa = `${y}年${Number(m)}月${Number(d)}日`
const pubEn = new Date(pubIso).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'Asia/Tokyo',
})
const pubTimeJa = `${pubJa} - ${pub.slice(11, 16) || '15:00'}`
const pubTimeEn = `- ${pubEn} - ${pub.slice(11, 16) || '15:00'}`

const titleJa =
  meta.titleJa ??
  '京都市動物園で子どもが飼育エリアに侵入 チンパンジーを緊急射殺'
const titleEn =
  meta.titleEn ??
  'Child enters chimpanzee enclosure at Kyoto City Zoo; chimpanzee shot dead in emergency'
const imgFile = meta.image ?? 'chimpanzee-stock.jpg'

let html = fs.readFileSync(path.join(draftDir, 'index.html'), 'utf8')
const imgAsset = `../../../assets/articles/${imgFile}`
html = html
  .replaceAll('../../../../', '../../../')
  .replaceAll(`./${imgFile}`, '__ARTICLE_IMG__')
  .replaceAll('__ARTICLE_IMG__', imgAsset)

html = html.replace(/datetime="[^"]*"/g, (match) => {
  if (match.includes('article-header-info') || match.includes('article-footer-info')) {
    return `datetime="${pub.slice(0, 16)}"`
  }
  return match
})
html = html.replace(
  /<time class="article-header-info__time"[^>]*>[^<]*<\/time>/,
  `<time class="article-header-info__time" datetime="${pub.slice(0, 16)}" data-en="${pubTimeEn}">- ${pubTimeJa}</time>`,
)
html = html.replace(
  /<time class="article-footer-info__time"[^>]*>[^<]*<\/time>/,
  `<time class="article-footer-info__time" datetime="${pub.slice(0, 16)}" data-en="${pubEn}">${pubJa}</time>`,
)

const outDir = path.join(root, 'articles', '-', id)
fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(path.join(root, 'assets', 'articles'), { recursive: true })
fs.copyFileSync(path.join(draftDir, imgFile), path.join(root, 'assets', 'articles', imgFile))
fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8')

fs.writeFileSync(
  metaPath,
  JSON.stringify({ ...meta, status: 'published', publishedAt: pubIso }, null, 2) + '\n',
  'utf8',
)

const teaserEn = `KYOTO — A young child entered a chimpanzee enclosure at Kyoto City Zoo, and the zoo's emergency response team shot and killed one chimpanzee to protect the child, the zoo said. The incident occurred on Saturday afternoon when a 4-year-old boy became separated from his family and entered the outdoor habitat. Most chimpanzees followed keepers indoors, but one male named Genku remained and approached the boy…`
const teaserJa = `京都 — 京都市動物園で、幼い子どもがチンパンジーの飼育エリア内に入り込む事故があり、子どもの安全を確保するため、園の緊急対応チームがチンパンジー1頭を射殺した。事故が発生したのは土曜日の午後。4歳の男の子が家族とはぐれ、屋外の飼育エリア内に入り込んだ。ほとんどの個体は職員の誘導に応じたが、「玄空（Genku）」が屋外に残り子どもに近づいた…`

function setTopNews($) {
  $('.top-news-main').html(`<a class="top-news-main__cover" href="./articles/-/${id}/">
        <img src="./assets/articles/${imgFile}" loading="eager" width="635" height="357" class="top-news-main__img" alt="${titleJa}" data-en-alt="${titleEn}">
      </a>
      <div class="top-news-main__content">
        <a class="top-news-main__link" href="./articles/-/${id}/" data-en="${titleEn}">${titleJa}</a>
        <div class="top-news-main__text" data-en="${teaserEn.replace(/"/g, '&quot;')}">${teaserJa}</div>
      </div>`)
}

function prependLatest($, linkPrefix) {
  const imgPrefix = linkPrefix === './' ? './' : '../../../'
  const block = `<div class="m-article">
    <article class="m-article-item">
      <a class="m-article-item__link" href="${linkPrefix}articles/-/${id}/">
        <img src="${imgPrefix}assets/articles/${imgFile}" loading="lazy" width="255" height="130" class="m-article-item__img" alt="${titleJa}" data-en-alt="${titleEn}">
      </a>
      <div class="m-article-item__content">
        <h3 class="m-article-item-ttl">
          <a class="m-article-item-ttl__link" href="${linkPrefix}articles/-/${id}/" data-en="${titleEn}">${titleJa}</a>
        </h3>
        <div class="m-article-info">
          <time class="m-article-info__time" datetime="${pubIso}" data-en="${pubEn}">${pubJa}</time>
          <a class="m-article-info__link" href="${linkPrefix}list/partners/kyodo_news/">ARK KYOTO NEWS</a>
        </div>
      </div>
    </article>
  </div>`
  $('h2.c-heading__ttl.--latest').first().next('section.m-article-wrap').prepend(block)
}

const indexPath = path.join(root, 'index.html')
const $index = cheerio.load(fs.readFileSync(indexPath, 'utf8'), { decodeEntities: false })
$index(`a[href="./articles/-/${id}/"]`).closest('.m-article').remove()
setTopNews($index)
prependLatest($index, './')
fs.writeFileSync(indexPath, $index.html(), 'utf8')

const listPath = path.join(root, 'list', 'news', 'index.html')
const $list = cheerio.load(fs.readFileSync(listPath, 'utf8'), { decodeEntities: false })
$list(`a[href="../../../articles/-/${id}/"]`).closest('.m-article').remove()
prependLatest($list, '../../../')
fs.writeFileSync(listPath, $list.html(), 'utf8')

console.log(`Published articles/-/${id}/ (${titleEn}), date ${pubIso}`)
