# 🌾 KisanSetu
### Agricultural Policy, Loan & Subsidy Transparency Platform

**Know Your Entitlements. Verify Your Benefits. Demand Transparency.**

KisanSetu is a farmer-centric AgriTech and FinTech platform designed to bring transparency to agricultural financial services. It helps farmers verify their entitlements under government agricultural schemes, identify discrepancies in loans, Minimum Support Price (MSP) payments and crop insurance payouts, and generate grievances in their preferred language.

The platform also enables banks to cross-verify agricultural land records, ownership, mortgage information and existing loans through a synthetic land and loan registry, helping identify potential duplicate financing and verification mismatches.

---

## 📌 Problem Statement

**GOV-TECH | GT-01 | OPTION A**

Agricultural borrowers frequently face unexplained loan rejections, delayed subsidy benefits, MSP payment discrepancies and crop insurance payout issues.

Farmers often lack access to simple tools that explain their actual entitlements under government schemes. Meanwhile, cooperative and regional banks struggle to verify land ownership, Khasra details, existing mortgages and duplicate financing across fragmented records.

This creates problems such as:

- Lack of transparency in agricultural loan interest and subsidies.
- Delayed or incomplete MSP payments.
- Discrepancies in crop insurance payouts.
- Difficulty verifying agricultural land ownership.
- Potential duplicate financing against the same land parcel.
- Limited access to grievance generation in regional languages.
- Lack of visibility into recurring regional agricultural financial bottlenecks.

**KisanSetu addresses these problems through a unified platform connecting agricultural policy, financial entitlements, land verification and grievance management.**

---

## 🎯 Project Objectives

1. Help farmers understand their financial entitlements under agricultural schemes.
2. Calculate eligible benefits using deterministic, rule-based calculations.
3. Verify agricultural loan interest and subsidy benefits.
4. Compare expected MSP payments against actual payments.
5. Reconcile sanctioned crop insurance claims with actual payouts.
6. Verify land ownership, Khasra details and mortgage status.
7. Identify potential duplicate agricultural financing.
8. Detect financial discrepancies and generate understandable alerts.
9. Generate grievances in Hindi and English, with extensibility for Chhattisgarhi.
10. Improve transparency for farmers and financial institutions.

---

# ✨ Key Features

## 1. 👨‍🌾 Farmer Portal

A simple and accessible dashboard designed for farmers.

Farmers can:

- View their profile and registered land records.
- Check agricultural loan information.
- Calculate applicable KCC interest benefits.
- Verify MSP procurement payments.
- Reconcile crop insurance payouts.
- View detected financial discrepancies.
- Generate grievance letters.
- Access financial information in simple language.

### Farmer Dashboard

The dashboard provides an overview of:

- Registered land parcels.
- Agricultural loans.
- Entitlement calculation results.
- MSP payment information.
- Crop insurance details.
- Potential discrepancies.
- Grievance history.

## 2. 💰 Agricultural Entitlement Engine

A deterministic Java-based calculation engine that evaluates financial entitlements using configurable government scheme rules.

**Important architectural decision: Financial calculations are performed by the Java backend, not by an AI model.**

### KCC Interest Benefit Calculator

Evaluates:

- Loan amount.
- Loan type.
- Disbursement date.
- Repayment date.
- Repayment eligibility.
- Applicable interest subvention.
- Prompt Repayment Incentive (PRI).
- Estimated interest payable.
- Actual interest charged.

The engine uses versioned scheme rules to determine eligibility and calculate applicable benefits.

### MSP Payment Verification

Compares expected procurement payments with actual recorded payments.

Calculation:

**Gross MSP Value**

`Accepted Quantity × Applicable MSP`

**Expected Net Payment**

`Gross MSP Value − Documented Deductions`

**Potential Difference**

`Expected Net Payment − Actual Payment Received`

The system identifies potential payment discrepancies and provides a calculation breakdown.

### Crop Insurance Reconciliation

Supports reconciliation of:

- Insurance policy information.
- Crop and season.
- Insured amount.
- Premium paid.
- Sanctioned claim amount.
- Actual payout.
- Payment date.

The MVP prioritizes sanctioned-claim versus actual-payout reconciliation.

It does not invent PMFBY claim amounts when official claim-d
