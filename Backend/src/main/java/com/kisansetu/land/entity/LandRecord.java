package com.kisansetu.land.entity;

import com.kisansetu.common.enums.OwnershipStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "land_records", uniqueConstraints = {
        @UniqueConstraint(name = "uq_land_geo_identity",
                columnNames = {"state", "district", "tehsil", "village", "khasra_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "khasra_number", nullable = false, length = 50)
    private String khasraNumber;

    @Column(name = "khata_number", length = 50)
    private String khataNumber;

    @Column(name = "survey_number", length = 50)
    private String surveyNumber;

    @Column(nullable = false, length = 100)
    private String village;

    @Column(nullable = false, length = 100)
    private String tehsil;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "land_area", nullable = false, precision = 12, scale = 4)
    private BigDecimal landArea;

    @Column(name = "area_unit", nullable = false, length = 20)
    @Builder.Default
    private String areaUnit = "ACRE";

    @Column(name = "owner_name", length = 150)
    private String ownerName;

    @Column(name = "co_owner_details", length = 255)
    private String coOwnerDetails;

    @Column(name = "irrigation_status", length = 50)
    @Builder.Default
    private String irrigationStatus = "UNIRRIGATED";

    @Column(name = "land_usage", length = 100)
    @Builder.Default
    private String landUsage = "AGRICULTURAL";

    @Column(name = "is_mortgaged")
    @Builder.Default
    private Boolean isMortgaged = false;

    @Column(name = "is_collateral")
    @Builder.Default
    private Boolean isCollateral = false;

    @Column(name = "verification_status", length = 50)
    @Builder.Default
    private String verificationStatus = "PENDING";

    @Column(name = "verification_remarks", columnDefinition = "TEXT")
    private String verificationRemarks;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verified_by_officer_id")
    private Long verifiedByOfficerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ownership_status", nullable = false, length = 50)
    @Builder.Default
    private OwnershipStatus ownershipStatus = OwnershipStatus.CLEAR;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getFullGeoIdentity() {
        return String.format("%s, %s, %s, %s, Khasra %s", state, district, tehsil, village, khasraNumber);
    }
}
