package com.kisansetu.verification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "synthetic_land_registry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyntheticLandRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "khasra_number", nullable = false, length = 50)
    private String khasraNumber;

    @Column(name = "khata_number", nullable = false, length = 50)
    private String khataNumber;

    @Column(nullable = false, length = 100)
    private String village;

    @Column(nullable = false, length = 100)
    private String tehsil;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "registered_owner_name", nullable = false, length = 150)
    private String registeredOwnerName;

    @Column(name = "land_area", nullable = false, precision = 12, scale = 4)
    private BigDecimal landArea;

    @Column(name = "area_unit", nullable = false, length = 20)
    @Builder.Default
    private String areaUnit = "ACRE";

    @Column(name = "is_mortgaged", nullable = false)
    @Builder.Default
    private Boolean isMortgaged = false;

    @Column(name = "mortgaged_bank_name", length = 150)
    private String mortgagedBankName;

    @Column(name = "encumbrance_status", nullable = false, length = 50)
    @Builder.Default
    private String encumbranceStatus = "CLEAR";

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
