package com.kisansetu.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "kisansetu.jwt")
@Getter
@Setter
public class JwtConfig {
    private String secret;
    private long expirationMs = 86400000; // 24 hours
}
