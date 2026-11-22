from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.core.database import get_all_documents, get_document_by_id, delete_document, get_chat_history, get_connection
from app.models.schemas import DocumentItem, ChatHistoryItem
from app.services.vector_store import vector_store

router = APIRouter(prefix="/api", tags=["Documents"])

@router.get("/documents", response_model=List[DocumentItem])
async def list_documents():
    docs = get_all_documents()
    return docs

@router.get("/documents/{doc_id}", response_model=DocumentItem)
async def get_document(doc_id: str):
    doc = get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )
    return doc

@router.delete("/documents/{doc_id}", status_code=status.HTTP_200_OK)
async def remove_document(doc_id: str):
    doc = get_document_by_id(doc_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )

    # Remove physical PDF file
    file_path = Path(doc["file_path"])
    file_path.unlink(missing_ok=True)

    # Remove vector index
    vector_store.delete_index(doc_id)

    # Delete from DB
    delete_document(doc_id)

    return {"success": True, "message": f"Document '{doc['filename']}' deleted successfully."}

@router.get("/chat/history", response_model=List[ChatHistoryItem])
async def fetch_chat_history(document_id: Optional[str] = None):
    return get_chat_history(document_id)

@router.delete("/chat/history")
async def clear_chat_history(document_id: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    if document_id:
        cursor.execute("DELETE FROM chat_history WHERE document_id = ?", (document_id,))
    else:
        cursor.execute("DELETE FROM chat_history")
    conn.commit()
    conn.close()
    return {"success": True, "message": "Chat history cleared."}
