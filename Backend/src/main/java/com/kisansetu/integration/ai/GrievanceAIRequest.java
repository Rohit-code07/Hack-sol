package com.kisansetu.integration.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrievanceAIRequest {
    private UUID farmerId;
    private String farmerName;
    private String village;
    private String district;
    private String category;
    private String referenceId;
    private BigDecimal expectedAmount;
    private BigDecimal actualAmount;
    private BigDecimal differenceAmount;
    private String description;
    private String language; // "hi", "en", or "chhattisgarhi"
}
