export function formatDate(iso, isEn) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(isEn ? 'en-US' : 'ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso.slice(0, 10)
  }
}
