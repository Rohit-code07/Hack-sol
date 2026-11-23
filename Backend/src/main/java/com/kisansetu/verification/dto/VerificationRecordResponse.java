package com.kisansetu.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRecordResponse {
    private Long id;
    private UUID farmerId;
    private String farmerName;
    private String officerUsername;
    private String recordType;
    private String targetId;
    private String verificationStatus;
    private String remarks;
    private String reasonForMismatch;
    private String additionalDocumentsRequested;
    private LocalDateTime createdAt;
}
