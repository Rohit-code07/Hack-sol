package com.kisansetu.document.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentAnalysisResponseDto {
    private UUID documentId;
    private String filename;
    private String originalFilename;
    private Long fileSizeBytes;
    private String contentType;
    private String documentCategory;
    private String categoryLabel;
    private String documentPurpose;

    // Quality
    private String qualityReadability;
    private Integer qualityScore;
    private String qualityNotes;

    // Verdict & status
    private String overallVerdict;
    private String processingStatus;
    private BigDecimal confidenceScore;
    private Integer discrepancyCount;
    private String aiModel;
    private String language;

    // Analysis content
    private String rawOcrText;
    private String analysisSummary;
    private List<String> recommendedNextSteps;
    private List<ExtractedFieldDto> extractedFields;
    private List<DocumentIssueDto> issues;

    private LocalDateTime createdAt;
    private Boolean success;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExtractedFieldDto {
        private String fieldKey;
        private String fieldLabel;
        private String extractedValue;
        private String confidence;
        private Boolean isVerified;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DocumentIssueDto {
        private String severity;
        private String issueTitle;
        private String issueDescription;
        private String supportingEvidence;
        private String recommendedAction;
    }
}
