package com.kisansetu.document.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "document_issues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private UploadedDocument document;

    @Column(name = "severity", nullable = false, length = 50)
    private String severity; // CRITICAL, WARNING, INFORMATIONAL, NO_ISSUE

    @Column(name = "issue_title", nullable = false)
    private String issueTitle;

    @Column(name = "issue_description", nullable = false, columnDefinition = "TEXT")
    private String issueDescription;

    @Column(name = "supporting_evidence", columnDefinition = "TEXT")
    private String supportingEvidence;

    @Column(name = "recommended_action", columnDefinition = "TEXT")
    private String recommendedAction;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
