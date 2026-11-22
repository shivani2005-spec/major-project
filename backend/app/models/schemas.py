from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DocumentItem(BaseModel):
    id: str
    filename: str
    file_size: int
    page_count: int
    chunk_count: int
    created_at: str

class UploadResponse(BaseModel):
    id: str
    filename: str
    page_count: int
    chunk_count: int
    message: str

class SourceCitation(BaseModel):
    page: int
    snippet: str
    score: float
    document_name: Optional[str] = None
    document_id: Optional[str] = None

class AskRequest(BaseModel):
    question: str = Field(..., min_length=2, description="Student's question")
    document_id: Optional[str] = Field(None, description="Document ID to query against, or None for all documents")
    top_k: Optional[int] = Field(4, ge=1, le=10, description="Number of relevant chunks to retrieve")

class AskResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    document_id: Optional[str] = None
    has_context: bool = True

class ChatHistoryItem(BaseModel):
    id: int
    document_id: Optional[str]
    sender: str
    message: str
    sources: Optional[List[SourceCitation]] = []
    created_at: str

class ApiKeyRequest(BaseModel):
    api_key: str

class HealthStatus(BaseModel):
    status: str
    project: str
    version: str
    llm_configured: bool
    document_count: int
