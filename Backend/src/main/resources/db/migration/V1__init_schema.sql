-- KisanSetu Database Schema Migration V1
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    farmer_name VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    village VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(20) DEFAULT 'hi',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banks (
    id BIGSERIAL PRIMARY KEY,
    bank_name VARCHAR(150) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL UNIQUE,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS land_records (
    id BIGSERIAL PRIMARY KEY,
    khasra_number VARCHAR(50) NOT NULL,
    village VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    land_area NUMERIC(12, 4) NOT NULL,
    area_unit VARCHAR(20) NOT NULL DEFAULT 'ACRE',
    ownership_status VARCHAR(50) NOT NULL DEFAULT 'CLEAR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_land_geo_identity UNIQUE (state, district, tehsil, village, khasra_number)
);

CREATE TABLE IF NOT EXISTS land_ownership (
    id BIGSERIAL PRIMARY KEY,
    land_record_id BIGINT NOT NULL REFERENCES land_records(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    ownership_type VARCHAR(50) NOT NULL DEFAULT 'INDIVIDUAL',
    ownership_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    valid_from DATE NOT NULL,
    valid_to DATE,
    CONSTRAINT chk_ownership_pct CHECK (ownership_percentage > 0 AND ownership_percentage <= 100.00)
);

CREATE TABLE IF NOT EXISTS mortgages (
    id BIGSERIAL PRIMARY KEY,
    land_record_id BIGINT NOT NULL REFERENCES land_records(id) ON DELETE CASCADE,
    bank_id BIGINT NOT NULL REFERENCES banks(id) ON DELETE RESTRICT,
    mortgage_reference VARCHAR(100) NOT NULL,
    mortgage_amount NUMERIC(15, 2) NOT NULL,
    mortgage_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date DATE NOT NULL,
    release_date DATE
);

CREATE TABLE IF NOT EXISTS loan_records (
    id BIGSERIAL PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    bank_id BIGINT NOT NULL REFERENCES banks(id) ON DELETE RESTRICT,
    loan_account_reference VARCHAR(100) NOT NULL UNIQUE,
    loan_type VARCHAR(50) NOT NULL,
    sanctioned_amount NUMERIC(15, 2) NOT NULL,
    disbursed_amount NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    disbursement_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    repayment_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_transactions (
    id BIGSERIAL PRIMARY KEY,
    loan_id BIGINT NOT NULL REFERENCES loan_records(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS loan_collaterals (
    id BIGSERIAL PRIMARY KEY,
    loan_id BIGINT NOT NULL REFERENCES loan_records(id) ON DELETE CASCADE,
    land_record_id BIGINT NOT NULL REFERENCES land_records(id) ON DELETE CASCADE,
    collateral_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT uq_loan_land UNIQUE (loan_id, land_record_id)
);

CREATE TABLE IF NOT EXISTS scheme_rules (
    id BIGSERIAL PRIMARY KEY,
    scheme_code VARCHAR(50) NOT NULL,
    scheme_name VARCHAR(150) NOT NULL,
    state_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    season VARCHAR(50) NOT NULL DEFAULT 'ALL',
    effective_from DATE NOT NULL,
    effective_to DATE,
    rule_version VARCHAR(50) NOT NULL,
    rule_data JSONB NOT NULL,
    source_url VARCHAR(255),
    source_document VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_scheme_version UNIQUE (scheme_code, state_code, season, rule_version)
);

CREATE TABLE IF NOT EXISTS msp_transactions (
    id BIGSERIAL PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    crop VARCHAR(100) NOT NULL,
    crop_grade VARCHAR(50) NOT NULL DEFAULT 'FAQ',
    marketing_season VARCHAR(50) NOT NULL,
    accepted_quantity NUMERIC(12, 4) NOT NULL,
    quantity_unit VARCHAR(20) NOT NULL DEFAULT 'QUINTAL',
    procurement_center VARCHAR(150) NOT NULL,
    applicable_msp NUMERIC(15, 2) NOT NULL,
    gross_procurement_amount NUMERIC(15, 2) NOT NULL,
    documented_deductions NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_payment NUMERIC(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    payment_date DATE,
    receipt_reference VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS insurance_records (
    id BIGSERIAL PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    scheme_name VARCHAR(150) NOT NULL DEFAULT 'PMFBY',
    crop VARCHAR(100) NOT NULL,
    season VARCHAR(50) NOT NULL,
    insurance_policy_number VARCHAR(100) NOT NULL UNIQUE,
    insured_area NUMERIC(12, 4) NOT NULL,
    sum_insured NUMERIC(15, 2) NOT NULL,
    premium_paid NUMERIC(15, 2) NOT NULL,
    claim_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sanctioned_claim_amount NUMERIC(15, 2),
    actual_payout NUMERIC(15, 2),
    claim_date DATE,
    payment_date DATE
);

CREATE TABLE IF NOT EXISTS entitlement_results (
    id BIGSERIAL PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    scheme_code VARCHAR(50) NOT NULL,
    entitlement_type VARCHAR(50) NOT NULL,
    input_data JSONB NOT NULL,
    expected_amount NUMERIC(15, 2) NOT NULL,
    actual_amount NUMERIC(15, 2) NOT NULL,
    difference_amount NUMERIC(15, 2) NOT NULL,
    calculation_breakdown JSONB NOT NULL,
    rule_version VARCHAR(50) NOT NULL,
    source_reference VARCHAR(255),
    calculation_status VARCHAR(50) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS discrepancies (
    id BIGSERIAL PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    category VARCHAR(60) NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    expected_amount NUMERIC(15, 2),
    actual_amount NUMERIC(15, 2),
    difference_amount NUMERIC(15, 2),
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'DETECTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grievances (
    id BIGSERIAL PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    discrepancy_id BIGINT REFERENCES discrepancies(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    grievance_content TEXT NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'en',
    evidence_checklist TEXT,
    grievance_status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON farmers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_land_geo ON land_records(state, district, tehsil, village);
CREATE INDEX IF NOT EXISTS idx_land_ownership_farmer ON land_ownership(farmer_id);
CREATE INDEX IF NOT EXISTS idx_mortgages_land ON mortgages(land_record_id);
CREATE INDEX IF NOT EXISTS idx_loan_records_farmer ON loan_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_loan_collateral_land ON loan_collaterals(land_record_id);
CREATE INDEX IF NOT EXISTS idx_loan_collateral_loan ON loan_collaterals(loan_id);
CREATE INDEX IF NOT EXISTS idx_scheme_rules_code ON scheme_rules(scheme_code, state_code, season);
CREATE INDEX IF NOT EXISTS idx_msp_farmer ON msp_transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_insurance_farmer ON insurance_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_farmer ON discrepancies(farmer_id);
CREATE INDEX IF NOT EXISTS idx_grievances_farmer ON grievances(farmer_id);
