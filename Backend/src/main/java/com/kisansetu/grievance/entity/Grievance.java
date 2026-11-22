package com.kisansetu.grievance.entity;

import com.kisansetu.common.enums.GrievanceStatus;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;

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

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(name = "grievance_content", nullable = false, columnDefinition = "TEXT")
    private String grievanceContent;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String language = "en";

    @Column(name = "evidence_checklist", columnDefinition = "TEXT")
    private String evidenceChecklist;

    @Enumerated(EnumType.STRING)
    @Column(name = "grievance_status", nullable = false, length = 50)
    @Builder.Default
    private GrievanceStatus grievanceStatus = GrievanceStatus.SUBMITTED;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
