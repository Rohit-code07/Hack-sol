-- Migration: discrepancies
CREATE TABLE IF NOT EXISTS discrepancies (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  rule_code TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  description TEXT NOT NULL,
  recommended_action TEXT,
  detected_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved INTEGER NOT NULL DEFAULT 0 CHECK (resolved IN (0, 1))
);

CREATE INDEX IF NOT EXISTS idx_discrepancies_farmer_id ON discrepancies(farmer_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_severity ON discrepancies(severity);