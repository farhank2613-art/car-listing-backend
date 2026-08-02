import type { Filters, Inquiry, Listing, ListingListResponse, ListingPayload, Meta } from './types';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function buildQuery(filters: Filters): string {
  const p = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 0) return;
    if (Array.isArray(value)) {
      if (value.length) p.set(key, value.join(','));
    } else {
      p.set(key, String(value));
    }
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function getListings(filters: Filters = {}): Promise<ListingListResponse> {
  return request(`/listings${buildQuery(filters)}`);
}

export function getMeta(): Promise<Meta> {
  return request('/meta');
}

export function getListing(id: number | string): Promise<{ item: Listing }> {
  return request(`/listings/${id}`);
}

export function createListing(data: ListingPayload): Promise<{ item: Listing; editToken: string }> {
  return request('/listings', { method: 'POST', body: JSON.stringify(data) });
}

export function updateListing(id: number, data: ListingPayload, token: string): Promise<{ item: Listing }> {
  return request(`/listings/${id}`, {
    method: 'PUT',
    headers: { 'x-edit-token': token },
    body: JSON.stringify(data)
  });
}

export function deleteListing(id: number, token: string): Promise<{ ok: boolean }> {
  return request(`/listings/${id}`, { method: 'DELETE', headers: { 'x-edit-token': token } });
}

export function getMine(token: string): Promise<{ items: Listing[] }> {
  return request(`/listings/mine?token=${encodeURIComponent(token)}`);
}

export function sendInquiry(id: number, data: { name: string; email: string; phone?: string; message?: string }): Promise<{ ok: boolean; id: number }> {
  return request(`/listings/${id}/inquiries`, { method: 'POST', body: JSON.stringify(data) });
}

export function getInquiries(id: number, token: string): Promise<{ items: Inquiry[] }> {
  return request(`/listings/${id}/inquiries?token=${encodeURIComponent(token)}`);
}

export function placeholderUrl(text: string, hue = 220): string {
  return `${BASE}/placeholder.svg?text=${encodeURIComponent(text)}&hue=${hue}`;
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function formatMiles(n: number): string {
  return `${new Intl.NumberFormat('en-US').format(n)} mi`;
}

export function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
