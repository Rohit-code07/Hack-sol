package com.kisansetu.entitlement.calculator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisansetu.common.enums.CalculationStatus;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.common.exception.InsufficientDataException;
import com.kisansetu.common.util.FinancialUtils;
import com.kisansetu.entitlement.dto.EntitlementCalculationResponse;
import com.kisansetu.entitlement.dto.KccEvaluationRequest;
import com.kisansetu.scheme.entity.SchemeRule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class KCCCalculator {

    private final ObjectMapper objectMapper;
    private final EligibilityEvaluator eligibilityEvaluator;

    public EntitlementCalculationResponse calculate(KccEvaluationRequest request, SchemeRule rule) {
        if (request.getLoanAmount() == null || request.getDisbursementDate() == null) {
            throw new InsufficientDataException("Loan amount and disbursement date are required for KCC calculation");
        }

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("loanAmount", request.getLoanAmount());
        breakdown.put("disbursementDate", request.getDisbursementDate().toString());

        // Parse configurable scheme rule JSON
        JsonNode ruleJson;
        try {
            ruleJson = objectMapper.readTree(rule.getRuleData());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse scheme rule configuration", e);
        }

        BigDecimal normalRate = new BigDecimal(ruleJson.path("normalInterestRate").asText("9.00"));
        BigDecimal subventionRate = new BigDecimal(ruleJson.path("interestSubvention").asText("2.00"));
        BigDecimal baseRate = new BigDecimal(ruleJson.path("effectiveBaseRate").asText("7.00"));
        BigDecimal promptRate = new BigDecimal(ruleJson.path("effectivePromptRate").asText("4.00"));
        BigDecimal maxEligibleAmount = new BigDecimal(ruleJson.path("maxEligibleAmount").asText("300000.00"));
        long promptGraceDays = ruleJson.path("promptRepaymentGraceDays").asLong(365);

        breakdown.put("ruleNormalRatePercent", normalRate);
        breakdown.put("ruleSubventionPercent", subventionRate);
        breakdown.put("ruleEffectiveBaseRatePercent", baseRate);
        breakdown.put("ruleEffectivePromptRatePercent", promptRate);
        breakdown.put("ruleMaxEligibleAmount", maxEligibleAmount);

        // Check Loan Type Eligibility
        if (!eligibilityEvaluator.isKccEligibleLoanType(request.getLoanType())) {
            breakdown.put("eligibilityRemark", "Loan type is not KCC Crop Loan. MISS subvention does not apply.");
            return EntitlementCalculationResponse.builder()
                    .farmerId(request.getFarmerId())
                    .schemeCode(rule.getSchemeCode())
                    .entitlementType("KCC_INTEREST_SUBVENTION")
                    .eligibilityStatus(CalculationStatus.INELIGIBLE)
                    .expectedAmount(BigDecimal.ZERO)
                    .actualAmount(request.getActualInterestCharged() != null ? request.getActualInterestCharged() : BigDecimal.ZERO)
                    .differenceAmount(BigDecimal.ZERO)
                    .applicableScheme(rule.getSchemeName())
                    .ruleVersion(rule.getRuleVersion())
                    .calculationBreakdown(breakdown)
                    .sourceDocumentReference(rule.getSourceDocument())
                    .verificationStatus(VerificationStatus.RESOLVED)
                    .explanation("Ineligible for KCC interest subvention: borrower loan type is " + request.getLoanType())
                    .build();
        }

        // Determine loan duration
        long daysOutstanding;
        boolean promptEligible = false;

        if (request.getRepaymentDate() != null) {
            daysOutstanding = ChronoUnit.DAYS.between(request.getDisbursementDate(), request.getRepaymentDate());
            if (daysOutstanding < 0) {
                daysOutstanding = 0;
            }
            breakdown.put("repaymentDate", request.getRepaymentDate().toString());
            breakdown.put("daysOutstanding", daysOutstanding);

            if (daysOutstanding <= promptGraceDays) {
                promptEligible = true;
                breakdown.put("promptRepaymentStatus", "TIMELY_REPAYMENT_WITHIN_365_DAYS");
            } else {
                breakdown.put("promptRepaymentStatus", "REPAID_AFTER_DUE_DATE");
            }
        } else {
            // Still active, compute till 365 days or 1 year
            daysOutstanding = promptGraceDays;
            breakdown.put("daysOutstanding", daysOutstanding);
            breakdown.put("promptRepaymentStatus", "ASSUMED_ANNUAL_TENURE_FOR_ACTIVE_LOAN");
        }

        BigDecimal eligibleAmount = request.getLoanAmount().min(maxEligibleAmount);
        BigDecimal excessAmount = request.getLoanAmount().subtract(eligibleAmount);
        breakdown.put("subventionEligibleAmount", eligibleAmount);
        breakdown.put("excessAmountSubjectToNormalRate", excessAmount);

        BigDecimal applicableInterestRate = promptEligible ? promptRate : baseRate;
        breakdown.put("applicableEffectiveRatePercent", applicableInterestRate);

        // Calculate expected interest: (Eligible Amount * Rate * Days) / (365 * 100)
        BigDecimal expectedEligibleInterest = eligibleAmount
                .multiply(applicableInterestRate)
                .multiply(BigDecimal.valueOf(daysOutstanding))
                .divide(BigDecimal.valueOf(36500), 2, RoundingMode.HALF_UP);

        BigDecimal expectedExcessInterest = BigDecimal.ZERO;
        if (FinancialUtils.isGreaterThan(excessAmount, BigDecimal.ZERO)) {
            expectedExcessInterest = excessAmount
                    .multiply(normalRate)
                    .multiply(BigDecimal.valueOf(daysOutstanding))
                    .divide(BigDecimal.valueOf(36500), 2, RoundingMode.HALF_UP);
        }

        BigDecimal totalExpectedInterest = FinancialUtils.round(expectedEligibleInterest.add(expectedExcessInterest));
        breakdown.put("expectedEligibleInterest", expectedEligibleInterest);
        breakdown.put("expectedExcessInterest", expectedExcessInterest);
        breakdown.put("totalExpectedInterest", totalExpectedInterest);

        BigDecimal actualInterest = request.getActualInterestCharged() != null ?
                FinancialUtils.round(request.getActualInterestCharged()) : totalExpectedInterest;
        BigDecimal difference = FinancialUtils.difference(totalExpectedInterest, actualInterest);

        CalculationStatus status;
        VerificationStatus verStatus;
        String explanation;

        if (request.getActualInterestCharged() == null) {
            status = CalculationStatus.ELIGIBLE;
            verStatus = VerificationStatus.VERIFIED;
            explanation = String.format("Expected total interest payable at effective %s%% rate is INR %s for %d days.",
                    applicableInterestRate, totalExpectedInterest, daysOutstanding);
        } else if (FinancialUtils.isEqual(totalExpectedInterest, actualInterest)) {
            status = CalculationStatus.VERIFIED_MATCH;
            verStatus = VerificationStatus.VERIFIED;
            explanation = "Charged interest matches exactly with official RBI MISS guidelines.";
        } else if (FinancialUtils.isGreaterThan(actualInterest, totalExpectedInterest)) {
            status = CalculationStatus.DISCREPANCY_DETECTED;
            verStatus = VerificationStatus.DETECTED;
            explanation = String.format("Potential interest overcharge of INR %s detected. Expected interest was INR %s at %s%%, but INR %s was charged.",
                    actualInterest.subtract(totalExpectedInterest), totalExpectedInterest, applicableInterestRate, actualInterest);
        } else {
            status = CalculationStatus.VERIFIED_MATCH;
            verStatus = VerificationStatus.VERIFIED;
            explanation = "Actual interest charged is lower than the statutory ceiling.";
        }

        return EntitlementCalculationResponse.builder()
                .farmerId(request.getFarmerId())
                .schemeCode(rule.getSchemeCode())
                .entitlementType("KCC_INTEREST_CALCULATION")
                .eligibilityStatus(status)
                .expectedAmount(totalExpectedInterest)
                .actualAmount(actualInterest)
                .differenceAmount(difference.abs())
                .applicableScheme(rule.getSchemeName())
                .ruleVersion(rule.getRuleVersion())
                .calculationBreakdown(breakdown)
                .sourceDocumentReference(rule.getSourceDocument())
                .verificationStatus(verStatus)
                .explanation(explanation)
                .build();
    }
}
