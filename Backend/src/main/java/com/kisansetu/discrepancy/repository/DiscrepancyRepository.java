package com.kisansetu.discrepancy.repository;

import com.kisansetu.common.enums.DiscrepancyCategory;
import com.kisansetu.common.enums.VerificationStatus;
import com.kisansetu.discrepancy.entity.Discrepancy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DiscrepancyRepository extends JpaRepository<Discrepancy, Long> {
    List<Discrepancy> findByFarmerId(UUID farmerId);
    List<Discrepancy> findByFarmerIdAndCategory(UUID farmerId, DiscrepancyCategory category);
    List<Discrepancy> findByVerificationStatus(VerificationStatus status);
    Optional<Discrepancy> findByFarmerIdAndCategoryAndReferenceId(UUID farmerId, DiscrepancyCategory category, String referenceId);
}
