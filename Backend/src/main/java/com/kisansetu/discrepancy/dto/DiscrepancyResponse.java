package com.kisansetu.discrepancy.dto;

import com.kisansetu.common.enums.DiscrepancyCategory;
import com.kisansetu.common.enums.DiscrepancySeverity;
import com.kisansetu.common.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscrepancyResponse {
    private Long id;
    private UUID farmerId;
    private String farmerName;
    private DiscrepancyCategory category;
    private String referenceId;
    private BigDecimal expectedAmount;
    private BigDecimal actualAmount;
    private BigDecimal differenceAmount;
    private DiscrepancySeverity severity;
    private String description;
    private VerificationStatus verificationStatus;
    private LocalDateTime createdAt;
}
