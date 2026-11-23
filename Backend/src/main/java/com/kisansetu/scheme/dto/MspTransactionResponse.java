package com.kisansetu.scheme.dto;

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
public class MspTransactionResponse {
    private Long id;
    private UUID farmerId;
    private String farmerName;
    private String crop;
    private String cropVariety;
    private String cropGrade;
    private String marketingSeason;
    private String procurementYear;
    private BigDecimal expectedProduction;
    private BigDecimal totalProduction;
    private BigDecimal quantitySold;
    private BigDecimal quantitySubmitted;
    private BigDecimal quantityRejected;
    private BigDecimal acceptedQuantity;
    private String quantityUnit;
    private String procurementCenter;
    private String procurementCenterLocation;
    private String tokenNumber;
    private BigDecimal applicableMsp;
    private BigDecimal actualRateReceived;
    private BigDecimal grossProcurementAmount;
    private BigDecimal documentedDeductions;
    private BigDecimal expectedPayment;
    private BigDecimal actualPayment;
    private BigDecimal pendingAmount;
    private String paymentStatus;
    private String bankAccountMasked;
    private String transactionId;
    private LocalDate transactionDate;
    private LocalDate paymentDate;
    private String receiptReference;
}
