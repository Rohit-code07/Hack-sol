package com.kisansetu.common.util;

import com.kisansetu.common.enums.UserRole;
import com.kisansetu.common.exception.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public static String getCurrentUsername() {
        Authentication auth = getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return auth.getName();
    }

    public static boolean hasRole(UserRole role) {
        Authentication auth = getAuthentication();
        if (auth == null) return false;
        String roleStr = "ROLE_" + role.name();
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(roleStr));
    }

    public static boolean isBankOfficer() {
        return hasRole(UserRole.BANK_OFFICER);
    }

    public static boolean isFarmer() {
        return hasRole(UserRole.FARMER);
    }
}
