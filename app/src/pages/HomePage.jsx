import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useArticles } from '../hooks/useArticles.js'
import { StoryRow } from '../components/StoryRow.jsx'
import { formatDate } from '../utils/formatDate.js'

function byCategory(articles, slug) {
  if (slug === 'latest') return articles
  return articles.filter((a) => a.categories?.includes(slug))
}

export function HomePage() {
  const { t, isEn } = useLanguage()
  const { articles, loading } = useArticles()

  if (loading) {
    return (
      <main className="jn-main jn-wrap">
        <p className="jn-loading">{t('読み込み中…', 'Loading…')}</p>
      </main>
    )
  }

  const featured = articles[0]
  const topStories = articles.slice(1, 6)
  const latest = articles.slice(0, 12)
  const japan = byCategory(articles, 'japan').slice(0, 5)
  const world = byCategory(articles, 'world').slice(0, 5)

  return (
    <main className="jn-main">
      <section className="jn-feature jn-wrap">
        {featured ? (
          <div className="jn-feature__grid">
            <div className="jn-feature__lead">
              <span className="jn-label">{t('トップニュース', 'Top News')}</span>
              <h1 className="jn-feature__title">
                <Link to={`/articles/${featured.id}`}>
                  {t(featured.titleJa, featured.titleEn)}
                </Link>
              </h1>
              <p className="jn-feature__excerpt">
                {t(featured.excerptJa, featured.excerptEn)}
              </p>
              <p className="jn-feature__meta">
                <time dateTime={featured.publishedAt}>
                  {formatDate(featured.publishedAt, isEn)}
                </time>
                · ARK KYOTO NEWS
              </p>
            </div>
            {featured.image ? (
              <Link to={`/articles/${featured.id}`} className="jn-feature__media">
                <img src={featured.image} alt="" />
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="jn-home-columns jn-wrap">
        <div className="jn-home-columns__primary">
          <section className="jn-section">
            <h2 className="jn-section__title">{t('最新記事', 'Latest')}</h2>
            <div className="jn-card-grid">
              {latest.map((a) => (
                <article key={a.id} className="jn-card">
                  {a.image ? (
                    <Link to={`/articles/${a.id}`} className="jn-card__media">
                      <img src={a.image} alt="" loading="lazy" />
                    </Link>
                  ) : null}
                  <h3 className="jn-card__title">
                    <Link to={`/articles/${a.id}`}>{t(a.titleJa, a.titleEn)}</Link>
                  </h3>
                  <time dateTime={a.publishedAt}>{formatDate(a.publishedAt, isEn)}</time>
                </article>
              ))}
            </div>
          </section>

          <section className="jn-section jn-section--columns">
            <div className="jn-section__col">
              <h2 className="jn-section__title">{t('日本', 'Japan')}</h2>
              {japan.map((a) => (
                <StoryRow key={a.id} article={a} compact />
              ))}
            </div>
            <div className="jn-section__col">
              <h2 className="jn-section__title">{t('国際', 'World')}</h2>
              {world.map((a) => (
                <StoryRow key={a.id} article={a} compact />
              ))}
            </div>
          </section>
        </div>

        <aside className="jn-sidebar">
          <h2 className="jn-sidebar__title">{t('注目', 'Highlights')}</h2>
          <div className="jn-sidebar__list">
            {topStories.map((a) => (
              <StoryRow key={a.id} article={a} compact />
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
