from fastapi import APIRouter, HTTPException, status
from app.models.schemas import AskRequest, AskResponse, SourceCitation
from app.services.embeddings import generate_embeddings
from app.services.vector_store import vector_store
from app.services.llm import answer_question_with_rag
from app.core.database import save_chat_message, get_document_by_id

router = APIRouter(prefix="/api", tags=["Ask"])

@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    # If document_id is provided, verify it exists
    if request.document_id:
        doc = get_document_by_id(request.document_id)
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document with ID {request.document_id} not found."
            )

    # 1. Generate query embedding
    query_embeddings = await generate_embeddings([question])
    if not query_embeddings:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate embedding for the question."
        )
    query_vector = query_embeddings[0]

    # 2. Retrieve top-k chunks from vector store
    retrieved_chunks = vector_store.search_similarity(
        query_embedding=query_vector,
        document_id=request.document_id,
        top_k=request.top_k or 4
    )

    # 3. Generate grounded answer
    answer, has_context = await answer_question_with_rag(question, retrieved_chunks)

    # 4. Format source citations
    citations = [
        SourceCitation(
            page=c["page"],
            snippet=c["snippet"],
            score=c["score"],
            document_name=c.get("document_name"),
            document_id=c.get("document_id")
        )
        for c in retrieved_chunks
    ]

    # 5. Persist to chat history
    save_chat_message(
        document_id=request.document_id,
        sender="user",
        message=question,
        sources=None
    )
    save_chat_message(
        document_id=request.document_id,
        sender="assistant",
        message=answer,
        sources=[c.model_dump() for c in citations] if has_context else []
    )

    return AskResponse(
        answer=answer,
        sources=citations if has_context else [],
        document_id=request.document_id,
        has_context=has_context
    )
