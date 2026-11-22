package com.kisansetu.entitlement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisansetu.common.enums.CalculationStatus;
import com.kisansetu.common.exception.InsufficientDataException;
import com.kisansetu.entitlement.calculator.MSPCalculator;
import com.kisansetu.entitlement.dto.EntitlementCalculationResponse;
import com.kisansetu.entitlement.dto.MspVerificationRequest;
import com.kisansetu.scheme.entity.SchemeRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class MSPCalculatorTest {

    private MSPCalculator calculator;
    private SchemeRule kharif2023Rule;
    private SchemeRule rabi2023Rule;
    private UUID testFarmerId;

    @BeforeEach
    void setUp() {
        calculator = new MSPCalculator(new ObjectMapper());
        testFarmerId = UUID.randomUUID();

        kharif2023Rule = SchemeRule.builder()
                .schemeCode("MSP_KHARIF_2023")
                .schemeName("MSP Kharif 2023-24")
                .ruleVersion("v2023.KHARIF")
                .sourceDocument("CACP Kharif 2023-24")
                .ruleData("{\"rates\": {\"PADDY_COMMON\": 2183.00, \"PADDY_GRADE_A\": 2203.00, \"MAIZE\": 2090.00, \"SOYABEAN\": 4600.00}}")
                .build();

        rabi2023Rule = SchemeRule.builder()
                .schemeCode("MSP_RABI_2023")
                .schemeName("MSP Rabi 2023-24")
                .ruleVersion("v2023.RABI")
                .sourceDocument("CACP Rabi 2023-24")
                .ruleData("{\"rates\": {\"WHEAT\": 2275.00, \"GRAM\": 5440.00, \"MUSTARD\": 5650.00}}")
                .build();
    }

    @Test
    @DisplayName("Correct MSP payment matches expected net entitlement")
    void testCorrectPayment_MatchesExpected() {
        MspVerificationRequest req = MspVerificationRequest.builder()
                .farmerId(testFarmerId)
                .crop("PADDY_COMMON")
                .marketingSeason("KHARIF_2023")
                .acceptedQuantity(new BigDecimal("40.00"))
                .documentedDeductions(new BigDecimal("120.00"))
                .actualPayment(new BigDecimal("87200.00")) // (40 * 2183) - 120 = 87320 - 120 = 87200
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, kharif2023Rule);

        assertThat(res.getEligibilityStatus()).isEqualTo(CalculationStatus.VERIFIED_MATCH);
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("87200.00");
        assertThat(res.getActualAmount()).isEqualByComparingTo("87200.00");
        assertThat(res.getDifferenceAmount()).isEqualByComparingTo("0.00");
    }

    @Test
    @DisplayName("Underpayment discrepancy detected when actual payment is less than net entitlement")
    void testPaymentDiscrepancy_Underpayment() {
        MspVerificationRequest req = MspVerificationRequest.builder()
                .farmerId(testFarmerId)
                .crop("PADDY_GRADE_A")
                .marketingSeason("KHARIF_2023")
                .acceptedQuantity(new BigDecimal("50.00"))
                .documentedDeductions(new BigDecimal("150.00"))
                .actualPayment(new BigDecimal("95000.00")) // Expected: (50 * 2203) - 150 = 110150 - 150 = 110000
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, kharif2023Rule);

        assertThat(res.getEligibilityStatus()).isEqualTo(CalculationStatus.DISCREPANCY_DETECTED);
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("110000.00");
        assertThat(res.getActualAmount()).isEqualByComparingTo("95000.00");
        assertThat(res.getDifferenceAmount()).isEqualByComparingTo("15000.00");
    }

    @Test
    @DisplayName("Different crops (e.g. Wheat in Rabi) use crop-specific official rates")
    void testDifferentCrop_WheatRabi() {
        MspVerificationRequest req = MspVerificationRequest.builder()
                .farmerId(testFarmerId)
                .crop("WHEAT")
                .marketingSeason("RABI_2023")
                .acceptedQuantity(new BigDecimal("30.00"))
                .documentedDeductions(new BigDecimal("100.00"))
                .actualPayment(new BigDecimal("68150.00")) // (30 * 2275) - 100 = 68250 - 100 = 68150
                .build();

        EntitlementCalculationResponse res = calculator.calculate(req, rabi2023Rule);

        assertThat(res.getEligibilityStatus()).isEqualTo(CalculationStatus.VERIFIED_MATCH);
        assertThat(res.getExpectedAmount()).isEqualByComparingTo("68150.00");
    }

    @Test
    @DisplayName("Missing accepted quantity throws InsufficientDataException")
    void testMissingQuantity_ThrowsInsufficientData() {
        MspVerificationRequest req = MspVerificationRequest.builder()
                .farmerId(testFarmerId)
                .crop("PADDY_COMMON")
                .marketingSeason("KHARIF_2023")
                .actualPayment(new BigDecimal("50000.00"))
                .build();

        assertThrows(InsufficientDataException.class, () -> calculator.calculate(req, kharif2023Rule));
    }

    @Test
    @DisplayName("Missing MSP rule for unknown crop throws InsufficientDataException")
    void testMissingMspRule_ThrowsInsufficientData() {
        MspVerificationRequest req = MspVerificationRequest.builder()
                .farmerId(testFarmerId)
                .crop("EXOTIC_SAFFRON")
                .marketingSeason("KHARIF_2023")
                .acceptedQuantity(new BigDecimal("10.00"))
                .actualPayment(new BigDecimal("50000.00"))
                .build();

        assertThrows(InsufficientDataException.class, () -> calculator.calculate(req, kharif2023Rule));
    }
}
