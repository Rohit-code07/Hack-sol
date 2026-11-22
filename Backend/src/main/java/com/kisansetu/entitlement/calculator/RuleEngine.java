package com.kisansetu.entitlement.calculator;

import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.entitlement.dto.EntitlementCalculationResponse;
import com.kisansetu.entitlement.dto.InsuranceReconciliationRequest;
import com.kisansetu.entitlement.dto.KccEvaluationRequest;
import com.kisansetu.entitlement.dto.MspVerificationRequest;
import com.kisansetu.scheme.entity.SchemeRule;
import com.kisansetu.scheme.repository.SchemeRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RuleEngine {

    private final SchemeRuleRepository schemeRuleRepository;
    private final KCCCalculator kccCalculator;
    private final MSPCalculator mspCalculator;
    private final InsuranceReconciliationCalculator insuranceCalculator;

    public EntitlementCalculationResponse evaluateKcc(KccEvaluationRequest request) {
        LocalDate evaluationDate = request.getDisbursementDate() != null ? request.getDisbursementDate() : LocalDate.now();
        List<SchemeRule> rules = schemeRuleRepository.findApplicableRules("KCC_SUBVENTION", "ALL", "ALL", evaluationDate);

        SchemeRule applicableRule;
        if (!rules.isEmpty()) {
            applicableRule = rules.get(0);
        } else {
            // Fallback to any latest KCC rule or error
            List<SchemeRule> allKccRules = schemeRuleRepository.findBySchemeCode("KCC_SUBVENTION");
            if (allKccRules.isEmpty()) {
                throw new ResourceNotFoundException("No active KCC scheme rules found for date: " + evaluationDate);
            }
            applicableRule = allKccRules.get(0);
        }

        return kccCalculator.calculate(request, applicableRule);
    }

    public EntitlementCalculationResponse verifyMsp(MspVerificationRequest request) {
        String season = request.getMarketingSeason();
        LocalDate queryDate = request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now();

        // Check for specific season rule first
        String schemeCodePrefix = "MSP_" + season.toUpperCase();
        List<SchemeRule> rules = schemeRuleRepository.findApplicableRules(schemeCodePrefix, "ALL", season, queryDate);

        SchemeRule applicableRule;
        if (!rules.isEmpty()) {
            applicableRule = rules.get(0);
        } else {
            // Try matching season across rules
            List<SchemeRule> byScheme = schemeRuleRepository.findBySchemeCode(schemeCodePrefix);
            if (!byScheme.isEmpty()) {
                applicableRule = byScheme.get(0);
            } else {
                throw new ResourceNotFoundException("No applicable MSP rules found for season: " + season + " and date: " + queryDate);
            }
        }

        return mspCalculator.calculate(request, applicableRule);
    }

    public EntitlementCalculationResponse reconcileInsurance(InsuranceReconciliationRequest request) {
        LocalDate queryDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
        List<SchemeRule> rules = schemeRuleRepository.findApplicableRules("PMFBY_RECONCILIATION", "CG", request.getSeason() != null ? request.getSeason() : "ALL", queryDate);

        SchemeRule applicableRule = !rules.isEmpty() ? rules.get(0) : null;
        return insuranceCalculator.calculate(request, applicableRule);
    }
}
