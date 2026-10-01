import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { formatDate } from '../utils/formatDate.js'

export function StoryRow({ article, compact }) {
  const { t } = useLanguage()
  if (!article) return null
  const title = t(article.titleJa, article.titleEn)
  return (
    <article className={compact ? 'jn-row jn-row--compact' : 'jn-row'}>
      {article.image ? (
        <Link to={`/articles/${article.id}`} className="jn-row__media">
          <img src={article.image} alt="" loading="lazy" />
        </Link>
      ) : null}
      <div className="jn-row__body">
        <h3 className="jn-row__title">
          <Link to={`/articles/${article.id}`}>{title}</Link>
        </h3>
        <p className="jn-row__meta">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, t)}</time>
        </p>
      </div>
    </article>
  )
}
