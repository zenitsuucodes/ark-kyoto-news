import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="jn-footer">
      <div className="jn-wrap jn-footer__inner">
        <nav className="jn-footer__nav">
          <Link to="/">{t('トップ', 'Home')}</Link>
          <Link to="/category/japan">{t('日本', 'Japan')}</Link>
          <Link to="/category/world">{t('国際', 'World')}</Link>
        </nav>
        <p className="jn-footer__copy">{t('© アーク京都ニュース', '© Ark Kyoto News')}</p>
      </div>
    </footer>
  )
}
