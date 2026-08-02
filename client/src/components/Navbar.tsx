import { Link, NavLink, useLocation } from 'react-router-dom';

interface Props {
  favoriteCount: number;
  compareCount: number;
}

export default function Navbar({ favoriteCount, compareCount }: Props) {
  const location = useLocation();
  const onListingPages = location.pathname.startsWith('/listings') && location.pathname !== '/listings';

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-badge">🚗</span>
          DriveMarket
        </Link>
        <nav className="nav-links">
          <NavLink to="/listings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span>Browse cars</span>
          </NavLink>
          <NavLink to="/compare" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span>Compare</span>
          </NavLink>
          <NavLink to="/my-listings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span>My listings</span>
          </NavLink>
        </nav>
        <div className="nav-spacer" />
        {onListingPages ? null : (
          <Link to="/listings" className="nav-cta">
            Browse cars
          </Link>
        )}
        <Link to="/favorites" className="nav-icon-btn" title="Favorites" aria-label="Favorites">
          ♥
          {favoriteCount > 0 && <span className="badge-count">{favoriteCount}</span>}
        </Link>
        <Link to="/compare" className="nav-icon-btn" title="Compare" aria-label="Compare">
          ⚖
          {compareCount > 0 && <span className="badge-count">{compareCount}</span>}
        </Link>
      </div>
    </header>
  );
}
