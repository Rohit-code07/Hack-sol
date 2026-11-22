package com.kisansetu.discrepancy.entity;

import com.kisansetu.common.enums.DiscrepancyCategory;
import com.kisansetu.common.enums.DiscrepancySeverity;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "discrepancies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discrepancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private DiscrepancyCategory category;

    @Column(name = "reference_id", nullable = false, length = 100)
    private String referenceId;

    @Column(name = "expected_amount", precision = 15, scale = 2)
    private BigDecimal expectedAmount;

    @Column(name = "actual_amount", precision = 15, scale = 2)
    private BigDecimal actualAmount;

    @Column(name = "difference_amount", precision = 15, scale = 2)
    private BigDecimal differenceAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private DiscrepancySeverity severity = DiscrepancySeverity.MEDIUM;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 50)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.DETECTED;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
