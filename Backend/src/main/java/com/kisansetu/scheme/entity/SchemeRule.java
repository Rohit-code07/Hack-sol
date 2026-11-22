package com.kisansetu.scheme.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheme_rules", uniqueConstraints = {
        @UniqueConstraint(name = "uq_scheme_version",
                columnNames = {"scheme_code", "state_code", "season", "rule_version"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchemeRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "scheme_code", nullable = false, length = 50)
    private String schemeCode;

    @Column(name = "scheme_name", nullable = false, length = 150)
    private String schemeName;

    @Column(name = "state_code", nullable = false, length = 20)
    @Builder.Default
    private String stateCode = "ALL";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String season = "ALL";

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "rule_version", nullable = false, length = 50)
    private String ruleVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rule_data", nullable = false, columnDefinition = "jsonb")
    private String ruleData;

    @Column(name = "source_url", length = 255)
    private String sourceUrl;

    @Column(name = "source_document", length = 255)
    private String sourceDocument;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verification_status", nullable = false, length = 50)
    @Builder.Default
    private String verificationStatus = "VERIFIED";

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
