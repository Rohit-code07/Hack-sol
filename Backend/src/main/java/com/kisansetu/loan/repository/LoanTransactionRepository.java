package com.kisansetu.loan.repository;

import com.kisansetu.loan.entity.LoanTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanTransactionRepository extends JpaRepository<LoanTransaction, Long> {
    List<LoanTransaction> findByLoanId(Long loanId);
    List<LoanTransaction> findByLoanIdOrderByTransactionDateAsc(Long loanId);
    List<LoanTransaction> findByLoanIdOrderByTransactionDateDesc(Long loanId);
}
