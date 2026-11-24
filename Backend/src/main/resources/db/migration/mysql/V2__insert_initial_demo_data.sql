-- KisanSetu Master Reference Data Migration V2
-- Target Database: MySQL 8.4 LTS / MySQL 8.0+
-- NOTE: Contains ONLY institutional bank directory and statutory government scheme rules.
-- Zero dummy users or dummy farmers are seeded. All farmer, land, and credit data must be user-created.

-- 1. Institutional Banks Master Directory
INSERT IGNORE INTO banks (id, bank_name, branch_name, ifsc_code, district, state) VALUES
(1, 'State Bank of India', 'Raipur Main Branch', 'SBIN0000461', 'Raipur', 'Chhattisgarh'),
(2, 'Chhattisgarh Rajya Gramin Bank', 'Durg Rural Branch', 'CRGB0001024', 'Durg', 'Chhattisgarh'),
(3, 'Punjab National Bank', 'Bilaspur Branch', 'PUNB0123400', 'Bilaspur', 'Chhattisgarh'),
(4, 'Bank of Baroda', 'Rajnandgaon Branch', 'BARB0RAJNAND', 'Rajnandgaon', 'Chhattisgarh'),
(5, 'HDFC Bank', 'Dhamtari Agriculture Hub', 'HDFC0002891', 'Dhamtari', 'Chhattisgarh');

-- 2. Statutory Government Scheme Rules (KCC MISS, MSP, PMFBY)
INSERT IGNORE INTO scheme_rules (id, scheme_code, scheme_name, state_code, season, effective_from, effective_to, rule_version, rule_data, source_url, source_document, verified_at, verification_status) VALUES
(1, 'KCC_SUBVENTION', 'Modified Interest Subvention Scheme (MISS) 2023-24', 'ALL', 'ALL', '2023-04-01', '2024-03-31', 'v2023.1',
 '{"normalInterestRate": 9.00, "interestSubvention": 2.00, "effectiveBaseRate": 7.00, "promptRepaymentIncentive": 3.00, "effectivePromptRate": 4.00, "maxEligibleAmount": 300000.00, "promptRepaymentGraceDays": 365}',
 'https://agricoop.nic.in/miss-guidelines-2023', 'RBI/2023-24/FIDD.CO.FSD.BC.No.3/05.02.001/2023-24', NOW(), 'VERIFIED'),

(2, 'KCC_SUBVENTION', 'Modified Interest Subvention Scheme (MISS) 2024-25', 'ALL', 'ALL', '2024-04-01', '2025-03-31', 'v2024.1',
 '{"normalInterestRate": 9.00, "interestSubvention": 2.00, "effectiveBaseRate": 7.00, "promptRepaymentIncentive": 3.00, "effectivePromptRate": 4.00, "maxEligibleAmount": 300000.00, "promptRepaymentGraceDays": 365}',
 'https://agricoop.nic.in/miss-guidelines-2024', 'RBI/2024-25/FIDD.CO.FSD.BC.No.2/05.02.001/2024-25', NOW(), 'VERIFIED'),

(3, 'MSP_KHARIF_2023', 'Minimum Support Price Kharif 2023-24', 'ALL', 'KHARIF_2023', '2023-10-01', '2024-03-31', 'v2023.KHARIF',
 '{"rates": {"PADDY_COMMON": 2183.00, "PADDY_GRADE_A": 2203.00, "MAIZE": 2090.00, "SOYABEAN": 4600.00, "COTTON": 6620.00}, "standardDeductionLimitPercent": 2.00}',
 'https://cacp.dacnet.nic.in/msp-kharif-2023', 'Government of India CACP Kharif 2023-24 Price Policy', NOW(), 'VERIFIED'),

(4, 'MSP_KHARIF_2024', 'Minimum Support Price Kharif 2024-25', 'ALL', 'KHARIF_2024', '2024-10-01', '2025-03-31', 'v2024.KHARIF',
 '{"rates": {"PADDY_COMMON": 2300.00, "PADDY_GRADE_A": 2320.00, "MAIZE": 2225.00, "SOYABEAN": 4892.00, "COTTON": 7121.00}, "standardDeductionLimitPercent": 2.00}',
 'https://cacp.dacnet.nic.in/msp-kharif-2024', 'Government of India CACP Kharif 2024-25 Price Policy', NOW(), 'VERIFIED'),

(5, 'MSP_RABI_2023', 'Minimum Support Price Rabi 2023-24', 'ALL', 'RABI_2023', '2023-11-01', '2024-05-31', 'v2023.RABI',
 '{"rates": {"WHEAT": 2275.00, "GRAM": 5440.00, "MUSTARD": 5650.00, "BARLEY": 1850.00}, "standardDeductionLimitPercent": 1.50}',
 'https://cacp.dacnet.nic.in/msp-rabi-2023', 'CACP Rabi 2023-24 Notification', NOW(), 'VERIFIED'),

(6, 'PMFBY_RECONCILIATION', 'Pradhan Mantri Fasal Bima Yojana Rules 2023-24', 'CG', 'KHARIF_2023', '2023-06-01', '2024-05-31', 'v2023.PMFBY.CG',
 '{"claimSettlementGraceDays": 21, "requireOfficialSanctionOrder": true, "auditUnderpaymentThreshold": 100.00}',
 'https://pmfby.gov.in/guidelines-2023', 'PMFBY Operational Guidelines Rev. IV', NOW(), 'VERIFIED');
