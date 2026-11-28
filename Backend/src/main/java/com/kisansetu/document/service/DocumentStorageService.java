package com.kisansetu.document.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private static final Logger log = LoggerFactory.getLogger(DocumentStorageService.class);

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp", "pdf");
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"
    );

    private final Path rootStorageLocation;

    public DocumentStorageService(
            @Value("${kisansetu.document.upload-dir:uploads/documents}") String uploadDir
    ) {
        this.rootStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootStorageLocation);
        } catch (Exception ex) {
            log.error("Could not initialize document upload root directory: {}", ex.getMessage());
        }
    }

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum permissible limit of 10 MB.");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "document"
        );

        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Invalid file path containing relative directory sequence: " + originalFilename);
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported file format: ." + extension + ". Allowed formats: JPG, JPEG, PNG, WEBP, PDF.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            log.warn("MIME type {} not in strictly allowed list, but extension .{} is accepted.", contentType, extension);
        }
    }

    public String storeFile(MultipartFile file, UUID farmerId, UUID documentId) {
        validateFile(file);

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "doc"
        );
        String extension = getFileExtension(originalFilename);
        String sanitizedFilename = documentId.toString() + "." + extension;

        Path farmerDir = this.rootStorageLocation.resolve(farmerId.toString()).normalize();

        try {
            Files.createDirectories(farmerDir);
            Path targetLocation = farmerDir.resolve(sanitizedFilename).normalize();

            // Security check against directory traversal
            if (!targetLocation.startsWith(this.rootStorageLocation)) {
                throw new SecurityException("Cannot store file outside of current storage directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            return targetLocation.toString();
        } catch (IOException ex) {
            log.error("Failed to store file {}: {}", originalFilename, ex.getMessage());
            throw new RuntimeException("Failed to store file on disk: " + ex.getMessage(), ex);
        }
    }

    public Resource loadFileAsResource(String filePath) {
        try {
            Path path = Paths.get(filePath).normalize();
            if (!path.startsWith(this.rootStorageLocation)) {
                throw new SecurityException("Access denied: File outside storage directory.");
            }

            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Document file not found or not readable: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Malformed file path URL: " + filePath, ex);
        }
    }

    public void deleteFile(String filePath) {
        if (filePath == null) return;
        try {
            Path path = Paths.get(filePath).normalize();
            if (path.startsWith(this.rootStorageLocation)) {
                Files.deleteIfExists(path);
            }
        } catch (IOException ex) {
            log.warn("Failed to delete document file {}: {}", filePath, ex.getMessage());
        }
    }

    public static String getFileExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex >= 0 && dotIndex < filename.length() - 1) ? filename.substring(dotIndex + 1) : "";
    }
}
