import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getListings, getMeta } from '../api';
import type { Listing, Meta } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { useCompare } from '../hooks/useCompare';
import CarCard from '../components/CarCard';

export default function HomePage() {
  const navigate = useNavigate();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { ids: compareIds, toggle: toggleCompare, full: compareFull } = useCompare();

  const [meta, setMeta] = useState<Meta | null>(null);
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [q, setQ] = useState('');
  const [make, setMake] = useState('');

  useEffect(() => {
    getMeta().then(setMeta).catch(() => undefined);
    getListings({ sort: 'newest', pageSize: 8 }).then((res) => setFeatured(res.items)).catch(() => undefined);
  }, []);

  function search() {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (make) p.set('make', make);
    navigate(`/listings${p.toString() ? `?${p.toString()}` : ''}`);
  }

  const total = meta?.makes.reduce((sum, m) => sum + m.count, 0) ?? 0;

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Find your next car. Sell your old one.</h1>
          <p>Search thousands of new and used vehicles from private sellers and dealerships, compare them side-by-side, and get in touch in minutes.</p>
          <div className="hero-search">
            <input
              type="search"
              placeholder="Search by make, model, or keyword…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <select value={make} onChange={(e) => setMake(e.target.value)}>
              <option value="">All makes</option>
              {meta?.makes.map((m) => (
                <option key={m.make} value={m.make}>{m.make}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={search}>Search</button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><b>{total}</b><span>Vehicles listed</span></div>
            <div className="hero-stat"><b>{meta?.makes.length ?? 0}</b><span>Makes available</span></div>
            <div className="hero-stat"><b>0%</b><span>Seller fees</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Just listed</h2>
              <p>The newest vehicles on DriveMarket.</p>
            </div>
            <Link to="/listings" className="link-arrow">View all →</Link>
          </div>
          <div className="grid grid-cards">
            {featured.map((listing) => (
              <CarCard
                key={listing.id}
                listing={listing}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                inCompare={compareIds.includes(listing.id)}
                onToggleCompare={toggleCompare}
                compareFull={compareFull}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface)', borderBlock: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Browse by type</h2>
              <p>Jump straight to the style that fits your life.</p>
            </div>
          </div>
          <div className="grid grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
            {(meta?.bodyTypes ?? []).map((body, i) => (
              <Link
                key={body}
                to={`/listings?bodyType=${encodeURIComponent(body)}`}
                className="btn btn-outline"
                style={{ padding: '18px', fontSize: 16 }}
              >
                {['🚙', '🚗', '🏎️', '🛻', '🚐', '🚘'][i % 6]} {body}s
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>How DriveMarket works</h2>
              <p>Buying and selling made simple.</p>
            </div>
          </div>
          <div className="grid grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {[
              { icon: '🔎', title: 'Search & filter', text: 'Narrow down hundreds of cars by price, mileage, fuel type, body style and more.' },
              { icon: '⚖️', title: 'Compare side-by-side', text: 'Line up to three vehicles and compare specs at a glance before you decide.' },
              { icon: '💬', title: 'Contact the seller', text: 'Send a message directly to the seller to ask questions or book a test drive.' },
              { icon: '🚀', title: 'List in minutes', text: 'Selling? Create a listing in under two minutes — no fees, no hassle.' }
            ].map((s) => (
              <div key={s.title} className="card" style={{ padding: 26 }}>
                <div style={{ fontSize: 34 }}>{s.icon}</div>
                <h3 style={{ margin: '12px 0 6px' }}>{s.title}</h3>
                <p style={{ color: 'var(--muted)', margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 34 }}>
            <Link to="/sell" className="btn btn-primary" style={{ padding: '14px 30px', fontSize: 16 }}>
              List your car for free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
