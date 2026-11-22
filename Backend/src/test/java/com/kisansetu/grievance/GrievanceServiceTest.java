package com.kisansetu.grievance;

import com.kisansetu.common.enums.DiscrepancyCategory;
import com.kisansetu.common.enums.DiscrepancySeverity;
import com.kisansetu.common.enums.GrievanceStatus;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.grievance.dto.GrievanceGenerateRequest;
import com.kisansetu.grievance.dto.GrievanceResponse;
import com.kisansetu.grievance.entity.Grievance;
import com.kisansetu.grievance.repository.GrievanceRepository;
import com.kisansetu.grievance.service.GrievancePdfService;
import com.kisansetu.grievance.service.GrievanceService;
import com.kisansetu.integration.ai.AIClientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GrievanceServiceTest {

    @Mock
    private GrievanceRepository grievanceRepository;

    @Mock
    private DiscrepancyRepository discrepancyRepository;

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private AIClientService aiClientService;

    @Mock
    private com.kisansetu.common.util.FarmerAccessValidator farmerAccessValidator;

    @Spy
    private GrievancePdfService pdfService = new GrievancePdfService();

    @InjectMocks
    private GrievanceService grievanceService;

    private Farmer testFarmer;
    private Discrepancy testDiscrepancy;

    @BeforeEach
    void setUp() {
        UUID farmerId = UUID.randomUUID();
        testFarmer = Farmer.builder()
                .id(farmerId)
                .farmerName("Ramesh Patel")
                .mobileNumber("9827100001")
                .village("Arang")
                .tehsil("Arang")
                .district("Raipur")
                .state("Chhattisgarh")
                .build();

        testDiscrepancy = Discrepancy.builder()
                .id(1L)
                .farmer(testFarmer)
                .category(DiscrepancyCategory.MSP_PAYMENT_DISCREPANCY)
                .referenceId("MSP-ARNG-2023-001")
                .expectedAmount(new BigDecimal("110000.00"))
                .actualAmount(new BigDecimal("95000.00"))
                .differenceAmount(new BigDecimal("15000.00"))
                .severity(DiscrepancySeverity.HIGH)
                .description("Expected net payment INR 110,000 exceeds actual payout INR 95,000 by INR 15,000.")
                .build();
    }

    @Test
    @DisplayName("Generate grievance letter preserving exact financial figures")
    void testGenerateGrievance_PreservesFinancialFigures() {
        GrievanceGenerateRequest req = GrievanceGenerateRequest.builder()
                .farmerId(testFarmer.getId())
                .discrepancyId(1L)
                .language("en")
                .build();

        when(farmerRepository.findById(testFarmer.getId())).thenReturn(Optional.of(testFarmer));
        when(discrepancyRepository.findById(1L)).thenReturn(Optional.of(testDiscrepancy));

        Grievance savedGrievance = Grievance.builder()
                .id(10L)
                .farmer(testFarmer)
                .discrepancy(testDiscrepancy)
                .subject("Representation for Rectification of Entitlement Discrepancy")
                .grievanceContent("Content with shortfall 15000.00")
                .language("en")
                .grievanceStatus(GrievanceStatus.SUBMITTED)
                .createdAt(LocalDateTime.now())
                .build();

        when(grievanceRepository.save(any(Grievance.class))).thenReturn(savedGrievance);

        GrievanceResponse res = grievanceService.generateGrievance(req);

        assertThat(res.getId()).isEqualTo(10L);
        assertThat(res.getRecordedDifferenceAmount()).isEqualByComparingTo("15000.00");
    }

    @Test
    @DisplayName("Generate grievance PDF successfully produces non-empty byte array")
    void testGeneratePdf() {
        Grievance grievance = Grievance.builder()
                .id(10L)
                .farmer(testFarmer)
                .discrepancy(testDiscrepancy)
                .subject("Representation for Rectification of Entitlement Discrepancy")
                .grievanceContent("Formal petition content for testing PDF generation.")
                .language("en")
                .evidenceChecklist("1. Bank passbook\n2. Mandi slip")
                .grievanceStatus(GrievanceStatus.SUBMITTED)
                .createdAt(LocalDateTime.now())
                .build();

        when(grievanceRepository.findById(10L)).thenReturn(Optional.of(grievance));

        byte[] pdf = grievanceService.getGrievancePdf(10L);

        assertThat(pdf).isNotNull();
        assertThat(pdf.length).isGreaterThan(100);
        // Standard PDF file begins with "%PDF-"
        assertThat(new String(pdf, 0, 5)).isEqualTo("%PDF-");
    }

    @Test
    @DisplayName("Missing discrepancy throws ResourceNotFoundException")
    void testMissingDiscrepancy_ThrowsException() {
        GrievanceGenerateRequest req = GrievanceGenerateRequest.builder()
                .farmerId(testFarmer.getId())
                .discrepancyId(999L)
                .build();

        when(farmerRepository.findById(testFarmer.getId())).thenReturn(Optional.of(testFarmer));
        when(discrepancyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> grievanceService.generateGrievance(req));
    }
}
