package com.kisansetu.discrepancy.controller;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.discrepancy.dto.DiscrepancyDetectionRequest;
import com.kisansetu.discrepancy.dto.DiscrepancyResponse;
import com.kisansetu.discrepancy.service.DiscrepancyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/discrepancies")
@RequiredArgsConstructor
@Tag(name = "Discrepancy Detection", description = "Automatic detection and tracking of financial gaps in loans, MSP, and insurance")
public class DiscrepancyController {

    private final DiscrepancyService discrepancyService;

    @PostMapping("/detect")
    @Operation(summary = "Detect Discrepancies for Farmer",
            description = "Scans farmer's active loan subventions, MSP transactions, and PMFBY claims to automatically identify discrepancies")
    public ResponseEntity<ApiResponse<List<DiscrepancyResponse>>> detect(
            @Valid @RequestBody DiscrepancyDetectionRequest request) {
        List<DiscrepancyResponse> responses = discrepancyService.detectForFarmer(request.getFarmerId());
        return ResponseEntity.ok(ApiResponse.success(responses, "Discrepancy scan completed successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Discrepancy by ID")
    public ResponseEntity<ApiResponse<DiscrepancyResponse>> getById(@PathVariable Long id) {
        DiscrepancyResponse response = discrepancyService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/farmer/{farmerId}")
    @Operation(summary = "Get All Discrepancies for a Farmer")
    public ResponseEntity<ApiResponse<List<DiscrepancyResponse>>> getByFarmer(@PathVariable UUID farmerId) {
        List<DiscrepancyResponse> responses = discrepancyService.getByFarmer(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping
    @Operation(summary = "Get All Discrepancies (Across System)")
    public ResponseEntity<ApiResponse<List<DiscrepancyResponse>>> getAll() {
        List<DiscrepancyResponse> responses = discrepancyService.getAll();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
