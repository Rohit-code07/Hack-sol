package com.kisansetu.loan.service;

import com.kisansetu.bank.entity.Bank;
import com.kisansetu.bank.repository.BankRepository;
import com.kisansetu.common.enums.CollateralStatus;
import com.kisansetu.common.enums.DiscrepancyCategory;
import com.kisansetu.common.enums.DiscrepancySeverity;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.common.exception.DuplicateResourceException;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.util.FarmerAccessValidator;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
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
import com.kisansetu.verification.entity.SyntheticLoanRegistry;
import com.kisansetu.verification.repository.SyntheticLoanRegistryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final SyntheticLoanRegistryRepository syntheticLoanRegistryRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final FarmerAccessValidator farmerAccessValidator;

    @Transactional
    public LoanRecordResponse createLoan(LoanRecordRequest request) {
        if (loanRecordRepository.findByLoanAccountReference(request.getLoanAccountReference()).isPresent()) {
            throw new DuplicateResourceException("Loan account reference already exists: " + request.getLoanAccountReference());
        }

        Farmer farmer = null;
        if (request.getFarmerId() != null) {
            farmer = farmerRepository.findById(request.getFarmerId()).orElse(null);
        }
        if (farmer == null) {
            String currentUsername = com.kisansetu.common.util.SecurityUtils.getCurrentUsername();
            if (currentUsername != null) {
                farmer = farmerRepository.findByUserUsername(currentUsername).orElse(null);
            }
        }
        if (farmer == null) {
            throw new ResourceNotFoundException("Farmer", "id", request.getFarmerId());
        }

        Bank bank = bankRepository.findById(request.getBankId())
                .orElseThrow(() -> new ResourceNotFoundException("Bank", "id", request.getBankId()));

        boolean duplicateFlag = false;
        String verificationStatus = "VERIFIED";

        // Check against synthetic loan registry for potential overlapping financing on the same Khasra
        if (request.getLinkedKhasra() != null && !request.getLinkedKhasra().isBlank()) {
            List<SyntheticLoanRegistry> existingRegistryLoans = syntheticLoanRegistryRepository
                    .findByKhasraNumberAndVillageAndIsActiveTrue(request.getLinkedKhasra(), farmer.getVillage());

            for (SyntheticLoanRegistry synthLoan : existingRegistryLoans) {
                if (!synthLoan.getBankName().equalsIgnoreCase(bank.getBankName())) {
                    duplicateFlag = true;
                    verificationStatus = "FLAGGED_DUPLICATE";

                    Discrepancy disc = Discrepancy.builder()
                            .farmer(farmer)
                            .category(DiscrepancyCategory.POTENTIAL_DUPLICATE_FINANCING)
                            .referenceId(request.getLoanAccountReference())
                            .expectedAmount(request.getSanctionedAmount())
                            .actualAmount(synthLoan.getSanctionedAmount())
                            .differenceAmount(request.getSanctionedAmount())
                            .severity(DiscrepancySeverity.HIGH)
                            .description(String.format("Potential duplicate financing on Khasra %s in village %s. Pledged to %s and declared at %s.",
                                    request.getLinkedKhasra(), farmer.getVillage(), synthLoan.getBankName(), bank.getBankName()))
                            .verificationStatus(VerificationStatus.DETECTED)
                            .build();
                    discrepancyRepository.save(disc);
                    break;
                }
            }
        }

        BigDecimal outstanding = request.getOutstandingAmount() != null
                ? request.getOutstandingAmount()
                : request.getDisbursedAmount();

        LoanRecord loan = LoanRecord.builder()
                .farmer(farmer)
                .bank(bank)
                .loanAccountReference(request.getLoanAccountReference())
                .loanType(request.getLoanType())
                .sanctionedAmount(request.getSanctionedAmount())
                .disbursedAmount(request.getDisbursedAmount())
                .outstandingAmount(outstanding)
                .interestRate(request.getInterestRate())
                .loanPurpose(request.getLoanPurpose() != null ? request.getLoanPurpose() : "Crop Production")
                .cropSeason(request.getCropSeason() != null ? request.getCropSeason() : "Kharif")
                .cropName(request.getCropName() != null ? request.getCropName() : "Paddy")
                .linkedKhasra(request.getLinkedKhasra())
                .subsidyApplied(request.getSubsidyApplied() != null ? request.getSubsidyApplied() : false)
                .subsidyReceived(request.getSubsidyReceived() != null ? request.getSubsidyReceived() : false)
                .subsidyAmountReceived(request.getSubsidyAmountReceived() != null ? request.getSubsidyAmountReceived() : BigDecimal.ZERO)
                .lastPaymentDate(request.getLastPaymentDate())
                .disbursementDate(request.getDisbursementDate())
                .maturityDate(request.getMaturityDate())
                .repaymentStatus(request.getRepaymentStatus())
                .verificationStatus(verificationStatus)
                .duplicateFlag(duplicateFlag)
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

        return mapToResponse(loan);
    }

    @Transactional(readOnly = true)
    public LoanRecordResponse getLoanById(Long loanId) {
        LoanRecord loan = loanRecordRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRecord", "id", loanId));
        return mapToResponse(loan);
    }

    @Transactional(readOnly = true)
    public List<LoanRecordResponse> getByFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        return loanRecordRepository.findByFarmerId(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanRecordResponse> getByBank(Long bankId) {
        return loanRecordRepository.findByBankId(bankId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanTransactionResponse> getTransactions(Long loanId) {
        return loanTransactionRepository.findByLoanIdOrderByTransactionDateDesc(loanId).stream()
                .map(tx -> LoanTransactionResponse.builder()
                        .id(tx.getId())
                        .loanId(tx.getLoan().getId())
                        .transactionType(tx.getTransactionType())
                        .amount(tx.getAmount())
                        .transactionDate(tx.getTransactionDate())
                        .referenceNumber(tx.getReferenceNumber())
                        .description(tx.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public LoanTransactionResponse addTransaction(Long loanId, LoanTransactionRequest request) {
        LoanRecord loan = loanRecordRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("LoanRecord", "id", loanId));

        LoanTransaction tx = LoanTransaction.builder()
                .loan(loan)
                .transactionType(request.getTransactionType())
                .amount(request.getAmount())
                .transactionDate(request.getTransactionDate())
                .referenceNumber(request.getReferenceNumber())
                .description(request.getDescription())
                .build();

        tx = loanTransactionRepository.save(tx);

        return LoanTransactionResponse.builder()
                .id(tx.getId())
                .loanId(loan.getId())
                .transactionType(tx.getTransactionType())
                .amount(tx.getAmount())
                .transactionDate(tx.getTransactionDate())
                .referenceNumber(tx.getReferenceNumber())
                .description(tx.getDescription())
                .build();
    }

    private LoanRecordResponse mapToResponse(LoanRecord l) {
        List<Long> pledgedLandIds = loanCollateralRepository.findByLoanId(l.getId()).stream()
                .map(c -> c.getLandRecord().getId())
                .collect(Collectors.toList());

        List<LoanTransactionResponse> transactions = loanTransactionRepository
                .findByLoanIdOrderByTransactionDateDesc(l.getId()).stream()
                .map(tx -> LoanTransactionResponse.builder()
                        .id(tx.getId())
                        .loanId(l.getId())
                        .transactionType(tx.getTransactionType())
                        .amount(tx.getAmount())
                        .transactionDate(tx.getTransactionDate())
                        .referenceNumber(tx.getReferenceNumber())
                        .description(tx.getDescription())
                        .build())
                .collect(Collectors.toList());

        return LoanRecordResponse.builder()
                .id(l.getId())
                .farmerId(l.getFarmer().getId())
                .farmerName(l.getFarmer().getFarmerName())
                .bankId(l.getBank().getId())
                .bankName(l.getBank().getBankName())
                .branchName(l.getBank().getBranchName())
                .ifscCode(l.getBank().getIfscCode())
                .loanAccountReference(l.getLoanAccountReference())
                .loanType(l.getLoanType())
                .sanctionedAmount(l.getSanctionedAmount())
                .disbursedAmount(l.getDisbursedAmount())
                .outstandingAmount(l.getOutstandingAmount())
                .interestRate(l.getInterestRate())
                .loanPurpose(l.getLoanPurpose())
                .cropSeason(l.getCropSeason())
                .cropName(l.getCropName())
                .linkedKhasra(l.getLinkedKhasra())
                .subsidyApplied(l.getSubsidyApplied())
                .subsidyReceived(l.getSubsidyReceived())
                .subsidyAmountReceived(l.getSubsidyAmountReceived())
                .lastPaymentDate(l.getLastPaymentDate())
                .disbursementDate(l.getDisbursementDate())
                .maturityDate(l.getMaturityDate())
                .repaymentStatus(l.getRepaymentStatus())
                .verificationStatus(l.getVerificationStatus() != null ? l.getVerificationStatus() : "PENDING")
                .duplicateFlag(l.getDuplicateFlag() != null ? l.getDuplicateFlag() : false)
                .createdAt(l.getCreatedAt())
                .pledgedLandParcelIds(pledgedLandIds)
                .transactions(transactions)
                .build();
    }
}
