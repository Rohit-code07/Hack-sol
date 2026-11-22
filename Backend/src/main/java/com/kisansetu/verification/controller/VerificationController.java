package com.kisansetu.verification.controller;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.farmer.dto.FarmerResponse;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.land.dto.LandRecordResponse;
import com.kisansetu.land.entity.LandRecord;
import com.kisansetu.loan.dto.LoanRecordResponse;
import com.kisansetu.loan.entity.LoanRecord;
import com.kisansetu.verification.dto.VerificationReportResponse;
import com.kisansetu.verification.dto.VerificationRequest;
import com.kisansetu.verification.service.DuplicateDetectionService;
import com.kisansetu.verification.service.LandVerificationService;
import com.kisansetu.verification.service.LoanVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
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

    @GetMapping("/farmers/search")
    @Operation(summary = "Search Farmers", description = "Search farmers by name, mobile number, village, or district")
    public ResponseEntity<ApiResponse<List<FarmerResponse>>> searchFarmers(@RequestParam(required = false, defaultValue = "") String query) {
        List<Farmer> farmers = farmerRepository.searchFarmers(query);
        List<FarmerResponse> responses = farmers.stream()
                .map(f -> FarmerResponse.builder()
                        .id(f.getId())
                        .userId(f.getUser() != null ? f.getUser().getId() : null)
                        .farmerName(f.getFarmerName())
                        .mobileNumber(f.getMobileNumber())
                        .village(f.getVillage())
                        .tehsil(f.getTehsil())
                        .district(f.getDistrict())
                        .state(f.getState())
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
                        .village(lr.getVillage())
                        .tehsil(lr.getTehsil())
                        .district(lr.getDistrict())
                        .state(lr.getState())
                        .landArea(lr.getLandArea())
                        .areaUnit(lr.getAreaUnit())
                        .ownershipStatus(lr.getOwnershipStatus())
                        .fullGeoIdentity(lr.getFullGeoIdentity())
                        .createdAt(lr.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/loan-history/{farmerId}")
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
                        .interestRate(l.getInterestRate())
                        .disbursementDate(l.getDisbursementDate())
                        .maturityDate(l.getMaturityDate())
                        .repaymentStatus(l.getRepaymentStatus())
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

    @GetMapping("/verification-reports/{reportId}")
    @Operation(summary = "Get Verification Report by Report ID")
    public ResponseEntity<ApiResponse<VerificationReportResponse>> getReport(@PathVariable String reportId) {
        VerificationReportResponse report = duplicateDetectionService.getReportById(reportId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
