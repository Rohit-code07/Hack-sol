package com.kisansetu.auth.service;

import com.kisansetu.auth.dto.AuthRequest;
import com.kisansetu.auth.dto.AuthResponse;
import com.kisansetu.auth.dto.RegisterRequest;
import com.kisansetu.auth.entity.User;
import com.kisansetu.auth.repository.UserRepository;
import com.kisansetu.common.enums.UserRole;
import com.kisansetu.common.exception.DuplicateResourceException;
import com.kisansetu.common.exception.ResourceNotFoundException;
import com.kisansetu.config.JwtTokenProvider;
import com.kisansetu.farmer.entity.Farmer;
import com.kisansetu.farmer.repository.FarmerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUsername()));

        UUID farmerId = null;
        if (user.getRole() == UserRole.FARMER) {
            Optional<Farmer> farmerOpt = farmerRepository.findByUserId(user.getId());
            if (farmerOpt.isPresent()) {
                farmerId = farmerOpt.get().getId();
            }
        }

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .farmerId(farmerId)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }

        if (request.getRole() == UserRole.FARMER && request.getMobileNumber() != null) {
            if (farmerRepository.findByMobileNumber(request.getMobileNumber()).isPresent()) {
                throw new DuplicateResourceException("Mobile number already registered: " + request.getMobileNumber());
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .enabled(true)
                .build();

        user = userRepository.save(user);

        UUID farmerId = null;
        if (request.getRole() == UserRole.FARMER) {
            String mobile = (request.getMobileNumber() != null && !request.getMobileNumber().isBlank())
                    ? request.getMobileNumber() 
                    : (request.getUsername() != null && request.getUsername().matches("^\\d{9,12}$") ? request.getUsername() : "98270" + String.format("%05d", (int)(Math.random() * 100000)));
            String maskedAadhaar = null;
            if (request.getAadhaarNumber() != null && !request.getAadhaarNumber().isBlank()) {
                String digits = request.getAadhaarNumber().replaceAll("\\D", "");
                maskedAadhaar = digits.length() >= 4 ? "XXXX-XXXX-" + digits.substring(digits.length() - 4) : "XXXX-XXXX-1234";
            }

            Farmer farmer = Farmer.builder()
                    .user(user)
                    .farmerName(request.getFarmerName() != null ? request.getFarmerName() : request.getUsername())
                    .fatherSpouseName(request.getFatherSpouseName())
                    .dob(request.getDob())
                    .gender(request.getGender() != null ? request.getGender() : "Male")
                    .mobileNumber(mobile)
                    .alternateMobile(request.getAlternateMobile())
                    .aadhaarNumber(maskedAadhaar)
                    .category(request.getCategory() != null ? request.getCategory() : "General")
                    .address(request.getAddress())
                    .village(request.getVillage() != null ? request.getVillage() : "Default Village")
                    .tehsil(request.getTehsil() != null ? request.getTehsil() : "Default Tehsil")
                    .district(request.getDistrict() != null ? request.getDistrict() : "Raipur")
                    .state(request.getState() != null ? request.getState() : "Chhattisgarh")
                    .pinCode(request.getPinCode())
                    .farmerType(request.getFarmerType() != null ? request.getFarmerType() : "Individual")
                    .farmingType(request.getFarmingType() != null ? request.getFarmingType() : "Owner")
                    .primaryCrop(request.getPrimaryCrop() != null ? request.getPrimaryCrop() : "Paddy")
                    .secondaryCrops(request.getSecondaryCrops())
                    .totalLandArea(request.getTotalLandArea() != null ? request.getTotalLandArea() : java.math.BigDecimal.ZERO)
                    .irrigationAvailable(request.getIrrigationAvailable() != null ? request.getIrrigationAvailable() : false)
                    .irrigationType(request.getIrrigationType() != null ? request.getIrrigationType() : "Rainfed")
                    .soilType(request.getSoilType() != null ? request.getSoilType() : "Alluvial")
                    .documentsJson(request.getDocumentsJson())
                    .preferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "hi")
                    .build();

            farmer.setProfileCompletionPercentage(farmer.calculateCompletionPercentage());
            farmer = farmerRepository.save(farmer);
            farmerId = farmer.getId();
        }

        // Authenticate directly after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .farmerId(farmerId)
                .build();
    }
}
