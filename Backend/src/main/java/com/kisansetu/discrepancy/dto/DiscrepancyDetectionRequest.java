package com.kisansetu.discrepancy.dto;

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
public class DiscrepancyDetectionRequest {
    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;
}
