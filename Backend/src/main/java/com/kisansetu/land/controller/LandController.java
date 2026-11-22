package com.kisansetu.land.controller;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.land.dto.LandOwnershipResponse;
import com.kisansetu.land.dto.LandRecordRequest;
import com.kisansetu.land.dto.LandRecordResponse;
import com.kisansetu.land.dto.MortgageResponse;
import com.kisansetu.land.service.LandService;
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
@RequestMapping("/api/v1/land-records")
@RequiredArgsConstructor
@Tag(name = "Land Record Registry", description = "Synthetic land parcel registry with composite geographical identities and encumbrances")
public class LandController {

    private final LandService landService;

    @PostMapping
    @Operation(summary = "Register Land Record Parcel")
    public ResponseEntity<ApiResponse<LandRecordResponse>> create(@Valid @RequestBody LandRecordRequest request) {
        LandRecordResponse response = landService.createLandRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Land record created successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Land Record by ID")
    public ResponseEntity<ApiResponse<LandRecordResponse>> getById(@PathVariable Long id) {
        LandRecordResponse response = landService.getLandRecordById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search Land Parcels by Geographical Criteria",
            description = "Search by State, District, Tehsil, Village, and Khasra Number")
    public ResponseEntity<ApiResponse<List<LandRecordResponse>>> search(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String tehsil,
            @RequestParam(required = false) String village,
            @RequestParam(required = false) String khasraNumber) {
        List<LandRecordResponse> responses = landService.search(state, district, tehsil, village, khasraNumber);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/farmer/{farmerId}")
    @Operation(summary = "Get All Land Parcels for a Farmer")
    public ResponseEntity<ApiResponse<List<LandRecordResponse>>> getByFarmer(@PathVariable UUID farmerId) {
        List<LandRecordResponse> responses = landService.getByFarmer(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}/ownership")
    @Operation(summary = "Get Ownership Information for a Parcel")
    public ResponseEntity<ApiResponse<List<LandOwnershipResponse>>> getOwnership(@PathVariable Long id) {
        List<LandOwnershipResponse> responses = landService.getOwnership(id);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}/mortgage")
    @Operation(summary = "Get Mortgage Encumbrances for a Parcel")
    public ResponseEntity<ApiResponse<List<MortgageResponse>>> getMortgages(@PathVariable Long id) {
        List<MortgageResponse> responses = landService.getMortgages(id);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
