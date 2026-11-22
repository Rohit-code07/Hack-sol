-- Migration: grievances
CREATE TABLE IF NOT EXISTS grievances (
  id TEXT PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  farmer_id TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_grievances_farmer_id ON grievances(farmer_id);