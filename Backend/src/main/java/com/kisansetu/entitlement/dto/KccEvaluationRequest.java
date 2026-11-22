package com.kisansetu.entitlement.dto;

import com.kisansetu.common.enums.LoanType;
import com.kisansetu.common.enums.RepaymentStatus;
import jakarta.validation.constraints.DecimalMin;
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
public class KccEvaluationRequest {

    @NotNull(message = "Farmer ID is required")
    private UUID farmerId;

    private Long loanId;

    @NotNull(message = "Loan amount is required")
    @DecimalMin(value = "100.00", message = "Loan amount must be at least 100")
    private BigDecimal loanAmount;

    @NotNull(message = "Loan type is required")
    private LoanType loanType;

    @NotNull(message = "Disbursement date is required")
    private LocalDate disbursementDate;

    private LocalDate repaymentDate;

    private RepaymentStatus repaymentStatus;

    private String applicableSchemeYear; // e.g. "2023-24" or "2024-25"

    private BigDecimal actualInterestCharged;
}
