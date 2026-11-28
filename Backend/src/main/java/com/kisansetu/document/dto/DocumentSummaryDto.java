package com.kisansetu.document.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentSummaryDto {
    private UUID id;
    private String filename;
    private String originalFilename;
    private Long fileSizeBytes;
    private String contentType;
    private String documentCategory;
    private String categoryLabel;
    private String documentPurpose;
    private String qualityReadability;
    private Integer qualityScore;
    private String overallVerdict;
    private String processingStatus;
    private Integer discrepancyCount;
    private LocalDateTime createdAt;
}
