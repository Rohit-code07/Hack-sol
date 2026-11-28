package com.kisansetu.document.repository;

import com.kisansetu.document.entity.UploadedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UploadedDocumentRepository extends JpaRepository<UploadedDocument, UUID> {

    List<UploadedDocument> findByFarmerIdOrderByCreatedAtDesc(UUID farmerId);

    Optional<UploadedDocument> findByIdAndFarmerId(UUID id, UUID farmerId);

    long countByFarmerId(UUID farmerId);
}
