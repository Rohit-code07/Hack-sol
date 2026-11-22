package com.kisansetu.entitlement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisansetu.common.enums.CalculationStatus;
import com.kisansetu.common.enums.LoanType;
import com.kisansetu.common.enums.RepaymentStatus;
import com.kisansetu.common.exception.InsufficientDataException;
import com.kisansetu.entitlement.calculator.EligibilityEvaluator;
import com.kisansetu.entitlement.calculator.KCCCalculator;
import com.kisansetu.entitlement.dto.EntitlementCalculationResponse;
import com.kisansetu.entitlement.dto.KccEvaluationRequest;
import com.kisansetu.scheme.entity.SchemeRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class KCCCalculatorTest {

    private KCCCalculator calculator;
    private SchemeRule sampleRule2023;
    private SchemeRule sampleRule2024;
    private UUID testFarmerId;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        EligibilityEvaluator eligibilityEvaluator = new EligibilityEvaluator();
        calculator = new KCCCalculator(objectMapper, eligibilityEvaluator);

        testFarmerId = UUID.randomUUID();

        sampleRule2023 = SchemeRule.builder()
                .schemeCode("KCC_SUBVENTION")
                .schemeName("MISS 2023-24")
                .ruleVersion("v2023.1")
                .sourceDocument("RBI/2023-24/FIDD.CO.FSD.BC.No.3")
                .ruleData("{\"normalInterestRate\": 9.00, \"interestSubvention\": 2.00, \"effectiveBaseRate\": 7.00, \"promptRepaymentIncentive\": 3.00, \"effectivePromptRate\": 4.00, \"maxEligibleAmount\": 300000.00, \"promptRepaymentGraceDays\": 365}")
                .build();

        sampleRule2024 = SchemeRule.builder()
                .schemeCode("KCC_SUBVENTION")
                .schemeName("MISS 2024-25")
                .ruleVersion("v2024.1")
                .sourceDocument("RBI/2024-25/FIDD.CO.FSD.BC.No.2")
                .ruleData("{\"normalInterestRate\": 9.50, \"interestSubvention\": 2.00, \"effectiveBaseRate\": 7.50, \"promptRepaymentIncentive\": 3.00, \"effectivePromptRate\": 4.50, \"maxEligibleAmount\": 300000.00, \"promptRepaymentGraceDays\": 365}")
                .build();
    }

    @Test
    @DisplayName("Eligible borrower with timely repayment gets 4% prompt repayment rate")
    void testTimelyRepayment_EligibleBorrower() {
        KccEvaluationRequest req = KccEvaluationRequest.builder()
                .farmerId(testFarmerId)
                .loanAmount(new BigDecimal("100000.00"))
                .loanType(LoanType.KCC_CROP_LOAN)
                .disbursementDate(LocalDate.of(2023, 5, 10))
                .repaymentDate(LocalDate.of(2024, 5, 9)) // Exactly within 365 days
                .repaymentStatus(RepaymentStatus.CLOSED)
                .actualInterestCharged(new BigDecimal("4000.00"))
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, sampleRule2023);

        assertThat(res.getEligibilityStatus()).isEqualTo(CalculationStatus.VERIFIED_MATCH);
        // (100000 * 4% * 365) / 36500 = 4000.00
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("4000.00");
        assertThat(res.getDifferenceAmount()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Eligible borrower with late repayment gets 7% base rate (no prompt repayment incentive)")
    void testLateRepayment_NoPromptIncentive() {
        KccEvaluationRequest req = KccEvaluationRequest.builder()
                .farmerId(testFarmerId)
                .loanAmount(new BigDecimal("100000.00"))
                .loanType(LoanType.KCC_CROP_LOAN)
                .disbursementDate(LocalDate.of(2023, 5, 10))
                .repaymentDate(LocalDate.of(2024, 6, 10)) // 397 days (late)
                .repaymentStatus(RepaymentStatus.CLOSED)
                .actualInterestCharged(new BigDecimal("7613.70"))
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, sampleRule2023);

        // 7% base rate applied: (100000 * 7 * 397) / 36500 = 7613.70
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("7613.70");
    }

    @Test
    @DisplayName("Ineligible borrower due to non-crop loan type")
    void testIneligibleBorrower_TermLoan() {
        KccEvaluationRequest req = KccEvaluationRequest.builder()
                .farmerId(testFarmerId)
                .loanAmount(new BigDecimal("100000.00"))
                .loanType(LoanType.TERM_LOAN)
                .disbursementDate(LocalDate.of(2023, 5, 10))
                .repaymentDate(LocalDate.of(2024, 5, 9))
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, sampleRule2023);

        assertThat(res.getEligibilityStatus()).isEqualTo(CalculationStatus.INELIGIBLE);
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Overcharge detected when actual interest charged exceeds statutory ceiling")
    void testDiscrepancy_OverchargedInterest() {
        KccEvaluationRequest req = KccEvaluationRequest.builder()
                .farmerId(testFarmerId)
                .loanAmount(new BigDecimal("100000.00"))
                .loanType(LoanType.KCC_CROP_LOAN)
                .disbursementDate(LocalDate.of(2023, 5, 10))
                .repaymentDate(LocalDate.of(2024, 5, 9))
                .actualInterestCharged(new BigDecimal("7000.00")) // Charged 7% instead of prompt 4%
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, sampleRule2023);

        assertThat(res.getEligibilityStatus()).isEqualTo(CalculationStatus.DISCREPANCY_DETECTED);
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("4000.00");
        assertThat(res.getActualAmount()).isEqualByComparingTo("7000.00");
        assertThat(res.getDifferenceAmount()).isEqualByComparingTo("3000.00");
    }

    @Test
    @DisplayName("Missing loan amount throws InsufficientDataException")
    void testMissingLoanAmount_ThrowsInsufficientData() {
        KccEvaluationRequest req = KccEvaluationRequest.builder()
                .farmerId(testFarmerId)
                .loanType(LoanType.KCC_CROP_LOAN)
                .disbursementDate(LocalDate.of(2023, 5, 10))
                .build();

        assertThrows(InsufficientDataException.class, () -> calculator.calculate(req, sampleRule2023));
    }

    @Test
    @DisplayName("Different rule version calculates with versioned rates")
    void testDifferentRuleVersion_CalculatesCorrectly() {
        KccEvaluationRequest req = KccEvaluationRequest.builder()
                .farmerId(testFarmerId)
                .loanAmount(new BigDecimal("100000.00"))
                .loanType(LoanType.KCC_CROP_LOAN)
                .disbursementDate(LocalDate.of(2024, 5, 10))
                .repaymentDate(LocalDate.of(2025, 5, 10)) // 365 days
                .repaymentStatus(RepaymentStatus.CLOSED)
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, sampleRule2024);

        assertThat(res.getRuleVersion()).isEqualTo("v2024.1");
        // Effective prompt rate in 2024 rule is 4.50%
        // (100000 * 4.50 * 365) / 36500 = 4500.00
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("4500.00");
    }
}
