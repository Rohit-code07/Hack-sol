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
           "WHERE (cast(:state as string) IS NULL OR LOWER(lr.state) = LOWER(cast(:state as string))) " +
           "AND (cast(:district as string) IS NULL OR LOWER(lr.district) = LOWER(cast(:district as string))) " +
           "AND (cast(:tehsil as string) IS NULL OR LOWER(lr.tehsil) = LOWER(cast(:tehsil as string))) " +
           "AND (cast(:village as string) IS NULL OR LOWER(lr.village) = LOWER(cast(:village as string))) " +
           "AND (cast(:khasraNumber as string) IS NULL OR lr.khasraNumber = cast(:khasraNumber as string))")
    List<LandRecord> searchParcels(
            @Param("state") String state,
            @Param("district") String district,
            @Param("tehsil") String tehsil,
            @Param("village") String village,
            @Param("khasraNumber") String khasraNumber);

    @Query("SELECT lo.landRecord FROM LandOwnership lo WHERE lo.farmer.id = :farmerId AND (lo.validTo IS NULL OR lo.validTo >= CURRENT_DATE)")
    List<LandRecord> findParcelsByFarmerId(@Param("farmerId") UUID farmerId);
}
