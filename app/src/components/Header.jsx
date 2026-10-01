import { Link, NavLink } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'

const NAV = [
  { slug: 'latest', ja: '最新', en: 'Latest', path: '/' },
  { slug: 'japan', ja: '日本', en: 'Japan', path: '/category/japan' },
  { slug: 'world', ja: '国際', en: 'World', path: '/category/world' },
  { slug: 'sports', ja: 'スポーツ', en: 'Sports', path: '/category/sports' },
  { slug: 'feature', ja: '特集', en: 'Feature', path: '/category/feature' },
]

export function Header() {
  const { t, toggle, isEn } = useLanguage()
  const today = new Date().toLocaleDateString(isEn ? 'en-US' : 'ja-JP', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="jn-header">
      <div className="jn-header__utility">
        <div className="jn-wrap jn-header__utility-inner">
          <time dateTime={new Date().toISOString()}>{today}</time>
          <button type="button" className="jn-lang" onClick={toggle}>
            {isEn ? '日本語' : 'English'}
          </button>
        </div>
      </div>
      <div className="jn-header__brand">
        <div className="jn-wrap">
        <Link to="/" className="jn-logo">
          <img
            src="/assets/logo-ark.png"
            alt="ARK NEWS KYOTO"
            className="jn-logo__image"
          />
        </Link>
        </div>
      </div>
      <nav className="jn-nav" aria-label="Primary">
        <div className="jn-wrap jn-nav__inner">
          {NAV.map((item) => (
            <NavLink
              key={item.slug}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => (isActive ? 'jn-nav__link is-active' : 'jn-nav__link')}
            >
              {t(item.ja, item.en)}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
