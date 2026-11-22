package com.kisansetu.farmer.repository;

import com.kisansetu.farmer.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, UUID> {
    Optional<Farmer> findByMobileNumber(String mobileNumber);
    Optional<Farmer> findByUserId(Long userId);

    @Query("SELECT f FROM Farmer f WHERE f.user.username = :username")
    Optional<Farmer> findByUserUsername(@Param("username") String username);

    @Query("SELECT f FROM Farmer f WHERE " +
           "LOWER(f.farmerName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "f.mobileNumber LIKE CONCAT('%', :query, '%') OR " +
           "LOWER(f.village) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.district) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Farmer> searchFarmers(@Param("query") String query);
}
