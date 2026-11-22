package com.kisansetu.verification.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    @NotNull(message = "Land record IDs are required")
    private List<Long> landRecordIds;

    private BigDecimal requestedLoanAmount;
    private BigDecimal proposedPledgedArea;
    private Boolean declaredExistingMortgage;
    private String remarks;
}
