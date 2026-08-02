import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteListing, formatDate, formatMiles, formatPrice, getInquiries, getMine } from '../api';
import type { Inquiry, Listing } from '../types';
import { getMasterToken, saveToken } from '../tokenStore';
import ImageWithFallback from '../components/ImageWithFallback';

export default function MyListingsPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState(getMasterToken());
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<Listing[]>([]);
  const [leads, setLeads] = useState<Record<number, Inquiry[]>>({});
  const [openLeads, setOpenLeads] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async (t: string) => {
    if (!t) {
      setItems([]);
      setLoaded(true);
      return;
    }
    try {
      const res = await getMine(t);
      setItems(res.items);
      setError('');
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Could not load listings.');
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyToken() {
    saveToken(token.trim());
    setLoaded(false);
    load(token.trim());
  }

  async function toggleLeads(listing: Listing) {
    if (openLeads === listing.id) {
      setOpenLeads(null);
      return;
    }
    setOpenLeads(listing.id);
    try {
      const res = await getInquiries(listing.id, token);
      setLeads((prev) => ({ ...prev, [listing.id]: res.items }));
    } catch {
      setLeads((prev) => ({ ...prev, [listing.id]: [] }));
    }
  }

  async function handleDelete(listing: Listing) {
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    try {
      await deleteListing(listing.id, token);
      setItems((prev) => prev.filter((l) => l.id !== listing.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.');
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <div className="detail-top">
        <div className="dashboard-head">
          <div>
            <h1 style={{ fontSize: 28, margin: 0 }}>My listings</h1>
            <p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>Manage the vehicles you've listed.</p>
          </div>
          <Link to="/sell" className="btn btn-primary">+ List a car</Link>
        </div>
      </div>

      <div className="token-note">
        This demo has no accounts. To manage your listings, paste the <strong>edit token</strong> shown after you publish a listing.
        We remember it in your browser for convenience.
      </div>

      <div className="token-input-row">
        <input
          type="text"
          placeholder="Paste your edit token…"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className="btn btn-dark" onClick={applyToken}>Load listings</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loaded && !token.trim() && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <h3>No token yet</h3>
          <p>Create a listing to get your edit token, or paste one above.</p>
          <Link to="/sell" className="btn btn-primary" style={{ marginTop: 12 }}>List your first car</Link>
        </div>
      )}

      {loaded && token.trim() && items.length === 0 && !error && (
        <div className="empty-state" style={{ marginTop: 20 }}>
          <h3>No listings found</h3>
          <p>This token doesn't own any listings yet.</p>
        </div>
      )}

      {items.map((listing) => (
        <div key={listing.id}>
          <div className="list-row">
            <Link to={`/listings/${listing.id}`}>
              <ImageWithFallback src={listing.images[0]} alt={listing.title} text={listing.title} hue={listing.id * 37} />
            </Link>
            <div>
              <div className="title">
                <Link to={`/listings/${listing.id}`}>{listing.title}</Link>
              </div>
              <div className="sub">{formatMiles(listing.mileage)} · {listing.location || 'Location TBD'} · Listed {formatDate(listing.createdAt)} · {listing.views} views</div>
            </div>
            <div className="price">{formatPrice(listing.price)}</div>
            <div className="actions" style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => toggleLeads(listing)}>
                Inquiries {openLeads === listing.id ? '▴' : '▾'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => navigate(`/listings/${listing.id}/edit`)}>
                Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(listing)}>
                Delete
              </button>
            </div>
          </div>

          {openLeads === listing.id && (
            <div className="panel" style={{ marginTop: 0, marginBottom: 14 }}>
              <h2>Inquiries</h2>
              {(leads[listing.id]?.length ?? 0) === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No inquiries yet.</p>
              ) : (
                leads[listing.id].map((lead) => (
                  <div key={lead.id} className="lead">
                    <div className="from">{lead.name}</div>
                    <div className="contact">
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      {lead.phone && <> · <a href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}>{lead.phone}</a></>}
                      {' · '}{formatDate(lead.createdAt)}
                    </div>
                    {lead.message && <div className="msg">{lead.message}</div>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
