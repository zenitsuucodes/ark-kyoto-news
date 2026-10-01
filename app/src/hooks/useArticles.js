import { useEffect, useState } from 'react'

let cache = null

export function useArticles() {
  const [articles, setArticles] = useState(cache?.articles ?? [])
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    fetch('/data/articles.json')
      .then((r) => r.json())
      .then((data) => {
        cache = data
        setArticles(data.articles || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { articles, loading }
}

export function useArticle(id) {
  const { articles, loading } = useArticles()
  const article = articles.find((a) => a.id === id)
  return { article, loading }
}
