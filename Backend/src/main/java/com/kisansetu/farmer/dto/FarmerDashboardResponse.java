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
    private int profileCompletionPercentage;
    
    // Land
    private int totalLandParcels;
    private BigDecimal totalLandAreaInAcres;
    
    // Loans
    private int totalLoansCount;
    private int activeLoansCount;
    private BigDecimal totalSanctionedLoanAmount;
    private BigDecimal totalDisbursedLoanAmount;
    private BigDecimal totalOutstandingLoanAmount;
    private BigDecimal totalSubsidyReceived;
    
    // MSP
    private int mspTransactionsCount;
    private BigDecimal expectedMspAmount;
    private BigDecimal receivedMspAmount;
    private BigDecimal pendingMspAmount;
    
    // Insurance
    private int insurancePoliciesCount;
    private int insuranceClaimsCount;
    private int pendingInsuranceClaimsCount;
    private BigDecimal totalInsuranceClaimsAmount;
    private BigDecimal totalInsurancePayoutReceived;
    
    // Grievances & Discrepancies
    private int detectedDiscrepanciesCount;
    private BigDecimal totalDiscrepancyDifferenceAmount;
    private int submittedGrievancesCount;
    private int activeGrievancesCount;
    private int resolvedGrievancesCount;
}
