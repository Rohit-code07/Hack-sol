package com.kisansetu.verification.entity;

import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "officer_username", nullable = false, length = 100)
    private String officerUsername;

    @Column(name = "record_type", nullable = false, length = 50)
    private String recordType; // LAND, LOAN, IDENTITY, APPLICATION

    @Column(name = "target_id", nullable = false, length = 100)
    private String targetId;

    @Column(name = "verification_status", nullable = false, length = 50)
    private String verificationStatus; // VERIFIED, MISMATCH, REJECTED, PENDING_REVIEW, DOCUMENTS_REQUESTED

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "reason_for_mismatch", columnDefinition = "TEXT")
    private String reasonForMismatch;

    @Column(name = "additional_documents_requested", length = 255)
    private String additionalDocumentsRequested;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
