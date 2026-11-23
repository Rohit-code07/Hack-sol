package com.kisansetu.farmer.entity;

import com.kisansetu.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "farmers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(length = 36)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "farmer_name", nullable = false, length = 150)
    private String farmerName;

    @Column(name = "father_spouse_name", length = 150)
    private String fatherSpouseName;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(length = 20)
    @Builder.Default
    private String gender = "Male";

    @Column(name = "mobile_number", nullable = false, unique = true, length = 15)
    private String mobileNumber;

    @Column(name = "alternate_mobile", length = 15)
    private String alternateMobile;

    @Column(name = "aadhaar_number", length = 20)
    private String aadhaarNumber;

    @Column(length = 50)
    @Builder.Default
    private String category = "General";

    @Column(length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String village;

    @Column(nullable = false, length = 100)
    private String tehsil;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "pin_code", length = 10)
    private String pinCode;

    @Column(name = "farmer_type", length = 50)
    @Builder.Default
    private String farmerType = "Individual";

    @Column(name = "farming_type", length = 50)
    @Builder.Default
    private String farmingType = "Owner";

    @Column(name = "primary_crop", length = 100)
    @Builder.Default
    private String primaryCrop = "Paddy";

    @Column(name = "secondary_crops", length = 255)
    private String secondaryCrops;

    @Column(name = "total_land_area", precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal totalLandArea = BigDecimal.ZERO;

    @Column(name = "irrigation_available")
    @Builder.Default
    private Boolean irrigationAvailable = false;

    @Column(name = "irrigation_type", length = 100)
    @Builder.Default
    private String irrigationType = "Rainfed";

    @Column(name = "soil_type", length = 100)
    @Builder.Default
    private String soilType = "Alluvial";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "documents_json")
    private String documentsJson;

    @Column(name = "profile_completion_percentage")
    @Builder.Default
    private Integer profileCompletionPercentage = 30;

    @Column(name = "preferred_language", length = 20)
    @Builder.Default
    private String preferredLanguage = "hi";

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public int calculateCompletionPercentage() {
        int score = 20; // Basic name, mobile, location
        if (fatherSpouseName != null && !fatherSpouseName.isBlank()) score += 10;
        if (dob != null) score += 5;
        if (gender != null) score += 5;
        if (aadhaarNumber != null && !aadhaarNumber.isBlank()) score += 10;
        if (category != null) score += 5;
        if (address != null && !address.isBlank()) score += 10;
        if (pinCode != null && !pinCode.isBlank()) score += 5;
        if (primaryCrop != null && !primaryCrop.isBlank()) score += 10;
        if (totalLandArea != null && totalLandArea.compareTo(BigDecimal.ZERO) > 0) score += 10;
        if (irrigationType != null) score += 5;
        if (documentsJson != null && !documentsJson.isBlank()) score += 5;
        return Math.min(100, score);
    }
}
