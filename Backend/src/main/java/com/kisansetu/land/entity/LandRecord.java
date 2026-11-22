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
