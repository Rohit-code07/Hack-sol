package com.kisansetu.entitlement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class InsuranceReconciliationRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    @NotBlank(message = "Insurance policy number is required")
    private String insurancePolicyNumber;

    private String crop;
    private String season;

    private BigDecimal sanctionedClaimAmount;

    @NotNull(message = "Actual payout amount is required")
    private BigDecimal actualPayout;

    private LocalDate claimDate;
    private LocalDate paymentDate;
}
