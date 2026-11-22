package com.kisansetu.loan.controller;

import com.kisansetu.common.response.ApiResponse;
import com.kisansetu.loan.dto.LoanRecordRequest;
import com.kisansetu.loan.dto.LoanRecordResponse;
import com.kisansetu.loan.dto.LoanTransactionRequest;
import com.kisansetu.loan.dto.LoanTransactionResponse;
import com.kisansetu.loan.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/loans")
@RequiredArgsConstructor
@Tag(name = "Agricultural Loans", description = "Management of KCC crop loans, bank records, and transaction histories")
public class LoanController {

    private final LoanService loanService;

    @PostMapping
    @Operation(summary = "Create Agricultural Loan Record")
    public ResponseEntity<ApiResponse<LoanRecordResponse>> create(@Valid @RequestBody LoanRecordRequest request) {
        LoanRecordResponse response = loanService.createLoan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Loan record created successfully"));
    }

    @GetMapping("/{loanId}")
    @Operation(summary = "Get Loan Details by ID")
    public ResponseEntity<ApiResponse<LoanRecordResponse>> getById(@PathVariable Long loanId) {
        LoanRecordResponse response = loanService.getLoanById(loanId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/farmer/{farmerId}")
    @Operation(summary = "Get Loan History for Farmer")
    public ResponseEntity<ApiResponse<List<LoanRecordResponse>>> getByFarmer(@PathVariable UUID farmerId) {
        List<LoanRecordResponse> responses = loanService.getByFarmer(farmerId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/bank/{bankId}")
    @Operation(summary = "Get Loans Issued by Bank Branch")
    public ResponseEntity<ApiResponse<List<LoanRecordResponse>>> getByBank(@PathVariable Long bankId) {
        List<LoanRecordResponse> responses = loanService.getByBank(bankId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{loanId}/transactions")
    @Operation(summary = "Get Loan Transactions", description = "Lists disbursements, interest debits, repayments, and subvention credits")
    public ResponseEntity<ApiResponse<List<LoanTransactionResponse>>> getTransactions(@PathVariable Long loanId) {
        List<LoanTransactionResponse> responses = loanService.getTransactions(loanId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/{loanId}/transactions")
    @Operation(summary = "Record Loan Transaction", description = "Records a new repayment, subvention credit, prompt incentive, or interest charge")
    public ResponseEntity<ApiResponse<LoanTransactionResponse>> addTransaction(
            @PathVariable Long loanId,
            @Valid @RequestBody LoanTransactionRequest request) {
        LoanTransactionResponse response = loanService.addTransaction(loanId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Transaction recorded successfully"));
    }
}
