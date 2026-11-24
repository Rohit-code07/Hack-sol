package com.kisansetu.scheme.controller;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.scheme.dto.InsuranceClaimRequest;
import com.kisansetu.scheme.dto.InsurancePolicyRequest;
import com.kisansetu.scheme.dto.InsuranceRecordResponse;
import com.kisansetu.scheme.dto.MspTransactionRequest;
import com.kisansetu.scheme.dto.MspTransactionResponse;
import com.kisansetu.scheme.service.SchemeService;
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
@RequestMapping("/api/v1/schemes")
@RequiredArgsConstructor
@Tag(name = "Agricultural Schemes", description = "MSP procurement and PMFBY crop insurance lifecycle")
public class SchemeController {

    private final SchemeService schemeService;

    @PostMapping("/msp")
    @Operation(summary = "Record MSP Crop Procurement")
    public ResponseEntity<ApiResponse<MspTransactionResponse>> recordMsp(@Valid @RequestBody MspTransactionRequest request) {
        MspTransactionResponse response = schemeService.recordMspTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "MSP procurement record saved successfully"));
    }

    @GetMapping("/msp/farmer/{farmerId}")
    @Operation(summary = "Get MSP Procurement Records by Farmer")
    public ResponseEntity<ApiResponse<List<MspTransactionResponse>>> getMspByFarmer(@PathVariable UUID farmerId) {
        List<MspTransactionResponse> responses = schemeService.getMspTransactionsByFarmer(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/insurance/policy")
    @Operation(summary = "Register PMFBY Crop Insurance Policy")
    public ResponseEntity<ApiResponse<InsuranceRecordResponse>> registerPolicy(@Valid @RequestBody InsurancePolicyRequest request) {
        InsuranceRecordResponse response = schemeService.registerInsurancePolicy(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Insurance policy registered successfully"));
    }

    @PostMapping("/insurance/claim")
    @Operation(summary = "Submit PMFBY Crop Damage Insurance Claim")
    public ResponseEntity<ApiResponse<InsuranceRecordResponse>> submitClaim(@Valid @RequestBody InsuranceClaimRequest request) {
        InsuranceRecordResponse response = schemeService.submitInsuranceClaim(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Insurance claim submitted for review"));
    }

    @GetMapping({"/insurance/policies/{farmerId}", "/insurance/farmer/{farmerId}"})
    @Operation(summary = "Get Insurance Policies and Claims by Farmer")
    public ResponseEntity<ApiResponse<List<InsuranceRecordResponse>>> getInsuranceByFarmer(@PathVariable UUID farmerId) {
        List<InsuranceRecordResponse> responses = schemeService.getInsuranceRecordsByFarmer(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
