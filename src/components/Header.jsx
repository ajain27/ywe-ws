import { Link, useLocation } from 'react-router-dom'
import DealsHeaderTabs from '../features/deals/components/DealsHeaderTabs'
import ThemeToggleButton from '../features/theme/components/ThemeToggleButton'

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
          {showTabs && <DealsHeaderTabs activeTab={activeTab} onChangeTab={onChangeTab} />}
          <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
