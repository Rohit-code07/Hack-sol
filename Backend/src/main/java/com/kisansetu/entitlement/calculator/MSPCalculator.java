package com.kisansetu.entitlement.calculator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisansetu.common.enums.CalculationStatus;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.common.exception.InsufficientDataException;
import com.kisansetu.common.util.FinancialUtils;
import com.kisansetu.entitlement.dto.EntitlementCalculationResponse;
import com.kisansetu.entitlement.dto.MspVerificationRequest;
import com.kisansetu.scheme.entity.SchemeRule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MSPCalculator {

    private final ObjectMapper objectMapper;

    public EntitlementCalculationResponse calculate(MspVerificationRequest request, SchemeRule rule) {
        if (request.getAcceptedQuantity() == null || request.getCrop() == null || request.getActualPayment() == null) {
            throw new InsufficientDataException("Crop, accepted quantity, and actual payment amount are required for MSP verification");
        }

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("crop", request.getCrop());
        breakdown.put("cropGrade", request.getCropGrade());
        breakdown.put("marketingSeason", request.getMarketingSeason());
        breakdown.put("acceptedQuantity", request.getAcceptedQuantity());
        breakdown.put("quantityUnit", request.getQuantityUnit());

        // Parse rates from rule JSON
        JsonNode ruleJson;
        try {
            ruleJson = objectMapper.readTree(rule.getRuleData());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse MSP rule JSON data", e);
        }

        JsonNode ratesNode = ruleJson.path("rates");
        String cropKey = request.getCrop().toUpperCase().replace(" ", "_");
        BigDecimal mspRate = null;

        if (ratesNode.has(cropKey)) {
            mspRate = new BigDecimal(ratesNode.path(cropKey).asText());
        } else if (ratesNode.has(request.getCrop())) {
            mspRate = new BigDecimal(ratesNode.path(request.getCrop()).asText());
        } else if (request.getApplicableMsp() != null) {
            mspRate = request.getApplicableMsp();
            breakdown.put("rateSource", "REQUEST_SUPPLIED");
        }

        if (mspRate == null) {
            throw new InsufficientDataException("No official MSP rate found for crop: " + request.getCrop() + " in season: " + request.getMarketingSeason());
        }

        breakdown.put("applicableMspRatePerQuintal", mspRate);

        // Gross procurement amount = Quantity * MSP Rate
        BigDecimal grossAmount = FinancialUtils.round(request.getAcceptedQuantity().multiply(mspRate));
        breakdown.put("grossProcurementAmount", grossAmount);

        // Documented deductions
        BigDecimal deductions = request.getDocumentedDeductions() != null ?
                FinancialUtils.round(request.getDocumentedDeductions()) : BigDecimal.ZERO;
        breakdown.put("documentedDeductions", deductions);

        // Expected Net Payment = Gross - Documented Deductions
        BigDecimal expectedNetPayment = FinancialUtils.round(grossAmount.subtract(deductions));
        breakdown.put("expectedNetPayment", expectedNetPayment);

        // Compare against actual payment
        BigDecimal actualPayment = FinancialUtils.round(request.getActualPayment());
        breakdown.put("actualPaymentReceived", actualPayment);

        BigDecimal difference = FinancialUtils.difference(expectedNetPayment, actualPayment);
        breakdown.put("paymentDifference", difference);

        CalculationStatus status;
        VerificationStatus verStatus;
        String explanation;

        if (FinancialUtils.isEqual(expectedNetPayment, actualPayment)) {
            status = CalculationStatus.VERIFIED_MATCH;
            verStatus = VerificationStatus.VERIFIED;
            explanation = String.format("MSP payment verified. Gross amount INR %s minus documented deductions INR %s matches received payment of INR %s exactly.",
                    grossAmount, deductions, actualPayment);
        } else if (FinancialUtils.isGreaterThan(expectedNetPayment, actualPayment)) {
            status = CalculationStatus.DISCREPANCY_DETECTED;
            verStatus = VerificationStatus.DETECTED;
            explanation = String.format("Potential MSP underpayment detected! Expected net payment is INR %s, but actual bank payout received was INR %s (Shortfall: INR %s).",
                    expectedNetPayment, actualPayment, difference);
        } else {
            status = CalculationStatus.VERIFIED_MATCH;
            verStatus = VerificationStatus.VERIFIED;
            explanation = String.format("Actual payment of INR %s exceeds calculated base MSP entitlement of INR %s (likely includes additional state bonus or incentives).",
                    actualPayment, expectedNetPayment);
        }

        return EntitlementCalculationResponse.builder()
                .farmerId(request.getFarmerId())
                .schemeCode(rule.getSchemeCode())
                .entitlementType("MSP_PAYMENT_VERIFICATION")
                .eligibilityStatus(status)
                .expectedAmount(expectedNetPayment)
                .actualAmount(actualPayment)
                .differenceAmount(difference.max(BigDecimal.ZERO))
                .applicableScheme(rule.getSchemeName())
                .ruleVersion(rule.getRuleVersion())
                .calculationBreakdown(breakdown)
                .sourceDocumentReference(rule.getSourceDocument())
                .verificationStatus(verStatus)
                .explanation(explanation)
                .build();
    }
}
