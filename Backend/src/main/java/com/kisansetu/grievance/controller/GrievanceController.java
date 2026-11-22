package com.kisansetu.grievance.controller;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.grievance.dto.GrievanceGenerateRequest;
import com.kisansetu.grievance.dto.GrievanceResponse;
import com.kisansetu.grievance.service.GrievanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/grievances")
@RequiredArgsConstructor
@Tag(name = "Grievance Management", description = "Deterministic and AI-assisted grievance drafting and PDF export")
public class GrievanceController {

    private final GrievanceService grievanceService;

    @PostMapping("/generate")
    @Operation(summary = "Generate Grievance from Discrepancy",
            description = "Creates a structured grievance petition based on verified discrepancy data in Hindi or English")
    public ResponseEntity<ApiResponse<GrievanceResponse>> generate(
            @Valid @RequestBody GrievanceGenerateRequest request) {
        GrievanceResponse response = grievanceService.generateGrievance(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Grievance generated successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Grievance by ID")
    public ResponseEntity<ApiResponse<GrievanceResponse>> getById(@PathVariable Long id) {
        GrievanceResponse response = grievanceService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/farmer/{farmerId}")
    @Operation(summary = "Get All Grievances for a Farmer")
    public ResponseEntity<ApiResponse<List<GrievanceResponse>>> getByFarmer(@PathVariable UUID farmerId) {
        List<GrievanceResponse> responses = grievanceService.getByFarmer(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Download Grievance Petition as PDF",
            description = "Generates a printable, formatted PDF representation for submission to administrative authorities")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        byte[] pdfBytes = grievanceService.getGrievancePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"grievance-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
