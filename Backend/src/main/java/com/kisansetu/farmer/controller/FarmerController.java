package com.kisansetu.farmer.controller;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.discrepancy.dto.DiscrepancyResponse;
import com.kisansetu.farmer.dto.FarmerDashboardResponse;
import com.kisansetu.farmer.dto.FarmerRequest;
import com.kisansetu.farmer.dto.FarmerResponse;
import com.kisansetu.farmer.service.FarmerService;
import com.kisansetu.grievance.dto.GrievanceResponse;
import com.kisansetu.land.dto.LandRecordResponse;
import com.kisansetu.loan.dto.LoanRecordResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/farmers")
@RequiredArgsConstructor
@Tag(name = "Farmer Profile & Dashboard", description = "Farmer management, land portfolio, loan history, and personal dashboard")
public class FarmerController {

    private final FarmerService farmerService;

    @PostMapping
    @Operation(summary = "Register Farmer Profile")
    public ResponseEntity<ApiResponse<FarmerResponse>> register(@Valid @RequestBody FarmerRequest request) {
        FarmerResponse response = farmerService.registerFarmer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Farmer profile created successfully"));
    }

    @GetMapping("/{farmerId}")
    @Operation(summary = "Get Farmer Profile by ID")
    public ResponseEntity<ApiResponse<FarmerResponse>> getProfile(@PathVariable UUID farmerId) {
        FarmerResponse response = farmerService.getFarmerProfile(farmerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{farmerId}")
    @Operation(summary = "Update Farmer Profile")
    public ResponseEntity<ApiResponse<FarmerResponse>> updateProfile(
            @PathVariable UUID farmerId,
            @Valid @RequestBody FarmerRequest request) {
        FarmerResponse response = farmerService.updateFarmerProfile(farmerId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Farmer profile updated successfully"));
    }

    @GetMapping("/{farmerId}/dashboard")
    @Operation(summary = "Get Farmer Comprehensive Dashboard",
            description = "Consolidates land holdings, active loans, detected discrepancies, and submitted grievances")
    public ResponseEntity<ApiResponse<FarmerDashboardResponse>> getDashboard(@PathVariable UUID farmerId) {
        FarmerDashboardResponse response = farmerService.getDashboard(farmerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{farmerId}/land-records")
    @Operation(summary = "Get Registered Land Records for Farmer")
    public ResponseEntity<ApiResponse<List<LandRecordResponse>>> getLandRecords(@PathVariable UUID farmerId) {
        List<LandRecordResponse> responses = farmerService.getLandRecords(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{farmerId}/loans")
    @Operation(summary = "Get Agricultural Loans for Farmer")
    public ResponseEntity<ApiResponse<List<LoanRecordResponse>>> getLoans(@PathVariable UUID farmerId) {
        List<LoanRecordResponse> responses = farmerService.getLoans(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{farmerId}/discrepancies")
    @Operation(summary = "Get Detected Discrepancies for Farmer")
    public ResponseEntity<ApiResponse<List<DiscrepancyResponse>>> getDiscrepancies(@PathVariable UUID farmerId) {
        List<DiscrepancyResponse> responses = farmerService.getDiscrepancies(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{farmerId}/grievances")
    @Operation(summary = "Get Grievance History for Farmer")
    public ResponseEntity<ApiResponse<List<GrievanceResponse>>> getGrievances(@PathVariable UUID farmerId) {
        List<GrievanceResponse> responses = farmerService.getGrievances(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
