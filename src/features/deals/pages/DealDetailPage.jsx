import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDeal } from '../api/deals'

export default function DealDetailPage() {
  const { dealId } = useParams()
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    getDeal(dealId)
      .then((data) => {
        if (!active) return
        if (data) {
          setDeal(data)
        } else {
          setNotFound(true)
        }
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [dealId])

  if (loading) return <p>Loading deal…</p>
  if (error) return <p className="form-status error">{error}</p>
  if (notFound)
    return (
      <p>
        This deal could not be found. <Link to="/">Back to all deals</Link>
      </p>
    )

  return (
    <section className="deal-detail">
      <Link to="/" className="back-link">
        &larr; Back to all deals
      </Link>

      <h1>{deal.address}</h1>
      <p className="deal-location">
        {deal.city}, {deal.state} {deal.zip}
      </p>
      {deal.price && <p className="deal-price">{deal.price}</p>}
      {deal.description && <p className="deal-description">{deal.description}</p>}

      <div className="deal-actions">
        {deal.zillowLink && (
          <a
            className="action-btn zillow-btn"
            href={deal.zillowLink}
            target="_blank"
            rel="noreferrer"
          >
            View on Zillow
          </a>
        )}
        {deal.photosLink && (
          <a
            className="action-btn photos-btn"
            href={deal.photosLink}
            target="_blank"
            rel="noreferrer"
          >
            View Photos
          </a>
        )}
        <Link className="action-btn offer-btn" to={`/deals/${deal.id}/offer`}>
          Make Offer
        </Link>
      </div>
    </section>
  )
}
