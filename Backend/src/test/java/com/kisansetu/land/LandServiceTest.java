package com.kisansetu.land;

import com.kisansetu.common.enums.MortgageStatus;
import com.kisansetu.common.enums.OwnershipStatus;
import com.kisansetu.common.enums.OwnershipType;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import com.kisansetu.land.dto.LandOwnershipResponse;
import com.kisansetu.land.dto.LandRecordResponse;
import com.kisansetu.land.dto.MortgageResponse;
import com.kisansetu.land.entity.LandOwnership;
import com.kisansetu.land.entity.LandRecord;
import com.kisansetu.land.entity.Mortgage;
import com.kisansetu.land.repository.LandOwnershipRepository;
import com.kisansetu.land.repository.LandRecordRepository;
import com.kisansetu.land.repository.MortgageRepository;
import com.kisansetu.land.service.LandService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class LandServiceTest {

    @Mock
    private LandRecordRepository landRecordRepository;

    @Mock
    private LandOwnershipRepository landOwnershipRepository;

    @Mock
    private MortgageRepository mortgageRepository;

    @Mock
    private FarmerRepository farmerRepository;

    @Mock
    private com.kisansetu.common.util.FarmerAccessValidator farmerAccessValidator;

    @InjectMocks
    private LandService landService;

    private LandRecord parcelArang;
    private LandRecord parcelPatan;

    @BeforeEach
    void setUp() {
        // Both parcels have Khasra number "104/1", but in different villages/districts!
        parcelArang = LandRecord.builder()
                .id(1L)
                .khasraNumber("104/1")
                .village("Arang")
                .tehsil("Arang")
                .district("Raipur")
                .state("Chhattisgarh")
                .landArea(new BigDecimal("2.50"))
                .ownershipStatus(OwnershipStatus.CLEAR)
                .build();

        parcelPatan = LandRecord.builder()
                .id(11L)
                .khasraNumber("104/1")
                .village("Patan")
                .tehsil("Patan")
                .district("Durg")
                .state("Chhattisgarh")
                .landArea(new BigDecimal("2.80"))
                .ownershipStatus(OwnershipStatus.CLEAR)
                .build();
    }

    @Test
    @DisplayName("Identical Khasra numbers (104/1) in different geographies are distinguished correctly")
    void testCompositeGeographicalIdentity() {
        when(landRecordRepository.searchParcels("Chhattisgarh", "Raipur", "Arang", "Arang", "104/1"))
                .thenReturn(List.of(parcelArang));

        List<LandRecordResponse> arangResults = landService.search("Chhattisgarh", "Raipur", "Arang", "Arang", "104/1");
        assertThat(arangResults).hasSize(1);
        assertThat(arangResults.get(0).getDistrict()).isEqualTo("Raipur");
        assertThat(arangResults.get(0).getLandArea()).isEqualByComparingTo("2.50");

        when(landRecordRepository.searchParcels("Chhattisgarh", "Durg", "Patan", "Patan", "104/1"))
                .thenReturn(List.of(parcelPatan));

        List<LandRecordResponse> patanResults = landService.search("Chhattisgarh", "Durg", "Patan", "Patan", "104/1");
        assertThat(patanResults).hasSize(1);
        assertThat(patanResults.get(0).getDistrict()).isEqualTo("Durg");
        assertThat(patanResults.get(0).getLandArea()).isEqualByComparingTo("2.80");
    }

    @Test
    @DisplayName("Fetch ownership details for a land parcel")
    void testFetchOwnership() {
        UUID farmerId = UUID.randomUUID();
        Farmer farmer = Farmer.builder().id(farmerId).farmerName("Ramesh").build();

        LandOwnership ownership = LandOwnership.builder()
                .id(1L)
                .landRecord(parcelArang)
                .farmer(farmer)
                .ownershipType(OwnershipType.INDIVIDUAL)
                .ownershipPercentage(new BigDecimal("100.00"))
                .validFrom(LocalDate.of(2015, 1, 1))
                .build();

        when(landOwnershipRepository.findByLandRecordId(1L)).thenReturn(List.of(ownership));

        List<LandOwnershipResponse> responses = landService.getOwnership(1L);
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getFarmerName()).isEqualTo("Ramesh");
        assertThat(responses.get(0).getOwnershipPercentage()).isEqualByComparingTo("100.00");
    }
}
