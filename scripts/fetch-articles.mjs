import fs from 'node:fs'
import path from 'node:path'
import { Agent, fetch } from 'undici'
import { fileURLToPath } from 'node:url'
import { extractArticleIds, ORIGIN } from './process-page.mjs'
import { runPool } from './translate.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const sourcePath = path.join(root, '_source.html')
const rawDir = path.join(root, '_articles', 'raw')

/** Reused keep-alive pool — big win vs one connection per request. */
const dispatcher = new Agent({
  connections: 64,
  pipelining: 1,
  keepAliveTimeout: 60_000,
  keepAliveMaxTimeout: 120_000,
})

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function downloadArticleHtml(id, attempt = 0) {
  try {
    const res = await fetch(`${ORIGIN}/articles/-/${id}`, {
      dispatcher,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArkKyotoNewsBuild/1.0)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(45_000),
    })
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await sleep(350 * (attempt + 1))
      return downloadArticleHtml(id, attempt + 1)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.text()
  } catch (err) {
    if (attempt < 4) {
      await sleep(350 * (attempt + 1))
      return downloadArticleHtml(id, attempt + 1)
    }
    throw err
  }
}

export async function fetchArticlesToDisk(ids, { concurrency = 24, force = false } = {}) {
  fs.mkdirSync(rawDir, { recursive: true })
  const todo = force
    ? ids
    : ids.filter((id) => !fs.existsSync(path.join(rawDir, `${id}.html`)))

  if (!todo.length) {
    console.log('All article HTML already cached in _articles/raw/')
    return { fetched: 0, skipped: ids.length, ms: 0 }
  }

  const t0 = Date.now()
  let fetched = 0
  const failedIds = []

  console.log(`Fetching ${todo.length} pages (${concurrency} parallel)…`)

  await runPool(todo, concurrency, async (id) => {
    const out = path.join(rawDir, `${id}.html`)
    try {
      const html = await downloadArticleHtml(id)
      fs.writeFileSync(out, html, 'utf8')
      fetched++
    } catch (err) {
      failedIds.push(id)
      console.error(`\nFailed ${id}: ${err.message}`)
    }
  })

  if (failedIds.length) {
    console.log(`Retrying ${failedIds.length} failed downloads (8 at a time)…`)
    const retry = [...failedIds]
    failedIds.length = 0
    await runPool(retry, 8, async (id) => {
      const out = path.join(rawDir, `${id}.html`)
      try {
        const html = await downloadArticleHtml(id)
        fs.writeFileSync(out, html, 'utf8')
        fetched++
      } catch (err) {
        failedIds.push(id)
        console.error(`\nStill failed ${id}: ${err.message}`)
      }
    })
  }

  const ms = Date.now() - t0
  console.log(
    `Fetch done in ${(ms / 1000).toFixed(1)}s — saved ${fetched}, failed ${failedIds.length}, skipped ${ids.length - todo.length}`,
  )
  return { fetched, failed: failedIds.length, skipped: ids.length - todo.length, ms }
}

async function main() {
  const force = process.argv.includes('--force')
  const sourceHtml = fs.readFileSync(sourcePath, 'utf8')
  const ids = [...new Set(extractArticleIds(sourceHtml))]
  await fetchArticlesToDisk(ids, { concurrency: 24, force })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
