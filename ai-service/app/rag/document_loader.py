import os
import tempfile
import shutil
import uuid
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import UploadFile, HTTPException
from langchain_core.documents import Document
from app.rag.text_splitter import get_text_splitter
from app.core.config import settings

logger = logging.getLogger(__name__)


class PolicyDocumentLoader:
    """
    High-performance document loader for Government Policy PDFs.
    Uses PyMuPDF (fitz) with PyPDFLoader fallback.
    Guarantees 1-indexed human-readable page numbers normalized exactly once.
    """

    @staticmethod
    def load_pdf_pages(file_path: str, filename: str) -> List[Document]:
        """
        Extracts pages from PDF (using PyMuPDF or PyPDFLoader) or plain text files.
        Page numbers in returned Document.metadata['page'] are 1-indexed.
        """
        documents: List[Document] = []

        # Plain text handling
        if filename.lower().endswith(".txt"):
            try:
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    text = f.read().strip()
                if text:
                    return [
                        Document(
                            page_content=text,
                            metadata={
                                "source": filename,
                                "page": 1,
                                "total_pages": 1
                            }
                        )
                    ]
            except Exception as e:
                logger.error("Failed to read text file %s: %s", filename, e)
                raise HTTPException(
                    status_code=422,
                    detail=f"Unable to read file '{filename}': {str(e)}"
                )
        
        # Primary: PyMuPDF (fitz)
        try:
            import fitz
            doc = fitz.open(file_path)
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                text = page.get_text("text").strip()
                if text:
                    documents.append(
                        Document(
                            page_content=text,
                            metadata={
                                "source": filename,
                                "page": page_idx + 1,  # 1-indexed human-readable page
                                "total_pages": len(doc)
                            }
                        )
                    )
            doc.close()
            if documents:
                return documents
        except Exception as e:
            logger.warning("PyMuPDF extraction fallback triggered for %s: %s", filename, e)

        # Fallback: PyPDFLoader
        try:
            from langchain_community.document_loaders import PyPDFLoader
            loader = PyPDFLoader(file_path)
            raw_docs = loader.load()
            for doc in raw_docs:
                raw_page = doc.metadata.get("page", 0)
                # PyPDFLoader returns 0-indexed page in metadata['page']
                page_1_indexed = raw_page + 1 if isinstance(raw_page, int) else 1
                doc.metadata["page"] = page_1_indexed
                doc.metadata["source"] = filename
                if doc.page_content.strip():
                    documents.append(doc)
            return documents
        except Exception as e:
            logger.error("Failed to extract text from PDF %s: %s", filename, e)
            raise HTTPException(
                status_code=422,
                detail=f"Unable to extract text from PDF '{filename}': {str(e)}"
            )

    @classmethod
    def split_and_annotate(
        cls,
        file_path: str,
        filename: str,
        scheme: str,
        chunk_size: int = settings.DEFAULT_CHUNK_SIZE,
        chunk_overlap: int = settings.DEFAULT_CHUNK_OVERLAP,
        document_id: Optional[str] = None,
        authority: Optional[str] = None,
        url: Optional[str] = None,
        effective_date: Optional[str] = None
    ) -> List[Document]:
        """
        Extracts PDF pages and splits them into chunks with rich metadata.
        Page numbers remain strictly 1-indexed throughout.
        """
        doc_id = document_id or str(uuid.uuid4())
        page_docs = cls.load_pdf_pages(file_path, filename)
        
        if not page_docs:
            raise HTTPException(status_code=400, detail=f"No readable text found in PDF '{filename}'.")

        splitter = get_text_splitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        chunks = splitter.split_documents(page_docs)

        if not chunks:
            raise HTTPException(status_code=400, detail=f"Chunking resulted in zero content for '{filename}'.")

        now_str = datetime.utcnow().isoformat()

        for idx, chunk in enumerate(chunks):
            # Page number is already 1-indexed from load_pdf_pages - DO NOT INCREMENT AGAIN
            page_num = chunk.metadata.get("page", 1)
            chunk.metadata.update({
                "document_id": doc_id,
                "source": filename,
                "scheme": scheme.upper(),
                "page": int(page_num),
                "chunk_index": idx,
                "chunk_size": chunk_size,
                "chunk_overlap": chunk_overlap,
                "authority": authority or "Government of India",
                "url": url or "",
                "effective_date": effective_date or "",
                "ingested_at": now_str
            })

        return chunks

    @classmethod
    async def process_upload(
        cls,
        file: UploadFile,
        scheme: str,
        chunk_size: int = settings.DEFAULT_CHUNK_SIZE,
        chunk_overlap: int = settings.DEFAULT_CHUNK_OVERLAP,
        authority: Optional[str] = None,
        url: Optional[str] = None,
        effective_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processes an uploaded PDF, safely handles temp file lifecycle,
        and returns annotated chunks ready for ChromaDB.
        """
        filename = file.filename or "policy_document.pdf"
        suffix = Path(filename).suffix.lower()
        if suffix not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type '{suffix}'. Permitted formats: {settings.ALLOWED_EXTENSIONS}"
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            doc_id = str(uuid.uuid4())
            chunks = cls.split_and_annotate(
                file_path=tmp_path,
                filename=filename,
                scheme=scheme,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                document_id=doc_id,
                authority=authority,
                url=url,
                effective_date=effective_date
            )
            return {
                "document_id": doc_id,
                "filename": filename,
                "scheme": scheme.upper(),
                "chunks": chunks,
                "total_chunks": len(chunks),
                "chunk_size": chunk_size,
                "chunk_overlap": chunk_overlap
            }
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
