import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function DealCard({ deal }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageSrc = deal.thumbnailUrl || deal.photosLink

  return (
    <Link to={`/deals/${deal.id}`} className="deal-card">
      <div className="deal-thumb">
        {imageFailed || !imageSrc ? (
          <div className="thumb-fallback">View Photos</div>
        ) : (
          <img
            src={imageSrc}
            alt={`${deal.address}, ${deal.city}, ${deal.state}`}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <div className="deal-card-body">
        <p className="deal-address">{deal.address}</p>
        <p className="deal-location">
          {deal.city}, {deal.state} {deal.zip}
        </p>
        {deal.price && <p className="deal-price">{deal.price}</p>}
      </div>
    </Link>
  )
}
