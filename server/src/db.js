import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'cars.db'));
db.exec('PRAGMA journal_mode = WAL');

export function prepare(sql) {
  const st = db.prepare(sql);
  st.setAllowBareNamedParameters(true);
  return st;
}

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
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
      features    TEXT NOT NULL DEFAULT '[]',
      images      TEXT NOT NULL DEFAULT '[]',
      seller_name  TEXT NOT NULL DEFAULT '',
      seller_email TEXT NOT NULL DEFAULT '',
      seller_phone TEXT NOT NULL DEFAULT '',
      edit_token  TEXT,
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      views       INTEGER NOT NULL DEFAULT 0,
      favorites   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS leads (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      phone      TEXT NOT NULL DEFAULT '',
      message    TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_listings_make ON listings(make);
    CREATE INDEX IF NOT EXISTS idx_listings_model ON listings(model);
    CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
    CREATE INDEX IF NOT EXISTS idx_listings_year ON listings(year);
    CREATE INDEX IF NOT EXISTS idx_listings_mileage ON listings(mileage);
    CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);
  `);
}

export function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function rowToListing(row) {
  if (!row) return null;
  return {
    ...row,
    features: safeParse(row.features),
    images: safeParse(row.images),
    createdAt: row.created_at,
    editToken: row.edit_token
  };
}

migrate();
