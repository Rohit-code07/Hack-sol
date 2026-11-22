package com.kisansetu.integration.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplanationAIRequest {
    private String schemeCode;
    private String ruleVersion;
    private BigDecimal expectedAmount;
    private BigDecimal actualAmount;
    private BigDecimal differenceAmount;
    private Map<String, Object> calculationBreakdown;
    private String targetLanguage;
}
