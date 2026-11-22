package com.kisansetu.land.repository;

import com.kisansetu.land.entity.LandOwnership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LandOwnershipRepository extends JpaRepository<LandOwnership, Long> {
    List<LandOwnership> findByLandRecordId(Long landRecordId);
    List<LandOwnership> findByFarmerId(UUID farmerId);
}
