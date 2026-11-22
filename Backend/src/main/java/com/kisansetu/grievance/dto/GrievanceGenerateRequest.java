package com.kisansetu.grievance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrievanceGenerateRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    @NotNull(message = "Discrepancy ID is required")
    private Long discrepancyId;

    @Builder.Default
    private String language = "en"; // "en" or "hi"

    private String additionalNotes;
}
