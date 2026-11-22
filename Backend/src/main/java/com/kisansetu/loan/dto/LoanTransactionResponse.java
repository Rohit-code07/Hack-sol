package com.kisansetu.loan.dto;

import com.kisansetu.common.enums.TransactionType;
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
public class LoanTransactionResponse {
    private Long id;
    private Long loanId;
    private TransactionType transactionType;
    private BigDecimal amount;
    private LocalDate transactionDate;
    private String referenceNumber;
    private String description;
}
