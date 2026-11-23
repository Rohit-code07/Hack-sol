package com.kisansetu.grievance.entity;

import com.kisansetu.common.enums.GrievanceStatus;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "grievances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grievance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discrepancy_id")
    private Discrepancy discrepancy;

    @Column(name = "grievance_category", length = 100)
    @Builder.Default
    private String grievanceCategory = "GENERAL";

    @Column(length = 100)
    @Builder.Default
    private String department = "Agriculture & Farmers Welfare";

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "branch_name", length = 150)
    private String branchName;

    @Column(name = "related_record_reference", length = 100)
    private String relatedRecordReference;

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(name = "grievance_content", nullable = false, columnDefinition = "TEXT")
    private String grievanceContent;

    @Column(name = "expected_resolution", columnDefinition = "TEXT")
    private String expectedResolution;

    @Column(name = "amount_involved", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal amountInvolved = BigDecimal.ZERO;

    @Column(name = "date_of_incident")
    private LocalDate dateOfIncident;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(length = 20)
    @Builder.Default
    private String priority = "MEDIUM";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String language = "en";

    @Column(name = "evidence_checklist", columnDefinition = "TEXT")
    private String evidenceChecklist;

    @Enumerated(EnumType.STRING)
    @Column(name = "grievance_status", nullable = false, length = 50)
    @Builder.Default
    private GrievanceStatus grievanceStatus = GrievanceStatus.SUBMITTED;

    @Column(name = "officer_remarks", columnDefinition = "TEXT")
    private String officerRemarks;

    @Column(name = "resolution_details", columnDefinition = "TEXT")
    private String resolutionDetails;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
