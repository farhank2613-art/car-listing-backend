import { useEffect, useState } from 'react';
import { getListings, getMeta } from '../api';
import type { Listing, ListingListResponse, Meta } from '../types';
import { SORT_OPTIONS } from '../types';
import { useFilters } from '../hooks/useFilters';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFavorites } from '../hooks/useFavorites';
import { useCompare } from '../hooks/useCompare';
import FilterPanel from '../components/FilterPanel';
import CarCard from '../components/CarCard';
import Pagination from '../components/Pagination';

export default function ListingsPage() {
  const { filters, patch, reset, activeCount } = useFilters();
  const debounced = useDebouncedValue(filters, 300);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { ids: compareIds, toggle: toggleCompare, full: compareFull } = useCompare();

  const [meta, setMeta] = useState<Meta | null>(null);
  const [data, setData] = useState<ListingListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMeta().then(setMeta).catch(() => undefined);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getListings({ ...debounced, page: debounced.page ?? 1 })
      .then((res) => alive && setData(res))
      .catch((err) => alive && setError(err instanceof Error ? err.message : 'Failed to load listings.'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [debounced]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="container">
      <div className="listings-layout">
        {meta && (
          <FilterPanel
            meta={meta}
            filters={filters}
            onChange={patch}
            onClear={reset}
            activeCount={activeCount}
          />
        )}

        <div>
          <div className="results-toolbar">
            <span className="count">{total}</span>
            <span className="muted">vehicle{total === 1 ? '' : 's'} found</span>
            {activeCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={reset}>
                Reset filters
              </button>
            )}
            <select
              className="sort-select"
              value={filters.sort ?? 'newest'}
              onChange={(e) => patch({ sort: e.target.value })}
              aria-label="Sort listings"
            >
              {SORT_OPTIONS.map((o: { value: string; label: string }) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading && !data ? (
            <div className="spinner" />
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <h3>No vehicles match your filters</h3>
              <p>Try widening your price range, mileage, or removing a filter.</p>
              <button className="btn btn-primary" onClick={reset} style={{ marginTop: 12 }}>Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cards">
                {items.map((listing: Listing) => (
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
              {data && data.pages > 1 && (
                <Pagination
                  page={data.page}
                  pages={data.pages}
                  onChange={(page) => {
                    patch({ page });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
