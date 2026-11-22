package com.kisansetu.verification;

import com.kisansetu.bank.entity.Bank;
import com.kisansetu.common.enums.CollateralStatus;
import com.kisansetu.common.enums.LoanType;
import com.kisansetu.common.enums.MortgageStatus;
import com.kisansetu.common.enums.RepaymentStatus;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.land.entity.LandRecord;
import com.kisansetu.land.entity.Mortgage;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.loan.entity.LoanCollateral;
import com.kisansetu.loan.entity.LoanRecord;
import com.kisansetu.loan.repository.LoanCollateralRepository;
import com.kisansetu.verification.dto.VerificationReportResponse;
import com.kisansetu.verification.dto.VerificationRequest;
import com.kisansetu.verification.service.DuplicateDetectionService;
import com.kisansetu.verification.service.LandVerificationService;
import com.kisansetu.verification.service.LoanVerificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class VerificationServiceTest {

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private LandRecordRepository landRecordRepository;

    @Mock
    private LoanCollateralRepository loanCollateralRepository;

    @Mock
    private DiscrepancyRepository discrepancyRepository;

    @Mock
    private LandVerificationService landVerificationService;

    @Mock
    private LoanVerificationService loanVerificationService;

    @InjectMocks
    private DuplicateDetectionService duplicateDetectionService;

    private Farmer testFarmer;
    private LandRecord testParcel;
    private Bank testBank;

    @BeforeEach
    void setUp() {
        UUID farmerId = UUID.randomUUID();
        testFarmer = Farmer.builder()
                .id(farmerId)
                .farmerName("Ramesh Kumar Patel")
                .mobileNumber("9827100001")
                .village("Arang")
                .district("Raipur")
                .state("Chhattisgarh")
                .build();

        testParcel = LandRecord.builder()
                .id(101L)
                .khasraNumber("215/3")
                .village("Arang")
                .tehsil("Arang")
                .district("Raipur")
                .state("Chhattisgarh")
                .landArea(new BigDecimal("3.20"))
                .build();

        testBank = Bank.builder()
                .id(1L)
                .bankName("State Bank of India")
                .build();
    }

    @Test
    @DisplayName("RULE 1: Same land parcel pledged in another active loan generates duplicate financing alert")
    void testDuplicateFinancingAlert() {
        when(farmerRepository.findById(testFarmer.getId())).thenReturn(Optional.of(testFarmer));
        when(landRecordRepository.findById(101L)).thenReturn(Optional.of(testParcel));

        LoanRecord existingLoan = LoanRecord.builder()
                .id(1L)
                .loanAccountReference("KCC-EXISTING-101")
                .bank(testBank)
                .repaymentStatus(RepaymentStatus.ACTIVE)
                .disbursedAmount(new BigDecimal("150000.00"))
                .build();

        LoanCollateral existingCollateral = LoanCollateral.builder()
                .id(50L)
                .loan(existingLoan)
                .landRecord(testParcel)
                .collateralStatus(CollateralStatus.ACTIVE)
                .build();

        when(loanCollateralRepository.findActiveCollateralsForLand(101L, CollateralStatus.ACTIVE))
                .thenReturn(List.of(existingCollateral));
        when(landVerificationService.verifyOwnership(101L, testFarmer.getId())).thenReturn(true);
        when(landVerificationService.getActiveMortgages(101L)).thenReturn(Collections.emptyList());
        when(loanVerificationService.getFarmerActiveLoans(testFarmer.getId())).thenReturn(List.of(existingLoan));
        when(loanVerificationService.calculateExistingLoanExposure(testFarmer.getId())).thenReturn(new BigDecimal("150000.00"));

        VerificationRequest req = VerificationRequest.builder()
                .farmerId(testFarmer.getId())
                .landRecordIds(List.of(101L))
                .requestedLoanAmount(new BigDecimal("120000.00"))
                .build();

        VerificationReportResponse report = duplicateDetectionService.verifyApplication(req);

        assertThat(report.isHasDuplicateFinancing()).isTrue();
        assertThat(report.getRiskLevel()).isEqualTo("CRITICAL");
        assertThat(report.getAlerts()).anyMatch(a -> "DUPLICATE_FINANCING".equals(a.getRuleCode()));
    }

    @Test
    @DisplayName("RULE 2: Ownership mismatch alert generated when applicant does not hold title")
    void testOwnershipMismatchAlert() {
        when(farmerRepository.findById(testFarmer.getId())).thenReturn(Optional.of(testFarmer));
        when(landRecordRepository.findById(101L)).thenReturn(Optional.of(testParcel));
        when(loanCollateralRepository.findActiveCollateralsForLand(101L, CollateralStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(landVerificationService.verifyOwnership(101L, testFarmer.getId())).thenReturn(false); // Not owner!
        when(landVerificationService.getActiveMortgages(101L)).thenReturn(Collections.emptyList());

        VerificationRequest req = VerificationRequest.builder()
                .farmerId(testFarmer.getId())
                .landRecordIds(List.of(101L))
                .build();

        VerificationReportResponse report = duplicateDetectionService.verifyApplication(req);

        assertThat(report.isHasOwnershipMismatch()).isTrue();
        assertThat(report.getAlerts()).anyMatch(a -> "OWNERSHIP_MISMATCH".equals(a.getRuleCode()));
    }

    @Test
    @DisplayName("RULE 3: Undisclosed prior mortgage generates mortgage verification alert")
    void testUndisclosedMortgageAlert() {
        when(farmerRepository.findById(testFarmer.getId())).thenReturn(Optional.of(testFarmer));
        when(landRecordRepository.findById(101L)).thenReturn(Optional.of(testParcel));
        when(loanCollateralRepository.findActiveCollateralsForLand(101L, CollateralStatus.ACTIVE))
                .thenReturn(Collections.emptyList());
        when(landVerificationService.verifyOwnership(101L, testFarmer.getId())).thenReturn(true);

        Mortgage activeMortgage = Mortgage.builder()
                .id(1L)
                .mortgageAmount(new BigDecimal("150000.00"))
                .mortgageStatus(MortgageStatus.ACTIVE)
                .build();

        when(landVerificationService.getActiveMortgages(101L)).thenReturn(List.of(activeMortgage));

        VerificationRequest req = VerificationRequest.builder()
                .farmerId(testFarmer.getId())
                .landRecordIds(List.of(101L))
                .declaredExistingMortgage(false) // Did not disclose!
                .build();

        VerificationReportResponse report = duplicateDetectionService.verifyApplication(req);

        assertThat(report.isHasMortgageAlert()).isTrue();
        assertThat(report.getAlerts()).anyMatch(a -> "MORTGAGE_ALERT".equals(a.getRuleCode()));
    }
}
