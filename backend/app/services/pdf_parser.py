from pathlib import Path
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class PageText:
    def __init__(self, page_num: int, text: str):
        self.page_num = page_num
        self.text = text

def extract_text_from_pdf(pdf_path: Path) -> List[PageText]:
    """
    Extracts text page by page from a PDF file.
    Uses PyMuPDF (fitz) if available, with pypdf as fallback.
    Returns a list of PageText objects (1-indexed page numbers).
    """
    pages: List[PageText] = []
    
    # Try PyMuPDF first
    try:
        import pymupdf as fitz
        doc = fitz.open(str(pdf_path))
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            text = page.get_text("text")
            # Normalize whitespace
            cleaned_text = " ".join(text.split())
            pages.append(PageText(page_num=page_idx + 1, text=cleaned_text))
        doc.close()
        logger.info(f"Extracted {len(pages)} pages using PyMuPDF from {pdf_path.name}")
        return pages
    except Exception as e:
        logger.warning(f"PyMuPDF failed or unavailable ({e}), trying pypdf...")

    # Fallback to pypdf
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(pdf_path))
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            cleaned_text = " ".join(text.split())
            pages.append(PageText(page_num=page_idx + 1, text=cleaned_text))
        logger.info(f"Extracted {len(pages)} pages using pypdf from {pdf_path.name}")
        return pages
    except Exception as e:
        logger.error(f"Failed to extract PDF text with pypdf: {e}")
        raise ValueError(f"Could not read PDF file: {e}")
