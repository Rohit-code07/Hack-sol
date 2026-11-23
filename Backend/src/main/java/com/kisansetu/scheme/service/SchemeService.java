package com.kisansetu.scheme.service;

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
import com.kisansetu.scheme.dto.*;
import com.kisansetu.scheme.entity.InsuranceRecord;
import com.kisansetu.scheme.entity.MspTransaction;
import com.kisansetu.scheme.entity.SchemeRule;
import com.kisansetu.scheme.repository.InsuranceRecordRepository;
import com.kisansetu.scheme.repository.MspTransactionRepository;
import com.kisansetu.scheme.repository.SchemeRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchemeService {

    private final MspTransactionRepository mspTransactionRepository;
    private final InsuranceRecordRepository insuranceRecordRepository;
    private final FarmerRepository farmerRepository;
    private final SchemeRuleRepository schemeRuleRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final FarmerAccessValidator farmerAccessValidator;

    @Transactional
    public MspTransactionResponse recordMspTransaction(MspTransactionRequest request) {
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

        String receiptRef = request.getReceiptReference();
        if (receiptRef == null || receiptRef.isBlank()) {
            receiptRef = "MSP-" + System.currentTimeMillis();
        }

        if (mspTransactionRepository.findByReceiptReference(receiptRef).isPresent()) {
            throw new DuplicateResourceException("MSP receipt reference already exists: " + receiptRef);
        }

        BigDecimal mspRate = request.getApplicableMsp();
        if (mspRate == null || mspRate.compareTo(BigDecimal.ZERO) <= 0) {
            // Default benchmark MSP rates
            mspRate = new BigDecimal("2300.00"); // Standard Paddy MSP
        }

        BigDecimal deductions = request.getDocumentedDeductions() != null ? request.getDocumentedDeductions() : BigDecimal.ZERO;
        BigDecimal grossAmount = request.getAcceptedQuantity().multiply(mspRate);
        BigDecimal expectedPayment = grossAmount.subtract(deductions);
        BigDecimal actualPayment = request.getActualPayment();
        BigDecimal difference = expectedPayment.subtract(actualPayment);

        String paymentStatus = request.getPaymentStatus() != null ? request.getPaymentStatus() : "COMPLETED";
        if (difference.compareTo(new BigDecimal("100.00")) > 0) {
            paymentStatus = "UNDERPAID";

            // Automatically detect underpayment discrepancy
            Discrepancy disc = Discrepancy.builder()
                    .farmer(farmer)
                    .category(DiscrepancyCategory.MSP_PAYMENT_DISCREPANCY)
                    .referenceId(receiptRef)
                    .expectedAmount(expectedPayment)
                    .actualAmount(actualPayment)
                    .differenceAmount(difference)
                    .severity(DiscrepancySeverity.MEDIUM)
                    .description(String.format("MSP procurement shortfall: Expected ₹%s based on MSP ₹%s/qtl for %s qtl, but received ₹%s.",
                            expectedPayment, mspRate, request.getAcceptedQuantity(), actualPayment))
                    .verificationStatus(VerificationStatus.DETECTED)
                    .build();
            discrepancyRepository.save(disc);
        }

        MspTransaction tx = MspTransaction.builder()
                .farmer(farmer)
                .crop(request.getCrop())
                .cropVariety(request.getCropVariety())
                .cropGrade(request.getCropGrade())
                .marketingSeason(request.getMarketingSeason())
                .procurementYear(request.getProcurementYear() != null ? request.getProcurementYear() : "2024")
                .expectedProduction(request.getExpectedProduction() != null ? request.getExpectedProduction() : BigDecimal.ZERO)
                .totalProduction(request.getTotalProduction() != null ? request.getTotalProduction() : BigDecimal.ZERO)
                .quantitySold(request.getQuantitySold() != null ? request.getQuantitySold() : BigDecimal.ZERO)
                .quantitySubmitted(request.getQuantitySubmitted() != null ? request.getQuantitySubmitted() : BigDecimal.ZERO)
                .quantityRejected(request.getQuantityRejected() != null ? request.getQuantityRejected() : BigDecimal.ZERO)
                .acceptedQuantity(request.getAcceptedQuantity())
                .quantityUnit(request.getQuantityUnit())
                .procurementCenter(request.getProcurementCenter())
                .procurementCenterLocation(request.getProcurementCenterLocation())
                .tokenNumber(request.getTokenNumber())
                .applicableMsp(mspRate)
                .actualRateReceived(request.getActualRateReceived() != null ? request.getActualRateReceived() : mspRate)
                .grossProcurementAmount(grossAmount)
                .documentedDeductions(deductions)
                .actualPayment(actualPayment)
                .paymentStatus(paymentStatus)
                .bankAccountMasked(request.getBankAccountMasked())
                .transactionId(request.getTransactionId())
                .transactionDate(request.getTransactionDate())
                .paymentDate(request.getPaymentDate())
                .receiptReference(receiptRef)
                .build();

        tx = mspTransactionRepository.save(tx);
        return mapMspToResponse(tx);
    }

    @Transactional(readOnly = true)
    public List<MspTransactionResponse> getMspTransactionsByFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        return mspTransactionRepository.findByFarmerId(farmerId).stream()
                .map(this::mapMspToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InsuranceRecordResponse registerInsurancePolicy(InsurancePolicyRequest request) {
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

        if (insuranceRecordRepository.findByInsurancePolicyNumber(request.getInsurancePolicyNumber()).isPresent()) {
            throw new DuplicateResourceException("Insurance policy already registered: " + request.getInsurancePolicyNumber());
        }

        InsuranceRecord policy = InsuranceRecord.builder()
                .farmer(farmer)
                .schemeName(request.getSchemeName())
                .crop(request.getCrop())
                .season(request.getSeason())
                .cropYear(request.getCropYear() != null ? request.getCropYear() : "2024")
                .village(request.getVillage() != null ? request.getVillage() : farmer.getVillage())
                .block(request.getBlock() != null ? request.getBlock() : farmer.getTehsil())
                .district(request.getDistrict() != null ? request.getDistrict() : farmer.getDistrict())
                .khasraNumber(request.getKhasraNumber())
                .insuranceCompany(request.getInsuranceCompany() != null ? request.getInsuranceCompany() : "Agriculture Insurance Company of India")
                .insurancePolicyNumber(request.getInsurancePolicyNumber())
                .applicationNumber(request.getApplicationNumber())
                .insuredArea(request.getInsuredArea())
                .sumInsured(request.getSumInsured())
                .premiumPaid(request.getPremiumPaid())
                .premiumPaymentDate(request.getPremiumPaymentDate())
                .enrollmentDate(request.getEnrollmentDate() != null ? request.getEnrollmentDate() : LocalDate.now())
                .claimStatus("ACTIVE")
                .build();

        policy = insuranceRecordRepository.save(policy);
        return mapInsuranceToResponse(policy);
    }

    @Transactional
    public InsuranceRecordResponse submitInsuranceClaim(InsuranceClaimRequest request) {
        InsuranceRecord policy = insuranceRecordRepository.findByInsurancePolicyNumber(request.getInsurancePolicyNumber())
                .orElseThrow(() -> new ResourceNotFoundException("InsuranceRecord", "policyNumber", request.getInsurancePolicyNumber()));

        String claimNumber = "CLM-" + System.currentTimeMillis();

        policy.setClaimType(request.getClaimType());
        policy.setDamageDate(request.getDamageDate());
        policy.setDamageType(request.getDamageType());
        policy.setDamageDescription(request.getDamageDescription());
        policy.setEstimatedDamagePercentage(request.getEstimatedDamagePercentage() != null ? request.getEstimatedDamagePercentage() : BigDecimal.ZERO);
        policy.setEstimatedLoss(request.getEstimatedLoss() != null ? request.getEstimatedLoss() : request.getClaimAmount());
        policy.setClaimAmount(request.getClaimAmount());
        policy.setClaimNumber(claimNumber);
        policy.setClaimDate(LocalDate.now());
        policy.setClaimStatus("UNDER_REVIEW");

        policy = insuranceRecordRepository.save(policy);
        return mapInsuranceToResponse(policy);
    }

    @Transactional(readOnly = true)
    public List<InsuranceRecordResponse> getInsuranceRecordsByFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        return insuranceRecordRepository.findByFarmerId(farmerId).stream()
                .map(this::mapInsuranceToResponse)
                .collect(Collectors.toList());
    }

    private MspTransactionResponse mapMspToResponse(MspTransaction tx) {
        BigDecimal expectedPayment = tx.getGrossProcurementAmount().subtract(tx.getDocumentedDeductions());
        BigDecimal pending = expectedPayment.subtract(tx.getActualPayment()).max(BigDecimal.ZERO);

        return MspTransactionResponse.builder()
                .id(tx.getId())
                .farmerId(tx.getFarmer().getId())
                .farmerName(tx.getFarmer().getFarmerName())
                .crop(tx.getCrop())
                .cropVariety(tx.getCropVariety())
                .cropGrade(tx.getCropGrade())
                .marketingSeason(tx.getMarketingSeason())
                .procurementYear(tx.getProcurementYear())
                .expectedProduction(tx.getExpectedProduction())
                .totalProduction(tx.getTotalProduction())
                .quantitySold(tx.getQuantitySold())
                .quantitySubmitted(tx.getQuantitySubmitted())
                .quantityRejected(tx.getQuantityRejected())
                .acceptedQuantity(tx.getAcceptedQuantity())
                .quantityUnit(tx.getQuantityUnit())
                .procurementCenter(tx.getProcurementCenter())
                .procurementCenterLocation(tx.getProcurementCenterLocation())
                .tokenNumber(tx.getTokenNumber())
                .applicableMsp(tx.getApplicableMsp())
                .actualRateReceived(tx.getActualRateReceived())
                .grossProcurementAmount(tx.getGrossProcurementAmount())
                .documentedDeductions(tx.getDocumentedDeductions())
                .expectedPayment(expectedPayment)
                .actualPayment(tx.getActualPayment())
                .pendingAmount(pending)
                .paymentStatus(tx.getPaymentStatus())
                .bankAccountMasked(tx.getBankAccountMasked())
                .transactionId(tx.getTransactionId())
                .transactionDate(tx.getTransactionDate())
                .paymentDate(tx.getPaymentDate())
                .receiptReference(tx.getReceiptReference())
                .build();
    }

    private InsuranceRecordResponse mapInsuranceToResponse(InsuranceRecord ir) {
        return InsuranceRecordResponse.builder()
                .id(ir.getId())
                .farmerId(ir.getFarmer().getId())
                .farmerName(ir.getFarmer().getFarmerName())
                .schemeName(ir.getSchemeName())
                .crop(ir.getCrop())
                .season(ir.getSeason())
                .cropYear(ir.getCropYear())
                .village(ir.getVillage())
                .block(ir.getBlock())
                .district(ir.getDistrict())
                .khasraNumber(ir.getKhasraNumber())
                .insuranceCompany(ir.getInsuranceCompany())
                .insurancePolicyNumber(ir.getInsurancePolicyNumber())
                .applicationNumber(ir.getApplicationNumber())
                .insuredArea(ir.getInsuredArea())
                .sumInsured(ir.getSumInsured())
                .premiumPaid(ir.getPremiumPaid())
                .premiumPaymentDate(ir.getPremiumPaymentDate())
                .enrollmentDate(ir.getEnrollmentDate())
                .claimStatus(ir.getClaimStatus())
                .claimType(ir.getClaimType())
                .damageDate(ir.getDamageDate())
                .damageType(ir.getDamageType())
                .damageDescription(ir.getDamageDescription())
                .estimatedDamagePercentage(ir.getEstimatedDamagePercentage())
                .estimatedLoss(ir.getEstimatedLoss())
                .claimAmount(ir.getClaimAmount())
                .claimNumber(ir.getClaimNumber())
                .sanctionedClaimAmount(ir.getSanctionedClaimAmount())
                .actualPayout(ir.getActualPayout())
                .rejectionReason(ir.getRejectionReason())
                .claimDate(ir.getClaimDate())
                .paymentDate(ir.getPaymentDate())
                .build();
    }
}
