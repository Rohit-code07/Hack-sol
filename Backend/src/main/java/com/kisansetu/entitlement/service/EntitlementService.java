package com.kisansetu.entitlement.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisansetu.common.enums.CalculationStatus;
import com.kisansetu.common.enums.DiscrepancyCategory;
import com.kisansetu.common.enums.DiscrepancySeverity;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.common.util.FarmerAccessValidator;
import com.kisansetu.common.util.SecurityUtils;
import com.kisansetu.discrepancy.entity.Discrepancy;
import com.kisansetu.discrepancy.repository.DiscrepancyRepository;
import com.kisansetu.entitlement.calculator.RuleEngine;
import com.kisansetu.entitlement.dto.EntitlementCalculationResponse;
import com.kisansetu.entitlement.dto.InsuranceReconciliationRequest;
import com.kisansetu.entitlement.dto.KccEvaluationRequest;
import com.kisansetu.entitlement.dto.MspVerificationRequest;
import com.kisansetu.entitlement.entity.EntitlementResult;
import com.kisansetu.entitlement.repository.EntitlementResultRepository;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EntitlementService {

    private final RuleEngine ruleEngine;
    private final EntitlementResultRepository resultRepository;
    private final FarmerRepository farmerRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final ObjectMapper objectMapper;
    private final FarmerAccessValidator farmerAccessValidator;

    @Transactional
    public EntitlementCalculationResponse evaluateKcc(KccEvaluationRequest request) {
        if (request.getFarmerId() == null || SecurityUtils.isFarmer()) {
            String username = SecurityUtils.getCurrentUsername();
            if (username != null) {
                farmerRepository.findByUserUsername(username).ifPresent(f -> request.setFarmerId(f.getId()));
            }
        }
        if (request.getFarmerId() == null) {
            throw new ResourceNotFoundException("Farmer", "username", SecurityUtils.getCurrentUsername());
        }
        farmerAccessValidator.validateAccess(request.getFarmerId());
        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", request.getFarmerId()));

        EntitlementCalculationResponse response = ruleEngine.evaluateKcc(request);
        persistResult(farmer, response, request, "KCC_SUBVENTION", "KCC_INTEREST");

        if (response.getEligibilityStatus() == CalculationStatus.DISCREPANCY_DETECTED) {
            recordDiscrepancy(farmer, DiscrepancyCategory.LOAN_INTEREST_DISCREPANCY,
                    request.getLoanId() != null ? "LOAN-" + request.getLoanId() : "LOAN-UNSPECIFIED",
                    response.getExpectedAmount(), response.getActualAmount(), response.getDifferenceAmount(),
                    DiscrepancySeverity.HIGH, response.getExplanation());
        }

        return response;
    }

    @Transactional
    public EntitlementCalculationResponse verifyMsp(MspVerificationRequest request) {
        if (request.getFarmerId() == null || SecurityUtils.isFarmer()) {
            String username = SecurityUtils.getCurrentUsername();
            if (username != null) {
                farmerRepository.findByUserUsername(username).ifPresent(f -> request.setFarmerId(f.getId()));
            }
        }
        if (request.getFarmerId() == null) {
            throw new ResourceNotFoundException("Farmer", "username", SecurityUtils.getCurrentUsername());
        }
        farmerAccessValidator.validateAccess(request.getFarmerId());
        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", request.getFarmerId()));

        EntitlementCalculationResponse response = ruleEngine.verifyMsp(request);
        persistResult(farmer, response, request, "MSP_VERIFICATION", "MSP_PAYMENT");

        if (response.getEligibilityStatus() == CalculationStatus.DISCREPANCY_DETECTED) {
            String refId = request.getReceiptReference() != null ? request.getReceiptReference() : "MSP-" + request.getCrop() + "-" + request.getMarketingSeason();
            recordDiscrepancy(farmer, DiscrepancyCategory.MSP_PAYMENT_DISCREPANCY, refId,
                    response.getExpectedAmount(), response.getActualAmount(), response.getDifferenceAmount(),
                    DiscrepancySeverity.HIGH, response.getExplanation());
        }

        return response;
    }

    @Transactional
    public EntitlementCalculationResponse reconcileInsurance(InsuranceReconciliationRequest request) {
        if (request.getFarmerId() == null || SecurityUtils.isFarmer()) {
            String username = SecurityUtils.getCurrentUsername();
            if (username != null) {
                farmerRepository.findByUserUsername(username).ifPresent(f -> request.setFarmerId(f.getId()));
            }
        }
        if (request.getFarmerId() == null) {
            throw new ResourceNotFoundException("Farmer", "username", SecurityUtils.getCurrentUsername());
        }
        farmerAccessValidator.validateAccess(request.getFarmerId());
        Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", request.getFarmerId()));

        EntitlementCalculationResponse response = ruleEngine.reconcileInsurance(request);
        persistResult(farmer, response, request, "PMFBY_RECONCILIATION", "CROP_INSURANCE");

        if (response.getEligibilityStatus() == CalculationStatus.DISCREPANCY_DETECTED) {
            recordDiscrepancy(farmer, DiscrepancyCategory.INSURANCE_PAYOUT_DISCREPANCY,
                    request.getInsurancePolicyNumber(),
                    response.getExpectedAmount(), response.getActualAmount(), response.getDifferenceAmount(),
                    DiscrepancySeverity.HIGH, response.getExplanation());
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<EntitlementCalculationResponse> getEntitlementsByFarmer(UUID farmerId) {
        farmerAccessValidator.validateAccess(farmerId);
        return resultRepository.findByFarmerId(farmerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EntitlementCalculationResponse getEntitlementById(Long resultId) {
        EntitlementResult result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("EntitlementResult", "id", resultId));
        return mapToResponse(result);
    }

    private void persistResult(Farmer farmer, EntitlementCalculationResponse response, Object requestObj, String schemeCode, String entitlementType) {
        try {
            String inputJson = objectMapper.writeValueAsString(requestObj);
            String breakdownJson = objectMapper.writeValueAsString(response.getCalculationBreakdown());

            EntitlementResult entity = EntitlementResult.builder()
                    .farmer(farmer)
                    .schemeCode(schemeCode)
                    .entitlementType(entitlementType)
                    .inputData(inputJson)
                    .expectedAmount(response.getExpectedAmount())
                    .actualAmount(response.getActualAmount())
                    .differenceAmount(response.getDifferenceAmount())
                    .calculationBreakdown(breakdownJson)
                    .ruleVersion(response.getRuleVersion() != null ? response.getRuleVersion() : "v1.0")
                    .sourceReference(response.getSourceDocumentReference())
                    .calculationStatus(response.getEligibilityStatus())
                    .calculatedAt(LocalDateTime.now())
                    .build();

            entity = resultRepository.save(entity);
            response.setId(entity.getId());
        } catch (Exception e) {
            // log error but do not break calculation response
        }
    }

    private void recordDiscrepancy(Farmer farmer, DiscrepancyCategory category, String refId,
                                   java.math.BigDecimal expected, java.math.BigDecimal actual,
                                   java.math.BigDecimal diff, DiscrepancySeverity severity, String description) {
        var existing = discrepancyRepository.findByFarmerIdAndCategoryAndReferenceId(farmer.getId(), category, refId);
        if (existing.isEmpty()) {
            Discrepancy discrepancy = Discrepancy.builder()
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
            discrepancyRepository.save(discrepancy);
        }
    }

    private EntitlementCalculationResponse mapToResponse(EntitlementResult entity) {
        Map<String, Object> breakdown = null;
        try {
            breakdown = objectMapper.readValue(entity.getCalculationBreakdown(), Map.class);
        } catch (Exception ignored) {}

        return EntitlementCalculationResponse.builder()
                .id(entity.getId())
                .farmerId(entity.getFarmer().getId())
                .schemeCode(entity.getSchemeCode())
                .entitlementType(entity.getEntitlementType())
                .eligibilityStatus(entity.getCalculationStatus())
                .expectedAmount(entity.getExpectedAmount())
                .actualAmount(entity.getActualAmount())
                .differenceAmount(entity.getDifferenceAmount())
                .applicableScheme(entity.getSchemeCode())
                .ruleVersion(entity.getRuleVersion())
                .calculationBreakdown(breakdown)
                .sourceDocumentReference(entity.getSourceReference())
                .verificationStatus(VerificationStatus.VERIFIED)
                .calculatedAt(entity.getCalculatedAt())
                .build();
    }
}
