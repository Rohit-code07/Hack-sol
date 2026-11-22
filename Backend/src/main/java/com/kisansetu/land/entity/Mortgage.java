package com.kisansetu.land.entity;

import com.kisansetu.bank.entity.Bank;
import com.kisansetu.common.enums.MortgageStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "mortgages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mortgage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "land_record_id", nullable = false)
    private LandRecord landRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false)
    private Bank bank;

    @Column(name = "mortgage_reference", nullable = false, length = 100)
    private String mortgageReference;

    @Column(name = "mortgage_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal mortgageAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "mortgage_status", nullable = false, length = 50)
    @Builder.Default
    private MortgageStatus mortgageStatus = MortgageStatus.ACTIVE;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "release_date")
    private LocalDate releaseDate;
}
