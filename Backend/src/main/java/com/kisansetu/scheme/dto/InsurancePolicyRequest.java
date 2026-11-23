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
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePolicyRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    @Builder.Default
    private String schemeName = "PMFBY";

    @NotBlank(message = "Crop is required")
    private String crop;

    @NotBlank(message = "Season is required")
    private String season;

    private String cropYear;
    private String village;
    private String block;
    private String district;
    private String khasraNumber;
    private String insuranceCompany;

    @NotBlank(message = "Policy number is required")
    private String insurancePolicyNumber;

    private String applicationNumber;

    @NotNull(message = "Insured area is required")
    @DecimalMin(value = "0.01", message = "Insured area must be positive")
    private BigDecimal insuredArea;

    @NotNull(message = "Sum insured is required")
    @DecimalMin(value = "100.00", message = "Sum insured must be positive")
    private BigDecimal sumInsured;

    @NotNull(message = "Premium paid is required")
    @DecimalMin(value = "0.00", message = "Premium cannot be negative")
    private BigDecimal premiumPaid;

    private LocalDate premiumPaymentDate;
    private LocalDate enrollmentDate;
}
