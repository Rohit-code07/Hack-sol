package com.kisansetu.grievance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrievanceSubmitRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    private Long discrepancyId;

    @com.fasterxml.jackson.annotation.JsonAlias({"category"})
    @NotBlank(message = "Category is required")
    private String grievanceCategory;

    private String department;
    private String bankName;
    private String branchName;
    private String relatedRecordReference;

    @NotBlank(message = "Subject is required")
    private String subject;

    @com.fasterxml.jackson.annotation.JsonAlias({"description", "content"})
    @NotBlank(message = "Grievance content is required")
    private String grievanceContent;

    private String expectedResolution;
    private BigDecimal amountInvolved;
    private LocalDate dateOfIncident;
    private String transactionId;

    @Builder.Default
    private String priority = "MEDIUM";

    @Builder.Default
    private String language = "en";

    private String evidenceChecklist;
}
