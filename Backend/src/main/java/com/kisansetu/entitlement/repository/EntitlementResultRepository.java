package com.kisansetu.entitlement.repository;

import com.kisansetu.entitlement.entity.EntitlementResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EntitlementResultRepository extends JpaRepository<EntitlementResult, Long> {
    List<EntitlementResult> findByFarmerId(UUID farmerId);
}
