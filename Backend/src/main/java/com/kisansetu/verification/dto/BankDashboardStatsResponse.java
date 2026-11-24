package com.kisansetu.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankDashboardStatsResponse {
    private long totalFarmers;
    private long totalLoans;
    private long pendingVerifications;
    private long verifiedCount;
    private long mismatchCount;
    private long duplicateFlagCount;
    private long openGrievancesCount;
    private List<Map<String, Object>> districtMismatches;
    private List<Map<String, Object>> loanPortfolio;
}
