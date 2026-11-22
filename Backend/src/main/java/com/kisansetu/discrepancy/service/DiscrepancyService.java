package com.kisansetu.discrepancy.service;

import com.kisansetu.common.enums.DiscrepancyCategory;
import com.kisansetu.common.enums.DiscrepancySeverity;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.util.FarmerAccessValidator;
import com.kisansetu.common.util.FinancialUtils;
import com.kisansetu.discrepancy.dto.DiscrepancyResponse;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.scheme.entity.InsuranceRecord;
import com.kisansetu.scheme.entity.MspTransaction;
import com.kisansetu.scheme.repository.InsuranceRecordRepository;
import com.kisansetu.scheme.repository.MspTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscrepancyService {

    private final DiscrepancyRepository discrepancyRepository;
    private final FarmerRepository farmerRepository;
    private final MspTransactionRepository mspTransactionRepository;
    private final InsuranceRecordRepository insuranceRecordRepository;
    private final FarmerAccessValidator farmerAccessValidator;

    @Transactional
    public List<DiscrepancyResponse> detectForFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", farmerId));

        List<Discrepancy> detected = new ArrayList<>();

        // 1. Scan MSP Transactions for underpayment
        List<MspTransaction> mspList = mspTransactionRepository.findByFarmerId(farmerId);
        for (MspTransaction msp : mspList) {
            BigDecimal expectedNet = FinancialUtils.round(msp.getGrossProcurementAmount().subtract(msp.getDocumentedDeductions()));
            if (FinancialUtils.isGreaterThan(expectedNet, msp.getActualPayment())) {
                BigDecimal diff = expectedNet.subtract(msp.getActualPayment());
                String desc = String.format("Recorded MSP net entitlement of INR %s for %s (%s) exceeds actual payment of INR %s by INR %s. Flagged for review.",
                        expectedNet, msp.getCrop(), msp.getMarketingSeason(), msp.getActualPayment(), diff);

                Discrepancy d = recordOrUpdate(farmer, DiscrepancyCategory.MSP_PAYMENT_DISCREPANCY,
                        msp.getReceiptReference(), expectedNet, msp.getActualPayment(), diff,
                        DiscrepancySeverity.HIGH, desc);
                detected.add(d);
            }
        }

        // 2. Scan Insurance Records for payout shortfalls
        List<InsuranceRecord> insList = insuranceRecordRepository.findByFarmerId(farmerId);
        for (InsuranceRecord ins : insList) {
            if (ins.getSanctionedClaimAmount() != null && ins.getActualPayout() != null) {
                if (FinancialUtils.isGreaterThan(ins.getSanctionedClaimAmount(), ins.getActualPayout())) {
                    BigDecimal diff = ins.getSanctionedClaimAmount().subtract(ins.getActualPayout());
                    String desc = String.format("Officially sanctioned insurance claim of INR %s for policy %s was disbursed as only INR %s (Shortfall: INR %s).",
                            ins.getSanctionedClaimAmount(), ins.getInsurancePolicyNumber(), ins.getActualPayout(), diff);

                    Discrepancy d = recordOrUpdate(farmer, DiscrepancyCategory.INSURANCE_PAYOUT_DISCREPANCY,
                            ins.getInsurancePolicyNumber(), ins.getSanctionedClaimAmount(), ins.getActualPayout(),
                            diff, DiscrepancySeverity.HIGH, desc);
                    detected.add(d);
                }
            }
        }

        // Return all discrepancies for this farmer
        return discrepancyRepository.findByFarmerId(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DiscrepancyResponse getById(Long id) {
        Discrepancy d = discrepancyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discrepancy", "id", id));
        farmerAccessValidator.validateAccess(d.getFarmer().getId());
        return mapToResponse(d);
    }

    @Transactional(readOnly = true)
    public List<DiscrepancyResponse> getByFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        return discrepancyRepository.findByFarmerId(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DiscrepancyResponse> getAll() {
        return discrepancyRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Discrepancy recordOrUpdate(Farmer farmer, DiscrepancyCategory category, String refId,
                                      BigDecimal expected, BigDecimal actual, BigDecimal diff,
                                      DiscrepancySeverity severity, String description) {
        var existing = discrepancyRepository.findByFarmerIdAndCategoryAndReferenceId(farmer.getId(), category, refId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Discrepancy d = Discrepancy.builder()
                .farmer(farmer)
                .category(category)
                .referenceId(refId)
                .expectedAmount(expected)
                .actualAmount(actual)
                .differenceAmount(diff)
                .severity(severity)
                .description(description)
                .verificationStatus(VerificationStatus.DETECTED)
                .build();
        return discrepancyRepository.save(d);
    }

    public DiscrepancyResponse mapToResponse(Discrepancy entity) {
        return DiscrepancyResponse.builder()
                .id(entity.getId())
                .farmerId(entity.getFarmer().getId())
                .farmerName(entity.getFarmer().getFarmerName())
                .category(entity.getCategory())
                .referenceId(entity.getReferenceId())
                .expectedAmount(entity.getExpectedAmount())
                .actualAmount(entity.getActualAmount())
                .differenceAmount(entity.getDifferenceAmount())
                .severity(entity.getSeverity())
                .description(entity.getDescription())
                .verificationStatus(entity.getVerificationStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
