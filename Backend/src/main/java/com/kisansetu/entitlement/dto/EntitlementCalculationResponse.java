package com.kisansetu.entitlement.dto;

import com.kisansetu.common.enums.CalculationStatus;
import com.kisansetu.common.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntitlementCalculationResponse {
    private Long id;
    private UUID farmerId;
    private String schemeCode;
    private String entitlementType;
    private CalculationStatus eligibilityStatus;
    private BigDecimal expectedAmount;
    private BigDecimal actualAmount;
    private BigDecimal differenceAmount;
    private String applicableScheme;
    private String ruleVersion;
    private Map<String, Object> calculationBreakdown;
    private String sourceDocumentReference;
    private VerificationStatus verificationStatus;
    private String explanation;
    private LocalDateTime calculatedAt;
}
