package com.kisansetu.document.entity;

import com.kisansetu.auth.entity.User;
import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "uploaded_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadedDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(length = 36)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_user_id")
    private User uploadedByUser;

    @Column(name = "filename", nullable = false)
    private String filename;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "document_category", length = 100)
    private String documentCategory;

    @Column(name = "category_label", length = 150)
    private String categoryLabel;

    @Column(name = "document_purpose")
    private String documentPurpose;

    @Column(name = "quality_readability", length = 50)
    @Builder.Default
    private String qualityReadability = "GOOD";

    @Column(name = "quality_score")
    @Builder.Default
    private Integer qualityScore = 85;

    @Column(name = "quality_notes")
    private String qualityNotes;

    @Column(name = "overall_verdict", length = 100)
    @Builder.Default
    private String overallVerdict = "REQUIRES_REVIEW";

    @Column(name = "processing_status", nullable = false, length = 50)
    @Builder.Default
    private String processingStatus = "UPLOADED";

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private DocumentAnalysisResult analysisResult;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DocumentExtractedField> extractedFields = new ArrayList<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DocumentIssue> issues = new ArrayList<>();
}
