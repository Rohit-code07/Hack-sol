package com.kisansetu.entitlement.controller;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.entitlement.dto.EntitlementCalculationResponse;
import com.kisansetu.entitlement.dto.InsuranceReconciliationRequest;
import com.kisansetu.entitlement.dto.KccEvaluationRequest;
import com.kisansetu.entitlement.dto.MspVerificationRequest;
import com.kisansetu.entitlement.service.EntitlementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/entitlements")
@RequiredArgsConstructor
@Tag(name = "Entitlement Rule Engine", description = "Deterministic, auditable financial calculations for KCC, MSP, and Insurance")
public class EntitlementController {

    private final EntitlementService entitlementService;

    @PostMapping("/kcc/evaluate")
    @Operation(summary = "Evaluate KCC Interest Subvention & Incentive",
            description = "Calculates exact statutory KCC interest under Modified Interest Subvention Scheme (MISS) based on repayment timeliness")
    public ResponseEntity<ApiResponse<EntitlementCalculationResponse>> evaluateKcc(
            @Valid @RequestBody KccEvaluationRequest request) {
        EntitlementCalculationResponse response = entitlementService.evaluateKcc(request);
        return ResponseEntity.ok(ApiResponse.success(response, "KCC interest evaluation completed successfully"));
    }

    @PostMapping("/msp/verify")
    @Operation(summary = "Verify MSP Payment",
            description = "Verifies net crop sale proceeds against CACP official Minimum Support Prices, applying documented deductions")
    public ResponseEntity<ApiResponse<EntitlementCalculationResponse>> verifyMsp(
            @Valid @RequestBody MspVerificationRequest request) {
        EntitlementCalculationResponse response = entitlementService.verifyMsp(request);
        return ResponseEntity.ok(ApiResponse.success(response, "MSP payment verification completed successfully"));
    }

    @PostMapping("/insurance/reconcile")
    @Operation(summary = "Reconcile PMFBY Crop Insurance Claim Payout",
            description = "Reconciles officially sanctioned insurance claim orders against actual bank credit amounts")
    public ResponseEntity<ApiResponse<EntitlementCalculationResponse>> reconcileInsurance(
            @Valid @RequestBody InsuranceReconciliationRequest request) {
        EntitlementCalculationResponse response = entitlementService.reconcileInsurance(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Insurance claim reconciliation completed successfully"));
    }

    @GetMapping("/farmer/{farmerId}")
    @Operation(summary = "Get Farmer Entitlement History",
            description = "Retrieves all past deterministic entitlement calculations and audit trails for a farmer")
    public ResponseEntity<ApiResponse<List<EntitlementCalculationResponse>>> getEntitlementsByFarmer(
            @PathVariable UUID farmerId) {
        List<EntitlementCalculationResponse> responses = entitlementService.getEntitlementsByFarmer(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{resultId}")
    @Operation(summary = "Get Entitlement Result by ID",
            description = "Retrieves a specific entitlement calculation result and its complete breakdown")
    public ResponseEntity<ApiResponse<EntitlementCalculationResponse>> getEntitlementById(
            @PathVariable Long resultId) {
        EntitlementCalculationResponse response = entitlementService.getEntitlementById(resultId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
