package com.kisansetu.common.util;

import com.kisansetu.common.exception.AccessDeniedException;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FarmerAccessValidator {

    private final FarmerRepository farmerRepository;

    public void validateAccess(UUID farmerId) {
        if (SecurityUtils.isBankOfficer()) {
            return; // Bank officers can view and verify farmer records
        }

        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new AccessDeniedException("Access denied: Authentication required.");
        }

        Optional<Farmer> farmerOpt = farmerRepository.findByUserUsername(username);
        if (farmerOpt.isEmpty() || !farmerOpt.get().getId().equals(farmerId)) {
            throw new AccessDeniedException("Access denied: You can only view and modify your own farmer records.");
        }
    }
}
