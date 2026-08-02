import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { db, prepare, rowToListing, safeParse } from './db.js';
import { seed } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

seed();

const PORT = process.env.PORT || 4000;

function toArr(value) {
  if (value === undefined || value === null || value === '') return [];
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

function intParam(value) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'car-listings-api' });
});

app.get('/api/meta', (_req, res) => {
  const makes = prepare(`
    SELECT make, json_group_array(DISTINCT model) AS models, COUNT(*) AS count
    FROM listings GROUP BY make ORDER BY make
  `).all().map((r) => ({ make: r.make, models: safeParse(r.models).sort(), count: r.count }));

  const by = (col) => prepare(`SELECT DISTINCT ${col} AS v FROM listings WHERE ${col} != '' ORDER BY ${col}`).all().map((r) => r.v);

  res.json({
    makes,
    bodyTypes: by('body_type'),
    fuelTypes: by('fuel_type'),
    transmissions: by('transmission'),
    drivetrains: by('drivetrain'),
    conditions: by('condition')
  });
});

app.get('/api/listings', (req, res) => {
  const { q, make, model, minPrice, maxPrice, minYear, maxYear, maxMileage,
          bodyType, fuelType, transmission, drivetrain, condition, sort } = req.query;

  const page = Math.max(1, intParam(req.query.page) || 1);
  const pageSize = Math.min(48, Math.max(1, intParam(req.query.pageSize) || 12));

  const where = [];
  const params = {};

  if (q) {
    where.push('(title LIKE @q OR make LIKE @q OR model LIKE @q OR description LIKE @q OR location LIKE @q OR vin LIKE @q)');
    params.q = `%${q}%`;
  }
  const makes = toArr(make);
  if (makes.length) {
    where.push(`make IN (${makes.map((_, i) => `@make${i}`).join(',')})`);
    makes.forEach((m, i) => (params[`make${i}`] = m));
  }
  const models = toArr(model);
  if (models.length) {
    where.push(`model IN (${models.map((_, i) => `@model${i}`).join(',')})`);
    models.forEach((m, i) => (params[`model${i}`] = m));
  }
  const minP = intParam(minPrice);
  if (minP !== null) { where.push('price >= @minP'); params.minP = minP; }
  const maxP = intParam(maxPrice);
  if (maxP !== null) { where.push('price <= @maxP'); params.maxP = maxP; }
  const minY = intParam(minYear);
  if (minY !== null) { where.push('year >= @minY'); params.minY = minY; }
  const maxY = intParam(maxYear);
  if (maxY !== null) { where.push('year <= @maxY'); params.maxY = maxY; }
  const maxM = intParam(maxMileage);
  if (maxM !== null) { where.push('mileage <= @maxM'); params.maxM = maxM; }
  const bodies = toArr(bodyType);
  if (bodies.length) {
    where.push(`body_type IN (${bodies.map((_, i) => `@body${i}`).join(',')})`);
    bodies.forEach((m, i) => (params[`body${i}`] = m));
  }
  const fuels = toArr(fuelType);
  if (fuels.length) {
    where.push(`fuel_type IN (${fuels.map((_, i) => `@fuel${i}`).join(',')})`);
    fuels.forEach((m, i) => (params[`fuel${i}`] = m));
  }
  const transmissions = toArr(transmission);
  if (transmissions.length) {
    where.push(`transmission IN (${transmissions.map((_, i) => `@trans${i}`).join(',')})`);
    transmissions.forEach((m, i) => (params[`trans${i}`] = m));
  }
  const drivetrains = toArr(drivetrain);
  if (drivetrains.length) {
    where.push(`drivetrain IN (${drivetrains.map((_, i) => `@dt${i}`).join(',')})`);
    drivetrains.forEach((m, i) => (params[`dt${i}`] = m));
  }
  const conditions = toArr(condition);
  if (conditions.length) {
    where.push(`condition IN (${conditions.map((_, i) => `@cond${i}`).join(',')})`);
    conditions.forEach((m, i) => (params[`cond${i}`] = m));
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sortMap = {
    newest: 'created_at DESC, id DESC',
    price_asc: 'price ASC',
    price_desc: 'price DESC',
    year_desc: 'year DESC',
    year_asc: 'year ASC',
    mileage_asc: 'mileage ASC',
    mileage_desc: 'mileage DESC'
  };
  const orderBy = sortMap[sort] || sortMap.newest;

  const total = prepare(`SELECT COUNT(*) AS c FROM listings ${whereSql}`).get(params).c;
  const rows = prepare(`
    SELECT * FROM listings ${whereSql} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset
  `).all({ ...params, limit: pageSize, offset: (page - 1) * pageSize });

  res.json({
    items: rows.map(rowToListing),
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize))
  });
});

app.get('/api/listings/mine', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'Missing edit token.' });
  const rows = prepare('SELECT * FROM listings WHERE edit_token = ? ORDER BY created_at DESC').all(token);
  res.json({ items: rows.map(rowToListing) });
});

app.get('/api/listings/:id', (req, res) => {
  const id = intParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id.' });
  const row = prepare('SELECT * FROM listings WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Listing not found.' });
  prepare('UPDATE listings SET views = views + 1 WHERE id = ?').run(id);
  res.json({ item: rowToListing(row) });
});

function validateListing(body) {
  const required = ['make', 'model', 'year', 'price', 'mileage', 'bodyType', 'fuelType', 'transmission'];
  const missing = required.filter((k) => body[k] === undefined || body[k] === null || body[k] === '');
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`;
  const year = intParam(body.year);
  const price = intParam(body.price);
  const mileage = intParam(body.mileage);
  if (!year || year < 1900 || year > 2100) return 'Invalid year.';
  if (!price || price <= 0) return 'Invalid price.';
  if (mileage === null || mileage < 0) return 'Invalid mileage.';
  return null;
}

app.post('/api/listings', (req, res) => {
  const b = req.body || {};
  const err = validateListing(b);
  if (err) return res.status(400).json({ error: err });

  const editToken = randomBytes(16).toString('hex');
  const title = [b.year, b.make, b.model].filter(Boolean).join(' ');

  const info = prepare(`
    INSERT INTO listings
      (title, description, make, model, year, price, mileage, body_type, fuel_type,
       transmission, drivetrain, color, condition, location, vin, features, images,
       seller_name, seller_email, seller_phone, edit_token)
    VALUES
      (@title, @description, @make, @model, @year, @price, @mileage, @bodyType, @fuelType,
       @transmission, @drivetrain, @color, @condition, @location, @vin, @features, @images,
       @sellerName, @sellerEmail, @sellerPhone, @editToken)
  `).run({
    title,
    description: b.description || '',
    make: b.make,
    model: b.model,
    year: intParam(b.year),
    price: intParam(b.price),
    mileage: intParam(b.mileage),
    bodyType: b.bodyType,
    fuelType: b.fuelType,
    transmission: b.transmission,
    drivetrain: b.drivetrain || '',
    color: b.color || '',
    condition: b.condition || 'Used',
    location: b.location || '',
    vin: b.vin || '',
    features: JSON.stringify(Array.isArray(b.features) ? b.features.filter(Boolean) : []),
    images: JSON.stringify(Array.isArray(b.images) ? b.images.filter(Boolean) : []),
    sellerName: b.sellerName || '',
    sellerEmail: b.sellerEmail || '',
    sellerPhone: b.sellerPhone || '',
    editToken
  });

  const row = prepare('SELECT * FROM listings WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ item: rowToListing(row), editToken });
});

function requireToken(req, res, id) {
  const row = prepare('SELECT * FROM listings WHERE id = ?').get(id);
  if (!row) { res.status(404).json({ error: 'Listing not found.' }); return null; }
  const token = (req.headers['x-edit-token'] || req.query.token || '').toString();
  if (!row.edit_token || row.edit_token !== token) {
    res.status(403).json({ error: 'You are not authorized to modify this listing.' });
    return null;
  }
  return row;
}

app.put('/api/listings/:id', (req, res) => {
  const id = intParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id.' });
  const existing = requireToken(req, res, id);
  if (!existing) return;

  const b = req.body || {};
  const err = validateListing(b);
  if (err) return res.status(400).json({ error: err });

  prepare(`
    UPDATE listings SET
      title = @title, description = @description, make = @make, model = @model,
      year = @year, price = @price, mileage = @mileage, body_type = @bodyType,
      fuel_type = @fuelType, transmission = @transmission, drivetrain = @drivetrain,
      color = @color, condition = @condition, location = @location, vin = @vin,
      features = @features, images = @images, seller_name = @sellerName,
      seller_email = @sellerEmail, seller_phone = @sellerPhone
    WHERE id = @id
  `).run({
    id,
    title: [b.year, b.make, b.model].join(' '),
    description: b.description || '',
    make: b.make,
    model: b.model,
    year: intParam(b.year),
    price: intParam(b.price),
    mileage: intParam(b.mileage),
    bodyType: b.bodyType,
    fuelType: b.fuelType,
    transmission: b.transmission,
    drivetrain: b.drivetrain || '',
    color: b.color || '',
    condition: b.condition || 'Used',
    location: b.location || '',
    vin: b.vin || '',
    features: JSON.stringify(Array.isArray(b.features) ? b.features.filter(Boolean) : []),
    images: JSON.stringify(Array.isArray(b.images) ? b.images.filter(Boolean) : []),
    sellerName: b.sellerName || '',
    sellerEmail: b.sellerEmail || '',
    sellerPhone: b.sellerPhone || ''
  });

  const row = prepare('SELECT * FROM listings WHERE id = ?').get(id);
  res.json({ item: rowToListing(row) });
});

app.delete('/api/listings/:id', (req, res) => {
  const id = intParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id.' });
  const existing = requireToken(req, res, id);
  if (!existing) return;
  prepare('DELETE FROM listings WHERE id = ?').run(id);
  res.json({ ok: true });
});

app.post('/api/listings/:id/inquiries', (req, res) => {
  const id = intParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id.' });
  const row = prepare('SELECT id FROM listings WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Listing not found.' });

  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !name.trim() || !email.trim()) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  const info = prepare(`
    INSERT INTO leads (listing_id, name, email, phone, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name.trim(), email.trim(), (phone || '').trim(), (message || '').trim());

  res.status(201).json({ ok: true, id: info.lastInsertRowid });
});

app.get('/api/listings/:id/inquiries', (req, res) => {
  const id = intParam(req.params.id);
  if (id === null) return res.status(400).json({ error: 'Invalid id.' });
  const existing = requireToken(req, res, id);
  if (!existing) return;
  const rows = prepare('SELECT * FROM leads WHERE listing_id = ? ORDER BY created_at DESC').all(id);
  res.json({ items: rows });
});

app.get('/api/placeholder.svg', (req, res) => {
  const text = (req.query.text || 'No Image Available').toString().slice(0, 60);
  const hue = parseInt(req.query.hue || '220', 10) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue}, 35%, 32%)"/>
      <stop offset="100%" stop-color="hsl(${hue}, 45%, 18%)"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <g fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M160 420 L200 320 Q210 290 240 290 L560 290 Q590 290 600 320 L640 420"/>
    <rect x="140" y="420" width="520" height="45" rx="18"/>
    <path d="M210 470 L210 520 M590 470 L590 520"/>
    <circle cx="250" cy="478" r="52"/>
    <circle cx="550" cy="478" r="52"/>
  </g>
  <circle cx="250" cy="478" r="22" fill="rgba(255,255,255,0.5)"/>
  <circle cx="550" cy="478" r="22" fill="rgba(255,255,255,0.5)"/>
  <text x="400" y="555" font-family="system-ui, sans-serif" font-size="30" fill="rgba(255,255,255,0.85)" text-anchor="middle">${text}</text>
  </svg>`;
  res.type('image/svg+xml').send(svg);
});

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found.' });
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Car Listings API listening on http://localhost:${PORT}`);
});

