import { useState } from 'react'
import { addDeal } from '../api/deals'
import { US_STATES } from '../constants/states'
import { normalizeAddress } from '../utils/address'

const emptyForm = {
  address: '',
  city: '',
  state: '',
  zip: '',
  price: '',
  description: '',
  photosLink: '',
  zillowLink: '',
}

function formatPrice(rawValue) {
  const digits = rawValue.replace(/\D/g, '')
  if (!digits) return ''
  return `$${Number(digits).toLocaleString('en-US')}`
}

export default function AddDealForm({ onDone, existingAddresses = [] }) {
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [addressError, setAddressError] = useState(null)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function updateZip(e) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 5)
    setForm((f) => ({ ...f, zip: digits }))
  }

  function updatePrice(e) {
    setForm((f) => ({ ...f, price: formatPrice(e.target.value) }))
  }

  function handleAddressBlur() {
    if (!form.address.trim()) {
      setAddressError(null)
      return
    }
    const isDuplicate = existingAddresses.includes(normalizeAddress(form.address))
    setAddressError(isDuplicate ? 'A deal for this address has already been added.' : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (existingAddresses.includes(normalizeAddress(form.address))) {
      setAddressError('A deal for this address has already been added.')
      return
    }
    setSubmitting(true)
    setStatus(null)
    try {
      await addDeal(form)
      setForm(emptyForm)
      onDone()
    } catch (err) {
      setStatus({ type: 'error', message: `Could not add deal: ${err.message}` })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="add-deal-section">
      <form className="add-deal-form" onSubmit={handleSubmit}>
        <h2>Add a Deal</h2>

        <div className="field">
          <label htmlFor="address">Property Address *</label>
          <input
            id="address"
            required
            value={form.address}
            onChange={update('address')}
            onBlur={handleAddressBlur}
            placeholder="123 Main St"
          />
          {addressError && <p className="field-error">{addressError}</p>}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="city">City *</label>
            <input id="city" required value={form.city} onChange={update('city')} placeholder="Dallas" />
          </div>
          <div className="field">
            <label htmlFor="state">State *</label>
            <select id="state" required value={form.state} onChange={update('state')}>
              <option value="" disabled>Select…</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.code} – {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="zip">Zip *</label>
            <input
              id="zip"
              required
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.zip}
              onChange={updateZip}
              placeholder="75201"
            />
          </div>
          <div className="field">
            <label htmlFor="price">Asking Price</label>
            <input id="price" inputMode="numeric" value={form.price} onChange={updatePrice} placeholder="$150,000" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" value={form.description} onChange={update('description')} placeholder="3 bed / 2 bath, needs cosmetic rehab..." rows={3} />
        </div>

        <div className="field">
          <label htmlFor="photosLink">Photos Link *</label>
          <input id="photosLink" required type="url" value={form.photosLink} onChange={update('photosLink')} placeholder="https://photos.example.com/album" />
        </div>

        <div className="field">
          <label htmlFor="zillowLink">Zillow Link</label>
          <input id="zillowLink" type="url" value={form.zillowLink} onChange={update('zillowLink')} placeholder="https://www.zillow.com/homedetails/..." />
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-btn" disabled={submitting || Boolean(addressError)}>
            {submitting ? 'Adding…' : 'Add Deal'}
          </button>
          <button type="button" className="cancel-btn" onClick={onDone}>
            Cancel
          </button>
        </div>

        {status && <p className={`form-status ${status.type}`}>{status.message}</p>}
      </form>
    </section>
  )
}
