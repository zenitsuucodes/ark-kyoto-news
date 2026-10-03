import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const id = '92001'
const img = '../../../assets/articles/chimpanzee-stock.jpg'
const imgHome = './assets/articles/chimpanzee-stock.jpg'

const titleJa =
  '京都市動物園で子どもが飼育エリアに侵入 チンパンジーを緊急射殺'
const titleEn =
  'Child enters chimpanzee enclosure at Kyoto City Zoo; chimpanzee shot dead in emergency'

const leadJa =
  '京都 — 京都市動物園で、幼い子どもがチンパンジーの飼育エリア内に入り込む事故があり、子どもの安全を確保するため、園の緊急対応チームがチンパンジー1頭を射殺した。'
const leadEn =
  'KYOTO — A young child entered a chimpanzee enclosure at Kyoto City Zoo, and the zoo\'s emergency response team shot and killed one chimpanzee to protect the child, the zoo said.'

const paragraphs = [
  [
    'The incident occurred on Saturday afternoon. A 4-year-old boy became separated from his family, somehow crossed a visitor barrier, and entered the outdoor chimpanzee habitat, according to the zoo.',
    '事故が発生したのは土曜日の午後。4歳の男の子が家族とはぐれ、何らかの方法で来園者用の柵を越え、屋外のチンパンジー飼育エリア内に入り込んだという。',
  ],
  [
    'After visitors noticed the child inside the enclosure and alerted staff, the zoo evacuated people from the area and began trying to move the chimpanzees indoors.',
    '子どもが飼育エリア内にいることに気づいた来園者が職員に知らせ、動物園側は周辺から来園者を退避させるとともに、チンパンジーを屋内施設へ戻す対応を開始した。',
  ],
  [
    'Most of the animals followed keepers\' guidance, but one male chimpanzee named Jabari remained outside and approached the child.',
    'ほとんどの個体は職員の誘導に応じたものの、オスのチンパンジー1頭、「ジャバリ（Jabari）」が屋外に残り、子どもに近づいた。',
  ],
  [
    'Keepers repeatedly tried to lure Jabari away from the child and back indoors, but he did not respond to their attempts, the zoo said.',
    '動物園によると、飼育員はジャバリを子どもから離し、屋内へ戻そうと繰り返し試みたが、誘導には応じなかったという。',
  ],
  [
    'With the child still inside the enclosure and Jabari within arm\'s reach, the emergency team concluded the boy\'s life was in imminent danger and decided to shoot Jabari.',
    '子どもが依然として飼育エリア内におり、ジャバリがすぐ手の届く距離にいたことから、緊急対応チームは子どもの生命に危険が及ぶ可能性があると判断し、ジャバリを射殺する決断を下した。',
  ],
  [
    'Jabari died at the scene.',
    'ジャバリはその場で死亡した。',
  ],
  [
    'The child was rescued immediately afterward and taken to a city hospital for examination. He suffered minor injuries believed to have occurred when he entered the habitat but is in stable condition, officials said.',
    '子どもはその直後に救助され、検査のため市内の病院に搬送された。飼育エリアに入った際に負ったとみられる軽傷があるものの、容体は安定しているという。',
  ],
  [
    'The zoo said it also considered using a tranquilizer dart but ruled it out because the drug takes time to take full effect and could agitate the chimpanzee.',
    '動物園側は、麻酔銃の使用についても検討したものの、薬が完全に効くまでには時間がかかることに加え、麻酔の影響でチンパンジーが興奮する可能性もあることから、使用を断念したとしている。',
  ],
  [
    'A zoo spokesperson said, "Chimpanzees are extremely powerful animals whose behavior can change within moments. In an emergency threatening a small child, staff had to decide within minutes."',
    '動物園の広報担当者は、「チンパンジーは非常に力の強い動物で、行動が短時間で変化する可能性があります。幼い子どもの安全が脅かされる緊急事態の中で、職員は数分以内に判断を下さなければなりませんでした」と説明した。',
  ],
  [
    'Jabari had lived at the zoo for more than 10 years and was known among keepers as an intelligent, social animal.',
    'ジャバリは10年以上にわたり動物園で飼育され、飼育員からは知能が高く、社会性のある個体として知られていたという。',
  ],
  [
    'The zoo has temporarily closed the chimpanzee habitat and is investigating how the child was able to get inside, including reviewing visitor barriers, safety equipment, and security camera footage.',
    '動物園は現在、チンパンジーの飼育エリアを一時的に閉鎖し、子どもがどのようにして内部へ入ることができたのか詳しく調査している。来園者用の柵や安全設備、防犯カメラの映像などを確認する方針。',
  ],
  [
    'The zoo said it will release additional information as the investigation progresses.',
    '動物園は、調査が進み次第、追加の情報を公表するとしている。',
  ],
]

const template = fs.readFileSync(
  path.join(root, 'articles', '-', '86481', 'index.html'),
  'utf8',
)
const $ = cheerio.load(template, { decodeEntities: false })

$('title').attr('data-en', titleEn).text(titleJa)
$('meta[name="description"]').attr('content', leadJa).attr('data-en-content', leadEn)
$('meta[property="og:title"]').attr('content', titleJa).attr('data-en-content', titleEn)
$('meta[property="og:description"]').attr('content', leadJa).attr('data-en-content', leadEn)
$('meta[property="twitter:title"]').attr('content', titleJa).attr('data-en-content', titleEn)
$('meta[property="twitter:description"]').attr('content', leadJa).attr('data-en-content', leadEn)
$('meta[property="og:image"]').attr('content', img)
$('meta[property="twitter:image"]').attr('content', img)
$('link[rel="canonical"]').attr('href', `../${id}/`)

$('h1.article-ttl').attr('data-en', titleEn).text(titleJa)
$('time.article-header-info__time')
  .attr('datetime', '2026-09-29T13:30')
  .attr('data-en', '- Sep 29, 2026 - 13:30')
  .text('- 2026年9月29日 - 13:30')

const figImg = $('.article-header-img-main img').first()
figImg.attr('src', img).removeAttr('srcset')
$('.article-header-img-main__caption').remove()

$('.article-sns__link.--copy').each(function () {
  $(this).attr('data-title', titleEn)
  $(this).attr('data-url', `#`)
})

const bodyInner = $('.article-body__inner')
bodyInner.empty()
bodyInner.append(`<p data-en="${leadEn.replace(/"/g, '&quot;')}">${leadJa}</p>`)
const wall = $('<div class="paywalled-content" data-nosnippet=""></div>')
for (const [en, ja] of paragraphs) {
  wall.append(`<p data-en="${en.replace(/"/g, '&quot;')}">${ja}</p>`)
}
bodyInner.append(wall)

$('.article-body-bottom').remove()
$('time.article-footer-info__time')
  .attr('datetime', '2026-09-29T13:30')
  .attr('data-en', 'Sep 29, 2026')
  .text('2026年9月29日')

const outDir = path.join(root, 'articles', '-', id)
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'index.html'), $.html(), 'utf8')

function insertLatest(htmlPath, linkPrefix) {
  const html = fs.readFileSync(htmlPath, 'utf8')
  const $p = cheerio.load(html, { decodeEntities: false })
  const block = `<div class="m-article">
    <article class="m-article-item">
      <a class="m-article-item__link" href="${linkPrefix}articles/-/${id}/">
        <img src="${linkPrefix === './' ? imgHome : img}" loading="lazy" width="255" height="130" class="m-article-item__img" alt="${titleJa}" data-en-alt="${titleEn}">
      </a>
      <div class="m-article-item__content">
        <h3 class="m-article-item-ttl">
          <a class="m-article-item-ttl__link" href="${linkPrefix}articles/-/${id}/" data-en="${titleEn}">${titleJa}</a>
        </h3>
        <div class="m-article-info">
          <time class="m-article-info__time" datetime="2026-09-29T13:30:00+09:00" data-en="Sep 29, 2026">2026年9月29日</time>
          <a class="m-article-info__link" href="${linkPrefix}list/partners/kyodo_news/">ARK KYOTO NEWS</a>
        </div>
      </div>
    </article>
  </div>`
  const section = $p('h2.c-heading__ttl.--latest').first().next('section.m-article-wrap')
  section.prepend(block)
  fs.writeFileSync(htmlPath, $p.html(), 'utf8')
}

insertLatest(path.join(root, 'index.html'), './')
insertLatest(path.join(root, 'list', 'news', 'index.html'), '../../../')

console.log(`Created articles/-/${id}/ and added to Latest on homepage and list/news`)
