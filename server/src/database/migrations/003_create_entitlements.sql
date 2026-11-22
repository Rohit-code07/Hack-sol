-- Migration: loans
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  loan_type TEXT NOT NULL,
  sanctioned_amount REAL NOT NULL CHECK (sanctioned_amount >= 0),
  outstanding_amount REAL NOT NULL CHECK (outstanding_amount >= 0),
  loan_status TEXT NOT NULL CHECK (loan_status IN ('ACTIVE', 'CLOSED', 'NPA')),
  disbursed_on TEXT
);

CREATE INDEX IF NOT EXISTS idx_loans_farmer_id ON loans(farmer_id);