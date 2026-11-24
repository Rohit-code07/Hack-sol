package com.kisansetu.verification.repository;

import com.kisansetu.verification.entity.SyntheticLoanRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyntheticLoanRegistryRepository extends JpaRepository<SyntheticLoanRegistry, Long> {
    Optional<SyntheticLoanRegistry> findByLoanAccountNumber(String loanAccountNumber);

    List<SyntheticLoanRegistry> findByKhasraNumberAndVillageAndIsActiveTrue(String khasraNumber, String village);

    List<SyntheticLoanRegistry> findByBorrowerName(String borrowerName);
}
