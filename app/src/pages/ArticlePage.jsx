import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useArticle, useArticles } from '../hooks/useArticles.js'
import { StoryRow } from '../components/StoryRow.jsx'
import { formatDate } from '../utils/formatDate.js'
import { articlePath, resolveArticleId } from '../utils/articleUrl.js'

export function ArticlePage() {
  const { slug, id: legacyId } = useParams()
  const param = legacyId ?? slug
  const articleId = resolveArticleId(param)
  const navigate = useNavigate()
  const { t, isEn } = useLanguage()
  const { article, loading } = useArticle(articleId)
  const { articles } = useArticles()

  useEffect(() => {
    if (!article || legacyId != null) return
    if (param === article.id && article.slug) {
      navigate(articlePath(article), { replace: true })
    }
  }, [article, param, legacyId, navigate])

  if (loading) {
    return (
      <main className="jn-main jn-wrap">
        <p>{t('読み込み中…', 'Loading…')}</p>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="jn-main jn-wrap">
        <p>{t('記事が見つかりません。', 'Article not found.')}</p>
        <Link to="/">{t('トップへ', 'Back to home')}</Link>
      </main>
    )
  }

  const body = isEn ? article.bodyEn : article.bodyJa
  const related = articles.filter((a) => a.id !== articleId).slice(0, 5)

  return (
    <main className="jn-main">
      <article className="jn-article jn-wrap">
        <nav className="jn-breadcrumb">
          <Link to="/">{t('トップ', 'Home')}</Link>
          <span aria-hidden="true"> / </span>
          <span>{t(article.titleJa, article.titleEn).slice(0, 40)}…</span>
        </nav>
        <h1 className="jn-article__title">{t(article.titleJa, article.titleEn)}</h1>
        <p className="jn-article__meta">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, isEn)}</time>
          · ARK KYOTO NEWS
        </p>
        {article.image ? (
          <figure className="jn-article__figure">
            <img src={article.image} alt="" />
          </figure>
        ) : null}
        <div className="jn-article__body">
          {body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>

      <aside className="jn-wrap jn-article-related">
        <h2>{t('関連記事', 'More stories')}</h2>
        {related.map((a) => (
          <StoryRow key={a.id} article={a} compact />
        ))}
      </aside>
    </main>
  )
}
