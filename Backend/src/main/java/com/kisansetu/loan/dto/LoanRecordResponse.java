package com.kisansetu.loan.dto;

import com.kisansetu.common.enums.LoanType;
import com.kisansetu.common.enums.RepaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanRecordResponse {
    private Long id;
    private UUID farmerId;
    private String farmerName;
    private Long bankId;
    private String bankName;
    private String branchName;
    private String ifscCode;
    private String loanAccountReference;
    private LoanType loanType;
    private BigDecimal sanctionedAmount;
    private BigDecimal disbursedAmount;
    private BigDecimal interestRate;
    private LocalDate disbursementDate;
    private LocalDate maturityDate;
    private RepaymentStatus repaymentStatus;
    private LocalDateTime createdAt;
    private List<Long> pledgedLandParcelIds;
    private List<LoanTransactionResponse> transactions;
}
