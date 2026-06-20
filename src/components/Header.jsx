import { Link, useLocation } from 'react-router-dom'

export default function Header({ activeTab, onChangeTab, theme, onToggleTheme }) {
  const location = useLocation()
  const showTabs = location.pathname === '/'

  return (
    <header className="site-header">
      <div className="site-header-row">
        <div className="brand-block">
          <Link to="/" className="brand">
            <span className="brand-mark">YW</span>
            <span className="brand-name">You Win Estates</span>
          </Link>
          <p className="brand-tagline">Off-market wholesale deals, direct from us to you.</p>
        </div>
        <div className="header-actions">
          {showTabs && (
            <nav className="header-tabs">
              <button
                type="button"
                className={`header-tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
                onClick={() => onChangeTab('deals')}
              >
                Available Deals
              </button>
              <button
                type="button"
                className={`header-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
                onClick={() => onChangeTab('add')}
              >
                + Add a Deal
              </button>
            </nav>
          )}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  )
}
