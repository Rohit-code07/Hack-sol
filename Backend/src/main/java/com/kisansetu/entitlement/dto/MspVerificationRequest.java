package com.kisansetu.entitlement.dto;

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
public class MspVerificationRequest {

    private UUID farmerId;

    @NotBlank(message = "Crop name is required")
    private String crop;

    @Builder.Default
    private String cropGrade = "FAQ";

    @NotBlank(message = "Marketing season is required")
    private String marketingSeason; // e.g. "KHARIF_2023", "KHARIF_2024", "RABI_2023"

    @NotNull(message = "Accepted quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
    private BigDecimal acceptedQuantity;

    @Builder.Default
    private String quantityUnit = "QUINTAL";

    private String procurementCenter;

    private BigDecimal applicableMsp; // Optional; if omitted, fetched from scheme_rules

    @NotNull(message = "Actual payment is required")
    private BigDecimal actualPayment;

    private BigDecimal documentedDeductions;

    private LocalDate transactionDate;
    private String receiptReference;
}
