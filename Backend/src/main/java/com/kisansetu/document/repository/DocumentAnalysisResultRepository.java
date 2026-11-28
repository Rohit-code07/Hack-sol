package com.kisansetu.document.repository;

import com.kisansetu.document.entity.DocumentAnalysisResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentAnalysisResultRepository extends JpaRepository<DocumentAnalysisResult, Long> {

    Optional<DocumentAnalysisResult> findByDocumentId(UUID documentId);
}
