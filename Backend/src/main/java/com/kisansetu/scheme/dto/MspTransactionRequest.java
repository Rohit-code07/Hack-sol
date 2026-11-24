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
public class MspTransactionRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    @NotBlank(message = "Crop is required")
    private String crop;

    private String cropVariety;

    @Builder.Default
    private String cropGrade = "FAQ";

    @NotBlank(message = "Marketing season is required")
    private String marketingSeason;

    private String procurementYear;
    private BigDecimal expectedProduction;
    private BigDecimal totalProduction;
    private BigDecimal quantitySold;
    private BigDecimal quantitySubmitted;
    private BigDecimal quantityRejected;

    @NotNull(message = "Accepted quantity is required")
    @DecimalMin(value = "0.01", message = "Accepted quantity must be positive")
    private BigDecimal acceptedQuantity;

    @Builder.Default
    private String quantityUnit = "QUINTAL";

    @NotBlank(message = "Procurement center is required")
    private String procurementCenter;

    private String procurementCenterLocation;
    private String tokenNumber;

    private BigDecimal applicableMsp; // Can be provided or auto-calculated from scheme rules
    private BigDecimal actualRateReceived;

    private BigDecimal documentedDeductions;

    @NotNull(message = "Actual payment is required")
    private BigDecimal actualPayment;

    private String paymentStatus;
    private String bankAccountMasked;
    private String transactionId;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    private LocalDate paymentDate;
    private String receiptReference;
}
