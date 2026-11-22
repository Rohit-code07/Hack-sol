-- Migration: entitlements
CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  scheme_code TEXT NOT NULL,
  scheme_name TEXT NOT NULL,
  eligible INTEGER NOT NULL CHECK (eligible IN (0, 1)),
  amount_due REAL NOT NULL DEFAULT 0,
  amount_paid REAL NOT NULL DEFAULT 0,
  last_payment_on TEXT,
  status TEXT NOT NULL,
  UNIQUE (farmer_id, scheme_code)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_farmer_id ON entitlements(farmer_id);