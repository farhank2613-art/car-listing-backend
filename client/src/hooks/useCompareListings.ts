import { useEffect, useState } from 'react';
import type { Listing } from '../types';
import { getListing } from '../api';

export function useCompareListings(ids: number[]) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
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

  return { listings, loading };
}
