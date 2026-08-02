import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Filters } from '../types';

function toNumber(searchParams: URLSearchParams, key: string): number | undefined {
  const v = searchParams.get(key);
  return v === null || v === '' ? undefined : Number(v);
}

function toList(searchParams: URLSearchParams, key: string): string[] | undefined {
  const v = searchParams.get(key);
  return v ? v.split(',').filter(Boolean) : undefined;
}

function setParam(next: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    next.delete(key);
  } else {
    next.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
}

export function useFilters(): {
  filters: Filters;
  patch: (p: Partial<Filters>) => void;
  reset: () => void;
  activeCount: number;
} {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<Filters>(() => ({
    q: searchParams.get('q') || undefined,
    make: searchParams.get('make') || undefined,
    model: searchParams.get('model') || undefined,
    minPrice: toNumber(searchParams, 'minPrice'),
    maxPrice: toNumber(searchParams, 'maxPrice'),
    minYear: toNumber(searchParams, 'minYear'),
    maxYear: toNumber(searchParams, 'maxYear'),
    maxMileage: toNumber(searchParams, 'maxMileage'),
    bodyType: toList(searchParams, 'bodyType'),
    fuelType: toList(searchParams, 'fuelType'),
    transmission: toList(searchParams, 'transmission'),
    drivetrain: toList(searchParams, 'drivetrain'),
    condition: toList(searchParams, 'condition'),
    sort: searchParams.get('sort') || undefined,
    page: toNumber(searchParams, 'page')
  }), [searchParams]);

  const patch = useCallback((p: Partial<Filters>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(p).forEach(([k, v]) => setParam(next, k, v));
      if (!('page' in p)) next.delete('page');
      return next;
    });
  }, [setSearchParams]);

  const reset = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.q) n++;
    if (filters.make) n++;
    if (filters.model) n++;
    if (filters.minPrice !== undefined) n++;
    if (filters.maxPrice !== undefined) n++;
    if (filters.minYear !== undefined) n++;
    if (filters.maxYear !== undefined) n++;
    if (filters.maxMileage !== undefined) n++;
    n += (filters.bodyType ?? []).length;
    n += (filters.fuelType ?? []).length;
    n += (filters.transmission ?? []).length;
    n += (filters.drivetrain ?? []).length;
    n += (filters.condition ?? []).length;
    return n;
  }, [filters]);

  return { filters, patch, reset, activeCount };
}
