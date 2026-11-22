from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.core.config import settings


def get_text_splitter(
    chunk_size: int = settings.DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = settings.DEFAULT_CHUNK_OVERLAP
) -> RecursiveCharacterTextSplitter:
    """
    Returns a tuned RecursiveCharacterTextSplitter for policy documents.
    Hierarchy prioritizes paragraphs, double newlines, sentence terminations, and clauses.
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", "। ", "।\n", ". ", " ", ""],
        keep_separator=True
    )


def split_policy_documents(
    documents: List[Document],
    chunk_size: int = settings.DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = settings.DEFAULT_CHUNK_OVERLAP
) -> List[Document]:
    """
    Splits documents into bounded chunks while preserving source metadata.
    """
    splitter = get_text_splitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return splitter.split_documents(documents)
