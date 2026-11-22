package com.kisansetu.common.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class FinancialUtils {

    public static final int FINANCIAL_SCALE = 2;
    public static final RoundingMode FINANCIAL_ROUNDING = RoundingMode.HALF_UP;

    private FinancialUtils() {
    }

    public static BigDecimal round(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(FINANCIAL_SCALE, FINANCIAL_ROUNDING);
        }
        return value.setScale(FINANCIAL_SCALE, FINANCIAL_ROUNDING);
    }

    public static BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    public static boolean isEqual(BigDecimal a, BigDecimal b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.compareTo(b) == 0;
    }

    public static boolean isGreaterThan(BigDecimal a, BigDecimal b) {
        if (a == null || b == null) return false;
        return a.compareTo(b) > 0;
    }

    public static boolean isLessThan(BigDecimal a, BigDecimal b) {
        if (a == null || b == null) return false;
        return a.compareTo(b) < 0;
    }

    public static BigDecimal difference(BigDecimal expected, BigDecimal actual) {
        BigDecimal exp = nullSafe(expected);
        BigDecimal act = nullSafe(actual);
        return round(exp.subtract(act));
    }
}
