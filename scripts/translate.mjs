import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cachePath = path.join(__dirname, 'translation-cache.json')

const SKIP_EXACT = new Set([
  'ARK KYOTO NEWS',
  'ENGLISH',
  '简体中文',
  '繁體中文',
  '日本語',
  'Facebook',
  'X',
  'rss',
  'search',
  'language',
  'xml',
])

/** @type {Map<string, Promise<string>>} */
const inflight = new Map()

export function loadCache() {
  if (!fs.existsSync(cachePath)) return {}
  return JSON.parse(fs.readFileSync(cachePath, 'utf8'))
}

export function saveCache(cache) {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8')
}

export function shouldSkipTranslation(text) {
  const t = text.trim()
  if (!t) return true
  if (SKIP_EXACT.has(t)) return true
  if (/^[\d\s©,.]+$/.test(t)) return true
  return false
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function translateChunk(enText, attempt = 0) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ja&dt=t&q=' +
    encodeURIComponent(enText)
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(25000) })
    if (res.status === 429 && attempt < 5) {
      await sleep(400 * (attempt + 1))
      return translateChunk(enText, attempt + 1)
    }
    if (!res.ok) throw new Error(`Translate failed (${res.status})`)
    const data = await res.json()
    return data[0].map((part) => part[0]).join('')
  } catch (err) {
    if (attempt < 5) {
      await sleep(400 * (attempt + 1))
      return translateChunk(enText, attempt + 1)
    }
    throw err
  }
}

async function translateLongText(key) {
  const maxLen = 4500
  if (key.length <= maxLen) return translateChunk(key)

  const parts = []
  let cursor = 0
  while (cursor < key.length) {
    let end = Math.min(cursor + maxLen, key.length)
    if (end < key.length) {
      const slice = key.slice(cursor, end)
      const breakAt = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf(' '))
      if (breakAt > maxLen * 0.5) end = cursor + breakAt + 1
    }
    parts.push(await translateChunk(key.slice(cursor, end)))
    cursor = end
  }
  return parts.join('')
}

async function translateAndStore(key, cache) {
  try {
    const ja = await translateLongText(key)
    cache[key] = ja
    return ja
  } catch {
    cache[key] = key
    return key
  }
}

export async function englishToJapanese(enText, cache) {
  const key = enText.trim()
  if (shouldSkipTranslation(key)) return key
  if (cache[key]) return cache[key]

  let pending = inflight.get(key)
  if (!pending) {
    pending = translateAndStore(key, cache).finally(() => inflight.delete(key))
    inflight.set(key, pending)
  }
  return pending
}

export async function runPool(items, concurrency, worker) {
  if (!items.length) return
  let index = 0
  async function runWorker() {
    while (index < items.length) {
      const i = index++
      await worker(items[i], i)
    }
  }
  const n = Math.min(concurrency, items.length)
  await Promise.all(Array.from({ length: n }, runWorker))
}

/** Translate many unique strings concurrently (cache + in-flight dedupe). */
export async function translateMany(strings, cache, concurrency = 6) {
  const unique = [...new Set(strings.map((s) => s.trim()).filter((s) => !shouldSkipTranslation(s)))]
  const missing = unique.filter((s) => !cache[s])
  if (!missing.length) return

  await runPool(missing, concurrency, async (text) => {
    await englishToJapanese(text, cache)
  })
}
