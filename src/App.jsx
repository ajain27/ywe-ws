import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import DealDetailPage from './pages/DealDetailPage'
import MakeOfferPage from './pages/MakeOfferPage'
import { firebaseConfigured } from './firebase'
import { useTheme } from './hooks/useTheme'

function App() {
  const [activeTab, setActiveTab] = useState('deals')
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app-shell">
      <Header activeTab={activeTab} onChangeTab={setActiveTab} theme={theme} onToggleTheme={toggleTheme} />
      {!firebaseConfigured && (
        <div className="config-banner">
          Firebase is not configured yet. Fill in your Firebase project
          credentials in <code>.env.development</code>. See README.md for setup steps.
        </div>
      )}
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<HomePage activeTab={activeTab} onShowDealsTab={() => setActiveTab('deals')} />}
          />
          <Route path="/deals/:dealId" element={<DealDetailPage />} />
          <Route path="/deals/:dealId/offer" element={<MakeOfferPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
