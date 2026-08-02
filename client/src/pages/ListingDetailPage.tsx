import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDate, formatMiles, formatPrice, getListing, getListings } from '../api';
import type { Listing } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { useCompare } from '../hooks/useCompare';
import Gallery from '../components/Gallery';
import FinanceCalculator from '../components/FinanceCalculator';
import InquiryForm from '../components/InquiryForm';
import CarCard from '../components/CarCard';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { ids: compareIds, toggle: toggleCompare, full: compareFull } = useCompare();

  const [listing, setListing] = useState<Listing | null>(null);
  const [similar, setSimilar] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    getListing(id)
      .then(async ({ item }) => {
        if (!alive) return;
        setListing(item);
        const res = await getListings({ make: item.make, pageSize: 4 }).catch(() => null);
        if (alive && res) setSimilar(res.items.filter((x) => x.id !== item.id).slice(0, 4));
      })
      .catch((err) => alive && setError(err instanceof Error ? err.message : 'Listing not found.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div className="container"><div className="spinner" /></div>;

  if (error || !listing) {
    return (
      <div className="container center-pad">
        <div className="alert alert-error">{error || 'Listing not found.'}</div>
        <Link to="/listings" className="btn btn-primary" style={{ marginTop: 10 }}>Back to listings</Link>
      </div>
    );
  }

  const fav = isFavorite(listing.id);
  const inCompare = compareIds.includes(listing.id);

  const specs: [string, string][] = [
    ['Year', String(listing.year)],
    ['Mileage', formatMiles(listing.mileage)],
    ['Body type', listing.bodyType],
    ['Fuel type', listing.fuelType],
    ['Transmission', listing.transmission],
    ['Drivetrain', listing.drivetrain],
    ['Color', listing.color],
    ['Condition', listing.condition],
    ['VIN', listing.vin || '—'],
    ['Location', listing.location || '—']
  ];

  return (
    <div className="container">
      <div className="detail-top">
        <div className="crumbs">
          <Link to="/">Home</Link> / <Link to="/listings">Listings</Link> / <span>{listing.title}</span>
        </div>
        <div className="detail-head">
          <div className="detail-title">
            <h1>{listing.title}</h1>
            <div className="sub">
              {listing.location || 'Location on request'} · Listed {formatDate(listing.createdAt)} · {listing.views} views
            </div>
          </div>
          <div className="detail-price">
            {formatPrice(listing.price)}
            <span className="est">est. {formatPrice(Math.round((listing.price * 0.8) / 60))}/mo</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button className={`btn ${fav ? 'btn-danger' : 'btn-outline'}`} onClick={() => toggleFavorite(listing.id)}>
            {fav ? 'Saved' : 'Save to favorites'}
          </button>
          <button
            className={`btn ${inCompare ? 'btn-dark' : 'btn-outline'}`}
            onClick={() => toggleCompare(listing.id)}
            disabled={!inCompare && compareFull}
          >
            {inCompare ? 'In compare' : compareFull ? 'Compare is full' : 'Add to compare'}
          </button>
        </div>
      </div>

      <div className="detail-layout">
        <div>
          <Gallery images={listing.images} alt={listing.title} text={`${listing.make} ${listing.model}`} hue={listing.id * 37} />

          <div className="panel">
            <h2>Overview</h2>
            <p style={{ margin: 0 }}>{listing.description || 'No description provided by the seller.'}</p>
          </div>

          <div className="panel">
            <h2>Specifications</h2>
            <div className="spec-grid">
              {specs.map(([k, v]) => (
                <div key={k} className="spec-cell">
                  <div className="k">{k}</div>
                  <div className="v">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {listing.features.length > 0 && (
            <div className="panel">
              <h2>Features & options</h2>
              <div className="feature-list">
                {listing.features.map((f) => (
                  <span key={f} className="feature-tag">{f}</span>
                ))}
              </div>
            </div>
          )}

          <InquiryForm listingId={listing.id} sellerName={listing.sellerName || 'the seller'} />

          {similar.length > 0 && (
            <div className="panel">
              <h2>Similar {listing.make} vehicles</h2>
              <div className="grid grid-cards">
                {similar.map((s) => (
                  <CarCard
                    key={s.id}
                    listing={s}
                    isFavorite={isFavorite}
                    onToggleFavorite={toggleFavorite}
                    inCompare={compareIds.includes(s.id)}
                    onToggleCompare={toggleCompare}
                    compareFull={compareFull}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-stack">
          <div className="price-panel">
            <div className="price">{formatPrice(listing.price)}</div>
            <div className="per-month">or ~{formatPrice(Math.round((listing.price * 0.8) / 60))}/month</div>
            <div className="seller-box">
              <div className="avatar">{(listing.sellerName || 'S')[0].toUpperCase()}</div>
              <div>
                <div className="name">{listing.sellerName || 'Private seller'}</div>
                <div className="loc">{listing.location || 'Location on request'}</div>
              </div>
            </div>
            {listing.sellerPhone && (
              <a href={`tel:${listing.sellerPhone.replace(/[^0-9+]/g, '')}`} className="btn btn-dark btn-block">
                Call {listing.sellerPhone}
              </a>
            )}
            {listing.sellerEmail && (
              <a href={`mailto:${listing.sellerEmail}?subject=Inquiry: ${encodeURIComponent(listing.title)}`} className="btn btn-outline btn-block" style={{ marginTop: 10 }}>
                Email seller
              </a>
            )}
          </div>
          <FinanceCalculator price={listing.price} />
        </div>
      </div>
    </div>
  );
}
