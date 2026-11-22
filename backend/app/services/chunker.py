import re
from typing import List, Dict, Any
from app.services.pdf_parser import PageText

class DocumentChunk:
    def __init__(self, chunk_id: str, document_id: str, document_name: str, page_number: int, text: str, index: int):
        self.chunk_id = chunk_id
        self.document_id = document_id
        self.document_name = document_name
        self.page_number = page_number
        self.text = text
        self.index = index

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "document_name": self.document_name,
            "page_number": self.page_number,
            "text": self.text,
            "index": self.index
        }

def split_text_into_chunks(
    pages: List[PageText],
    document_id: str,
    document_name: str,
    chunk_size: int = 700,
    chunk_overlap: int = 120
) -> List[DocumentChunk]:
    """
    Splits page text into overlapping chunks, strictly keeping track of page numbers.
    """
    all_chunks: List[DocumentChunk] = []
    chunk_counter = 0

    for page in pages:
        text = page.text.strip()
        if not text:
            continue
        
        # Split text into sentences / segments first
        # Regex looks for punctuation followed by space
        sentences = re.split(r'(?<=[.!?]) +', text)
        
        current_chunk_words: List[str] = []
        current_length = 0
        
        for sentence in sentences:
            sentence_words = sentence.split()
            sentence_len = sum(len(w) + 1 for w in sentence_words)
            
            if current_length + sentence_len > chunk_size and current_chunk_words:
                chunk_str = " ".join(current_chunk_words)
                all_chunks.append(DocumentChunk(
                    chunk_id=f"{document_id}_c{chunk_counter}",
                    document_id=document_id,
                    document_name=document_name,
                    page_number=page.page_num,
                    text=chunk_str,
                    index=chunk_counter
                ))
                chunk_counter += 1
                
                # Keep overlap words
                overlap_words = []
                overlap_len = 0
                for w in reversed(current_chunk_words):
                    overlap_words.insert(0, w)
                    overlap_len += len(w) + 1
                    if overlap_len >= chunk_overlap:
                        break
                
                current_chunk_words = overlap_words
                current_length = sum(len(w) + 1 for w in current_chunk_words)
            
            current_chunk_words.extend(sentence_words)
            current_length += sentence_len
            
        # Add remaining text on this page
        if current_chunk_words:
            chunk_str = " ".join(current_chunk_words)
            all_chunks.append(DocumentChunk(
                chunk_id=f"{document_id}_c{chunk_counter}",
                document_id=document_id,
                document_name=document_name,
                page_number=page.page_num,
                text=chunk_str,
                index=chunk_counter
            ))
            chunk_counter += 1

    return all_chunks
