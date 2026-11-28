-- KisanSetu Database Schema Migration V4
-- Purpose: AI-Powered Document Image Upload, Intelligence, Structured Fields & Issue Audit

CREATE TABLE IF NOT EXISTS uploaded_documents (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    farmer_id VARCHAR(36) NOT NULL,
    uploaded_by_user_id BIGINT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    document_category VARCHAR(100) NULL,
    category_label VARCHAR(150) NULL,
    document_purpose VARCHAR(255) NULL,
    quality_readability VARCHAR(50) DEFAULT 'GOOD',
    quality_score INT DEFAULT 85,
    quality_notes VARCHAR(255) NULL,
    overall_verdict VARCHAR(100) DEFAULT 'REQUIRES_REVIEW',
    processing_status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED',
    failure_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_uploaded_docs_farmer FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
    CONSTRAINT fk_uploaded_docs_user FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_uploaded_docs_farmer (farmer_id),
    INDEX idx_uploaded_docs_status (processing_status)
);

CREATE TABLE IF NOT EXISTS document_analysis_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL UNIQUE,
    raw_ocr_text LONGTEXT NULL,
    analysis_summary TEXT NULL,
    recommended_next_steps JSON NULL,
    confidence_score DECIMAL(5, 2) DEFAULT 0.90,
    discrepancy_count INT DEFAULT 0,
    ai_model VARCHAR(100) DEFAULT 'GEMINI',
    language VARCHAR(20) DEFAULT 'hi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_analysis_doc FOREIGN KEY (document_id) REFERENCES uploaded_documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_extracted_fields (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_label VARCHAR(150) NOT NULL,
    extracted_value TEXT NULL,
    confidence VARCHAR(50) DEFAULT 'HIGH',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_fields_doc FOREIGN KEY (document_id) REFERENCES uploaded_documents(id) ON DELETE CASCADE,
    INDEX idx_doc_fields_doc (document_id)
);

CREATE TABLE IF NOT EXISTS document_issues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    issue_title VARCHAR(255) NOT NULL,
    issue_description TEXT NOT NULL,
    supporting_evidence TEXT NULL,
    recommended_action TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_issues_doc FOREIGN KEY (document_id) REFERENCES uploaded_documents(id) ON DELETE CASCADE,
    INDEX idx_doc_issues_doc (document_id)
);
