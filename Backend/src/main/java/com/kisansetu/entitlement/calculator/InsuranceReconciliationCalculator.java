package com.kisansetu.entitlement.calculator;

import com.kisansetu.common.enums.CalculationStatus;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.common.exception.InsufficientDataException;
import com.kisansetu.common.util.FinancialUtils;
import com.kisansetu.entitlement.dto.EntitlementCalculationResponse;
import com.kisansetu.entitlement.dto.InsuranceReconciliationRequest;
import com.kisansetu.scheme.entity.SchemeRule;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class InsuranceReconciliationCalculator {

    public EntitlementCalculationResponse calculate(InsuranceReconciliationRequest request, SchemeRule rule) {
        if (request.getActualPayout() == null) {
            throw new InsufficientDataException("Actual payout amount is required for insurance reconciliation");
        }

        if (request.getSanctionedClaimAmount() == null) {
            throw new InsufficientDataException("Sanctioned claim amount is required. PMFBY claim cannot be estimated from insured amount alone without official yield/claim sanction records.");
        }

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("insurancePolicyNumber", request.getInsurancePolicyNumber());
        breakdown.put("crop", request.getCrop());
        breakdown.put("season", request.getSeason());
        breakdown.put("sanctionedClaimAmount", request.getSanctionedClaimAmount());
        breakdown.put("actualPayoutReceived", request.getActualPayout());

        BigDecimal sanctioned = FinancialUtils.round(request.getSanctionedClaimAmount());
        BigDecimal actual = FinancialUtils.round(request.getActualPayout());
        BigDecimal difference = FinancialUtils.difference(sanctioned, actual);

        breakdown.put("recordedDifference", difference);

        CalculationStatus status;
        VerificationStatus verStatus;
        String explanation;

        if (FinancialUtils.isEqual(sanctioned, actual)) {
            status = CalculationStatus.VERIFIED_MATCH;
            verStatus = VerificationStatus.VERIFIED;
            explanation = String.format("Insurance payout verified. Actual bank credit of INR %s exactly matches officially sanctioned claim amount.", actual);
        } else if (FinancialUtils.isGreaterThan(sanctioned, actual)) {
            status = CalculationStatus.DISCREPANCY_DETECTED;
            verStatus = VerificationStatus.DETECTED;
            explanation = String.format("Potential insurance underpayment detected! Officially sanctioned claim was INR %s, but actual bank payout received was INR %s (Shortfall: INR %s).",
                    sanctioned, actual, difference);
        } else {
            status = CalculationStatus.VERIFIED_MATCH;
            verStatus = VerificationStatus.VERIFIED;
            explanation = String.format("Actual insurance payout received (INR %s) satisfies or exceeds sanctioned claim (INR %s).",
                    actual, sanctioned);
        }

        return EntitlementCalculationResponse.builder()
                .farmerId(request.getFarmerId())
                .schemeCode(rule != null ? rule.getSchemeCode() : "PMFBY_RECONCILIATION")
                .entitlementType("PMFBY_INSURANCE_RECONCILIATION")
                .eligibilityStatus(status)
                .expectedAmount(sanctioned)
                .actualAmount(actual)
                .differenceAmount(difference.max(BigDecimal.ZERO))
                .applicableScheme(rule != null ? rule.getSchemeName() : "Pradhan Mantri Fasal Bima Yojana (PMFBY)")
                .ruleVersion(rule != null ? rule.getRuleVersion() : "v2023.PMFBY.CG")
                .calculationBreakdown(breakdown)
                .sourceDocumentReference(rule != null ? rule.getSourceDocument() : "Official PMFBY Claim Sanction Register")
                .verificationStatus(verStatus)
                .explanation(explanation)
                .build();
    }
}
