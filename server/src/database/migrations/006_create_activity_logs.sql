-- Migration: verifications
CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  farmer_id TEXT REFERENCES farmers(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('LAND', 'LOAN')),
  reference TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('VERIFIED', 'MISMATCH', 'NOT_FOUND')),
  notes TEXT,
  checked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_verifications_farmer_id ON verifications(farmer_id);