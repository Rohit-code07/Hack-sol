package com.kisansetu.farmer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerDashboardResponse {
    private FarmerResponse profile;
    private int totalLandParcels;
    private BigDecimal totalLandAreaInAcres;
    private int activeLoansCount;
    private BigDecimal totalDisbursedLoanAmount;
    private int detectedDiscrepanciesCount;
    private BigDecimal totalDiscrepancyDifferenceAmount;
    private int submittedGrievancesCount;
}
