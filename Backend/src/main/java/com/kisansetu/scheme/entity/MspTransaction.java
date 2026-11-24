package com.kisansetu.scheme.entity;

import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "msp_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MspTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(nullable = false, length = 100)
    private String crop;

    @Column(name = "crop_variety", length = 100)
    private String cropVariety;

    @Column(name = "crop_grade", nullable = false, length = 50)
    @Builder.Default
    private String cropGrade = "FAQ";

    @Column(name = "marketing_season", nullable = false, length = 50)
    private String marketingSeason;

    @Column(name = "procurement_year", length = 20)
    @Builder.Default
    private String procurementYear = "2024";

    @Column(name = "expected_production", precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal expectedProduction = BigDecimal.ZERO;

    @Column(name = "total_production", precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal totalProduction = BigDecimal.ZERO;

    @Column(name = "quantity_sold", precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal quantitySold = BigDecimal.ZERO;

    @Column(name = "quantity_submitted", precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal quantitySubmitted = BigDecimal.ZERO;

    @Column(name = "quantity_rejected", precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal quantityRejected = BigDecimal.ZERO;

    @Column(name = "accepted_quantity", nullable = false, precision = 12, scale = 4)
    private BigDecimal acceptedQuantity;

    @Column(name = "quantity_unit", nullable = false, length = 20)
    @Builder.Default
    private String quantityUnit = "QUINTAL";

    @Column(name = "procurement_center", nullable = false, length = 150)
    private String procurementCenter;

    @Column(name = "procurement_center_location", length = 150)
    private String procurementCenterLocation;

    @Column(name = "token_number", length = 50)
    private String tokenNumber;

    @Column(name = "applicable_msp", nullable = false, precision = 15, scale = 2)
    private BigDecimal applicableMsp;

    @Column(name = "actual_rate_received", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal actualRateReceived = BigDecimal.ZERO;

    @Column(name = "gross_procurement_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossProcurementAmount;

    @Column(name = "documented_deductions", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal documentedDeductions = BigDecimal.ZERO;

    @Column(name = "actual_payment", nullable = false, precision = 15, scale = 2)
    private BigDecimal actualPayment;

    @Column(name = "payment_status", length = 50)
    @Builder.Default
    private String paymentStatus = "COMPLETED";

    @Column(name = "bank_account_masked", length = 50)
    private String bankAccountMasked;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "receipt_reference", nullable = false, unique = true, length = 100)
    private String receiptReference;
}
