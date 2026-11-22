-- Migration: land_records
CREATE TABLE IF NOT EXISTS land_records (
  id TEXT PRIMARY KEY,
  farmer_id TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  survey_number TEXT NOT NULL,
  area_hectares REAL NOT NULL CHECK (area_hectares >= 0),
  registered_owner_name TEXT NOT NULL,
  ownership_status TEXT NOT NULL,
  crop_type TEXT,
  last_updated TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_land_records_farmer_id ON land_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_land_records_survey_number ON land_records(survey_number);