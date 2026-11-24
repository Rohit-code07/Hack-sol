package com.kisansetu.verification.controller;

import com.kisansetu.common.enums.RepaymentStatus;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.common.util.SecurityUtils;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.farmer.dto.FarmerResponse;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.grievance.entity.Grievance;
import com.kisansetu.grievance.repository.GrievanceRepository;
import com.kisansetu.land.dto.LandRecordResponse;
import com.kisansetu.land.entity.LandRecord;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.loan.dto.LoanRecordResponse;
import com.kisansetu.loan.entity.LoanRecord;
import com.kisansetu.loan.repository.LoanRecordRepository;
import com.kisansetu.verification.dto.*;
import com.kisansetu.verification.entity.VerificationRecord;
import com.kisansetu.verification.repository.VerificationRecordRepository;
import com.kisansetu.verification.service.DuplicateDetectionService;
import com.kisansetu.verification.service.LandVerificationService;
import com.kisansetu.verification.service.LoanVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/bank")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BANK_OFFICER')")
@Tag(name = "Bank Officer Verification", description = "Farmer searching, land record verification, duplicate financing detection, and loan risk analysis")
public class VerificationController {

    private final FarmerRepository farmerRepository;
    private final LandVerificationService landVerificationService;
    private final LoanVerificationService loanVerificationService;
    private final DuplicateDetectionService duplicateDetectionService;
    private final VerificationRecordRepository verificationRecordRepository;
    private final LandRecordRepository landRecordRepository;
    private final LoanRecordRepository loanRecordRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final GrievanceRepository grievanceRepository;

    @GetMapping("/farmers/search")
    @Operation(summary = "Search Farmers", description = "Search farmers by name, mobile number, village, or district")
    public ResponseEntity<ApiResponse<List<FarmerResponse>>> searchFarmers(@RequestParam(required = false, defaultValue = "") String query) {
        List<Farmer> farmers = farmerRepository.searchFarmers(query);
        List<FarmerResponse> responses = farmers.stream()
                .map(f -> FarmerResponse.builder()
                        .id(f.getId())
                        .userId(f.getUser() != null ? f.getUser().getId() : null)
                        .farmerName(f.getFarmerName())
                        .fatherSpouseName(f.getFatherSpouseName())
                        .dob(f.getDob())
                        .gender(f.getGender())
                        .mobileNumber(f.getMobileNumber())
                        .alternateMobile(f.getAlternateMobile())
                        .aadhaarNumber(f.getAadhaarNumber())
                        .category(f.getCategory())
                        .address(f.getAddress())
                        .village(f.getVillage())
                        .tehsil(f.getTehsil())
                        .district(f.getDistrict())
                        .state(f.getState())
                        .pinCode(f.getPinCode())
                        .farmerType(f.getFarmerType())
                        .farmingType(f.getFarmingType())
                        .primaryCrop(f.getPrimaryCrop())
                        .secondaryCrops(f.getSecondaryCrops())
                        .totalLandArea(f.getTotalLandArea())
                        .irrigationAvailable(f.getIrrigationAvailable())
                        .irrigationType(f.getIrrigationType())
                        .soilType(f.getSoilType())
                        .documentsJson(f.getDocumentsJson())
                        .profileCompletionPercentage(f.getProfileCompletionPercentage() != null ? f.getProfileCompletionPercentage() : f.calculateCompletionPercentage())
                        .preferredLanguage(f.getPreferredLanguage())
                        .createdAt(f.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/land/search")
    @Operation(summary = "Search Land Records", description = "Searches land records using geographical composite identity (State, District, Tehsil, Village, Khasra Number)")
    public ResponseEntity<ApiResponse<List<LandRecordResponse>>> searchLand(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String tehsil,
            @RequestParam(required = false) String village,
            @RequestParam(required = false) String khasraNumber) {

        List<LandRecord> parcels = landVerificationService.searchParcels(state, district, tehsil, village, khasraNumber);
        List<LandRecordResponse> responses = parcels.stream()
                .map(lr -> LandRecordResponse.builder()
                        .id(lr.getId())
                        .khasraNumber(lr.getKhasraNumber())
                        .khataNumber(lr.getKhataNumber())
                        .surveyNumber(lr.getSurveyNumber())
                        .village(lr.getVillage())
                        .tehsil(lr.getTehsil())
                        .district(lr.getDistrict())
                        .state(lr.getState())
                        .landArea(lr.getLandArea())
                        .areaUnit(lr.getAreaUnit())
                        .ownerName(lr.getOwnerName())
                        .coOwnerDetails(lr.getCoOwnerDetails())
                        .irrigationStatus(lr.getIrrigationStatus())
                        .landUsage(lr.getLandUsage())
                        .isMortgaged(lr.getIsMortgaged())
                        .isCollateral(lr.getIsCollateral())
                        .verificationStatus(lr.getVerificationStatus() != null ? lr.getVerificationStatus() : "PENDING")
                        .verificationRemarks(lr.getVerificationRemarks())
                        .verifiedAt(lr.getVerifiedAt())
                        .ownershipStatus(lr.getOwnershipStatus())
                        .fullGeoIdentity(lr.getFullGeoIdentity())
                        .createdAt(lr.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/loan-history/{farmerId}")
    @Transactional(readOnly = true)
    @Operation(summary = "View Farmer Agricultural Loan History", description = "Fetches all past and active agricultural loan records for a farmer across banks")
    public ResponseEntity<ApiResponse<List<LoanRecordResponse>>> getLoanHistory(@PathVariable UUID farmerId) {
        List<LoanRecord> loans = loanVerificationService.getFarmerLoanHistory(farmerId);
        List<LoanRecordResponse> responses = loans.stream()
                .map(l -> LoanRecordResponse.builder()
                        .id(l.getId())
                        .farmerId(l.getFarmer().getId())
                        .farmerName(l.getFarmer().getFarmerName())
                        .bankId(l.getBank().getId())
                        .bankName(l.getBank().getBankName())
                        .branchName(l.getBank().getBranchName())
                        .ifscCode(l.getBank().getIfscCode())
                        .loanAccountReference(l.getLoanAccountReference())
                        .loanType(l.getLoanType())
                        .sanctionedAmount(l.getSanctionedAmount())
                        .disbursedAmount(l.getDisbursedAmount())
                        .outstandingAmount(l.getOutstandingAmount())
                        .interestRate(l.getInterestRate())
                        .loanPurpose(l.getLoanPurpose())
                        .cropSeason(l.getCropSeason())
                        .cropName(l.getCropName())
                        .linkedKhasra(l.getLinkedKhasra())
                        .subsidyApplied(l.getSubsidyApplied())
                        .subsidyReceived(l.getSubsidyReceived())
                        .subsidyAmountReceived(l.getSubsidyAmountReceived())
                        .lastPaymentDate(l.getLastPaymentDate())
                        .disbursementDate(l.getDisbursementDate())
                        .maturityDate(l.getMaturityDate())
                        .repaymentStatus(l.getRepaymentStatus())
                        .verificationStatus(l.getVerificationStatus())
                        .duplicateFlag(l.getDuplicateFlag())
                        .createdAt(l.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/verify-application")
    @Operation(summary = "Cross-Verify Loan Application",
            description = "Runs comprehensive automated cross-verification rules: Duplicate Financing, Ownership Mismatch, Undisclosed Mortgages, and Area Discrepancies")
    public ResponseEntity<ApiResponse<VerificationReportResponse>> verifyApplication(
            @Valid @RequestBody VerificationRequest request) {
        VerificationReportResponse report = duplicateDetectionService.verifyApplication(request);
        return ResponseEntity.ok(ApiResponse.success(report, "Application verification completed successfully"));
    }

    @PostMapping("/verifications/decision")
    @Operation(summary = "Record Bank Officer Verification Decision",
            description = "Stores officer approval, rejection, or mismatch findings with audit trail")
    public ResponseEntity<ApiResponse<VerificationRecordResponse>> recordDecision(
            @Valid @RequestBody VerificationDecisionRequest request) {

        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", request.getFarmerId()));

        String officer = SecurityUtils.getCurrentUsername();
        if (officer == null) officer = "bank_officer";

        VerificationRecord record = VerificationRecord.builder()
                .farmer(farmer)
                .officerUsername(officer)
                .recordType(request.getRecordType())
                .targetId(request.getTargetId())
                .verificationStatus(request.getVerificationStatus())
                .remarks(request.getRemarks())
                .reasonForMismatch(request.getReasonForMismatch())
                .additionalDocumentsRequested(request.getAdditionalDocumentsRequested())
                .createdAt(LocalDateTime.now())
                .build();

        record = verificationRecordRepository.save(record);

        // Update target record status if applicable
        if ("LAND".equalsIgnoreCase(request.getRecordType())) {
            try {
                Long landId = Long.parseLong(request.getTargetId());
                landRecordRepository.findById(landId).ifPresent(lr -> {
                    lr.setVerificationStatus(request.getVerificationStatus());
                    lr.setVerificationRemarks(request.getRemarks());
                    lr.setVerifiedAt(LocalDateTime.now());
                    landRecordRepository.save(lr);
                });
            } catch (Exception ignored) {}
        } else if ("LOAN".equalsIgnoreCase(request.getRecordType())) {
            try {
                Long loanId = Long.parseLong(request.getTargetId());
                loanRecordRepository.findById(loanId).ifPresent(l -> {
                    l.setVerificationStatus(request.getVerificationStatus());
                    loanRecordRepository.save(l);
                });
            } catch (Exception ignored) {}
        }

        VerificationRecordResponse response = VerificationRecordResponse.builder()
                .id(record.getId())
                .farmerId(farmer.getId())
                .farmerName(farmer.getFarmerName())
                .officerUsername(record.getOfficerUsername())
                .recordType(record.getRecordType())
                .targetId(record.getTargetId())
                .verificationStatus(record.getVerificationStatus())
                .remarks(record.getRemarks())
                .reasonForMismatch(record.getReasonForMismatch())
                .additionalDocumentsRequested(record.getAdditionalDocumentsRequested())
                .createdAt(record.getCreatedAt())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Verification decision recorded into audit log"));
    }

    @GetMapping("/verifications/records/{farmerId}")
    @Operation(summary = "Get Verification Audit History for a Farmer")
    public ResponseEntity<ApiResponse<List<VerificationRecordResponse>>> getVerificationRecords(@PathVariable UUID farmerId) {
        List<VerificationRecord> records = verificationRecordRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        List<VerificationRecordResponse> responses = records.stream()
                .map(r -> VerificationRecordResponse.builder()
                        .id(r.getId())
                        .farmerId(r.getFarmer().getId())
                        .farmerName(r.getFarmer().getFarmerName())
                        .officerUsername(r.getOfficerUsername())
                        .recordType(r.getRecordType())
                        .targetId(r.getTargetId())
                        .verificationStatus(r.getVerificationStatus())
                        .remarks(r.getRemarks())
                        .reasonForMismatch(r.getReasonForMismatch())
                        .additionalDocumentsRequested(r.getAdditionalDocumentsRequested())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get Bank Officer Console Dashboard Metrics")
    public ResponseEntity<ApiResponse<BankDashboardStatsResponse>> getDashboardStats() {
        long totalFarmers = farmerRepository.count();
        long totalLoans = loanRecordRepository.count();
        long duplicateFlags = loanRecordRepository.findAll().stream().filter(l -> Boolean.TRUE.equals(l.getDuplicateFlag())).count();
        long mismatches = discrepancyRepository.count();
        long openGrievances = grievanceRepository.findAll().stream()
                .filter(g -> !"RESOLVED".equalsIgnoreCase(g.getGrievanceStatus().name()))
                .count();

        long pendingVerifications = landRecordRepository.findAll().stream()
                .filter(lr -> "PENDING".equalsIgnoreCase(lr.getVerificationStatus()))
                .count();

        long verifiedCount = landRecordRepository.findAll().stream()
                .filter(lr -> "VERIFIED".equalsIgnoreCase(lr.getVerificationStatus()))
                .count();

        // District Breakdown
        Map<String, Integer> distCounts = new HashMap<>();
        for (Farmer f : farmerRepository.findAll()) {
            distCounts.put(f.getDistrict(), distCounts.getOrDefault(f.getDistrict(), 0) + 1);
        }

        List<Map<String, Object>> districtMismatches = new ArrayList<>();
        distCounts.forEach((dist, count) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("district", dist);
            item.put("verified", count);
            item.put("mismatches", 0);
            districtMismatches.add(item);
        });

        List<Map<String, Object>> loanPortfolio = List.of(
                Map.of("name", "Active", "value", totalLoans > 0 ? totalLoans : 1, "fill", "#4D7A5A"),
                Map.of("name", "Closed", "value", 0, "fill", "#6B6558"),
                Map.of("name", "NPA", "value", 0, "fill", "#B42318")
        );

        BankDashboardStatsResponse response = BankDashboardStatsResponse.builder()
                .totalFarmers(totalFarmers)
                .totalLoans(totalLoans)
                .pendingVerifications(pendingVerifications)
                .verifiedCount(verifiedCount)
                .mismatchCount(mismatches)
                .duplicateFlagCount(duplicateFlags)
                .openGrievancesCount(openGrievances)
                .districtMismatches(districtMismatches)
                .loanPortfolio(loanPortfolio)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
