import uuid
import shutil
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from app.core.config import settings
from app.core.database import save_document
from app.models.schemas import UploadResponse
from app.services.pdf_parser import extract_text_from_pdf
from app.services.chunker import split_text_into_chunks
from app.services.embeddings import generate_embeddings
from app.services.vector_store import vector_store
from app.services.auth import get_optional_current_user

router = APIRouter(prefix="/api", tags=["Upload"])

@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)
):
    # 1. Validate file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF documents are supported."
        )

    # 2. Generate unique doc ID & path
    doc_id = str(uuid.uuid4())
    safe_filename = Path(file.filename).name
    saved_pdf_path = settings.UPLOADS_DIR / f"{doc_id}_{safe_filename}"

    # 3. Save file while checking size
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    file_size = 0

    try:
        with open(saved_pdf_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024): # 1MB chunks
                file_size += len(chunk)
                if file_size > max_bytes:
                    saved_pdf_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
                    )
                buffer.write(chunk)
    except HTTPException:
        raise
    except Exception as e:
        saved_pdf_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # 4. Extract text page by page
    try:
        pages = extract_text_from_pdf(saved_pdf_path)
    except Exception as e:
        saved_pdf_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to read PDF content: {str(e)}"
        )

    if not pages or all(len(p.text.strip()) == 0 for p in pages):
        saved_pdf_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF appears to be empty or contains only unscanned images."
        )

    # 5. Chunk text
    chunks = split_text_into_chunks(
        pages=pages,
        document_id=doc_id,
        document_name=safe_filename,
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP
    )

    if not chunks:
        saved_pdf_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract readable text chunks from the document."
        )

    # 6. Generate embeddings
    chunk_texts = [c.text for c in chunks]
    embeddings = await generate_embeddings(chunk_texts)

    # 7. Store in Vector Store
    chunk_dicts = [c.to_dict() for c in chunks]
    vector_store.save_index(doc_id, chunk_dicts, embeddings)

    # 8. Save metadata to DB (MongoDB or fallback)
    user_id = current_user["id"] if current_user else None
    save_document(
        doc_id=doc_id,
        user_id=user_id,
        filename=safe_filename,
        file_path=str(saved_pdf_path),
        file_size=file_size,
        page_count=len(pages),
        chunk_count=len(chunks)
    )

    return UploadResponse(
        id=doc_id,
        filename=safe_filename,
        page_count=len(pages),
        chunk_count=len(chunks),
        message="Document successfully processed and indexed!"
    )
