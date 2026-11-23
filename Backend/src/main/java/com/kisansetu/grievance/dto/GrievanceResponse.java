package com.kisansetu.grievance.dto;

import com.kisansetu.common.enums.GrievanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrievanceResponse {
    private Long id;
    private UUID farmerId;
    private String farmerName;
    private Long discrepancyId;
    private String grievanceCategory;
    private String department;
    private String bankName;
    private String branchName;
    private String relatedRecordReference;
    private String subject;
    private String grievanceContent;
    private String expectedResolution;
    private BigDecimal amountInvolved;
    private LocalDate dateOfIncident;
    private String transactionId;
    private String priority;
    private String language;
    private String evidenceChecklist;
    private GrievanceStatus grievanceStatus;
    private String officerRemarks;
    private String resolutionDetails;
    private LocalDateTime resolvedAt;
    private BigDecimal recordedDifferenceAmount;
    private LocalDateTime createdAt;
}
