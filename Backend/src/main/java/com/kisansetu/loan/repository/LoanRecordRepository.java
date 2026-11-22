package com.kisansetu.loan.repository;

import com.kisansetu.loan.entity.LoanRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoanRecordRepository extends JpaRepository<LoanRecord, Long> {
    Optional<LoanRecord> findByLoanAccountReference(String loanAccountReference);
    List<LoanRecord> findByFarmerId(UUID farmerId);
    List<LoanRecord> findByBankId(Long bankId);

    @Query("SELECT lr FROM LoanRecord lr WHERE lr.farmer.id = :farmerId AND lr.repaymentStatus = 'ACTIVE'")
    List<LoanRecord> findActiveLoansByFarmerId(@Param("farmerId") UUID farmerId);
}
