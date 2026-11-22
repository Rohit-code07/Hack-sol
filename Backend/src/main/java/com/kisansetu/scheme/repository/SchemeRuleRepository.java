package com.kisansetu.scheme.repository;

import com.kisansetu.scheme.entity.SchemeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SchemeRuleRepository extends JpaRepository<SchemeRule, Long> {

    Optional<SchemeRule> findBySchemeCodeAndStateCodeAndSeasonAndRuleVersion(
            String schemeCode, String stateCode, String season, String ruleVersion);

    @Query("SELECT r FROM SchemeRule r WHERE r.schemeCode = :schemeCode " +
           "AND (r.stateCode = :stateCode OR r.stateCode = 'ALL') " +
           "AND (r.season = :season OR r.season = 'ALL') " +
           "AND (:date BETWEEN r.effectiveFrom AND COALESCE(r.effectiveTo, '9999-12-31')) " +
           "ORDER BY r.effectiveFrom DESC")
    List<SchemeRule> findApplicableRules(
            @Param("schemeCode") String schemeCode,
            @Param("stateCode") String stateCode,
            @Param("season") String season,
            @Param("date") LocalDate date);

    List<SchemeRule> findBySchemeCode(String schemeCode);
}
