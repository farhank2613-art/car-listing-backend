import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Listing } from '../types';
import { getListing } from '../api';
import { useFavorites } from '../hooks/useFavorites';
import { useCompare } from '../hooks/useCompare';
import CarCard from '../components/CarCard';

export default function FavoritesPage() {
  const { ids, toggle: toggleFavorite } = useFavorites();
  const { ids: compareIds, toggle: toggleCompare, full: compareFull } = useCompare();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (!ids.length) {
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => getListing(id).catch(() => null)))
      .then((results) => {
        if (!alive) return;
        setListings(results.filter((r): r is { item: Listing } => r !== null).map((r) => r.item));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [ids.join(',')]);

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <div className="detail-top">
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 28 }}>Favorites</h1>
            <p>Your saved vehicles ({listings.length}).</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <h3>No favorites yet</h3>
          <p>Tap the heart on any listing to save it here for later.</p>
          <Link to="/listings" className="btn btn-primary" style={{ marginTop: 12 }}>Browse cars</Link>
        </div>
      ) : (
        <div className="grid grid-cards">
          {listings.map((listing) => (
            <CarCard
              key={listing.id}
              listing={listing}
              isFavorite={(id) => ids.includes(id)}
              onToggleFavorite={toggleFavorite}
              inCompare={compareIds.includes(listing.id)}
              onToggleCompare={toggleCompare}
              compareFull={compareFull}
            />
          ))}
        </div>
      )}
    </div>
  );
}
