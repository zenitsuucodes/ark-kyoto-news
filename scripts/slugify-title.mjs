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
