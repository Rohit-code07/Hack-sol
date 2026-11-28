package com.kisansetu.document.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_analysis_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentAnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private UploadedDocument document;

    @Lob
    @Column(name = "raw_ocr_text", columnDefinition = "LONGTEXT")
    private String rawOcrText;

    @Column(name = "analysis_summary", columnDefinition = "TEXT")
    private String analysisSummary;

    @Column(name = "recommended_next_steps", columnDefinition = "JSON")
    private String recommendedNextStepsJson;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal confidenceScore = new BigDecimal("0.90");

    @Column(name = "discrepancy_count")
    @Builder.Default
    private Integer discrepancyCount = 0;

    @Column(name = "ai_model", length = 100)
    @Builder.Default
    private String aiModel = "GEMINI";

    @Column(name = "language", length = 20)
    @Builder.Default
    private String language = "hi";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
