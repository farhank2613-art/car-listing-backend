interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, pages, onChange }: Props) {
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  const nums: (number | 'ellipsis')[] = [];
  if (start > 1) { nums.push(1); if (start > 2) nums.push('ellipsis'); }
  for (let i = start; i <= end; i++) nums.push(i);
  if (end < pages) { if (end < pages - 1) nums.push('ellipsis'); nums.push(pages); }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="page-btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</button>
      {nums.map((n, i) =>
        n === 'ellipsis' ? (
          <span key={`e${i}`} style={{ alignSelf: 'center', color: 'var(--muted)' }}>…</span>
        ) : (
          <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => onChange(n)}>
            {n}
          </button>
        )
      )}
      <button className="page-btn" disabled={page >= pages} onClick={() => onChange(page + 1)}>›</button>
    </nav>
  );
}
