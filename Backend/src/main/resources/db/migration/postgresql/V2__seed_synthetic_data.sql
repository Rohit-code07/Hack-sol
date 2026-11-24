-- KisanSetu Synthetic Demo Seed Data Migration V2
-- Password for demo users: "password123" (BCrypt: $2a$10$65RYC1c9Zw3h6z7eP8yogec9x.rjd/qpEfBRlZyctxjcGSXCkOyH2)

-- 1. Demo Users
INSERT INTO users (id, username, password_hash, role, enabled, created_at) VALUES
(1, 'farmer_ramesh', '$2a$10$65RYC1c9Zw3h6z7eP8yogec9x.rjd/qpEfBRlZyctxjcGSXCkOyH2', 'FARMER', true, NOW()),
(2, 'bank_officer_sharma', '$2a$10$65RYC1c9Zw3h6z7eP8yogec9x.rjd/qpEfBRlZyctxjcGSXCkOyH2', 'BANK_OFFICER', true, NOW()),
(3, 'farmer_suresh', '$2a$10$65RYC1c9Zw3h6z7eP8yogec9x.rjd/qpEfBRlZyctxjcGSXCkOyH2', 'FARMER', true, NOW()),
(4, 'farmer_anita', '$2a$10$65RYC1c9Zw3h6z7eP8yogec9x.rjd/qpEfBRlZyctxjcGSXCkOyH2', 'FARMER', true, NOW())
ON CONFLICT (username) DO NOTHING;

-- 2. Synthetic Banks (5+ banks)
INSERT INTO banks (id, bank_name, branch_name, ifsc_code, district, state) VALUES
(1, 'State Bank of India', 'Raipur Main Branch', 'SBIN0000461', 'Raipur', 'Chhattisgarh'),
(2, 'Chhattisgarh Rajya Gramin Bank', 'Durg Rural Branch', 'CRGB0001024', 'Durg', 'Chhattisgarh'),
(3, 'Punjab National Bank', 'Bilaspur Branch', 'PUNB0123400', 'Bilaspur', 'Chhattisgarh'),
(4, 'Bank of Baroda', 'Rajnandgaon Branch', 'BARB0RAJNAND', 'Rajnandgaon', 'Chhattisgarh'),
(5, 'HDFC Bank', 'Dhamtari Agriculture Hub', 'HDFC0002891', 'Dhamtari', 'Chhattisgarh')
ON CONFLICT (ifsc_code) DO NOTHING;

-- 3. Synthetic Farmers (30+ farmers)
-- We use fixed UUIDs for demo farmers for deterministic testing
INSERT INTO farmers (id, user_id, farmer_name, mobile_number, village, tehsil, district, state, preferred_language) VALUES
('a0000000-0000-0000-0000-000000000001', 1, 'Ramesh Kumar Patel', '9827100001', 'Arang', 'Arang', 'Raipur', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000002', 3, 'Suresh Chandra Verma', '9827100002', 'Patan', 'Patan', 'Durg', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000003', 4, 'Anita Bai Sahu', '9827100003', 'Kota', 'Kota', 'Bilaspur', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000004', NULL, 'Dhananjay Singh', '9827100004', 'Dongargaon', 'Dongargaon', 'Rajnandgaon', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000005', NULL, 'Lakhan Lal Yadav', '9827100005', 'Kurud', 'Kurud', 'Dhamtari', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000006', NULL, 'Komal Prasad Dewangan', '9827100006', 'Abhanpur', 'Abhanpur', 'Raipur', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000007', NULL, 'Bhagwati Charan Nishad', '9827100007', 'Gunderdehi', 'Gunderdehi', 'Balod', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000008', NULL, 'Radha Devi Netam', '9827100008', 'Nagri', 'Nagri', 'Dhamtari', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000009', NULL, 'Santosh Kumar Markam', '9827100009', 'Takhatpur', 'Takhatpur', 'Bilaspur', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000010', NULL, 'Puran Lal Soni', '9827100010', 'Bemetara', 'Bemetara', 'Bemetara', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000011', NULL, 'Govind Ram Rathore', '9827100011', 'Masturi', 'Masturi', 'Bilaspur', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000012', NULL, 'Kamla Bai Sen', '9827100012', 'Simga', 'Simga', 'Baloda Bazar', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000013', NULL, 'Chhedilal Kurmi', '9827100013', 'Tilda', 'Tilda', 'Raipur', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000014', NULL, 'Ganga Ram Dhruw', '9827100014', 'Chhuria', 'Chhuria', 'Rajnandgaon', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000015', NULL, 'Kalyan Singh Thakur', '9827100015', 'Bodla', 'Bodla', 'Kabirdham', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000016', NULL, 'Tribhuvan Kashyap', '9827100016', 'Bilha', 'Bilha', 'Bilaspur', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000017', NULL, 'Rukmani Bai Chandrakar', '9827100017', 'Mahasamund', 'Mahasamund', 'Mahasamund', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000018', NULL, 'Jagdish Prasad Kaushik', '9827100018', 'Pendra', 'Pendra', 'Gaurela-Pendra-Marwahi', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000019', NULL, 'Nand Kumar Gond', '9827100019', 'Lormi', 'Lormi', 'Mungeli', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000020', NULL, 'Phool Bai Maravi', '9827100020', 'Marwahi', 'Marwahi', 'Gaurela-Pendra-Marwahi', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000021', NULL, 'Rajendra Prasad Agrawal', '9827100021', 'Bhatapara', 'Bhatapara', 'Baloda Bazar', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000022', NULL, 'Gajendra Verma', '9827100022', 'Dhamdha', 'Dhamdha', 'Durg', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000023', NULL, 'Babulal Jaiswal', '9827100023', 'Saja', 'Saja', 'Bemetara', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000024', NULL, 'Shanti Devi Baghel', '9827100024', 'Berla', 'Berla', 'Bemetara', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000025', NULL, 'Mohan Lal Sinha', '9827100025', 'Magarlod', 'Magarlod', 'Dhamtari', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000026', NULL, 'Dukhiram Manjhi', '9827100026', 'Fingeshwar', 'Fingeshwar', 'Gariaband', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000027', NULL, 'Savita Bai Halba', '9827100027', 'Chhuria', 'Chhuria', 'Rajnandgaon', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000028', NULL, 'Bisahu Ram Tandon', '9827100028', 'Palari', 'Palari', 'Baloda Bazar', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000029', NULL, 'Hemant Kumar Banjare', '9827100029', 'Kasdol', 'Kasdol', 'Baloda Bazar', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000030', NULL, 'Tulsiram Mandavi', '9827100030', 'Ambagarh Chowki', 'Mohla', 'Mohla-Manpur', 'Chhattisgarh', 'hi'),
('a0000000-0000-0000-0000-000000000031', NULL, 'Devki Bai Korram', '9827100031', 'Manpur', 'Manpur', 'Mohla-Manpur', 'Chhattisgarh', 'hi')
ON CONFLICT (mobile_number) DO NOTHING;

-- 4. Synthetic Scheme Rules (KCC, MSP, PMFBY) with versioning
INSERT INTO scheme_rules (id, scheme_code, scheme_name, state_code, season, effective_from, effective_to, rule_version, rule_data, source_url, source_document, verified_at, verification_status) VALUES
(1, 'KCC_SUBVENTION', 'Modified Interest Subvention Scheme (MISS) 2023-24', 'ALL', 'ALL', '2023-04-01', '2024-03-31', 'v2023.1',
 '{"normalInterestRate": 9.00, "interestSubvention": 2.00, "effectiveBaseRate": 7.00, "promptRepaymentIncentive": 3.00, "effectivePromptRate": 4.00, "maxEligibleAmount": 300000.00, "promptRepaymentGraceDays": 365}'::jsonb,
 'https://agricoop.nic.in/miss-guidelines-2023', 'RBI/2023-24/FIDD.CO.FSD.BC.No.3/05.02.001/2023-24', NOW(), 'VERIFIED'),

(2, 'KCC_SUBVENTION', 'Modified Interest Subvention Scheme (MISS) 2024-25', 'ALL', 'ALL', '2024-04-01', '2025-03-31', 'v2024.1',
 '{"normalInterestRate": 9.00, "interestSubvention": 2.00, "effectiveBaseRate": 7.00, "promptRepaymentIncentive": 3.00, "effectivePromptRate": 4.00, "maxEligibleAmount": 300000.00, "promptRepaymentGraceDays": 365}'::jsonb,
 'https://agricoop.nic.in/miss-guidelines-2024', 'RBI/2024-25/FIDD.CO.FSD.BC.No.2/05.02.001/2024-25', NOW(), 'VERIFIED'),

(3, 'MSP_KHARIF_2023', 'Minimum Support Price Kharif 2023-24', 'ALL', 'KHARIF_2023', '2023-10-01', '2024-03-31', 'v2023.KHARIF',
 '{"rates": {"PADDY_COMMON": 2183.00, "PADDY_GRADE_A": 2203.00, "MAIZE": 2090.00, "SOYABEAN": 4600.00, "COTTON": 6620.00}, "standardDeductionLimitPercent": 2.00}'::jsonb,
 'https://cacp.dacnet.nic.in/msp-kharif-2023', 'Government of India CACP Kharif 2023-24 Price Policy', NOW(), 'VERIFIED'),

(4, 'MSP_KHARIF_2024', 'Minimum Support Price Kharif 2024-25', 'ALL', 'KHARIF_2024', '2024-10-01', '2025-03-31', 'v2024.KHARIF',
 '{"rates": {"PADDY_COMMON": 2300.00, "PADDY_GRADE_A": 2320.00, "MAIZE": 2225.00, "SOYABEAN": 4892.00, "COTTON": 7121.00}, "standardDeductionLimitPercent": 2.00}'::jsonb,
 'https://cacp.dacnet.nic.in/msp-kharif-2024', 'Government of India CACP Kharif 2024-25 Price Policy', NOW(), 'VERIFIED'),

(5, 'MSP_RABI_2023', 'Minimum Support Price Rabi 2023-24', 'ALL', 'RABI_2023', '2023-11-01', '2024-05-31', 'v2023.RABI',
 '{"rates": {"WHEAT": 2275.00, "GRAM": 5440.00, "MUSTARD": 5650.00, "BARLEY": 1850.00}, "standardDeductionLimitPercent": 1.50}'::jsonb,
 'https://cacp.dacnet.nic.in/msp-rabi-2023', 'CACP Rabi 2023-24 Notification', NOW(), 'VERIFIED'),

(6, 'PMFBY_RECONCILIATION', 'Pradhan Mantri Fasal Bima Yojana Rules 2023-24', 'CG', 'KHARIF_2023', '2023-06-01', '2024-05-31', 'v2023.PMFBY.CG',
 '{"claimSettlementGraceDays": 21, "requireOfficialSanctionOrder": true, "auditUnderpaymentThreshold": 100.00}'::jsonb,
 'https://pmfby.gov.in/guidelines-2023', 'PMFBY Operational Guidelines Rev. IV', NOW(), 'VERIFIED')
ON CONFLICT (scheme_code, state_code, season, rule_version) DO NOTHING;

-- 5. Synthetic Land Records (40+ land parcels across districts)
-- Note: Demonstrates composite geographical uniqueness (State+District+Tehsil+Village+Khasra)
INSERT INTO land_records (id, khasra_number, village, tehsil, district, state, land_area, area_unit, ownership_status) VALUES
(1, '104/1', 'Arang', 'Arang', 'Raipur', 'Chhattisgarh', 2.5000, 'ACRE', 'CLEAR'),
(2, '104/2', 'Arang', 'Arang', 'Raipur', 'Chhattisgarh', 1.8000, 'ACRE', 'CLEAR'),
(3, '215/3', 'Arang', 'Arang', 'Raipur', 'Chhattisgarh', 3.2000, 'ACRE', 'MORTGAGED'),
(4, '88/1', 'Patan', 'Patan', 'Durg', 'Chhattisgarh', 4.0000, 'ACRE', 'CLEAR'),
(5, '88/2', 'Patan', 'Patan', 'Durg', 'Chhattisgarh', 2.2000, 'ACRE', 'MORTGAGED'),
(6, '15/1', 'Kota', 'Kota', 'Bilaspur', 'Chhattisgarh', 5.5000, 'ACRE', 'CLEAR'),
(7, '15/2', 'Kota', 'Kota', 'Bilaspur', 'Chhattisgarh', 3.1000, 'ACRE', 'CLEAR'),
(8, '42/1', 'Dongargaon', 'Dongargaon', 'Rajnandgaon', 'Chhattisgarh', 3.5000, 'ACRE', 'MORTGAGED'),
(9, '42/2', 'Dongargaon', 'Dongargaon', 'Rajnandgaon', 'Chhattisgarh', 1.5000, 'ACRE', 'CLEAR'),
(10, '73/1', 'Kurud', 'Kurud', 'Dhamtari', 'Chhattisgarh', 4.2000, 'ACRE', 'CLEAR'),
(11, '104/1', 'Patan', 'Patan', 'Durg', 'Chhattisgarh', 2.8000, 'ACRE', 'CLEAR'), -- Same khasra 104/1, but Patan/Durg!
(12, '104/1', 'Kota', 'Kota', 'Bilaspur', 'Chhattisgarh', 3.0000, 'ACRE', 'CLEAR'), -- Same khasra 104/1, but Kota/Bilaspur!
(13, '55/3', 'Abhanpur', 'Abhanpur', 'Raipur', 'Chhattisgarh', 3.4000, 'ACRE', 'CLEAR'),
(14, '91/2', 'Gunderdehi', 'Gunderdehi', 'Balod', 'Chhattisgarh', 2.1000, 'ACRE', 'CLEAR'),
(15, '112/4', 'Nagri', 'Nagri', 'Dhamtari', 'Chhattisgarh', 6.0000, 'ACRE', 'CLEAR'),
(16, '64/1', 'Takhatpur', 'Takhatpur', 'Bilaspur', 'Chhattisgarh', 2.9000, 'ACRE', 'CLEAR'),
(17, '33/2', 'Bemetara', 'Bemetara', 'Bemetara', 'Chhattisgarh', 4.5000, 'ACRE', 'CLEAR'),
(18, '77/1', 'Masturi', 'Masturi', 'Bilaspur', 'Chhattisgarh', 3.8000, 'ACRE', 'CLEAR'),
(19, '120/1', 'Simga', 'Simga', 'Baloda Bazar', 'Chhattisgarh', 2.3000, 'ACRE', 'CLEAR'),
(20, '45/3', 'Tilda', 'Tilda', 'Raipur', 'Chhattisgarh', 3.7000, 'ACRE', 'CLEAR'),
(21, '83/1', 'Chhuria', 'Chhuria', 'Rajnandgaon', 'Chhattisgarh', 5.1000, 'ACRE', 'CLEAR'),
(22, '19/2', 'Bodla', 'Bodla', 'Kabirdham', 'Chhattisgarh', 4.0000, 'ACRE', 'CLEAR'),
(23, '140/5', 'Bilha', 'Bilha', 'Bilaspur', 'Chhattisgarh', 3.2000, 'ACRE', 'CLEAR'),
(24, '61/1', 'Mahasamund', 'Mahasamund', 'Mahasamund', 'Chhattisgarh', 2.7000, 'ACRE', 'CLEAR'),
(25, '85/2', 'Pendra', 'Pendra', 'Gaurela-Pendra-Marwahi', 'Chhattisgarh', 4.6000, 'ACRE', 'CLEAR'),
(26, '29/3', 'Lormi', 'Lormi', 'Mungeli', 'Chhattisgarh', 3.3000, 'ACRE', 'CLEAR'),
(27, '99/1', 'Marwahi', 'Marwahi', 'Gaurela-Pendra-Marwahi', 'Chhattisgarh', 5.0000, 'ACRE', 'CLEAR'),
(28, '108/2', 'Bhatapara', 'Bhatapara', 'Baloda Bazar', 'Chhattisgarh', 3.9000, 'ACRE', 'CLEAR'),
(29, '52/4', 'Dhamdha', 'Dhamdha', 'Durg', 'Chhattisgarh', 2.4000, 'ACRE', 'CLEAR'),
(30, '74/1', 'Saja', 'Saja', 'Bemetara', 'Chhattisgarh', 4.8000, 'ACRE', 'CLEAR'),
(31, '63/2', 'Berla', 'Berla', 'Bemetara', 'Chhattisgarh', 3.1000, 'ACRE', 'CLEAR'),
(32, '37/1', 'Magarlod', 'Magarlod', 'Dhamtari', 'Chhattisgarh', 2.9000, 'ACRE', 'CLEAR'),
(33, '81/3', 'Fingeshwar', 'Fingeshwar', 'Gariaband', 'Chhattisgarh', 4.3000, 'ACRE', 'CLEAR'),
(34, '115/2', 'Chhuria', 'Chhuria', 'Rajnandgaon', 'Chhattisgarh', 3.6000, 'ACRE', 'CLEAR'),
(35, '22/1', 'Palari', 'Palari', 'Baloda Bazar', 'Chhattisgarh', 2.8000, 'ACRE', 'CLEAR'),
(36, '94/4', 'Kasdol', 'Kasdol', 'Baloda Bazar', 'Chhattisgarh', 5.2000, 'ACRE', 'CLEAR'),
(37, '58/2', 'Ambagarh Chowki', 'Mohla', 'Mohla-Manpur', 'Chhattisgarh', 3.5000, 'ACRE', 'CLEAR'),
(38, '71/3', 'Manpur', 'Manpur', 'Mohla-Manpur', 'Chhattisgarh', 4.1000, 'ACRE', 'CLEAR'),
(39, '101/1', 'Arang', 'Arang', 'Raipur', 'Chhattisgarh', 1.9000, 'ACRE', 'CLEAR'),
(40, '102/2', 'Arang', 'Arang', 'Raipur', 'Chhattisgarh', 2.6000, 'ACRE', 'CLEAR'),
(41, '103/3', 'Arang', 'Arang', 'Raipur', 'Chhattisgarh', 3.0000, 'ACRE', 'CLEAR')
ON CONFLICT (state, district, tehsil, village, khasra_number) DO NOTHING;

-- 6. Land Ownership Links
INSERT INTO land_ownership (id, land_record_id, farmer_id, ownership_type, ownership_percentage, valid_from) VALUES
(1, 1, 'a0000000-0000-0000-0000-000000000001', 'INDIVIDUAL', 100.00, '2015-01-01'),
(2, 2, 'a0000000-0000-0000-0000-000000000001', 'INDIVIDUAL', 100.00, '2018-05-10'),
(3, 3, 'a0000000-0000-0000-0000-000000000001', 'INDIVIDUAL', 100.00, '2019-03-15'),
(4, 4, 'a0000000-0000-0000-0000-000000000002', 'INDIVIDUAL', 100.00, '2016-07-20'),
(5, 5, 'a0000000-0000-0000-0000-000000000002', 'INDIVIDUAL', 100.00, '2017-11-05'),
(6, 6, 'a0000000-0000-0000-0000-000000000003', 'INDIVIDUAL', 100.00, '2014-02-12'),
(7, 7, 'a0000000-0000-0000-0000-000000000003', 'INDIVIDUAL', 100.00, '2020-01-25'),
(8, 8, 'a0000000-0000-0000-0000-000000000004', 'INDIVIDUAL', 100.00, '2015-08-30'),
(9, 9, 'a0000000-0000-0000-0000-000000000004', 'INDIVIDUAL', 100.00, '2018-04-18'),
(10, 10, 'a0000000-0000-0000-0000-000000000005', 'INDIVIDUAL', 100.00, '2016-12-01'),
(11, 11, 'a0000000-0000-0000-0000-000000000006', 'INDIVIDUAL', 100.00, '2019-09-09'),
(12, 12, 'a0000000-0000-0000-0000-000000000007', 'INDIVIDUAL', 100.00, '2017-03-14'),
(13, 13, 'a0000000-0000-0000-0000-000000000008', 'INDIVIDUAL', 100.00, '2018-06-21'),
(14, 14, 'a0000000-0000-0000-0000-000000000009', 'INDIVIDUAL', 100.00, '2015-10-10'),
(15, 15, 'a0000000-0000-0000-0000-000000000010', 'INDIVIDUAL', 100.00, '2014-05-15'),
(16, 16, 'a0000000-0000-0000-0000-000000000011', 'INDIVIDUAL', 100.00, '2016-08-20'),
(17, 17, 'a0000000-0000-0000-0000-000000000012', 'INDIVIDUAL', 100.00, '2017-12-11'),
(18, 18, 'a0000000-0000-0000-0000-000000000013', 'INDIVIDUAL', 100.00, '2019-04-05'),
(19, 19, 'a0000000-0000-0000-0000-000000000014', 'INDIVIDUAL', 100.00, '2018-02-17'),
(20, 20, 'a0000000-0000-0000-0000-000000000015', 'INDIVIDUAL', 100.00, '2015-09-29')
ON CONFLICT DO NOTHING;

-- 7. Mortgages (Demonstrating SCENARIO 3: Active Mortgages)
INSERT INTO mortgages (id, land_record_id, bank_id, mortgage_reference, mortgage_amount, mortgage_status, start_date, release_date) VALUES
(1, 3, 1, 'MORT-SBI-ARP-2022-001', 150000.00, 'ACTIVE', '2022-06-15', NULL),
(2, 5, 2, 'MORT-CRGB-PTN-2021-042', 200000.00, 'ACTIVE', '2021-08-10', NULL),
(3, 8, 4, 'MORT-BOB-DNG-2020-119', 180000.00, 'ACTIVE', '2020-03-20', NULL)
ON CONFLICT DO NOTHING;

-- 8. Synthetic Agricultural Loans (35+ loan records)
-- Demonstrating SCENARIO 2: DUPLICATE FINANCING (Land Parcel ID 3 linked to Loan 1 and Loan 2)
INSERT INTO loan_records (id, farmer_id, bank_id, loan_account_reference, loan_type, sanctioned_amount, disbursed_amount, interest_rate, disbursement_date, maturity_date, repayment_status) VALUES
(1, 'a0000000-0000-0000-0000-000000000001', 1, 'KCC-SBI-2023-1001', 'KCC_CROP_LOAN', 150000.00, 150000.00, 7.00, '2023-05-10', '2024-05-09', 'ACTIVE'),
(2, 'a0000000-0000-0000-0000-000000000001', 2, 'KCC-CRGB-2023-2002', 'KCC_CROP_LOAN', 120000.00, 120000.00, 7.00, '2023-06-15', '2024-06-14', 'ACTIVE'), -- DUPLICATE FINANCING ON PARCEL 3
(3, 'a0000000-0000-0000-0000-000000000001', 1, 'KCC-SBI-2022-0990', 'KCC_CROP_LOAN', 100000.00, 100000.00, 7.00, '2022-04-12', '2023-04-11', 'CLOSED'),
(4, 'a0000000-0000-0000-0000-000000000002', 2, 'KCC-CRGB-2023-4001', 'KCC_CROP_LOAN', 200000.00, 200000.00, 7.00, '2023-07-01', '2024-06-30', 'ACTIVE'),
(5, 'a0000000-0000-0000-0000-000000000003', 3, 'KCC-PNB-2023-5001', 'KCC_CROP_LOAN', 180000.00, 180000.00, 7.00, '2023-06-20', '2024-06-19', 'ACTIVE'),
(6, 'a0000000-0000-0000-0000-000000000004', 4, 'KCC-BOB-2023-6001', 'KCC_CROP_LOAN', 160000.00, 160000.00, 7.00, '2023-05-25', '2024-05-24', 'ACTIVE'),
(7, 'a0000000-0000-0000-0000-000000000005', 5, 'KCC-HDFC-2023-7001', 'KCC_CROP_LOAN', 220000.00, 220000.00, 7.00, '2023-06-10', '2024-06-09', 'ACTIVE'),
(8, 'a0000000-0000-0000-0000-000000000006', 1, 'KCC-SBI-2023-1008', 'KCC_CROP_LOAN', 140000.00, 140000.00, 7.00, '2023-08-01', '2024-07-31', 'ACTIVE'),
(9, 'a0000000-0000-0000-0000-000000000007', 2, 'KCC-CRGB-2023-2009', 'KCC_CROP_LOAN', 110000.00, 110000.00, 7.00, '2023-05-18', '2024-05-17', 'ACTIVE'),
(10, 'a0000000-0000-0000-0000-000000000008', 5, 'KCC-HDFC-2023-7010', 'KCC_CROP_LOAN', 250000.00, 250000.00, 7.00, '2023-07-12', '2024-07-11', 'ACTIVE'),
(11, 'a0000000-0000-0000-0000-000000000009', 3, 'KCC-PNB-2023-5011', 'KCC_CROP_LOAN', 130000.00, 130000.00, 7.00, '2023-06-05', '2024-06-04', 'ACTIVE'),
(12, 'a0000000-0000-0000-0000-000000000010', 4, 'KCC-BOB-2023-6012', 'KCC_CROP_LOAN', 190000.00, 190000.00, 7.00, '2023-04-20', '2024-04-19', 'ACTIVE'),
(13, 'a0000000-0000-0000-0000-000000000011', 3, 'KCC-PNB-2023-5013', 'KCC_CROP_LOAN', 170000.00, 170000.00, 7.00, '2023-07-22', '2024-07-21', 'ACTIVE'),
(14, 'a0000000-0000-0000-0000-000000000012', 1, 'KCC-SBI-2023-1014', 'KCC_CROP_LOAN', 115000.00, 115000.00, 7.00, '2023-08-14', '2024-08-13', 'ACTIVE'),
(15, 'a0000000-0000-0000-0000-000000000013', 1, 'KCC-SBI-2023-1015', 'KCC_CROP_LOAN', 160000.00, 160000.00, 7.00, '2023-05-30', '2024-05-29', 'ACTIVE'),
(16, 'a0000000-0000-0000-0000-000000000014', 4, 'KCC-BOB-2023-6016', 'KCC_CROP_LOAN', 210000.00, 210000.00, 7.00, '2023-06-11', '2024-06-10', 'ACTIVE'),
(17, 'a0000000-0000-0000-0000-000000000015', 2, 'KCC-CRGB-2023-2017', 'KCC_CROP_LOAN', 180000.00, 180000.00, 7.00, '2023-07-07', '2024-07-06', 'ACTIVE'),
(18, 'a0000000-0000-0000-0000-000000000016', 3, 'KCC-PNB-2023-5018', 'KCC_CROP_LOAN', 145000.00, 145000.00, 7.00, '2023-05-02', '2024-05-01', 'ACTIVE'),
(19, 'a0000000-0000-0000-0000-000000000017', 1, 'KCC-SBI-2023-1019', 'KCC_CROP_LOAN', 135000.00, 135000.00, 7.00, '2023-06-25', '2024-06-24', 'ACTIVE'),
(20, 'a0000000-0000-0000-0000-000000000018', 3, 'KCC-PNB-2023-5020', 'KCC_CROP_LOAN', 200000.00, 200000.00, 7.00, '2023-07-19', '2024-07-18', 'ACTIVE'),
(21, 'a0000000-0000-0000-0000-000000000019', 3, 'KCC-PNB-2023-5021', 'KCC_CROP_LOAN', 155000.00, 155000.00, 7.00, '2023-04-18', '2024-04-17', 'ACTIVE'),
(22, 'a0000000-0000-0000-0000-000000000020', 3, 'KCC-PNB-2023-5022', 'KCC_CROP_LOAN', 230000.00, 230000.00, 7.00, '2023-05-15', '2024-05-14', 'ACTIVE'),
(23, 'a0000000-0000-0000-0000-000000000021', 1, 'KCC-SBI-2023-1023', 'KCC_CROP_LOAN', 175000.00, 175000.00, 7.00, '2023-06-29', '2024-06-28', 'ACTIVE'),
(24, 'a0000000-0000-0000-0000-000000000022', 2, 'KCC-CRGB-2023-2024', 'KCC_CROP_LOAN', 125000.00, 125000.00, 7.00, '2023-07-04', '2024-07-03', 'ACTIVE'),
(25, 'a0000000-0000-0000-0000-000000000023', 4, 'KCC-BOB-2023-6025', 'KCC_CROP_LOAN', 195000.00, 195000.00, 7.00, '2023-08-08', '2024-08-07', 'ACTIVE'),
(26, 'a0000000-0000-0000-0000-000000000024', 2, 'KCC-CRGB-2023-2026', 'KCC_CROP_LOAN', 165000.00, 165000.00, 7.00, '2023-05-22', '2024-05-21', 'ACTIVE'),
(27, 'a0000000-0000-0000-0000-000000000025', 5, 'KCC-HDFC-2023-7027', 'KCC_CROP_LOAN', 140000.00, 140000.00, 7.00, '2023-06-18', '2024-06-17', 'ACTIVE'),
(28, 'a0000000-0000-0000-0000-000000000026', 1, 'KCC-SBI-2023-1028', 'KCC_CROP_LOAN', 185000.00, 185000.00, 7.00, '2023-07-25', '2024-07-24', 'ACTIVE'),
(29, 'a0000000-0000-0000-0000-000000000027', 4, 'KCC-BOB-2023-6029', 'KCC_CROP_LOAN', 150000.00, 150000.00, 7.00, '2023-04-28', '2024-04-27', 'ACTIVE'),
(30, 'a0000000-0000-0000-0000-000000000028', 1, 'KCC-SBI-2023-1030', 'KCC_CROP_LOAN', 130000.00, 130000.00, 7.00, '2023-05-14', '2024-05-13', 'ACTIVE'),
(31, 'a0000000-0000-0000-0000-000000000029', 1, 'KCC-SBI-2023-1031', 'KCC_CROP_LOAN', 215000.00, 215000.00, 7.00, '2023-06-07', '2024-06-06', 'ACTIVE'),
(32, 'a0000000-0000-0000-0000-000000000030', 4, 'KCC-BOB-2023-6032', 'KCC_CROP_LOAN', 160000.00, 160000.00, 7.00, '2023-07-15', '2024-07-14', 'ACTIVE'),
(33, 'a0000000-0000-0000-0000-000000000031', 4, 'KCC-BOB-2023-6033', 'KCC_CROP_LOAN', 170000.00, 170000.00, 7.00, '2023-08-03', '2024-08-02', 'ACTIVE'),
(34, 'a0000000-0000-0000-0000-000000000001', 1, 'KCC-SBI-2024-1034', 'KCC_CROP_LOAN', 180000.00, 180000.00, 7.00, '2024-05-12', '2025-05-11', 'ACTIVE'),
(35, 'a0000000-0000-0000-0000-000000000002', 2, 'KCC-CRGB-2024-2035', 'KCC_CROP_LOAN', 190000.00, 190000.00, 7.00, '2024-06-18', '2025-06-17', 'ACTIVE')
ON CONFLICT (loan_account_reference) DO NOTHING;

-- 9. Loan Collateral Mapping (Demonstrating SCENARIO 2: Land parcel 3 used in both loan 1 and loan 2)
INSERT INTO loan_collaterals (id, loan_id, land_record_id, collateral_status) VALUES
(1, 1, 3, 'ACTIVE'), -- Loan 1 on Parcel 3
(2, 2, 3, 'ACTIVE'), -- Loan 2 on Parcel 3 -> MULTIPLE ACTIVE LOANS ON SAME LAND PARCEL!
(3, 4, 4, 'ACTIVE'),
(4, 5, 6, 'ACTIVE'),
(5, 6, 8, 'ACTIVE'),
(6, 7, 10, 'ACTIVE')
ON CONFLICT (loan_id, land_record_id) DO NOTHING;

-- 10. Loan Transactions
INSERT INTO loan_transactions (id, loan_id, transaction_type, amount, transaction_date, reference_number, description) VALUES
(1, 1, 'DISBURSEMENT', 150000.00, '2023-05-10', 'TXN-DISB-1001', 'Sanctioned crop loan disbursement'),
(2, 1, 'INTEREST_CHARGED', 10500.00, '2024-05-09', 'TXN-INT-1001', '7% interest charged for 1 year (Standard rate)'),
(3, 1, 'REPAYMENT', 156000.00, '2024-05-02', 'TXN-REP-1001', 'Timely repayment before due date'),
(4, 1, 'PROMPT_REPAYMENT_INCENTIVE', 4500.00, '2024-05-20', 'TXN-PRI-1001', '3% Prompt Repayment Incentive credit')
ON CONFLICT DO NOTHING;

-- 11. Synthetic MSP Transactions (20+ records)
-- Demonstrating SCENARIO 1: MSP DISCREPANCY (Farmer 1: Actual 100,000 received instead of expected 108,000)
-- Demonstrating SCENARIO 5: VALID TRANSACTION (Farmer 2: Exactly matches expected)
INSERT INTO msp_transactions (id, farmer_id, crop, crop_grade, marketing_season, accepted_quantity, quantity_unit, procurement_center, applicable_msp, gross_procurement_amount, documented_deductions, actual_payment, transaction_date, payment_date, receipt_reference) VALUES
-- Farmer 1 (Ramesh): DISCREPANCY! 50 quintals * 2203 = 110,150. Deductions = 150. Expected Net = 110,000. Actual received = 95,000! Underpayment of 15,000.
(1, 'a0000000-0000-0000-0000-000000000001', 'PADDY_GRADE_A', 'GRADE_A', 'KHARIF_2023', 50.0000, 'QUINTAL', 'Arang Mandi Center #4', 2203.00, 110150.00, 150.00, 95000.00, '2023-11-15', '2023-11-28', 'MSP-ARNG-2023-001'),

-- Farmer 2 (Suresh): VALID TRANSACTION! 40 quintals * 2183 = 87,320. Deductions = 120. Expected Net = 87,200. Actual = 87,200.
(2, 'a0000000-0000-0000-0000-000000000002', 'PADDY_COMMON', 'FAQ', 'KHARIF_2023', 40.0000, 'QUINTAL', 'Patan Krishi Upaj Mandi', 2183.00, 87320.00, 120.00, 87200.00, '2023-11-20', '2023-12-01', 'MSP-PATAN-2023-002'),

-- Farmer 3 (Anita): 60 quintals * 2203 = 132,180. Deductions = 180. Expected Net = 132,000. Actual = 132,000.
(3, 'a0000000-0000-0000-0000-000000000003', 'PADDY_GRADE_A', 'GRADE_A', 'KHARIF_2023', 60.0000, 'QUINTAL', 'Kota Procurement Hub', 2203.00, 132180.00, 180.00, 132000.00, '2023-12-05', '2023-12-18', 'MSP-KOTA-2023-003'),

-- Additional MSP transactions across farmers and crops
(4, 'a0000000-0000-0000-0000-000000000004', 'MAIZE', 'FAQ', 'KHARIF_2023', 35.0000, 'QUINTAL', 'Dongargaon Mandi', 2090.00, 73150.00, 150.00, 73000.00, '2023-11-10', '2023-11-22', 'MSP-DNG-2023-004'),
(5, 'a0000000-0000-0000-0000-000000000005', 'PADDY_COMMON', 'FAQ', 'KHARIF_2023', 45.0000, 'QUINTAL', 'Kurud Mandi', 2183.00, 98235.00, 235.00, 98000.00, '2023-11-25', '2023-12-05', 'MSP-KRD-2023-005'),
(6, 'a0000000-0000-0000-0000-000000000006', 'PADDY_GRADE_A', 'GRADE_A', 'KHARIF_2023', 55.0000, 'QUINTAL', 'Abhanpur Mandi', 2203.00, 121165.00, 165.00, 121000.00, '2023-12-02', '2023-12-15', 'MSP-ABH-2023-006'),
(7, 'a0000000-0000-0000-0000-000000000007', 'SOYABEAN', 'FAQ', 'KHARIF_2023', 25.0000, 'QUINTAL', 'Balod Mandi', 4600.00, 115000.00, 200.00, 114800.00, '2023-10-28', '2023-11-12', 'MSP-BLD-2023-007'),
(8, 'a0000000-0000-0000-0000-000000000008', 'PADDY_COMMON', 'FAQ', 'KHARIF_2023', 40.0000, 'QUINTAL', 'Nagri Mandi', 2183.00, 87320.00, 120.00, 87200.00, '2023-12-08', '2023-12-22', 'MSP-NGR-2023-008'),
(9, 'a0000000-0000-0000-0000-000000000009', 'PADDY_GRADE_A', 'GRADE_A', 'KHARIF_2023', 48.0000, 'QUINTAL', 'Takhatpur Mandi', 2203.00, 105744.00, 144.00, 105600.00, '2023-12-14', '2023-12-28', 'MSP-TKP-2023-009'),
(10, 'a0000000-0000-0000-0000-000000000010', 'PADDY_COMMON', 'FAQ', 'KHARIF_2023', 52.0000, 'QUINTAL', 'Bemetara Mandi', 2183.00, 113516.00, 216.00, 113300.00, '2023-12-18', '2024-01-02', 'MSP-BMT-2023-010'),
(11, 'a0000000-0000-0000-0000-000000000011', 'WHEAT', 'FAQ', 'RABI_2023', 30.0000, 'QUINTAL', 'Masturi Mandi', 2275.00, 68250.00, 100.00, 68150.00, '2024-04-10', '2024-04-25', 'MSP-MST-2024-011'),
(12, 'a0000000-0000-0000-0000-000000000012', 'GRAM', 'FAQ', 'RABI_2023', 20.0000, 'QUINTAL', 'Simga Mandi', 5440.00, 108800.00, 300.00, 108500.00, '2024-04-15', '2024-04-30', 'MSP-SMG-2024-012'),
(13, 'a0000000-0000-0000-0000-000000000013', 'MUSTARD', 'FAQ', 'RABI_2023', 15.0000, 'QUINTAL', 'Tilda Mandi', 5650.00, 84750.00, 150.00, 84600.00, '2024-04-20', '2024-05-05', 'MSP-TLD-2024-013'),
(14, 'a0000000-0000-0000-0000-000000000014', 'PADDY_COMMON', 'FAQ', 'KHARIF_2023', 38.0000, 'QUINTAL', 'Chhuria Mandi', 2183.00, 82954.00, 154.00, 82800.00, '2023-11-22', '2023-12-07', 'MSP-CHR-2023-014'),
(15, 'a0000000-0000-0000-0000-000000000015', 'MAIZE', 'FAQ', 'KHARIF_2023', 42.0000, 'QUINTAL', 'Kawardha Mandi', 2090.00, 87780.00, 180.00, 87600.00, '2023-11-18', '2023-12-02', 'MSP-KWD-2023-015'),
(16, 'a0000000-0000-0000-0000-000000000016', 'PADDY_GRADE_A', 'GRADE_A', 'KHARIF_2023', 65.0000, 'QUINTAL', 'Bilha Mandi', 2203.00, 143195.00, 195.00, 143000.00, '2023-12-12', '2023-12-27', 'MSP-BLH-2023-016'),
(17, 'a0000000-0000-0000-0000-000000000017', 'PADDY_COMMON', 'FAQ', 'KHARIF_2023', 50.0000, 'QUINTAL', 'Mahasamund Mandi', 2183.00, 109150.00, 150.00, 109000.00, '2023-11-29', '2023-12-14', 'MSP-MSM-2023-017'),
(18, 'a0000000-0000-0000-0000-000000000018', 'WHEAT', 'FAQ', 'RABI_2023', 28.0000, 'QUINTAL', 'Pendra Mandi', 2275.00, 63700.00, 100.00, 63600.00, '2024-04-18', '2024-05-02', 'MSP-PND-2024-018'),
(19, 'a0000000-0000-0000-0000-000000000019', 'PADDY_GRADE_A', 'GRADE_A', 'KHARIF_2023', 44.0000, 'QUINTAL', 'Mungeli Mandi', 2203.00, 96932.00, 132.00, 96800.00, '2023-12-07', '2023-12-21', 'MSP-MNG-2023-019'),
(20, 'a0000000-0000-0000-0000-000000000020', 'PADDY_COMMON', 'FAQ', 'KHARIF_2023', 35.0000, 'QUINTAL', 'Marwahi Mandi', 2183.00, 76405.00, 105.00, 76300.00, '2023-12-15', '2023-12-30', 'MSP-MRW-2023-020'),
(21, 'a0000000-0000-0000-0000-000000000001', 'PADDY_GRADE_A', 'GRADE_A', 'KHARIF_2024', 40.0000, 'QUINTAL', 'Arang Mandi Center #4', 2320.00, 92800.00, 100.00, 92700.00, '2024-11-10', '2024-11-24', 'MSP-ARNG-2024-021')
ON CONFLICT (receipt_reference) DO NOTHING;

-- 12. Synthetic Insurance Records (10+ records)
-- Demonstrating SCENARIO 4: INSURANCE PAYOUT DISCREPANCY (Farmer 1: Sanctioned 45,000, Actual payout 30,000 -> 15,000 shortfall!)
INSERT INTO insurance_records (id, farmer_id, scheme_name, crop, season, insurance_policy_number, insured_area, sum_insured, premium_paid, claim_status, sanctioned_claim_amount, actual_payout, claim_date, payment_date) VALUES
(1, 'a0000000-0000-0000-0000-000000000001', 'PMFBY', 'Paddy', 'KHARIF_2023', 'PMFBY-CG-2023-0001', 2.5000, 75000.00, 1500.00, 'SETTLED', 45000.00, 30000.00, '2023-10-15', '2024-01-10'), -- DISCREPANCY (shortfall 15000)
(2, 'a0000000-0000-0000-0000-000000000002', 'PMFBY', 'Paddy', 'KHARIF_2023', 'PMFBY-CG-2023-0002', 4.0000, 120000.00, 2400.00, 'SETTLED', 60000.00, 60000.00, '2023-10-20', '2024-01-15'), -- VALID
(3, 'a0000000-0000-0000-0000-000000000003', 'PMFBY', 'Paddy', 'KHARIF_2023', 'PMFBY-CG-2023-0003', 5.5000, 165000.00, 3300.00, 'SETTLED', 50000.00, 50000.00, '2023-10-25', '2024-01-20'),
(4, 'a0000000-0000-0000-0000-000000000004', 'PMFBY', 'Maize', 'KHARIF_2023', 'PMFBY-CG-2023-0004', 3.5000, 70000.00, 1400.00, 'SETTLED', 35000.00, 35000.00, '2023-11-05', '2024-01-25'),
(5, 'a0000000-0000-0000-0000-000000000005', 'PMFBY', 'Paddy', 'KHARIF_2023', 'PMFBY-CG-2023-0005', 4.2000, 126000.00, 2520.00, 'PENDING', 40000.00, NULL, '2023-11-12', NULL),
(6, 'a0000000-0000-0000-0000-000000000006', 'PMFBY', 'Paddy', 'KHARIF_2023', 'PMFBY-CG-2023-0006', 3.4000, 102000.00, 2040.00, 'SETTLED', 42000.00, 42000.00, '2023-10-18', '2024-01-12'),
(7, 'a0000000-0000-0000-0000-000000000007', 'PMFBY', 'Soyabean', 'KHARIF_2023', 'PMFBY-CG-2023-0007', 2.1000, 63000.00, 1260.00, 'SETTLED', 28000.00, 20000.00, '2023-11-01', '2024-01-18'), -- DISCREPANCY (shortfall 8000)
(8, 'a0000000-0000-0000-0000-000000000008', 'PMFBY', 'Paddy', 'KHARIF_2023', 'PMFBY-CG-2023-0008', 6.0000, 180000.00, 3600.00, 'SETTLED', 70000.00, 70000.00, '2023-10-30', '2024-01-22'),
(9, 'a0000000-0000-0000-0000-000000000009', 'PMFBY', 'Paddy', 'KHARIF_2023', 'PMFBY-CG-2023-0009', 2.9000, 87000.00, 1740.00, 'SETTLED', 32000.00, 32000.00, '2023-11-08', '2024-01-29'),
(10, 'a0000000-0000-0000-0000-000000000010', 'PMFBY', 'Paddy', 'KHARIF_2023', 'PMFBY-CG-2023-0010', 4.5000, 135000.00, 2700.00, 'SETTLED', 55000.00, 55000.00, '2023-10-22', '2024-02-05')
ON CONFLICT (insurance_policy_number) DO NOTHING;

-- 13. Pre-seeded Discrepancies for immediate testing
INSERT INTO discrepancies (id, farmer_id, category, reference_id, expected_amount, actual_amount, difference_amount, severity, description, verification_status) VALUES
(1, 'a0000000-0000-0000-0000-000000000001', 'MSP_PAYMENT_DISCREPANCY', 'MSP-ARNG-2023-001', 110000.00, 95000.00, 15000.00, 'HIGH', 'Recorded MSP net entitlement of INR 110,000.00 exceeds actual bank payment received of INR 95,000.00 by INR 15,000.00.', 'DETECTED'),
(2, 'a0000000-0000-0000-0000-000000000001', 'INSURANCE_PAYOUT_DISCREPANCY', 'PMFBY-CG-2023-0001', 45000.00, 30000.00, 15000.00, 'HIGH', 'Officially sanctioned PMFBY claim of INR 45,000.00 was paid out as only INR 30,000.00, resulting in a recorded difference of INR 15,000.00.', 'DETECTED'),
(3, 'a0000000-0000-0000-0000-000000000001', 'POTENTIAL_DUPLICATE_FINANCING', 'LAND-3-LOAN-1-LOAN-2', NULL, NULL, NULL, 'CRITICAL', 'Land parcel Khasra 215/3 (Arang/Raipur) is pledged as active collateral in multiple active loans (KCC-SBI-2023-1001 and KCC-CRGB-2023-2002). Flagged for verification.', 'DETECTED')
ON CONFLICT DO NOTHING;

-- Reset identity sequences for tables
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('banks_id_seq', (SELECT MAX(id) FROM banks));
SELECT setval('land_records_id_seq', (SELECT MAX(id) FROM land_records));
SELECT setval('land_ownership_id_seq', (SELECT MAX(id) FROM land_ownership));
SELECT setval('mortgages_id_seq', (SELECT MAX(id) FROM mortgages));
SELECT setval('loan_records_id_seq', (SELECT MAX(id) FROM loan_records));
SELECT setval('loan_transactions_id_seq', (SELECT MAX(id) FROM loan_transactions));
SELECT setval('loan_collaterals_id_seq', (SELECT MAX(id) FROM loan_collaterals));
SELECT setval('scheme_rules_id_seq', (SELECT MAX(id) FROM scheme_rules));
SELECT setval('msp_transactions_id_seq', (SELECT MAX(id) FROM msp_transactions));
SELECT setval('insurance_records_id_seq', (SELECT MAX(id) FROM insurance_records));
SELECT setval('discrepancies_id_seq', (SELECT MAX(id) FROM discrepancies));
