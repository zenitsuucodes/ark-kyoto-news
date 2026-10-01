/** URL slug: short English title snippet + article id (e.g. child-enters-chimpanzee-enclosure-92001). */
export function slugifyTitle(title, id) {
  let s = (title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (s.length > 72) {
    s = s.slice(0, 72).replace(/-[^-]*$/, '')
  }
  if (!s) s = 'article'
  return `${s}-${id}`
}

export function articlePath(article) {
  const slug = article.slug || slugifyTitle(article.titleEn || article.titleJa, article.id)
  return `/articles/${slug}`
}

export function resolveArticleId(param) {
  if (!param) return null
  if (/^\d+$/.test(param)) return param
  const m = param.match(/-(\d+)$/)
  return m ? m[1] : param
}
