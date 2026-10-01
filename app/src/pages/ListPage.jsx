import { useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useArticles } from '../hooks/useArticles.js'
import { StoryRow } from '../components/StoryRow.jsx'

const LABELS = {
  latest: { ja: '最新', en: 'Latest' },
  japan: { ja: '日本', en: 'Japan' },
  world: { ja: '国際', en: 'World' },
  sports: { ja: 'スポーツ', en: 'Sports' },
  feature: { ja: '特集', en: 'Feature' },
  sumo: { ja: '大相撲', en: 'Sumo' },
  arts: { ja: '文化', en: 'Arts' },
}

export function ListPage() {
  const { slug = 'latest' } = useParams()
  const { t } = useLanguage()
  const { articles, loading } = useArticles()

  const label = LABELS[slug] || { ja: slug, en: slug }
  const filtered =
    slug === 'latest'
      ? articles
      : articles.filter((a) => {
          if (slug === 'sports') {
            return a.categories?.some((c) =>
              ['sports', 'sumo', 'asian-games'].includes(c),
            )
          }
          return a.categories?.includes(slug)
        })

  return (
    <main className="jn-main jn-wrap">
      <h1 className="jn-page-title">{t(label.ja, label.en)}</h1>
      {loading ? (
        <p>{t('読み込み中…', 'Loading…')}</p>
      ) : (
        <div className="jn-list">
          {filtered.map((a) => (
            <StoryRow key={a.id} article={a} />
          ))}
        </div>
      )}
    </main>
  )
}
