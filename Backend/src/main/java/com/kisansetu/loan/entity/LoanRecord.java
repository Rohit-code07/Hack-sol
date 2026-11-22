package com.kisansetu.loan.entity;

import com.kisansetu.bank.entity.Bank;
import com.kisansetu.common.enums.LoanType;
import com.kisansetu.common.enums.RepaymentStatus;
import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false)
    private Bank bank;

    @Column(name = "loan_account_reference", nullable = false, unique = true, length = 100)
    private String loanAccountReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_type", nullable = false, length = 50)
    private LoanType loanType;

    @Column(name = "sanctioned_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal sanctionedAmount;

    @Column(name = "disbursed_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal disbursedAmount;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "disbursement_date", nullable = false)
    private LocalDate disbursementDate;

    @Column(name = "maturity_date", nullable = false)
    private LocalDate maturityDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "repayment_status", nullable = false, length = 50)
    @Builder.Default
    private RepaymentStatus repaymentStatus = RepaymentStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
