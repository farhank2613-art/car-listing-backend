import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const KEY = 'drivemarket:compare';
export const MAX_COMPARE = 3;

function read(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

interface CompareValue {
  ids: number[];
  toggle: (id: number) => void;
  clear: () => void;
  has: boolean;
  full: boolean;
  count: number;
}

const CompareContext = createContext<CompareValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(read);
  const idsRef = useRef<number[]>(ids);

  useEffect(() => {
    idsRef.current = ids;
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = useCallback((id: number) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const clear = useCallback(() => setIds([]), []);

  return (
    <CompareContext.Provider value={{ ids, toggle, clear, has: ids.length > 0, full: ids.length >= MAX_COMPARE, count: ids.length }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
