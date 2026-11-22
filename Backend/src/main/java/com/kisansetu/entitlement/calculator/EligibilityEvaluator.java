package com.kisansetu.entitlement.calculator;

import com.kisansetu.common.enums.LoanType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EligibilityEvaluator {

    public boolean isKccEligibleLoanType(LoanType loanType) {
        return loanType == LoanType.KCC_CROP_LOAN;
    }

    public boolean isAmountWithinKccLimit(BigDecimal amount, BigDecimal limit) {
        if (amount == null || limit == null) return false;
        return amount.compareTo(limit) <= 0;
    }
}
