package com.kisansetu.document.repository;

import com.kisansetu.document.entity.DocumentIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentIssueRepository extends JpaRepository<DocumentIssue, Long> {

    List<DocumentIssue> findByDocumentIdOrderByIdAsc(UUID documentId);
}
