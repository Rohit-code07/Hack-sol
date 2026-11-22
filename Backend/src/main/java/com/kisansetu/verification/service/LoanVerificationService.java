package com.kisansetu.verification.service;

import com.kisansetu.common.enums.RepaymentStatus;
import com.kisansetu.loan.entity.LoanRecord;
import com.kisansetu.loan.repository.LoanRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoanVerificationService {

    private final LoanRecordRepository loanRecordRepository;

    @Transactional(readOnly = true)
    public List<LoanRecord> getFarmerLoanHistory(UUID farmerId) {
        return loanRecordRepository.findByFarmerId(farmerId);
    }

    @Transactional(readOnly = true)
    public List<LoanRecord> getFarmerActiveLoans(UUID farmerId) {
        return loanRecordRepository.findActiveLoansByFarmerId(farmerId);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateExistingLoanExposure(UUID farmerId) {
        List<LoanRecord> activeLoans = getFarmerActiveLoans(farmerId);
        return activeLoans.stream()
                .map(LoanRecord::getDisbursedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
