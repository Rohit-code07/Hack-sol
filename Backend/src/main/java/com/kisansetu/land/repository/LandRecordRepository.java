package com.kisansetu.land.repository;

import com.kisansetu.land.entity.LandRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LandRecordRepository extends JpaRepository<LandRecord, Long> {

    Optional<LandRecord> findByStateAndDistrictAndTehsilAndVillageAndKhasraNumber(
            String state, String district, String tehsil, String village, String khasraNumber);

    List<LandRecord> findByKhasraNumber(String khasraNumber);

    List<LandRecord> findByDistrictAndTehsilAndVillage(String district, String tehsil, String village);

    @Query("SELECT lr FROM LandRecord lr " +
           "WHERE (:state IS NULL OR LOWER(lr.state) = LOWER(:state)) " +
           "AND (:district IS NULL OR LOWER(lr.district) = LOWER(:district)) " +
           "AND (:tehsil IS NULL OR LOWER(lr.tehsil) = LOWER(:tehsil)) " +
           "AND (:village IS NULL OR LOWER(lr.village) = LOWER(:village)) " +
           "AND (:khasraNumber IS NULL OR lr.khasraNumber = :khasraNumber)")
    List<LandRecord> searchParcels(
            @Param("state") String state,
            @Param("district") String district,
            @Param("tehsil") String tehsil,
            @Param("village") String village,
            @Param("khasraNumber") String khasraNumber);

    @Query("SELECT lo.landRecord FROM LandOwnership lo WHERE lo.farmer.id = :farmerId AND (lo.validTo IS NULL OR lo.validTo >= CURRENT_DATE)")
    List<LandRecord> findParcelsByFarmerId(@Param("farmerId") UUID farmerId);
}
