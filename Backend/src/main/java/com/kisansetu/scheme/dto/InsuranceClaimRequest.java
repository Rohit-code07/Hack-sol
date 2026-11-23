package com.kisansetu.scheme.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceClaimRequest {

    @NotBlank(message = "Policy number is required")
    private String insurancePolicyNumber;

    @NotBlank(message = "Claim type is required")
    private String claimType; // Crop Damage, Yield Loss, Natural Disaster, Other

    @NotNull(message = "Damage date is required")
    private LocalDate damageDate;

    private String damageType;
    private String damageDescription;

    private BigDecimal estimatedDamagePercentage;
    private BigDecimal estimatedLoss;

    @NotNull(message = "Claim amount is required")
    @DecimalMin(value = "1.00", message = "Claim amount must be positive")
    private BigDecimal claimAmount;
}
