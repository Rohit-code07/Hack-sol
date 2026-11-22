package com.kisansetu.scheme.repository;

import com.kisansetu.scheme.entity.MspTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MspTransactionRepository extends JpaRepository<MspTransaction, Long> {
    Optional<MspTransaction> findByReceiptReference(String receiptReference);
    List<MspTransaction> findByFarmerId(UUID farmerId);
}
