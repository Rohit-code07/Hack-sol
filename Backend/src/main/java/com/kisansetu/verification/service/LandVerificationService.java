package com.kisansetu.verification.service;

import com.kisansetu.common.enums.MortgageStatus;
import com.kisansetu.common.enums.OwnershipStatus;
import com.kisansetu.land.entity.LandOwnership;
import com.kisansetu.land.entity.LandRecord;
import com.kisansetu.land.entity.Mortgage;
import com.kisansetu.land.repository.LandOwnershipRepository;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.land.repository.MortgageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LandVerificationService {

    private final LandRecordRepository landRecordRepository;
    private final LandOwnershipRepository landOwnershipRepository;
    private final MortgageRepository mortgageRepository;

    @Transactional(readOnly = true)
    public List<LandRecord> searchParcels(String state, String district, String tehsil, String village, String khasraNumber) {
        return landRecordRepository.searchParcels(state, district, tehsil, village, khasraNumber);
    }

    @Transactional(readOnly = true)
    public boolean verifyOwnership(Long landRecordId, UUID farmerId) {
        List<LandOwnership> ownerships = landOwnershipRepository.findByLandRecordId(landRecordId);
        return ownerships.stream()
                .anyMatch(o -> o.getFarmer().getId().equals(farmerId) &&
                        (o.getValidTo() == null || !o.getValidTo().isBefore(java.time.LocalDate.now())));
    }

    @Transactional(readOnly = true)
    public List<Mortgage> getActiveMortgages(Long landRecordId) {
        return mortgageRepository.findByLandRecordIdAndMortgageStatus(landRecordId, MortgageStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateTotalEligibleArea(List<Long> landRecordIds, UUID farmerId) {
        BigDecimal totalArea = BigDecimal.ZERO;
        for (Long id : landRecordIds) {
            var landOpt = landRecordRepository.findById(id);
            if (landOpt.isPresent()) {
                LandRecord lr = landOpt.get();
                List<LandOwnership> ownerships = landOwnershipRepository.findByLandRecordId(id);
                for (LandOwnership lo : ownerships) {
                    if (lo.getFarmer().getId().equals(farmerId)) {
                        BigDecimal pct = lo.getOwnershipPercentage().divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP);
                        BigDecimal farmerShare = lr.getLandArea().multiply(pct);
                        totalArea = totalArea.add(farmerShare);
                    }
                }
            }
        }
        return totalArea;
    }
}
