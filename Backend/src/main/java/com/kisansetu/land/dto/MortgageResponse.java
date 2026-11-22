package com.kisansetu.land.dto;

import com.kisansetu.common.enums.MortgageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MortgageResponse {
    private Long id;
    private Long landRecordId;
    private Long bankId;
    private String bankName;
    private String branchName;
    private String mortgageReference;
    private BigDecimal mortgageAmount;
    private MortgageStatus mortgageStatus;
    private LocalDate startDate;
    private LocalDate releaseDate;
}
