import { useEffect, useMemo, useState } from 'react'
import AddDealForm from '../components/AddDealForm'
import DealCard from '../components/DealCard'
import { subscribeToDeals } from '../api/deals'
import { firebaseConfigured } from '../firebase'
import { US_STATES } from '../constants/states'
import { normalizeAddress } from '../utils/address'

export default function HomePage({ activeTab, onShowDealsTab }) {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(firebaseConfigured)
  const [stateFilter, setStateFilter] = useState('')

  useEffect(() => {
    if (!firebaseConfigured) return
    const unsubscribe = subscribeToDeals((data) => {
      setDeals(data)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const filteredDeals = useMemo(
    () => (stateFilter ? deals.filter((deal) => deal.state === stateFilter) : deals),
    [deals, stateFilter],
  )

  const existingAddresses = useMemo(
    () => deals.map((deal) => normalizeAddress(deal.address || '')),
    [deals],
  )

  if (activeTab === 'add') {
    return <AddDealForm onDone={onShowDealsTab} existingAddresses={existingAddresses} />
  }

  return (
    <section className="deals-section">
      <div className="deals-section-header">
        <h2>Available Deals to Purchase</h2>
        <div className="filter-field">
          <label htmlFor="stateFilter">Filter by state</label>
          <select id="stateFilter" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
            <option value="">All States</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>{s.code} – {s.name}</option>
            ))}
          </select>
        </div>
      </div>
      {loading && <p>Loading deals…</p>}
      {!loading && filteredDeals.length === 0 && (
        <p>{deals.length === 0 ? 'No deals posted yet. Check back soon.' : 'No deals match this filter.'}</p>
      )}
      <div className="deals-grid">
        {filteredDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
    </section>
  )
}
