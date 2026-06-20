export default function DealsHeaderTabs({ activeTab, onChangeTab }) {
  return (
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
  )
}
