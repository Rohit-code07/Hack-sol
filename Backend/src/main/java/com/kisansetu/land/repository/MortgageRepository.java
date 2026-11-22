package com.kisansetu.land.repository;

import com.kisansetu.common.enums.MortgageStatus;
import com.kisansetu.land.entity.Mortgage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MortgageRepository extends JpaRepository<Mortgage, Long> {
    List<Mortgage> findByLandRecordId(Long landRecordId);
    List<Mortgage> findByLandRecordIdAndMortgageStatus(Long landRecordId, MortgageStatus status);
}
