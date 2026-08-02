import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="brand" style={{ color: '#fff', marginBottom: 12 }}>
              <span className="brand-badge">🚗</span>
              DriveMarket
            </div>
            <p style={{ maxWidth: 320 }}>
              The simple way to buy and sell used cars. Search thousands of listings, compare models side-by-side,
              and connect directly with sellers.
            </p>
          </div>
          <div>
            <h5>Shop</h5>
            <Link to="/listings">All cars</Link>
            <Link to="/listings?bodyType=SUV">SUVs</Link>
            <Link to="/listings?fuelType=Electric">Electric cars</Link>
            <Link to="/listings?bodyType=Truck">Trucks</Link>
          </div>
          <div>
            <h5>Sell</h5>
            <Link to="/sell">List your car</Link>
            <Link to="/my-listings">Manage listings</Link>
          </div>
          <div>
            <h5>Tools</h5>
            <Link to="/compare">Compare vehicles</Link>
            <Link to="/favorites">Favorites</Link>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} DriveMarket. Demo marketplace — data is sample content.</div>
      </div>
    </footer>
  );
}
