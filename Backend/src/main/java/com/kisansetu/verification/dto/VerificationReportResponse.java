package com.kisansetu.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationReportResponse {
    private String reportId;
    private UUID farmerId;
    private String farmerName;
    private String mobileNumber;
    private int totalParcelsChecked;
    private BigDecimal totalRecordedArea;
    private int activeLoansFound;
    private BigDecimal existingLoanExposure;
    private boolean hasDuplicateFinancing;
    private boolean hasMortgageAlert;
    private boolean hasOwnershipMismatch;
    private boolean hasAreaMismatch;
    private String riskLevel; // LOW, MODERATE, HIGH, CRITICAL
    private List<VerificationAlert> alerts;
    private LocalDateTime generatedAt;
}
