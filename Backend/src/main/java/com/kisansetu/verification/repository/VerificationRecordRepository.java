package com.kisansetu.verification.repository;

import com.kisansetu.verification.entity.VerificationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationRecordRepository extends JpaRepository<VerificationRecord, Long> {
    List<VerificationRecord> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);
    List<VerificationRecord> findByRecordTypeAndTargetId(String recordType, String targetId);
    long countByVerificationStatus(String verificationStatus);
}
