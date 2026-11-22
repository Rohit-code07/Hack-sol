package com.kisansetu.loan.repository;

import com.kisansetu.common.enums.CollateralStatus;
import com.kisansetu.loan.entity.LoanCollateral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanCollateralRepository extends JpaRepository<LoanCollateral, Long> {
    List<LoanCollateral> findByLoanId(Long loanId);
    List<LoanCollateral> findByLandRecordId(Long landRecordId);

    @Query("SELECT lc FROM LoanCollateral lc " +
           "WHERE lc.landRecord.id = :landRecordId " +
           "AND lc.collateralStatus = :status " +
           "AND lc.loan.repaymentStatus = 'ACTIVE'")
    List<LoanCollateral> findActiveCollateralsForLand(
            @Param("landRecordId") Long landRecordId,
            @Param("status") CollateralStatus status);
}
