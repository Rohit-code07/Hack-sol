package com.kisansetu.entitlement;

import com.kisansetu.common.enums.CalculationStatus;
import com.kisansetu.common.exception.InsufficientDataException;
import com.kisansetu.entitlement.calculator.InsuranceReconciliationCalculator;
import com.kisansetu.entitlement.dto.EntitlementCalculationResponse;
import com.kisansetu.entitlement.dto.InsuranceReconciliationRequest;
import com.kisansetu.scheme.entity.SchemeRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class InsuranceCalculatorTest {

    private InsuranceReconciliationCalculator calculator;
    private SchemeRule pmfbyRule;
    private UUID testFarmerId;

    @BeforeEach
    void setUp() {
        calculator = new InsuranceReconciliationCalculator();
        testFarmerId = UUID.randomUUID();

        pmfbyRule = SchemeRule.builder()
                .schemeCode("PMFBY_RECONCILIATION")
                .schemeName("PMFBY Rules 2023-24")
                .ruleVersion("v2023.PMFBY.CG")
                .sourceDocument("PMFBY Guidelines")
                .ruleData("{}")
                .build();
    }

    @Test
    @DisplayName("Correct insurance payout exactly matches sanctioned claim")
    void testCorrectPayout() {
        InsuranceReconciliationRequest req = InsuranceReconciliationRequest.builder()
                .farmerId(testFarmerId)
                .insurancePolicyNumber("PMFBY-CG-2023-0002")
                .sanctionedClaimAmount(new BigDecimal("60000.00"))
                .actualPayout(new BigDecimal("60000.00"))
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, pmfbyRule);

        assertThat(res.getEligibilityStatus()).isEqualTo(CalculationStatus.VERIFIED_MATCH);
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("60000.00");
        assertThat(res.getActualAmount()).isEqualByComparingTo("60000.00");
        assertThat(res.getDifferenceAmount()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Partial payout generates underpayment discrepancy")
    void testPartialPayout_Discrepancy() {
        InsuranceReconciliationRequest req = InsuranceReconciliationRequest.builder()
                .farmerId(testFarmerId)
                .insurancePolicyNumber("PMFBY-CG-2023-0001")
                .sanctionedClaimAmount(new BigDecimal("45000.00"))
                .actualPayout(new BigDecimal("30000.00"))
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, pmfbyRule);

        assertThat(res.getEligibilityStatus()).isEqualTo(CalculationStatus.DISCREPANCY_DETECTED);
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("45000.00");
        assertThat(res.getActualAmount()).isEqualByComparingTo("30000.00");
        assertThat(res.getDifferenceAmount()).isEqualByComparingTo("15000.00");
    }

    @Test
    @DisplayName("Missing sanctioned claim amount throws InsufficientDataException (cannot estimate from insured amount alone)")
    void testMissingSanctionedClaim_ThrowsInsufficientData() {
        InsuranceReconciliationRequest req = InsuranceReconciliationRequest.builder()
                .farmerId(testFarmerId)
                .insurancePolicyNumber("PMFBY-CG-2023-0003")
                .actualPayout(new BigDecimal("30000.00"))
                .build();

        assertThrows(InsufficientDataException.class, () -> calculator.calculate(req, pmfbyRule));
    }
}
