-- KisanSetu Database Schema Migration V1
-- Target Database: MySQL 8.4 LTS / MySQL 8.0+

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS farmers (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    user_id BIGINT UNIQUE,
    farmer_name VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    village VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(20) DEFAULT 'hi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_farmers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS banks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(150) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL UNIQUE,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS land_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    khasra_number VARCHAR(50) NOT NULL,
    village VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    land_area DECIMAL(12, 4) NOT NULL,
    area_unit VARCHAR(20) NOT NULL DEFAULT 'ACRE',
    ownership_status VARCHAR(50) NOT NULL DEFAULT 'CLEAR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_land_geo_identity UNIQUE (state, district, tehsil, village, khasra_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS land_ownership (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    land_record_id BIGINT NOT NULL,
    farmer_id VARCHAR(36) NOT NULL,
    ownership_type VARCHAR(50) NOT NULL DEFAULT 'INDIVIDUAL',
    ownership_percentage DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    valid_from DATE NOT NULL,
    valid_to DATE,
    CONSTRAINT fk_ownership_land FOREIGN KEY (land_record_id) REFERENCES land_records(id) ON DELETE CASCADE,
    CONSTRAINT fk_ownership_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
    CONSTRAINT chk_ownership_pct CHECK (ownership_percentage > 0 AND ownership_percentage <= 100.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS mortgages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    land_record_id BIGINT NOT NULL,
    bank_id BIGINT NOT NULL,
    mortgage_reference VARCHAR(100) NOT NULL,
    mortgage_amount DECIMAL(15, 2) NOT NULL,
    mortgage_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date DATE NOT NULL,
    release_date DATE,
    CONSTRAINT fk_mortgages_land FOREIGN KEY (land_record_id) REFERENCES land_records(id) ON DELETE CASCADE,
    CONSTRAINT fk_mortgages_bank FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS loan_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    bank_id BIGINT NOT NULL,
    loan_account_reference VARCHAR(100) NOT NULL UNIQUE,
    loan_type VARCHAR(50) NOT NULL,
    sanctioned_amount DECIMAL(15, 2) NOT NULL,
    disbursed_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    disbursement_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    repayment_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_loans_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_loans_bank FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS loan_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT fk_tx_loan FOREIGN KEY (loan_id) REFERENCES loan_records(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS loan_collaterals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    land_record_id BIGINT NOT NULL,
    collateral_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_collateral_loan FOREIGN KEY (loan_id) REFERENCES loan_records(id) ON DELETE CASCADE,
    CONSTRAINT fk_collateral_land FOREIGN KEY (land_record_id) REFERENCES land_records(id) ON DELETE CASCADE,
    CONSTRAINT uq_loan_land UNIQUE (loan_id, land_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS scheme_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scheme_code VARCHAR(50) NOT NULL,
    scheme_name VARCHAR(150) NOT NULL,
    state_code VARCHAR(20) NOT NULL DEFAULT 'ALL',
    season VARCHAR(50) NOT NULL DEFAULT 'ALL',
    effective_from DATE NOT NULL,
    effective_to DATE,
    rule_version VARCHAR(50) NOT NULL,
    rule_data JSON NOT NULL,
    source_url VARCHAR(255),
    source_document VARCHAR(255),
    verified_at TIMESTAMP NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_scheme_version UNIQUE (scheme_code, state_code, season, rule_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS msp_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    crop_grade VARCHAR(50) NOT NULL DEFAULT 'FAQ',
    marketing_season VARCHAR(50) NOT NULL,
    accepted_quantity DECIMAL(12, 4) NOT NULL,
    quantity_unit VARCHAR(20) NOT NULL DEFAULT 'QUINTAL',
    procurement_center VARCHAR(150) NOT NULL,
    applicable_msp DECIMAL(15, 2) NOT NULL,
    gross_procurement_amount DECIMAL(15, 2) NOT NULL,
    documented_deductions DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    actual_payment DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    payment_date DATE,
    receipt_reference VARCHAR(100) NOT NULL UNIQUE,
    CONSTRAINT fk_msp_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS insurance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    scheme_name VARCHAR(150) NOT NULL DEFAULT 'PMFBY',
    crop VARCHAR(100) NOT NULL,
    season VARCHAR(50) NOT NULL,
    insurance_policy_number VARCHAR(100) NOT NULL UNIQUE,
    insured_area DECIMAL(12, 4) NOT NULL,
    sum_insured DECIMAL(15, 2) NOT NULL,
    premium_paid DECIMAL(15, 2) NOT NULL,
    claim_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    sanctioned_claim_amount DECIMAL(15, 2),
    actual_payout DECIMAL(15, 2),
    claim_date DATE,
    payment_date DATE,
    CONSTRAINT fk_insurance_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS entitlement_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    scheme_code VARCHAR(50) NOT NULL,
    entitlement_type VARCHAR(50) NOT NULL,
    input_data JSON NOT NULL,
    expected_amount DECIMAL(15, 2) NOT NULL,
    actual_amount DECIMAL(15, 2) NOT NULL,
    difference_amount DECIMAL(15, 2) NOT NULL,
    calculation_breakdown JSON NOT NULL,
    rule_version VARCHAR(50) NOT NULL,
    source_reference VARCHAR(255),
    calculation_status VARCHAR(50) NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_entitlement_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS discrepancies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    category VARCHAR(60) NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    expected_amount DECIMAL(15, 2),
    actual_amount DECIMAL(15, 2),
    difference_amount DECIMAL(15, 2),
    severity VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'DETECTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_discrepancies_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS grievances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    discrepancy_id BIGINT NULL,
    subject VARCHAR(255) NOT NULL,
    grievance_content TEXT NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'en',
    evidence_checklist TEXT,
    grievance_status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grievances_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
    CONSTRAINT fk_grievances_discrepancy FOREIGN KEY (discrepancy_id) REFERENCES discrepancies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Indexes for performance
CREATE INDEX idx_farmers_mobile ON farmers(mobile_number);
CREATE INDEX idx_land_geo ON land_records(state, district, tehsil, village);
CREATE INDEX idx_land_ownership_farmer ON land_ownership(farmer_id);
CREATE INDEX idx_mortgages_land ON mortgages(land_record_id);
CREATE INDEX idx_loan_records_farmer ON loan_records(farmer_id);
CREATE INDEX idx_loan_collateral_land ON loan_collaterals(land_record_id);
CREATE INDEX idx_loan_collateral_loan ON loan_collaterals(loan_id);
CREATE INDEX idx_scheme_rules_code ON scheme_rules(scheme_code, state_code, season);
CREATE INDEX idx_msp_farmer ON msp_transactions(farmer_id);
CREATE INDEX idx_insurance_farmer ON insurance_records(farmer_id);
CREATE INDEX idx_discrepancies_farmer ON discrepancies(farmer_id);
CREATE INDEX idx_grievances_farmer ON grievances(farmer_id);
