package com.kisansetu.loan;

import com.kisansetu.bank.entity.Bank;
import com.kisansetu.bank.repository.BankRepository;
import com.kisansetu.common.enums.LoanType;
import com.kisansetu.common.enums.RepaymentStatus;
import com.kisansetu.common.enums.TransactionType;
import com.kisansetu.common.exception.DuplicateResourceException;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.loan.dto.LoanRecordRequest;
import com.kisansetu.loan.dto.LoanRecordResponse;
import com.kisansetu.loan.dto.LoanTransactionRequest;
import com.kisansetu.loan.dto.LoanTransactionResponse;
import com.kisansetu.loan.entity.LoanRecord;
import com.kisansetu.loan.entity.LoanTransaction;
import com.kisansetu.loan.repository.LoanCollateralRepository;
import com.kisansetu.loan.repository.LoanRecordRepository;
import com.kisansetu.loan.repository.LoanTransactionRepository;
import com.kisansetu.loan.service.LoanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class LoanServiceTest {

    @Mock
    private LoanRecordRepository loanRecordRepository;

    @Mock
    private LoanTransactionRepository loanTransactionRepository;

    @Mock
    private LoanCollateralRepository loanCollateralRepository;

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private BankRepository bankRepository;

    @Mock
    private LandRecordRepository landRecordRepository;

    @Mock
    private com.kisansetu.common.util.FarmerAccessValidator farmerAccessValidator;

    @InjectMocks
    private LoanService loanService;

    private Farmer testFarmer;
    private Bank testBank;
    private LoanRecord testLoan;

    @BeforeEach
    void setUp() {
        UUID farmerId = UUID.randomUUID();
        testFarmer = Farmer.builder().id(farmerId).farmerName("Ramesh").build();
        testBank = Bank.builder().id(1L).bankName("SBI").branchName("Raipur").ifscCode("SBIN0000461").build();

        testLoan = LoanRecord.builder()
                .id(1L)
                .farmer(testFarmer)
                .bank(testBank)
                .loanAccountReference("KCC-SBI-2023-1001")
                .loanType(LoanType.KCC_CROP_LOAN)
                .sanctionedAmount(new BigDecimal("150000.00"))
                .disbursedAmount(new BigDecimal("150000.00"))
                .interestRate(new BigDecimal("7.00"))
                .disbursementDate(LocalDate.of(2023, 5, 10))
                .maturityDate(LocalDate.of(2024, 5, 9))
                .repaymentStatus(RepaymentStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Create agricultural loan successfully")
    void testCreateLoan_Success() {
        LoanRecordRequest req = LoanRecordRequest.builder()
                .farmerId(testFarmer.getId())
                .bankId(1L)
                .loanAccountReference("KCC-SBI-2023-1001")
                .loanType(LoanType.KCC_CROP_LOAN)
                .sanctionedAmount(new BigDecimal("150000.00"))
                .disbursedAmount(new BigDecimal("150000.00"))
                .interestRate(new BigDecimal("7.00"))
                .disbursementDate(LocalDate.of(2023, 5, 10))
                .maturityDate(LocalDate.of(2024, 5, 9))
                .repaymentStatus(RepaymentStatus.ACTIVE)
                .build();

        when(loanRecordRepository.findByLoanAccountReference("KCC-SBI-2023-1001")).thenReturn(Optional.empty());
        when(farmerRepository.findById(testFarmer.getId())).thenReturn(Optional.of(testFarmer));
        when(bankRepository.findById(1L)).thenReturn(Optional.of(testBank));
        when(loanRecordRepository.save(any(LoanRecord.class))).thenReturn(testLoan);
        when(loanRecordRepository.findById(1L)).thenReturn(Optional.of(testLoan));
        when(loanCollateralRepository.findByLoanId(1L)).thenReturn(Collections.emptyList());
        when(loanTransactionRepository.findByLoanIdOrderByTransactionDateAsc(1L)).thenReturn(Collections.emptyList());

        LoanRecordResponse res = loanService.createLoan(req);

        assertThat(res.getId()).isEqualTo(1L);
        assertThat(res.getLoanAccountReference()).isEqualTo("KCC-SBI-2023-1001");
        assertThat(res.getSanctionedAmount()).isEqualByComparingTo("150000.00");
    }

    @Test
    @DisplayName("Duplicate loan account reference throws DuplicateResourceException")
    void testDuplicateLoanReference_ThrowsException() {
        LoanRecordRequest req = LoanRecordRequest.builder()
                .loanAccountReference("KCC-SBI-2023-1001")
                .build();

        when(loanRecordRepository.findByLoanAccountReference("KCC-SBI-2023-1001")).thenReturn(Optional.of(testLoan));

        assertThrows(DuplicateResourceException.class, () -> loanService.createLoan(req));
    }

    @Test
    @DisplayName("Record loan transaction successfully")
    void testRecordTransaction() {
        LoanTransactionRequest txnReq = LoanTransactionRequest.builder()
                .transactionType(TransactionType.REPAYMENT)
                .amount(new BigDecimal("50000.00"))
                .transactionDate(LocalDate.of(2024, 4, 15))
                .referenceNumber("TXN-REP-999")
                .description("Partial crop loan repayment")
                .build();

        when(loanRecordRepository.findById(1L)).thenReturn(Optional.of(testLoan));

        LoanTransaction savedTxn = LoanTransaction.builder()
                .id(10L)
                .loan(testLoan)
                .transactionType(TransactionType.REPAYMENT)
                .amount(new BigDecimal("50000.00"))
                .transactionDate(LocalDate.of(2024, 4, 15))
                .referenceNumber("TXN-REP-999")
                .description("Partial crop loan repayment")
                .build();

        when(loanTransactionRepository.save(any(LoanTransaction.class))).thenReturn(savedTxn);

        LoanTransactionResponse res = loanService.addTransaction(1L, txnReq);

        assertThat(res.getId()).isEqualTo(10L);
        assertThat(res.getAmount()).isEqualByComparingTo("50000.00");
        assertThat(res.getTransactionType()).isEqualTo(TransactionType.REPAYMENT);
    }
}
