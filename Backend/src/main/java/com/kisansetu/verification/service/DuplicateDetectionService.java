package com.kisansetu.verification.service;

import com.kisansetu.common.enums.CollateralStatus;
import com.kisansetu.common.enums.DiscrepancyCategory;
import com.kisansetu.common.enums.DiscrepancySeverity;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.util.FinancialUtils;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.land.entity.LandRecord;
import com.kisansetu.land.entity.Mortgage;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.loan.entity.LoanCollateral;
import com.kisansetu.loan.entity.LoanRecord;
import com.kisansetu.loan.repository.LoanCollateralRepository;
import com.kisansetu.verification.dto.VerificationAlert;
import com.kisansetu.verification.dto.VerificationReportResponse;
import com.kisansetu.verification.dto.VerificationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class DuplicateDetectionService {

    private final FarmerRepository farmerRepository;
    private final LandRecordRepository landRecordRepository;
    private final LoanCollateralRepository loanCollateralRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final LandVerificationService landVerificationService;
    private final LoanVerificationService loanVerificationService;

    // In-memory cache for fast report lookup by reportId
    private final Map<String, VerificationReportResponse> reportsCache = new ConcurrentHashMap<>();

    @Transactional
    public VerificationReportResponse verifyApplication(VerificationRequest request) {
        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", request.getFarmerId()));

        String reportId = "VR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        List<VerificationAlert> alerts = new ArrayList<>();

        boolean hasDuplicate = false;
        boolean hasMortgageMismatch = false;
        boolean hasOwnershipMismatch = false;
        boolean hasAreaMismatch = false;

        BigDecimal totalRecordedArea = BigDecimal.ZERO;

        for (Long landId : request.getLandRecordIds()) {
            Optional<LandRecord> landOpt = landRecordRepository.findById(landId);
            if (landOpt.isEmpty()) {
                alerts.add(VerificationAlert.builder()
                        .ruleCode("LAND_NOT_FOUND")
                        .severity(DiscrepancySeverity.CRITICAL)
                        .alertTitle("Land Parcel Not Registered")
                        .description("Requested land parcel ID " + landId + " does not exist in the land registry.")
                        .recommendation("Request physical land title deed (Khasra/Khatauni) verification.")
                        .build());
                continue;
            }

            LandRecord lr = landOpt.get();
            totalRecordedArea = totalRecordedArea.add(lr.getLandArea());

            // RULE 1: Potential Duplicate Financing (Same land parcel pledged in another active loan)
            List<LoanCollateral> activeCollaterals = loanCollateralRepository.findActiveCollateralsForLand(landId, CollateralStatus.ACTIVE);
            if (!activeCollaterals.isEmpty()) {
                hasDuplicate = true;
                List<String> loanRefs = activeCollaterals.stream()
                        .map(c -> c.getLoan().getLoanAccountReference() + " (" + c.getLoan().getBank().getBankName() + ")")
                        .toList();

                String alertDesc = String.format("Land parcel '%s' is already active collateral in %d existing loan(s): %s.",
                        lr.getFullGeoIdentity(), activeCollaterals.size(), String.join(", ", loanRefs));

                alerts.add(VerificationAlert.builder()
                        .ruleCode("DUPLICATE_FINANCING")
                        .severity(DiscrepancySeverity.CRITICAL)
                        .alertTitle("Potential Duplicate Financing Alert")
                        .description(alertDesc)
                        .recommendation("Conduct physical site and bank inspection. Note: Multiple loans do not automatically indicate fraud.")
                        .build());

                // Persist Discrepancy Record
                recordDiscrepancy(farmer, DiscrepancyCategory.POTENTIAL_DUPLICATE_FINANCING,
                        "PARCEL-" + landId, null, null, null, DiscrepancySeverity.CRITICAL, alertDesc);
            }

            // RULE 2: Ownership Mismatch (Applicant does not match recorded owner)
            boolean isOwner = landVerificationService.verifyOwnership(landId, farmer.getId());
            if (!isOwner) {
                hasOwnershipMismatch = true;
                String desc = String.format("Applicant '%s' is not listed as a verified titleholder for parcel '%s'.",
                        farmer.getFarmerName(), lr.getFullGeoIdentity());

                alerts.add(VerificationAlert.builder()
                        .ruleCode("OWNERSHIP_MISMATCH")
                        .severity(DiscrepancySeverity.HIGH)
                        .alertTitle("Title Ownership Mismatch")
                        .description(desc)
                        .recommendation("Verify legal inheritance, tenancy agreement, or mutation records (Naam-antaran).")
                        .build());

                recordDiscrepancy(farmer, DiscrepancyCategory.LAND_RECORD_MISMATCH,
                        "PARCEL-OWN-" + landId, null, null, null, DiscrepancySeverity.HIGH, desc);
            }

            // RULE 3: Undisclosed Mortgage
            List<Mortgage> activeMortgages = landVerificationService.getActiveMortgages(landId);
            if (!activeMortgages.isEmpty() && (request.getDeclaredExistingMortgage() == null || !request.getDeclaredExistingMortgage())) {
                hasMortgageMismatch = true;
                BigDecimal mortgageSum = activeMortgages.stream()
                        .map(Mortgage::getMortgageAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                alerts.add(VerificationAlert.builder()
                        .ruleCode("MORTGAGE_ALERT")
                        .severity(DiscrepancySeverity.HIGH)
                        .alertTitle("Undisclosed Prior Mortgage Registered")
                        .description(String.format("Parcel '%s' carries %d active mortgage encumbrance(s) totaling INR %s.",
                                lr.getFullGeoIdentity(), activeMortgages.size(), mortgageSum))
                        .recommendation("Obtain Non-Encumbrance Certificate (NEC) and prior charge clearance before sanctioning.")
                        .build());
            }
        }

        // RULE 4: Area Mismatch
        if (request.getProposedPledgedArea() != null && FinancialUtils.isGreaterThan(request.getProposedPledgedArea(), totalRecordedArea)) {
            hasAreaMismatch = true;
            alerts.add(VerificationAlert.builder()
                    .ruleCode("AREA_MISMATCH")
                    .severity(DiscrepancySeverity.MEDIUM)
                    .alertTitle("Requested Pledged Area Exceeds Recorded Area")
                    .description(String.format("Proposed pledged area (%s acres) exceeds verified total land area (%s acres) across submitted parcels.",
                            request.getProposedPledgedArea(), totalRecordedArea))
                    .recommendation("Align credit sanction scale with verified net cultivable area.")
                    .build());
        }

        // Existing loan exposure
        List<LoanRecord> activeLoans = loanVerificationService.getFarmerActiveLoans(farmer.getId());
        BigDecimal existingDebt = loanVerificationService.calculateExistingLoanExposure(farmer.getId());

        // Determine Risk Level
        String riskLevel = "LOW";
        if (hasDuplicate) {
            riskLevel = "CRITICAL";
        } else if (hasOwnershipMismatch || hasMortgageMismatch) {
            riskLevel = "HIGH";
        } else if (hasAreaMismatch || !activeLoans.isEmpty()) {
            riskLevel = "MODERATE";
        }

        VerificationReportResponse response = VerificationReportResponse.builder()
                .reportId(reportId)
                .farmerId(farmer.getId())
                .farmerName(farmer.getFarmerName())
                .mobileNumber(farmer.getMobileNumber())
                .totalParcelsChecked(request.getLandRecordIds().size())
                .totalRecordedArea(totalRecordedArea)
                .activeLoansFound(activeLoans.size())
                .existingLoanExposure(existingDebt)
                .hasDuplicateFinancing(hasDuplicate)
                .hasMortgageAlert(hasMortgageMismatch)
                .hasOwnershipMismatch(hasOwnershipMismatch)
                .hasAreaMismatch(hasAreaMismatch)
                .riskLevel(riskLevel)
                .alerts(alerts)
                .generatedAt(LocalDateTime.now())
                .build();

        reportsCache.put(reportId, response);
        return response;
    }

    @Transactional(readOnly = true)
    public VerificationReportResponse getReportById(String reportId) {
        VerificationReportResponse report = reportsCache.get(reportId);
        if (report == null) {
            throw new ResourceNotFoundException("Verification report not found: " + reportId);
        }
        return report;
    }

    private void recordDiscrepancy(Farmer farmer, DiscrepancyCategory category, String refId,
                                  BigDecimal expected, BigDecimal actual, BigDecimal diff,
                                  DiscrepancySeverity severity, String description) {
        var existing = discrepancyRepository.findByFarmerIdAndCategoryAndReferenceId(farmer.getId(), category, refId);
        if (existing.isEmpty()) {
            Discrepancy discrepancy = Discrepancy.builder()
                    .farmer(farmer)
                    .category(category)
                    .referenceId(refId)
                    .expectedAmount(expected)
                    .actualAmount(actual)
                    .differenceAmount(diff)
                    .severity(severity)
                    .description(description)
                    .verificationStatus(VerificationStatus.DETECTED)
                    .build();
            discrepancyRepository.save(discrepancy);
        }
    }
}
