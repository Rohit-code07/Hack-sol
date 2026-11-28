package com.kisansetu.document.repository;

import com.kisansetu.document.entity.DocumentExtractedField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentExtractedFieldRepository extends JpaRepository<DocumentExtractedField, Long> {

    List<DocumentExtractedField> findByDocumentIdOrderByIdAsc(UUID documentId);
}
