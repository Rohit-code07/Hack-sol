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

    @Column(name = "insurance_policy_number", nullable = false, unique = true, length = 100)
    private String insurancePolicyNumber;

    @Column(name = "insured_area", nullable = false, precision = 12, scale = 4)
    private BigDecimal insuredArea;

    @Column(name = "sum_insured", nullable = false, precision = 15, scale = 2)
    private BigDecimal sumInsured;

    @Column(name = "premium_paid", nullable = false, precision = 15, scale = 2)
    private BigDecimal premiumPaid;

    @Column(name = "claim_status", nullable = false, length = 50)
    @Builder.Default
    private String claimStatus = "PENDING";

    @Column(name = "sanctioned_claim_amount", precision = 15, scale = 2)
    private BigDecimal sanctionedClaimAmount;

    @Column(name = "actual_payout", precision = 15, scale = 2)
    private BigDecimal actualPayout;

    @Column(name = "claim_date")
    private LocalDate claimDate;

    @Column(name = "payment_date")
    private LocalDate paymentDate;
}
