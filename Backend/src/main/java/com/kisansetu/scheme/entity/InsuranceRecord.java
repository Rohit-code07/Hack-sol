package com.kisansetu.scheme.entity;

import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "insurance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "scheme_name", nullable = false, length = 150)
    @Builder.Default
    private String schemeName = "PMFBY";

    @Column(nullable = false, length = 100)
    private String crop;

    @Column(nullable = false, length = 50)
    private String season;

    @Column(name = "crop_year", length = 20)
    @Builder.Default
    private String cropYear = "2024";

    @Column(length = 100)
    private String village;

    @Column(length = 100)
    private String block;

    @Column(length = 100)
    private String district;

    @Column(name = "khasra_number", length = 100)
    private String khasraNumber;

    @Column(name = "insurance_company", length = 150)
    @Builder.Default
    private String insuranceCompany = "Agriculture Insurance Company of India";

    @Column(name = "insurance_policy_number", nullable = false, unique = true, length = 100)
    private String insurancePolicyNumber;

    @Column(name = "application_number", length = 100)
    private String applicationNumber;

    @Column(name = "insured_area", nullable = false, precision = 12, scale = 4)
    private BigDecimal insuredArea;

    @Column(name = "sum_insured", nullable = false, precision = 15, scale = 2)
    private BigDecimal sumInsured;

    @Column(name = "premium_paid", nullable = false, precision = 15, scale = 2)
    private BigDecimal premiumPaid;

    @Column(name = "premium_payment_date")
    private LocalDate premiumPaymentDate;

    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @Column(name = "claim_status", nullable = false, length = 50)
    @Builder.Default
    private String claimStatus = "PENDING";

    @Column(name = "claim_type", length = 100)
    private String claimType;

    @Column(name = "damage_date")
    private LocalDate damageDate;

    @Column(name = "damage_type", length = 100)
    private String damageType;

    @Column(name = "damage_description", columnDefinition = "TEXT")
    private String damageDescription;

    @Column(name = "estimated_damage_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal estimatedDamagePercentage = BigDecimal.ZERO;

    @Column(name = "estimated_loss", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal estimatedLoss = BigDecimal.ZERO;

    @Column(name = "claim_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal claimAmount = BigDecimal.ZERO;

    @Column(name = "claim_number", length = 100)
    private String claimNumber;

    @Column(name = "sanctioned_claim_amount", precision = 15, scale = 2)
    private BigDecimal sanctionedClaimAmount;

    @Column(name = "actual_payout", precision = 15, scale = 2)
    private BigDecimal actualPayout;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "claim_date")
    private LocalDate claimDate;

    @Column(name = "payment_date")
    private LocalDate paymentDate;
}
