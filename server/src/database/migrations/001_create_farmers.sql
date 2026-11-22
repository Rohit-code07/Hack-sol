-- Migration: farmers
CREATE TABLE IF NOT EXISTS farmers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  father_name TEXT,
  village TEXT,
  district TEXT,
  state TEXT,
  mobile_masked TEXT,
  bank_account_masked TEXT,
  ifsc TEXT,
  category TEXT NOT NULL CHECK (category IN ('GENERAL', 'SC', 'ST', 'OBC')),
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);