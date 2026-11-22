package com.kisansetu.loan.service;

import com.kisansetu.bank.entity.Bank;
import com.kisansetu.bank.repository.BankRepository;
import com.kisansetu.common.enums.CollateralStatus;
import com.kisansetu.common.exception.DuplicateResourceException;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.util.FarmerAccessValidator;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.land.entity.LandRecord;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.loan.dto.LoanRecordRequest;
import com.kisansetu.loan.dto.LoanRecordResponse;
import com.kisansetu.loan.dto.LoanTransactionRequest;
import com.kisansetu.loan.dto.LoanTransactionResponse;
import com.kisansetu.loan.entity.LoanCollateral;
import com.kisansetu.loan.entity.LoanRecord;
import com.kisansetu.loan.entity.LoanTransaction;
import com.kisansetu.loan.repository.LoanCollateralRepository;
import com.kisansetu.loan.repository.LoanRecordRepository;
import com.kisansetu.loan.repository.LoanTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRecordRepository loanRecordRepository;
    private final LoanTransactionRepository loanTransactionRepository;
    private final LoanCollateralRepository loanCollateralRepository;
    private final FarmerRepository farmerRepository;
    private final BankRepository bankRepository;
    private final LandRecordRepository landRecordRepository;
    private final FarmerAccessValidator farmerAccessValidator;

    @Transactional
    public LoanRecordResponse createLoan(LoanRecordRequest request) {
        if (loanRecordRepository.findByLoanAccountReference(request.getLoanAccountReference()).isPresent()) {
            throw new DuplicateResourceException("Loan account reference already exists: " + request.getLoanAccountReference());
        }

        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", request.getFarmerId()));

        Bank bank = bankRepository.findById(request.getBankId())
                .orElseThrow(() -> new ResourceNotFoundException("Bank", "id", request.getBankId()));

        LoanRecord loan = LoanRecord.builder()
                .farmer(farmer)
                .bank(bank)
                .loanAccountReference(request.getLoanAccountReference())
                .loanType(request.getLoanType())
                .sanctionedAmount(request.getSanctionedAmount())
                .disbursedAmount(request.getDisbursedAmount())
                .interestRate(request.getInterestRate())
                .disbursementDate(request.getDisbursementDate())
                .maturityDate(request.getMaturityDate())
                .repaymentStatus(request.getRepaymentStatus())
                .createdAt(LocalDateTime.now())
                .build();

        loan = loanRecordRepository.save(loan);

        // Map collaterals if specified
        if (request.getPledgedLandRecordIds() != null) {
            for (Long landId : request.getPledgedLandRecordIds()) {
                LandRecord lr = landRecordRepository.findById(landId)
                        .orElseThrow(() -> new ResourceNotFoundException("LandRecord", "id", landId));
                LoanCollateral collateral = LoanCollateral.builder()
                        .loan(loan)
                        .landRecord(lr)
                        .collateralStatus(CollateralStatus.ACTIVE)
                        .build();
                loanCollateralRepository.save(collateral);
            }
        }

        return getLoanById(loan.getId());
    }

    @Transactional(readOnly = true)
    public LoanRecordResponse getLoanById(Long loanId) {
        LoanRecord loan = loanRecordRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRecord", "id", loanId));

        List<LoanTransactionResponse> txns = getTransactions(loanId);
        List<Long> pledgedLandIds = loanCollateralRepository.findByLoanId(loanId).stream()
                .map(c -> c.getLandRecord().getId())
                .collect(Collectors.toList());

        return LoanRecordResponse.builder()
                .id(loan.getId())
                .farmerId(loan.getFarmer().getId())
                .farmerName(loan.getFarmer().getFarmerName())
                .bankId(loan.getBank().getId())
                .bankName(loan.getBank().getBankName())
                .branchName(loan.getBank().getBranchName())
                .ifscCode(loan.getBank().getIfscCode())
                .loanAccountReference(loan.getLoanAccountReference())
                .loanType(loan.getLoanType())
                .sanctionedAmount(loan.getSanctionedAmount())
                .disbursedAmount(loan.getDisbursedAmount())
                .interestRate(loan.getInterestRate())
                .disbursementDate(loan.getDisbursementDate())
                .maturityDate(loan.getMaturityDate())
                .repaymentStatus(loan.getRepaymentStatus())
                .createdAt(loan.getCreatedAt())
                .pledgedLandParcelIds(pledgedLandIds)
                .transactions(txns)
                .build();
    }

    @Transactional(readOnly = true)
    public List<LoanRecordResponse> getByFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        return loanRecordRepository.findByFarmerId(farmerId).stream()
                .map(l -> getLoanById(l.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanRecordResponse> getByBank(Long bankId) {
        return loanRecordRepository.findByBankId(bankId).stream()
                .map(l -> getLoanById(l.getId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanTransactionResponse> getTransactions(Long loanId) {
        return loanTransactionRepository.findByLoanIdOrderByTransactionDateAsc(loanId).stream()
                .map(t -> LoanTransactionResponse.builder()
                        .id(t.getId())
                        .loanId(t.getLoan().getId())
                        .transactionType(t.getTransactionType())
                        .amount(t.getAmount())
                        .transactionDate(t.getTransactionDate())
                        .referenceNumber(t.getReferenceNumber())
                        .description(t.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public LoanTransactionResponse addTransaction(Long loanId, LoanTransactionRequest request) {
        LoanRecord loan = loanRecordRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRecord", "id", loanId));

        LoanTransaction txn = LoanTransaction.builder()
                .loan(loan)
                .transactionType(request.getTransactionType())
                .amount(request.getAmount())
                .transactionDate(request.getTransactionDate())
                .referenceNumber(request.getReferenceNumber())
                .description(request.getDescription())
                .build();

        txn = loanTransactionRepository.save(txn);

        return LoanTransactionResponse.builder()
                .id(txn.getId())
                .loanId(loan.getId())
                .transactionType(txn.getTransactionType())
                .amount(txn.getAmount())
                .transactionDate(txn.getTransactionDate())
                .referenceNumber(txn.getReferenceNumber())
                .description(txn.getDescription())
                .build();
    }
}
