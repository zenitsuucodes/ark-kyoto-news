import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'ja'
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      isEn: lang === 'en',
      toggle: () => setLang((l) => (l === 'ja' ? 'en' : 'ja')),
      /** Show English by default; Japanese originals passed as first arg are kept in data only. */
      t: (ja, en) => (lang === 'en' ? en || ja : ja),
    }),
    [lang],
  )
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage outside provider')
  return ctx
}
