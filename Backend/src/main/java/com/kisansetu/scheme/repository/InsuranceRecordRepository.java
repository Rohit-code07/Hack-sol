package com.kisansetu.scheme.repository;

import com.kisansetu.scheme.entity.InsuranceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InsuranceRecordRepository extends JpaRepository<InsuranceRecord, Long> {
    Optional<InsuranceRecord> findByInsurancePolicyNumber(String policyNumber);
    List<InsuranceRecord> findByFarmerId(UUID farmerId);
}
