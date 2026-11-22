from pathlib import Path
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import (
    get_all_documents,
    get_document_by_id,
    delete_document,
    get_chat_history,
    clear_chat_history
)
from app.models.schemas import DocumentItem, ChatHistoryItem
from app.services.vector_store import vector_store
from app.services.auth import get_optional_current_user

router = APIRouter(prefix="/api", tags=["Documents"])

@router.get("/documents", response_model=List[DocumentItem])
async def list_documents(current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)):
    user_id = current_user["id"] if current_user else None
    docs = get_all_documents(user_id=user_id)
    return docs

@router.get("/documents/{doc_id}", response_model=DocumentItem)
async def get_document(doc_id: str, current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)):
    user_id = current_user["id"] if current_user else None
    doc = get_document_by_id(doc_id, user_id=user_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found."
        )
    return doc

@router.delete("/documents/{doc_id}", status_code=status.HTTP_200_OK)
async def remove_document(doc_id: str, current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)):
    user_id = current_user["id"] if current_user else None
    doc = get_document_by_id(doc_id, user_id=user_id)
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
    delete_document(doc_id, user_id=user_id)

    return {"success": True, "message": f"Document '{doc['filename']}' deleted successfully."}

@router.get("/chat/history", response_model=List[ChatHistoryItem])
async def fetch_chat_history(
    document_id: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)
):
    user_id = current_user["id"] if current_user else None
    return get_chat_history(user_id=user_id, document_id=document_id)

@router.delete("/chat/history")
async def clear_chat(
    document_id: Optional[str] = None,
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)
):
    user_id = current_user["id"] if current_user else None
    clear_chat_history(user_id=user_id, document_id=document_id)
    return {"success": True, "message": "Chat history cleared."}
