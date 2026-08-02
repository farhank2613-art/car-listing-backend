import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { query, rowToListing, waitForDb } from './db.js';
import { seed } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

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

app.get('/api/meta', async (_req, res, next) => {
  try {
    const makes = (await query(`SELECT make, json_agg(DISTINCT model) AS models, COUNT(*)::int AS count FROM listings GROUP BY make ORDER BY make`)).rows;
    const by = async (col) => (await query(`SELECT DISTINCT ${col} AS v FROM listings WHERE ${col} != '' ORDER BY ${col}`)).rows.map((r) => r.v);
    res.json({
      makes: makes.map((m) => ({ make: m.make, models: (m.models || []).sort(), count: m.count })),
      bodyTypes: await by('body_type'),
      fuelTypes: await by('fuel_type'),
      transmissions: await by('transmission'),
      drivetrains: await by('drivetrain'),
      conditions: await by('condition')
    });
  } catch (e) { next(e); }
});

app.get('/api/listings', async (req, res, next) => {
  try {
    const { q, make, model, minPrice, maxPrice, minYear, maxYear, maxMileage,
            bodyType, fuelType, transmission, drivetrain, condition, sort } = req.query;

    const page = Math.max(1, intParam(req.query.page) || 1);
    const pageSize = Math.min(48, Math.max(1, intParam(req.query.pageSize) || 12));

    const where = [];
    const params = [];
    let idx = 0;

    if (q) {
      const qpat = `%${q}%`;
      params.push(qpat, qpat, qpat, qpat, qpat, qpat);
      idx += 6;
      where.push(`(title ILIKE $${idx-5} OR make ILIKE $${idx-4} OR model ILIKE $${idx-3} OR description ILIKE $${idx-2} OR location ILIKE $${idx-1} OR vin ILIKE $${idx})`);
    }

    const makes = toArr(make);
    if (makes.length) { const ph = makes.map((_, i) => `$${++idx}`).join(','); where.push(`make IN (${ph})`); params.push(...makes); }
    const models = toArr(model);
    if (models.length) { const ph = models.map((_, i) => `$${++idx}`).join(','); where.push(`model IN (${ph})`); params.push(...models); }
    if (intParam(minPrice) !== null) { where.push(`price >= $${++idx}`); params.push(intParam(minPrice)); }
    if (intParam(maxPrice) !== null) { where.push(`price <= $${++idx}`); params.push(intParam(maxPrice)); }
    if (intParam(minYear) !== null) { where.push(`year >= $${++idx}`); params.push(intParam(minYear)); }
    if (intParam(maxYear) !== null) { where.push(`year <= $${++idx}`); params.push(intParam(maxYear)); }
    if (intParam(maxMileage) !== null) { where.push(`mileage <= $${++idx}`); params.push(intParam(maxMileage)); }
    const bodies = toArr(bodyType);
    if (bodies.length) { const ph = bodies.map(() => `$${++idx}`).join(','); where.push(`body_type IN (${ph})`); params.push(...bodies); }
    const fuels = toArr(fuelType);
    if (fuels.length) { const ph = fuels.map(() => `$${++idx}`).join(','); where.push(`fuel_type IN (${ph})`); params.push(...fuels); }
    const trans = toArr(transmission);
    if (trans.length) { const ph = trans.map(() => `$${++idx}`).join(','); where.push(`transmission IN (${ph})`); params.push(...trans); }
    const dts = toArr(drivetrain);
    if (dts.length) { const ph = dts.map(() => `$${++idx}`).join(','); where.push(`drivetrain IN (${ph})`); params.push(...dts); }
    const conds = toArr(condition);
    if (conds.length) { const ph = conds.map(() => `$${++idx}`).join(','); where.push(`condition IN (${ph})`); params.push(...conds); }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sortMap = {
      newest: 'created_at DESC, id DESC',
      price_asc: 'price ASC', price_desc: 'price DESC',
      year_desc: 'year DESC', year_asc: 'year ASC',
      mileage_asc: 'mileage ASC', mileage_desc: 'mileage DESC'
    };
    const orderBy = sortMap[sort] || sortMap.newest;

    const totalRes = await query(`SELECT COUNT(*)::int AS c FROM listings ${whereSql}`, params);
    const total = totalRes.rows[0].c;

    params.push(pageSize, (page - 1) * pageSize);
    const rows = (await query(`SELECT * FROM listings ${whereSql} ORDER BY ${orderBy} LIMIT $${++idx} OFFSET $${++idx}`, params)).rows;

    res.json({ items: rows.map(rowToListing), total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (e) { next(e); }
});

app.get('/api/listings/mine', async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ error: 'Missing edit token.' });
    const rows = (await query('SELECT * FROM listings WHERE edit_token = $1 ORDER BY created_at DESC', [token])).rows;
    res.json({ items: rows.map(rowToListing) });
  } catch (e) { next(e); }
});

app.get('/api/listings/:id', async (req, res, next) => {
  try {
    const id = intParam(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid id.' });
    const { rows } = await query('SELECT * FROM listings WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Listing not found.' });
    await query('UPDATE listings SET views = views + 1 WHERE id = $1', [id]);
    res.json({ item: rowToListing(rows[0]) });
  } catch (e) { next(e); }
});

app.post('/api/listings', async (req, res, next) => {
  try {
    const b = req.body || {};
    const required = ['make', 'model', 'year', 'price', 'mileage', 'bodyType', 'fuelType', 'transmission'];
    const missing = required.filter((k) => b[k] === undefined || b[k] === null || b[k] === '');
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });

    const editToken = randomBytes(16).toString('hex');
    const title = [b.year, b.make, b.model].filter(Boolean).join(' ');

    const { rows } = await query(`
      INSERT INTO listings (title, description, make, model, year, price, mileage, body_type, fuel_type,
        transmission, drivetrain, color, condition, location, vin, features, images,
        seller_name, seller_email, seller_phone, edit_token)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *
    `, [
      title, b.description || '', b.make, b.model, Number(b.year), Number(b.price), Number(b.mileage),
      b.bodyType, b.fuelType, b.transmission, b.drivetrain || '', b.color || '', b.condition || 'Used',
      b.location || '', b.vin || '', JSON.stringify(Array.isArray(b.features) ? b.features.filter(Boolean) : []),
      JSON.stringify(Array.isArray(b.images) ? b.images.filter(Boolean) : []),
      b.sellerName || '', b.sellerEmail || '', b.sellerPhone || '', editToken
    ]);

    res.status(201).json({ item: rowToListing(rows[0]), editToken });
  } catch (e) { next(e); }
});

async function requireToken(req, res) {
  const id = intParam(req.params.id);
  if (id === null) { res.status(400).json({ error: 'Invalid id.' }); return null; }
  const { rows } = await query('SELECT * FROM listings WHERE id = $1', [id]);
  if (!rows[0]) { res.status(404).json({ error: 'Listing not found.' }); return null; }
  const token = (req.headers['x-edit-token'] || req.query.token || '').toString();
  if (!rows[0].edit_token || rows[0].edit_token !== token) {
    res.status(403).json({ error: 'You are not authorized to modify this listing.' }); return null;
  }
  return rows[0];
}

app.put('/api/listings/:id', async (req, res, next) => {
  try {
    const existing = await requireToken(req, res);
    if (!existing) return;
    const b = req.body || {};
    const title = [b.year, b.make, b.model].join(' ');
    const { rows } = await query(`
      UPDATE listings SET title=$1, description=$2, make=$3, model=$4, year=$5, price=$6, mileage=$7,
        body_type=$8, fuel_type=$9, transmission=$10, drivetrain=$11, color=$12, condition=$13,
        location=$14, vin=$15, features=$16, images=$17, seller_name=$18, seller_email=$19, seller_phone=$20
      WHERE id=$21 RETURNING *
    `, [
      title, b.description || '', b.make, b.model, Number(b.year), Number(b.price), Number(b.mileage),
      b.bodyType, b.fuelType, b.transmission, b.drivetrain || '', b.color || '', b.condition || 'Used',
      b.location || '', b.vin || '', JSON.stringify(Array.isArray(b.features) ? b.features.filter(Boolean) : []),
      JSON.stringify(Array.isArray(b.images) ? b.images.filter(Boolean) : []),
      b.sellerName || '', b.sellerEmail || '', b.sellerPhone || '', existing.id
    ]);
    res.json({ item: rowToListing(rows[0]) });
  } catch (e) { next(e); }
});

app.delete('/api/listings/:id', async (req, res, next) => {
  try {
    const existing = await requireToken(req, res);
    if (!existing) return;
    await query('DELETE FROM listings WHERE id = $1', [existing.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.post('/api/listings/:id/inquiries', async (req, res, next) => {
  try {
    const id = intParam(req.params.id);
    if (id === null) return res.status(400).json({ error: 'Invalid id.' });
    const { rows } = await query('SELECT id FROM listings WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ error: 'Listing not found.' });

    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !name.trim() || !email.trim()) return res.status(400).json({ error: 'Name and email are required.' });

    const result = await query(`INSERT INTO leads (listing_id, name, email, phone, message) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [id, name.trim(), email.trim(), (phone || '').trim(), (message || '').trim()]);
    res.status(201).json({ ok: true, id: result.rows[0].id });
  } catch (e) { next(e); }
});

app.get('/api/listings/:id/inquiries', async (req, res, next) => {
  try {
    const existing = await requireToken(req, res);
    if (!existing) return;
    const rows = (await query('SELECT * FROM leads WHERE listing_id = $1 ORDER BY created_at DESC', [existing.id])).rows;
    res.json({ items: rows });
  } catch (e) { next(e); }
});

app.get('/api/placeholder.svg', (req, res) => {
  const text = (req.query.text || 'No Image Available').toString().slice(0, 60);
  const hue = parseInt(req.query.hue || '220', 10) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="hsl(${hue}, 35%, 32%)"/>
    <stop offset="100%" stop-color="hsl(${hue}, 45%, 18%)"/>
  </linearGradient></defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <g fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M160 420 L200 320 Q210 290 240 290 L560 290 Q590 290 600 320 L640 420"/>
    <rect x="140" y="420" width="520" height="45" rx="18"/>
    <path d="M210 470 L210 520 M590 470 L590 520"/>
    <circle cx="250" cy="478" r="52"/><circle cx="550" cy="478" r="52"/>
  </g>
  <circle cx="250" cy="478" r="22" fill="rgba(255,255,255,0.5)"/>
  <circle cx="550" cy="478" r="22" fill="rgba(255,255,255,0.5)"/>
  <text x="400" y="555" font-family="system-ui, sans-serif" font-size="30" fill="rgba(255,255,255,0.85)" text-anchor="middle">${text}</text></svg>`;
  res.type('image/svg+xml').send(svg);
});

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found.' });
  res.sendFile(path.join(clientDist, 'index.html'), (err) => { if (err) res.status(404).send('Not found'); });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function start() {
  await waitForDb();
  await seed();
  app.listen(PORT, () => console.log(`Car Listings API listening on http://localhost:${PORT}`));
}

start().catch((err) => { console.error('Failed to start:', err); process.exit(1); });
