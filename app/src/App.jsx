import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ListPage } from './pages/ListPage.jsx'
import { ArticlePage } from './pages/ArticlePage.jsx'

export default function App() {
  return (
    <div className="jn-app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<ListPage />} />
        <Route path="/articles/:id" element={<ArticlePage />} />
        <Route path="/articles/-/:id" element={<ArticlePage />} />
      </Routes>
      <Footer />
    </div>
  )
}
