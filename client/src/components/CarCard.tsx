import { Link } from 'react-router-dom';
import type { Listing } from '../types';
import { formatMiles, formatPrice } from '../api';
import ImageWithFallback from './ImageWithFallback';

interface Props {
  listing: Listing;
  isFavorite: (id: number) => boolean;
  onToggleFavorite: (id: number) => void;
  inCompare: boolean;
  onToggleCompare: (id: number) => void;
  compareFull: boolean;
}

export default function CarCard({ listing, isFavorite, onToggleFavorite, inCompare, onToggleCompare, compareFull }: Props) {
  const fav = isFavorite(listing.id);

  return (
    <article className="card">
      <div className="card-media">
        <span className="badge-tag condition">{listing.condition}</span>
        <button
          className={`heart-btn ${fav ? 'active' : ''}`}
          title={fav ? 'Remove from favorites' : 'Save to favorites'}
          onClick={() => onToggleFavorite(listing.id)}
        >
          {fav ? '♥' : '♡'}
        </button>
        <button
          className={`compare-btn ${inCompare ? 'active' : ''}`}
          title={inCompare ? 'Remove from compare' : compareFull ? 'Compare is full' : 'Add to compare'}
          onClick={() => onToggleCompare(listing.id)}
          disabled={!inCompare && compareFull}
        >
          {inCompare ? '✓ Comparing' : '+ Compare'}
        </button>
        <Link to={`/listings/${listing.id}`} aria-label={listing.title}>
          <ImageWithFallback src={listing.images[0]} alt={listing.title} text={`${listing.make} ${listing.model}`} hue={listing.id * 37} />
        </Link>
      </div>
      <div className="card-body">
        <div className="card-price">{formatPrice(listing.price)}</div>
        <div className="card-title">
          <span className="year">{listing.year}</span> {listing.make} {listing.model}
        </div>
        <div className="card-meta">
          <span className="chip">{listing.bodyType}</span>
          <span className="chip">{formatMiles(listing.mileage)}</span>
          <span className="chip">{listing.fuelType}</span>
        </div>
        <div className="card-location">📍 {listing.location || 'Location on request'}</div>
        <div className="card-actions">
          <Link to={`/listings/${listing.id}`} className="btn btn-outline btn-sm">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
