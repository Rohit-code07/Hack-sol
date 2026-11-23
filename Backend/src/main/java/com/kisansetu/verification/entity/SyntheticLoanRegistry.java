package com.kisansetu.verification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "synthetic_loan_registry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyntheticLoanRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loan_account_number", nullable = false, unique = true, length = 100)
    private String loanAccountNumber;

    @Column(name = "bank_name", nullable = false, length = 150)
    private String bankName;

    @Column(name = "branch_name", nullable = false, length = 150)
    private String branchName;

    @Column(name = "khasra_number", nullable = false, length = 100)
    private String khasraNumber;

    @Column(nullable = false, length = 100)
    private String village;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(name = "borrower_name", nullable = false, length = 150)
    private String borrowerName;

    @Column(name = "sanctioned_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal sanctionedAmount;

    @Column(name = "outstanding_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal outstandingAmount;

    @Column(name = "disbursement_date", nullable = false)
    private LocalDate disbursementDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
