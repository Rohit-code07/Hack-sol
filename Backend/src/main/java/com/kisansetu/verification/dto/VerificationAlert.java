package com.kisansetu.verification.dto;

import com.kisansetu.common.enums.DiscrepancySeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationAlert {
    private String ruleCode; // DUPLICATE_FINANCING, OWNERSHIP_MISMATCH, MORTGAGE_ALERT, AREA_MISMATCH
    private DiscrepancySeverity severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String alertTitle;
    private String description;
    private String recommendation;
}
