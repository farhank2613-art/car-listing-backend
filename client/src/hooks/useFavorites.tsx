import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const KEY = 'drivemarket:favorites';

function read(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

interface FavoritesValue {
  ids: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
  count: number;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(read);
  const idsRef = useRef<number[]>(ids);

  useEffect(() => {
    idsRef.current = ids;
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback((id: number) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isFavorite = useCallback((id: number) => idsRef.current.includes(id), []);

  return (
    <FavoritesContext.Provider value={{ ids, toggle, isFavorite, count: ids.length }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
