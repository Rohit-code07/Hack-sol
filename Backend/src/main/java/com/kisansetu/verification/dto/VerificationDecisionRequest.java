package com.kisansetu.verification.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
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
public class VerificationDecisionRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    @NotBlank(message = "Record type is required")
    private String recordType; // LAND, LOAN, IDENTITY, APPLICATION

    @JsonAlias({"recordId", "id"})
    @NotBlank(message = "Target ID is required")
    private String targetId;

    @JsonAlias({"decision", "status", "decisionStatus"})
    @NotBlank(message = "Verification status is required")
    private String verificationStatus; // VERIFIED, MISMATCH, REJECTED, PENDING_REVIEW, DOCUMENTS_REQUESTED

    private String remarks;
    private String reasonForMismatch;
    private String additionalDocumentsRequested;

    public void setRecordId(String recordId) {
        if (this.targetId == null) {
            this.targetId = recordId;
        }
    }

    public void setDecision(String decision) {
        if (this.verificationStatus == null) {
            this.verificationStatus = decision;
        }
    }

    public void setStatus(String status) {
        if (this.verificationStatus == null) {
            this.verificationStatus = status;
        }
    }
}
