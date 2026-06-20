import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { addOffer, getDeal } from '../api/deals'

const emptyForm = {
  buyerName: '',
  buyerEmail: '',
  buyerPhone: '',
  offerAmount: '',
  message: '',
}

export default function MakeOfferPage() {
  const { dealId } = useParams()
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    getDeal(dealId)
      .then((data) => setDeal(data))
      .catch(() => setDeal(null))
      .finally(() => setLoading(false))
  }, [dealId])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    try {
      await addOffer({
        dealId,
        dealAddress: deal ? `${deal.address}, ${deal.city}, ${deal.state} ${deal.zip}` : dealId,
        ...form,
      })
      setStatus({ type: 'success', message: "Offer submitted! We'll be in touch shortly." })
      setForm(emptyForm)
    } catch (err) {
      setStatus({ type: 'error', message: `Could not submit offer: ${err.message}` })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p>Loading…</p>

  return (
    <section className="offer-page">
      <Link to={`/deals/${dealId}`} className="back-link">&larr; Back to deal</Link>
      <h1>Make an Offer</h1>
      {deal && (
        <p className="deal-location">
          {deal.address}, {deal.city}, {deal.state} {deal.zip}
        </p>
      )}

      {status?.type === 'success' ? (
        <p className="form-status success">{status.message}</p>
      ) : (
        <form className="offer-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="buyerName">Your Name *</label>
            <input id="buyerName" required value={form.buyerName} onChange={update('buyerName')} />
          </div>

          <div className="field">
            <label htmlFor="buyerEmail">Email *</label>
            <input id="buyerEmail" type="email" required value={form.buyerEmail} onChange={update('buyerEmail')} />
          </div>

          <div className="field">
            <label htmlFor="buyerPhone">Phone *</label>
            <input id="buyerPhone" type="tel" required value={form.buyerPhone} onChange={update('buyerPhone')} />
          </div>

          <div className="field">
            <label htmlFor="offerAmount">Offer Amount *</label>
            <input id="offerAmount" required value={form.offerAmount} onChange={update('offerAmount')} placeholder="$140,000" />
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" value={form.message} onChange={update('message')} rows={3} placeholder="Proof of funds, timeline, questions..." />
          </div>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Offer'}
          </button>

          {status?.type === 'error' && <p className="form-status error">{status.message}</p>}
        </form>
      )}
    </section>
  )
}
