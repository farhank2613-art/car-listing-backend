import { FormEvent, useState } from 'react';
import type { Listing, ListingPayload } from '../types';
import { BODY_TYPES, CONDITIONS, DRIVETRAINS, FUEL_TYPES, TRANSMISSIONS } from '../types';

interface Props {
  initial?: ListingPayload;
  onSubmit: (data: ListingPayload) => Promise<void>;
  submitLabel: string;
}

export function toPayload(listing: Partial<Listing>): ListingPayload {
  return {
    make: String(listing.make ?? ''),
    model: String(listing.model ?? ''),
    year: Number(listing.year ?? new Date().getFullYear()),
    price: Number(listing.price ?? 0),
    mileage: Number(listing.mileage ?? 0),
    bodyType: String(listing.bodyType ?? 'Sedan'),
    fuelType: String(listing.fuelType ?? 'Gasoline'),
    transmission: String(listing.transmission ?? 'Automatic'),
    drivetrain: String(listing.drivetrain ?? ''),
    color: String(listing.color ?? ''),
    condition: String(listing.condition ?? 'Used'),
    location: String(listing.location ?? ''),
    vin: String(listing.vin ?? ''),
    description: String(listing.description ?? ''),
    features: Array.isArray(listing.features) ? listing.features : [],
    images: Array.isArray(listing.images) ? listing.images : [],
    sellerName: String(listing.sellerName ?? ''),
    sellerEmail: String(listing.sellerEmail ?? ''),
    sellerPhone: String(listing.sellerPhone ?? '')
  };
}

const empty: ListingPayload = {
  make: '', model: '', year: new Date().getFullYear(), price: 0, mileage: 0,
  bodyType: 'Sedan', fuelType: 'Gasoline', transmission: 'Automatic', drivetrain: 'AWD',
  color: '', condition: 'Used', location: '', vin: '', description: '',
  features: [], images: [], sellerName: '', sellerEmail: '', sellerPhone: ''
};

export default function CarForm({ initial, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<ListingPayload>(initial ?? empty);
  const [featuresText, setFeaturesText] = useState((initial?.features ?? []).join(', '));
  const [imagesText, setImagesText] = useState((initial?.images ?? []).join('\n'));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ListingPayload, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const required: (keyof ListingPayload)[] = ['make', 'model', 'year', 'price', 'mileage', 'bodyType', 'fuelType', 'transmission'];
    const missing = required.filter((k) => form[k] === '' || form[k] === null || form[k] === undefined);
    if (missing.length) {
      setError('Please fill in all required fields: ' + missing.join(', '));
      return;
    }
    if (form.price <= 0) { setError('Price must be greater than zero.'); return; }
    if (form.year < 1900 || form.year > 2100) { setError('Please enter a valid year.'); return; }
    if (form.mileage < 0) { setError('Mileage cannot be negative.'); return; }

    const data: ListingPayload = {
      ...form,
      features: featuresText.split(',').map((s) => s.trim()).filter(Boolean),
      images: imagesText.split('\n').map((s) => s.trim()).filter(Boolean),
      price: Number(form.price),
      mileage: Number(form.mileage),
      year: Number(form.year)
    };

    setSaving(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 4 }}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="panel">
        <h2>Vehicle details</h2>
        <div className="form-row">
          <div className="form-field">
            <label>Make *</label>
            <input required value={form.make} onChange={(e) => set('make', e.target.value)} placeholder="Toyota" list="makes-list" />
            <datalist id="makes-list">
              {['Audi', 'BMW', 'Chevrolet', 'Ford', 'Honda', 'Hyundai', 'Jeep', 'Kia', 'Lexus', 'Mazda', 'Mercedes-Benz', 'Nissan', 'Porsche', 'RAM', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen'].map((m) => <option key={m} value={m} />)}
            </datalist>
          </div>
          <div className="form-field">
            <label>Model *</label>
            <input required value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Camry" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Year *</label>
            <input type="number" required min={1900} max={2100} value={form.year} onChange={(e) => set('year', e.target.value)} />
          </div>
          <div className="form-field">
            <label>Price (USD) *</label>
            <input type="number" required min={1} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="25000" />
          </div>
          <div className="form-field">
            <label>Mileage *</label>
            <input type="number" required min={0} value={form.mileage} onChange={(e) => set('mileage', e.target.value)} placeholder="30000" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Body type *</label>
            <select value={form.bodyType} onChange={(e) => set('bodyType', e.target.value)}>
              {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Fuel type *</label>
            <select value={form.fuelType} onChange={(e) => set('fuelType', e.target.value)}>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Transmission *</label>
            <select value={form.transmission} onChange={(e) => set('transmission', e.target.value)}>
              {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Drivetrain</label>
            <select value={form.drivetrain} onChange={(e) => set('drivetrain', e.target.value)}>
              <option value="">—</option>
              {DRIVETRAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Color</label>
            <input value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Midnight Blue" />
          </div>
          <div className="form-field">
            <label>Condition</label>
            <select value={form.condition} onChange={(e) => set('condition', e.target.value)}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Location</label>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Austin, TX" />
          </div>
          <div className="form-field">
            <label>VIN</label>
            <input value={form.vin} onChange={(e) => set('vin', e.target.value)} placeholder="1HGCM82633A004352" />
          </div>
        </div>
        <div className="form-field">
          <label>Description</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the car: condition, service history, ownership, extras…" />
        </div>
        <div className="form-field">
          <label>Features (comma separated)</label>
          <input value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder="Heated Seats, Backup Camera, Apple CarPlay" />
        </div>
        <div className="form-field">
          <label>Photo URLs (one per line)</label>
          <textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg" />
        </div>
      </div>

      <div className="panel">
        <h2>Seller contact</h2>
        <div className="form-2col">
          <div className="form-field">
            <label>Name</label>
            <input value={form.sellerName} onChange={(e) => set('sellerName', e.target.value)} placeholder="Jane Doe / ABC Motors" />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input type="email" value={form.sellerEmail} onChange={(e) => set('sellerEmail', e.target.value)} placeholder="jane@email.com" />
          </div>
        </div>
        <div className="form-field">
          <label>Phone</label>
          <input value={form.sellerPhone} onChange={(e) => set('sellerPhone', e.target.value)} placeholder="(555) 000-0000" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
