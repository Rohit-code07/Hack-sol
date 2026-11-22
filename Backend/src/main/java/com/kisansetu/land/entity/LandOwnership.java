package com.kisansetu.land.entity;

import com.kisansetu.common.enums.OwnershipType;
import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "land_ownership")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandOwnership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_record_id", nullable = false)
    private LandRecord landRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Enumerated(EnumType.STRING)
    @Column(name = "ownership_type", nullable = false, length = 50)
    @Builder.Default
    private OwnershipType ownershipType = OwnershipType.INDIVIDUAL;

    @Column(name = "ownership_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal ownershipPercentage = new BigDecimal("100.00");

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;
}
