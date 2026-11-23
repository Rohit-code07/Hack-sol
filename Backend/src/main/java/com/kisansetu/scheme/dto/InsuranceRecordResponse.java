package com.kisansetu.scheme.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceRecordResponse {
    private Long id;
    private UUID farmerId;
    private String farmerName;
    private String schemeName;
    private String crop;
    private String season;
    private String cropYear;
    private String village;
    private String block;
    private String district;
    private String khasraNumber;
    private String insuranceCompany;
    private String insurancePolicyNumber;
    private String applicationNumber;
    private BigDecimal insuredArea;
    private BigDecimal sumInsured;
    private BigDecimal premiumPaid;
    private LocalDate premiumPaymentDate;
    private LocalDate enrollmentDate;
    private String claimStatus;
    private String claimType;
    private LocalDate damageDate;
    private String damageType;
    private String damageDescription;
    private BigDecimal estimatedDamagePercentage;
    private BigDecimal estimatedLoss;
    private BigDecimal claimAmount;
    private String claimNumber;
    private BigDecimal sanctionedClaimAmount;
    private BigDecimal actualPayout;
    private String rejectionReason;
    private LocalDate claimDate;
    private LocalDate paymentDate;
}
