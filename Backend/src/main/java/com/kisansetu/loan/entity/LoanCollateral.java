package com.kisansetu.loan.entity;

import com.kisansetu.common.enums.CollateralStatus;
import com.kisansetu.land.entity.LandRecord;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loan_collaterals", uniqueConstraints = {
        @UniqueConstraint(name = "uq_loan_land", columnNames = {"loan_id", "land_record_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanCollateral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private LoanRecord loan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_record_id", nullable = false)
    private LandRecord landRecord;

    @Enumerated(EnumType.STRING)
    @Column(name = "collateral_status", nullable = false, length = 50)
    @Builder.Default
    private CollateralStatus collateralStatus = CollateralStatus.ACTIVE;
}
