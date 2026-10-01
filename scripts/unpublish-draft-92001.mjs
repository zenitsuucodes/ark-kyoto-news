import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const id = '92001'
const imgFile = 'chimpanzee-stock.jpg'

const liveDir = path.join(root, 'articles', '-', id)
const draftDir = path.join(root, '_drafts', 'articles', '-', id)
const liveHtmlPath = path.join(liveDir, 'index.html')

if (!fs.existsSync(liveHtmlPath)) {
  console.error(`No published article at articles/-/${id}/`)
  process.exit(1)
}

let html = fs.readFileSync(liveHtmlPath, 'utf8')
html = html
  .replaceAll(`../../../assets/articles/${imgFile}`, `./${imgFile}`)
  .replaceAll('../../../', '../../../../')

fs.mkdirSync(draftDir, { recursive: true })
fs.writeFileSync(path.join(draftDir, 'index.html'), html, 'utf8')

const liveImg = path.join(root, 'assets', 'articles', imgFile)
const draftImg = path.join(draftDir, imgFile)
if (fs.existsSync(liveImg)) {
  fs.copyFileSync(liveImg, draftImg)
  fs.unlinkSync(liveImg)
}

const draftMetaPath = path.join(draftDir, 'draft.json')
let meta = {}
if (fs.existsSync(draftMetaPath)) {
  meta = JSON.parse(fs.readFileSync(draftMetaPath, 'utf8'))
}
meta.id = id
meta.status = 'draft'
meta.unpublishedAt = new Date().toISOString()
fs.writeFileSync(draftMetaPath, JSON.stringify(meta, null, 2) + '\n', 'utf8')

fs.rmSync(liveDir, { recursive: true, force: true })

const topNews86477 = `<a class="top-news-main__cover" href="./articles/-/86477/">
        <img src="https://english-kyodo.ismcdn.jp/mwimgs/f/e/635m/img_fee0e3ae6c89c22cf89edb4f944c2728858250.jpg" loading="eager" srcset="https://english-kyodo.ismcdn.jp/mwimgs/f/e/635m/img_fee0e3ae6c89c22cf89edb4f944c2728858250.jpg 1x,https://english-kyodo.ismcdn.jp/mwimgs/f/e/1270m/img_fee0e3ae6c89c22cf89edb4f944c2728858250.jpg 2x" width="635" height="370" class="top-news-main__img" alt="大相撲：大野里が青錦を圧倒して初優勝" data-en-alt="Sumo: Onosato overwhelms Aonishiki to capture 1st title in year">
      </a>
      <div class="top-news-main__content">
        <a class="top-news-main__link" href="./articles/-/86477/" data-en="Sumo: Onosato overwhelms Aonishiki to capture 1st title in year">大相撲：大野里が青錦を圧倒して初優勝</a>
        <div class="top-news-main__text" data-en="Yokozuna Onosato defeated title rival ozeki Aonishiki in an emphatic fashion to capture his first title in a year at the Autumn Grand Sumo Tournament on Sunday.Having thrown away his two-win lead with successive losses through Saturday, Onosato (12-3) was back to his best against Ukrainian star Aonishiki (11-4) in the final bout of the 15-day meet at Tokyo's Ryogoku Kokugikan.Aonishiki got his left hand on the grand champion's belt straight away and looked to take control, but failed to hold on to it and backed off as Onosato produced a powerful push to the ozeki's throat.Onosato, troubled by left shoulder pain since dislocating it last November, followed up with another inescapable push to Aonishiki's throat to finish the fascinating matchup in seconds with a lopsided thrust out.&quot;I just …">横綱大野里は日曜日の大相撲秋場所で、タイトルのライバルである大関青錦を力強い形で破り、1年ぶりのタイトルを獲得した。土曜日まで連敗して2勝リードを捨てていたが、大野里（12勝3敗）は、東京の両国国技館で行われた15日間の大会の最終取組で、ウクライナのスター青錦（11勝4敗）に対して本調子を取り戻した。青錦は大相撲で左手を手にした。すぐにチャンピオンのベルトを奪い、主導権を握るかに見えたが、大関の喉元に力強い押し込みをした大野里がそれを掴みきれず後ずさりした。昨年11月に左肩を脱臼して以来左肩の痛みに悩まされていた大野里は、続いて青錦の喉元への避けられない押し込みを決め、偏った突き出しで数秒で魅力的な試合を終わらせた。「私はただ…</div>
      </div>`

function stripFromList($, href) {
  $(`a[href="${href}"]`).closest('.m-article').remove()
}

const indexPath = path.join(root, 'index.html')
const $index = cheerio.load(fs.readFileSync(indexPath, 'utf8'), { decodeEntities: false })
stripFromList($index, `./articles/-/${id}/`)
$index('.top-news-main').html(topNews86477)
fs.writeFileSync(indexPath, $index.html(), 'utf8')

const listPath = path.join(root, 'list', 'news', 'index.html')
const $list = cheerio.load(fs.readFileSync(listPath, 'utf8'), { decodeEntities: false })
stripFromList($list, `../../../articles/-/${id}/`)
fs.writeFileSync(listPath, $list.html(), 'utf8')

const readmePath = path.join(root, '_drafts', 'README.md')
fs.writeFileSync(
  readmePath,
  `# Draft articles

Unpublished stories live here (not linked from the site).

- \`articles/-/${id}/\` — Kyoto City Zoo / hippo Luna emergency story

Each draft folder contains \`index.html\`, optional assets, and \`draft.json\` metadata.
`,
  'utf8',
)

console.log(`Unpublished articles/-/${id}/ → _drafts/articles/-/${id}/ (draft)`)
