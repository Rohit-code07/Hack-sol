package com.kisansetu.entitlement.entity;

import com.kisansetu.common.enums.CalculationStatus;
import com.kisansetu.farmer.entity.Farmer;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "entitlement_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntitlementResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private Farmer farmer;

    @Column(name = "scheme_code", nullable = false, length = 50)
    private String schemeCode;

    @Column(name = "entitlement_type", nullable = false, length = 50)
    private String entitlementType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_data", nullable = false, columnDefinition = "jsonb")
    private String inputData;

    @Column(name = "expected_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal expectedAmount;

    @Column(name = "actual_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal actualAmount;

    @Column(name = "difference_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal differenceAmount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "calculation_breakdown", nullable = false, columnDefinition = "jsonb")
    private String calculationBreakdown;

    @Column(name = "rule_version", nullable = false, length = 50)
    private String ruleVersion;

    @Column(name = "source_reference", length = 255)
    private String sourceReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "calculation_status", nullable = false, length = 50)
    private CalculationStatus calculationStatus;

    @Column(name = "calculated_at", updatable = false)
    @Builder.Default
    private LocalDateTime calculatedAt = LocalDateTime.now();
}
