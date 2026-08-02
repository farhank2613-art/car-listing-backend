const MASTER_KEY = 'drivemarket:token';
const MAP_KEY = 'drivemarket:token-map';

export function saveToken(token: string): void {
  try {
    localStorage.setItem(MASTER_KEY, token);
  } catch {
    /* ignore */
  }
}

export function getMasterToken(): string {
  try {
    return localStorage.getItem(MASTER_KEY) || '';
  } catch {
    return '';
  }
}

function readMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(MAP_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function saveTokenForListing(listingId: number, token: string): void {
  try {
    const map = readMap();
    map[String(listingId)] = token;
    localStorage.setItem(MAP_KEY, JSON.stringify(map));
    saveToken(token);
  } catch {
    /* ignore */
  }
}

export function getTokenForListing(listingId: number): string {
  try {
    return readMap()[String(listingId)] || getMasterToken();
  } catch {
    return getMasterToken();
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(MASTER_KEY);
  } catch {
    /* ignore */
  }
}
