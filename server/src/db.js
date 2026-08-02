import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

export async function query(text, params = []) {
  const res = await pool.query(text, params);
  return res;
}

export async function waitForDb(retries = 15, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connection established.');
      return;
    } catch (err) {
      console.log(`Database attempt ${i + 1}/${retries} failed: ${err.code || err.message}`);
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Could not connect to database after retries.');
}

export async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS listings (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      make        TEXT NOT NULL,
      model       TEXT NOT NULL,
      year        INTEGER NOT NULL,
      price       INTEGER NOT NULL,
      mileage     INTEGER NOT NULL,
      body_type   TEXT NOT NULL,
      fuel_type   TEXT NOT NULL,
      transmission TEXT NOT NULL,
      drivetrain  TEXT NOT NULL DEFAULT '',
      color       TEXT NOT NULL DEFAULT '',
      condition   TEXT NOT NULL DEFAULT 'Used',
      location    TEXT NOT NULL DEFAULT '',
      vin         TEXT NOT NULL DEFAULT '',
      features    JSONB NOT NULL DEFAULT '[]',
      images      JSONB NOT NULL DEFAULT '[]',
      seller_name  TEXT NOT NULL DEFAULT '',
      seller_email TEXT NOT NULL DEFAULT '',
      seller_phone TEXT NOT NULL DEFAULT '',
      edit_token  TEXT,
      created_at  INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::INTEGER,
      views       INTEGER NOT NULL DEFAULT 0,
      favorites   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS leads (
      id         SERIAL PRIMARY KEY,
      listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      phone      TEXT NOT NULL DEFAULT '',
      message    TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_listings_make ON listings(make);
    CREATE INDEX IF NOT EXISTS idx_listings_model ON listings(model);
    CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
    CREATE INDEX IF NOT EXISTS idx_listings_year ON listings(year);
    CREATE INDEX IF NOT EXISTS idx_listings_mileage ON listings(mileage);
    CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);
  `);
}

export function rowToListing(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    make: row.make,
    model: row.model,
    year: row.year,
    price: row.price,
    mileage: row.mileage,
    bodyType: row.body_type,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    drivetrain: row.drivetrain,
    color: row.color,
    condition: row.condition,
    location: row.location,
    vin: row.vin,
    features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []),
    images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
    sellerName: row.seller_name,
    sellerEmail: row.seller_email,
    sellerPhone: row.seller_phone,
    createdAt: row.created_at,
    editToken: row.edit_token,
    views: row.views,
    favorites: row.favorites
  };
}
