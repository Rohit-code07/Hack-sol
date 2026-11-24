package com.kisansetu.loan.dto;

import com.kisansetu.common.enums.LoanType;
import com.kisansetu.common.enums.RepaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanRecordRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    @NotNull(message = "Bank ID is required")
    private Long bankId;

    @NotBlank(message = "Loan account reference is required")
    private String loanAccountReference;

    @NotNull(message = "Loan type is required")
    private LoanType loanType;

    @NotNull(message = "Sanctioned amount is required")
    @DecimalMin(value = "100.00", message = "Sanctioned amount must be at least 100")
    private BigDecimal sanctionedAmount;

    @NotNull(message = "Disbursed amount is required")
    @DecimalMin(value = "0.00", message = "Disbursed amount cannot be negative")
    private BigDecimal disbursedAmount;

    private BigDecimal outstandingAmount;

    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.01", message = "Interest rate must be positive")
    private BigDecimal interestRate;

    private String loanPurpose;
    private String cropSeason;
    private String cropName;
    private String linkedKhasra;

    private Boolean subsidyApplied;
    private Boolean subsidyReceived;
    private BigDecimal subsidyAmountReceived;
    private LocalDate lastPaymentDate;

    @NotNull(message = "Disbursement date is required")
    private LocalDate disbursementDate;

    @NotNull(message = "Maturity date is required")
    private LocalDate maturityDate;

    @Builder.Default
    private RepaymentStatus repaymentStatus = RepaymentStatus.ACTIVE;

    // Optional list of pledged land record IDs
    private List<Long> pledgedLandRecordIds;
}
