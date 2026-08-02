import { Link } from 'react-router-dom';
import { useCompare } from '../hooks/useCompare';
import { useCompareListings } from '../hooks/useCompareListings';
import { MAX_COMPARE } from '../hooks/useCompare';
import ImageWithFallback from './ImageWithFallback';

export default function CompareStrip() {
  const { ids, clear } = useCompare();
  const { listings } = useCompareListings(ids);

  if (!ids.length) return null;

  return (
    <div className="compare-strip">
      <div className="container compare-strip-inner">
        <strong style={{ fontSize: 14 }}>Compare ({ids.length}/{MAX_COMPARE})</strong>
        {listings.map((l) => (
          <Link key={l.id} to={`/listings/${l.id}`} title={l.title}>
            <ImageWithFallback src={l.images[0]} alt={l.title} className="compare-thumb" text={l.title} />
          </Link>
        ))}
        {Array.from({ length: MAX_COMPARE - listings.length }).map((_, i) => (
          <div key={i} className="compare-empty-slot">+</div>
        ))}
        <div className="nav-spacer" />
        <button className="btn btn-outline btn-sm" onClick={clear}>
          Clear all
        </button>
        <Link to="/compare" className="btn btn-primary btn-sm">
          Compare now
        </Link>
      </div>
    </div>
  );
}
