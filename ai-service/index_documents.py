"""
Index policy documents into ChromaDB for KisanSetu RAG.
Loads:
- PMFBY Revised Operational Guidelines (PDF)
- KCC Operational Guidelines (TXT)
- MSP Procurement Policy (TXT)
"""

import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.core.config import settings
from app.rag.document_loader import PolicyDocumentLoader
from app.rag.vector_store import vector_store_service
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("index_documents")


def run_indexing():
    docs_dir = Path(settings.DOCUMENTS_DIRECTORY)
    logger.info("Scanning documents directory: %s", docs_dir)

    indexed_count = 0
    total_chunks = 0

    files_to_index = [
        {
            "path": docs_dir / "pmfby" / "PMFBY_Revised_Operational_Guidelines.pdf",
            "scheme": "PMFBY",
            "authority": "Ministry of Agriculture & Farmers Welfare",
            "url": "https://pmfby.gov.in"
        },
        {
            "path": docs_dir / "kcc" / "KCC_Operational_Guidelines.txt",
            "scheme": "KCC",
            "authority": "Reserve Bank of India & NABARD",
            "url": "https://rbi.org.in"
        },
        {
            "path": docs_dir / "msp" / "MSP_Procurement_Policy.txt",
            "scheme": "MSP",
            "authority": "Ministry of Consumer Affairs, Food & Public Distribution (CACP)",
            "url": "https://cacp.dacnet.nic.in"
        }
    ]

    for item in files_to_index:
        fpath = item["path"]
        if not fpath.exists():
            logger.warning("File not found: %s", fpath)
            continue

        filename = fpath.name
        scheme = item["scheme"]
        logger.info("Processing %s (%s)...", filename, scheme)

        try:
            chunks = PolicyDocumentLoader.split_and_annotate(
                file_path=str(fpath),
                filename=filename,
                scheme=scheme,
                chunk_size=settings.DEFAULT_CHUNK_SIZE,
                chunk_overlap=settings.DEFAULT_CHUNK_OVERLAP,
                authority=item["authority"],
                url=item["url"]
            )

            added = vector_store_service.add_documents(chunks)
            logger.info("Added %d chunks for %s", added, filename)
            indexed_count += 1
            total_chunks += added
        except Exception as e:
            logger.exception("Failed to index %s: %s", filename, e)

    stats = vector_store_service.get_stats()
    logger.info("Indexing complete! Successfully indexed %d files (%d chunks total in DB). Stats: %s",
                indexed_count, total_chunks, stats)


if __name__ == "__main__":
    run_indexing()
