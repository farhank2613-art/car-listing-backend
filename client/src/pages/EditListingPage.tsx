import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getListing, updateListing } from '../api';
import type { Listing, ListingPayload } from '../types';
import CarForm, { toPayload } from '../components/CarForm';
import { getTokenForListing, saveTokenForListing } from '../tokenStore';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const listingId = Number(id);

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    getListing(listingId)
      .then(({ item }) => setListing(item))
      .catch((err) => setError(err instanceof Error ? err.message : 'Listing not found.'))
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) return <div className="container"><div className="spinner" /></div>;

  if (error || !listing) {
    return (
      <div className="container center-pad">
        <div className="alert alert-error">{error || 'Listing not found.'}</div>
        <Link to="/my-listings" className="btn btn-primary" style={{ marginTop: 10 }}>Back to My listings</Link>
      </div>
    );
  }

  const token = getTokenForListing(listing.id);

  async function handleSubmit(data: ListingPayload) {
    if (!token || !listing) throw new Error('Missing edit token. Go to My listings and load your token first.');
    await updateListing(listing.id, data, token);
    saveTokenForListing(listing.id, token);
    setSaved(true);
    setTimeout(() => navigate(`/listings/${listing.id}`), 1200);
  }

  return (
    <div className="container" style={{ maxWidth: 860, paddingBottom: 60 }}>
      <div className="detail-top">
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 28 }}>Edit listing</h1>
            <p>
              <Link to={`/listings/${listing.id}`}>{listing.title}</Link>
              {!token && <span className="alert alert-error" style={{ display: 'inline-block', marginLeft: 10 }}>No edit token — open from My listings.</span>}
            </p>
          </div>
        </div>
      </div>

      {saved && <div className="alert alert-success">Saved! Redirecting…</div>}

      <CarForm initial={toPayload(listing)} onSubmit={handleSubmit} submitLabel="Save changes" />
    </div>
  );
}
