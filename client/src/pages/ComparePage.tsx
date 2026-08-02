import { Link } from 'react-router-dom';
import { useCompare } from '../hooks/useCompare';
import { useCompareListings } from '../hooks/useCompareListings';
import ImageWithFallback from '../components/ImageWithFallback';

export default function ComparePage() {
  const { ids, toggle, clear } = useCompare();
  const { listings, loading } = useCompareListings(ids);

  if (loading) return <div className="container"><div className="spinner" /></div>;

  if (!ids.length) {
    return (
      <div className="container center-pad">
        <div className="empty-state">
          <h3>Nothing to compare yet</h3>
          <p>Add up to three vehicles using the "Compare" button on any listing.</p>
          <Link to="/listings" className="btn btn-primary" style={{ marginTop: 12 }}>Browse cars</Link>
        </div>
      </div>
    );
  }

  const rows: { label: string; get: (l: (typeof listings)[number]) => string }[] = [
    { label: 'Year', get: (l) => String(l.year) },
    { label: 'Mileage', get: (l) => `${l.mileage.toLocaleString()} mi` },
    { label: 'Price', get: (l) => `$${l.price.toLocaleString()}` },
    { label: 'Body type', get: (l) => l.bodyType },
    { label: 'Fuel type', get: (l) => l.fuelType },
    { label: 'Transmission', get: (l) => l.transmission },
    { label: 'Drivetrain', get: (l) => l.drivetrain || '—' },
    { label: 'Color', get: (l) => l.color || '—' },
    { label: 'Condition', get: (l) => l.condition },
    { label: 'Location', get: (l) => l.location || '—' },
    { label: 'Features', get: (l) => l.features.length ? l.features.join(', ') : '—' }
  ];

  return (
    <div className="container" style={{ paddingBottom: 90 }}>
      <div className="detail-top">
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 28 }}>Compare vehicles</h1>
            <p>Side-by-side specs for the cars you selected.</p>
          </div>
          <button className="btn btn-outline" onClick={clear}>Clear all</button>
        </div>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th style={{ width: 170 }}></th>
              {listings.map((l) => (
                <th key={l.id}>
                  <ImageWithFallback src={l.images[0]} alt={l.title} className="compare-card-img" text={l.title} hue={l.id * 37} />
                  <div style={{ marginTop: 8 }}>{l.year} {l.make} {l.model}</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggle(l.id)} style={{ marginTop: 6, color: 'var(--red)' }}>
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                {listings.map((l) => (
                  <td key={l.id}>
                    <div style={row.label === 'Price' ? { fontWeight: 800 } : undefined}>{row.get(l)}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 26 }}>
        <Link to="/listings" className="link-arrow">← Back to search</Link>
      </div>
    </div>
  );
}
