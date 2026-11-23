-- KisanSetu Database Schema Migration V3
-- Target Database: MySQL 8.4 LTS / MySQL 8.0+
-- Purpose: Complete Farmer Data Entry, Forms, Synthetic Demo Registry & Verification Audit Trail

-- 1. Enhance farmers table with comprehensive profile & agricultural attributes
ALTER TABLE farmers
    ADD COLUMN father_spouse_name VARCHAR(150) NULL AFTER farmer_name,
    ADD COLUMN dob DATE NULL AFTER father_spouse_name,
    ADD COLUMN gender VARCHAR(20) DEFAULT 'Male' AFTER dob,
    ADD COLUMN alternate_mobile VARCHAR(15) NULL AFTER mobile_number,
    ADD COLUMN aadhaar_number VARCHAR(20) NULL AFTER alternate_mobile,
    ADD COLUMN category VARCHAR(50) DEFAULT 'General' AFTER aadhaar_number,
    ADD COLUMN address VARCHAR(255) NULL AFTER category,
    ADD COLUMN pin_code VARCHAR(10) NULL AFTER state,
    ADD COLUMN farmer_type VARCHAR(50) DEFAULT 'Individual' AFTER pin_code,
    ADD COLUMN farming_type VARCHAR(50) DEFAULT 'Owner' AFTER farmer_type,
    ADD COLUMN primary_crop VARCHAR(100) DEFAULT 'Paddy' AFTER farming_type,
    ADD COLUMN secondary_crops VARCHAR(255) NULL AFTER primary_crop,
    ADD COLUMN total_land_area DECIMAL(12, 4) DEFAULT 0.0000 AFTER secondary_crops,
    ADD COLUMN irrigation_available BOOLEAN DEFAULT FALSE AFTER total_land_area,
    ADD COLUMN irrigation_type VARCHAR(100) DEFAULT 'Rainfed' AFTER irrigation_available,
    ADD COLUMN soil_type VARCHAR(100) DEFAULT 'Alluvial' AFTER irrigation_type,
    ADD COLUMN documents_json JSON NULL AFTER soil_type,
    ADD COLUMN profile_completion_percentage INT DEFAULT 30 AFTER documents_json;

-- 2. Enhance land_records table
ALTER TABLE land_records
    ADD COLUMN khata_number VARCHAR(50) NULL AFTER khasra_number,
    ADD COLUMN survey_number VARCHAR(50) NULL AFTER khata_number,
    ADD COLUMN owner_name VARCHAR(150) NULL AFTER area_unit,
    ADD COLUMN co_owner_details VARCHAR(255) NULL AFTER owner_name,
    ADD COLUMN irrigation_status VARCHAR(50) DEFAULT 'UNIRRIGATED' AFTER co_owner_details,
    ADD COLUMN land_usage VARCHAR(100) DEFAULT 'AGRICULTURAL' AFTER irrigation_status,
    ADD COLUMN is_mortgaged BOOLEAN DEFAULT FALSE AFTER land_usage,
    ADD COLUMN is_collateral BOOLEAN DEFAULT FALSE AFTER is_mortgaged,
    ADD COLUMN verification_status VARCHAR(50) DEFAULT 'PENDING' AFTER is_collateral,
    ADD COLUMN verification_remarks TEXT NULL AFTER verification_status,
    ADD COLUMN verified_at TIMESTAMP NULL AFTER verification_remarks,
    ADD COLUMN verified_by_officer_id BIGINT NULL AFTER verified_at;

-- 3. Enhance loan_records table
ALTER TABLE loan_records
    ADD COLUMN outstanding_amount DECIMAL(15, 2) DEFAULT 0.00 AFTER disbursed_amount,
    ADD COLUMN loan_purpose VARCHAR(100) DEFAULT 'Crop Production' AFTER outstanding_amount,
    ADD COLUMN crop_season VARCHAR(50) DEFAULT 'Kharif' AFTER loan_purpose,
    ADD COLUMN crop_name VARCHAR(100) DEFAULT 'Paddy' AFTER crop_season,
    ADD COLUMN linked_khasra VARCHAR(100) NULL AFTER crop_name,
    ADD COLUMN subsidy_applied BOOLEAN DEFAULT FALSE AFTER linked_khasra,
    ADD COLUMN subsidy_received BOOLEAN DEFAULT FALSE AFTER subsidy_applied,
    ADD COLUMN subsidy_amount_received DECIMAL(15, 2) DEFAULT 0.00 AFTER subsidy_received,
    ADD COLUMN last_payment_date DATE NULL AFTER subsidy_amount_received,
    ADD COLUMN verification_status VARCHAR(50) DEFAULT 'PENDING' AFTER repayment_status,
    ADD COLUMN duplicate_flag BOOLEAN DEFAULT FALSE AFTER verification_status;

-- 4. Enhance msp_transactions table
ALTER TABLE msp_transactions
    ADD COLUMN crop_variety VARCHAR(100) NULL AFTER crop,
    ADD COLUMN procurement_year VARCHAR(20) DEFAULT '2024' AFTER marketing_season,
    ADD COLUMN expected_production DECIMAL(12, 4) DEFAULT 0.0000 AFTER procurement_year,
    ADD COLUMN total_production DECIMAL(12, 4) DEFAULT 0.0000 AFTER expected_production,
    ADD COLUMN quantity_sold DECIMAL(12, 4) DEFAULT 0.0000 AFTER total_production,
    ADD COLUMN quantity_submitted DECIMAL(12, 4) DEFAULT 0.0000 AFTER quantity_sold,
    ADD COLUMN quantity_rejected DECIMAL(12, 4) DEFAULT 0.0000 AFTER quantity_submitted,
    ADD COLUMN procurement_center_location VARCHAR(150) NULL AFTER procurement_center,
    ADD COLUMN token_number VARCHAR(50) NULL AFTER procurement_center_location,
    ADD COLUMN actual_rate_received DECIMAL(15, 2) DEFAULT 0.00 AFTER applicable_msp,
    ADD COLUMN payment_status VARCHAR(50) DEFAULT 'COMPLETED' AFTER actual_payment,
    ADD COLUMN bank_account_masked VARCHAR(50) NULL AFTER payment_status,
    ADD COLUMN transaction_id VARCHAR(100) NULL AFTER bank_account_masked;

-- 5. Enhance insurance_records table
ALTER TABLE insurance_records
    ADD COLUMN crop_year VARCHAR(20) DEFAULT '2024' AFTER season,
    ADD COLUMN village VARCHAR(100) NULL AFTER crop_year,
    ADD COLUMN block VARCHAR(100) NULL AFTER village,
    ADD COLUMN district VARCHAR(100) NULL AFTER block,
    ADD COLUMN khasra_number VARCHAR(100) NULL AFTER district,
    ADD COLUMN insurance_company VARCHAR(150) DEFAULT 'Agriculture Insurance Company of India' AFTER khasra_number,
    ADD COLUMN application_number VARCHAR(100) NULL AFTER insurance_policy_number,
    ADD COLUMN premium_payment_date DATE NULL AFTER premium_paid,
    ADD COLUMN enrollment_date DATE NULL AFTER premium_payment_date,
    ADD COLUMN claim_type VARCHAR(100) NULL AFTER claim_status,
    ADD COLUMN damage_date DATE NULL AFTER claim_type,
    ADD COLUMN damage_type VARCHAR(100) NULL AFTER damage_date,
    ADD COLUMN damage_description TEXT NULL AFTER damage_type,
    ADD COLUMN estimated_damage_percentage DECIMAL(5, 2) DEFAULT 0.00 AFTER damage_description,
    ADD COLUMN estimated_loss DECIMAL(15, 2) DEFAULT 0.00 AFTER estimated_damage_percentage,
    ADD COLUMN claim_amount DECIMAL(15, 2) DEFAULT 0.00 AFTER estimated_loss,
    ADD COLUMN claim_number VARCHAR(100) NULL AFTER claim_amount,
    ADD COLUMN rejection_reason TEXT NULL AFTER actual_payout;

-- 6. Enhance grievances table
ALTER TABLE grievances
    ADD COLUMN grievance_category VARCHAR(100) DEFAULT 'GENERAL' AFTER discrepancy_id,
    ADD COLUMN department VARCHAR(100) DEFAULT 'Agriculture & Farmers Welfare' AFTER grievance_category,
    ADD COLUMN bank_name VARCHAR(150) NULL AFTER department,
    ADD COLUMN branch_name VARCHAR(150) NULL AFTER bank_name,
    ADD COLUMN related_record_reference VARCHAR(100) NULL AFTER branch_name,
    ADD COLUMN expected_resolution TEXT NULL AFTER grievance_content,
    ADD COLUMN amount_involved DECIMAL(15, 2) DEFAULT 0.00 AFTER expected_resolution,
    ADD COLUMN date_of_incident DATE NULL AFTER amount_involved,
    ADD COLUMN transaction_id VARCHAR(100) NULL AFTER date_of_incident,
    ADD COLUMN priority VARCHAR(20) DEFAULT 'MEDIUM' AFTER transaction_id,
    ADD COLUMN officer_remarks TEXT NULL AFTER grievance_status,
    ADD COLUMN resolution_details TEXT NULL AFTER officer_remarks,
    ADD COLUMN resolved_at TIMESTAMP NULL AFTER resolution_details;

-- 7. Synthetic Land Registry Table (Benchmark for Land Verification Engine)
CREATE TABLE IF NOT EXISTS synthetic_land_registry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    khasra_number VARCHAR(50) NOT NULL,
    khata_number VARCHAR(50) NOT NULL,
    village VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    registered_owner_name VARCHAR(150) NOT NULL,
    land_area DECIMAL(12, 4) NOT NULL,
    area_unit VARCHAR(20) NOT NULL DEFAULT 'ACRE',
    is_mortgaged BOOLEAN NOT NULL DEFAULT FALSE,
    mortgaged_bank_name VARCHAR(150) NULL,
    encumbrance_status VARCHAR(50) NOT NULL DEFAULT 'CLEAR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_synth_land UNIQUE (state, district, tehsil, village, khasra_number),
    INDEX idx_synth_land_khasra (khasra_number, village, district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Synthetic Loan Registry Table (Benchmark for Duplicate Financing Cross-Checks)
CREATE TABLE IF NOT EXISTS synthetic_loan_registry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_account_number VARCHAR(100) NOT NULL UNIQUE,
    bank_name VARCHAR(150) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    khasra_number VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    borrower_name VARCHAR(150) NOT NULL,
    sanctioned_amount DECIMAL(15, 2) NOT NULL,
    outstanding_amount DECIMAL(15, 2) NOT NULL,
    disbursement_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_synth_loan_khasra (khasra_number, village)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. Bank Officer Verification Audit Log Table
CREATE TABLE IF NOT EXISTS verification_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    officer_username VARCHAR(100) NOT NULL,
    record_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    verification_status VARCHAR(50) NOT NULL,
    remarks TEXT NULL,
    reason_for_mismatch TEXT NULL,
    additional_documents_requested VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verif_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
    INDEX idx_verif_records_farmer (farmer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. Seed Demo Synthetic Registry Data
INSERT IGNORE INTO synthetic_land_registry 
(id, khasra_number, khata_number, village, tehsil, district, state, registered_owner_name, land_area, area_unit, is_mortgaged, mortgaged_bank_name, encumbrance_status)
VALUES
(1, '142/1', 'KH-88', 'Arang', 'Arang', 'Raipur', 'Chhattisgarh', 'Ramesh Kumar', 3.5000, 'ACRE', FALSE, NULL, 'CLEAR'),
(2, '142/2', 'KH-88', 'Arang', 'Arang', 'Raipur', 'Chhattisgarh', 'Ramesh Kumar', 2.0000, 'ACRE', TRUE, 'State Bank of India', 'MORTGAGED'),
(3, '205/4', 'KH-102', 'Dhamdha', 'Dhamdha', 'Durg', 'Chhattisgarh', 'Suresh Patel', 4.2500, 'ACRE', FALSE, NULL, 'CLEAR'),
(4, '88/A', 'KH-45', 'Bilha', 'Bilha', 'Bilaspur', 'Chhattisgarh', 'Santosh Sahu', 5.0000, 'ACRE', FALSE, NULL, 'CLEAR');

INSERT IGNORE INTO synthetic_loan_registry
(id, loan_account_number, bank_name, branch_name, khasra_number, village, district, borrower_name, sanctioned_amount, outstanding_amount, disbursement_date, is_active)
VALUES
(1, 'KCC-SBI-2023-8891', 'State Bank of India', 'Raipur Main Branch', '142/2', 'Arang', 'Raipur', 'Ramesh Kumar', 150000.00, 120000.00, '2023-06-15', TRUE),
(2, 'CROP-CRGB-2024-4412', 'Chhattisgarh Rajya Gramin Bank', 'Durg Rural Branch', '205/4', 'Dhamdha', 'Durg', 'Suresh Patel', 200000.00, 185000.00, '2024-05-10', TRUE);
