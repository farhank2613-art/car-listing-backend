import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createListing } from '../api';
import type { Listing } from '../types';
import CarForm from '../components/CarForm';
import { saveTokenForListing } from '../tokenStore';

export default function AddListingPage() {
  const [created, setCreated] = useState<{ item: Listing; editToken: string } | null>(null);

  if (created) {
    const { item, editToken } = created;
    return (
      <div className="container center-pad" style={{ maxWidth: 640 }}>
        <div className="alert alert-success" style={{ fontSize: 16 }}>
          Your listing is live! 🎉
        </div>
        <div className="panel" style={{ textAlign: 'left' }}>
          <h2>Manage this listing</h2>
          <p>
            Your listing is at{' '}
            <Link to={`/listings/${item.id}`} className="link-arrow">{item.title}</Link>.
          </p>
          <p>Keep your edit token safe — you'll need it to edit or delete the listing from <Link to="/my-listings">My listings</Link>.</p>
          <div className="token-note" style={{ wordBreak: 'break-all' }}>
            Edit token: <code>{editToken}</code>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to={`/listings/${item.id}`} className="btn btn-primary">View listing</Link>
            <Link to="/my-listings" className="btn btn-outline">Go to My listings</Link>
            <button className="btn btn-outline" onClick={() => setCreated(null)}>List another car</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 860, paddingBottom: 60 }}>
      <div className="detail-top">
        <div className="section-head">
          <div>
            <h1 style={{ fontSize: 28 }}>Sell your car</h1>
            <p>Fill in the details below — your listing goes live immediately and it's free.</p>
          </div>
        </div>
      </div>
      <CarForm
        submitLabel="Publish listing"
        onSubmit={async (data) => {
          const res = await createListing(data);
          saveTokenForListing(res.item.id, res.editToken);
          setCreated(res);
        }}
      />
    </div>
  );
}
