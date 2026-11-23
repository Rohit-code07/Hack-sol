package com.kisansetu.verification.repository;

import com.kisansetu.verification.entity.SyntheticLandRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyntheticLandRegistryRepository extends JpaRepository<SyntheticLandRegistry, Long> {
    Optional<SyntheticLandRegistry> findByStateAndDistrictAndTehsilAndVillageAndKhasraNumber(
            String state, String district, String tehsil, String village, String khasraNumber);

    List<SyntheticLandRegistry> findByKhasraNumberAndVillage(String khasraNumber, String village);

    List<SyntheticLandRegistry> findByVillage(String village);
}
