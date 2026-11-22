import logging
import httpx
from typing import List, Dict, Any, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are NoteWise AI, an intelligent academic document-based question answering assistant.
Your job is to help students study from their lecture notes, textbooks, and PDF materials.

Follow these strict rules:
1. Ground your answer strictly and exclusively in the provided context passages below.
2. If the context does not contain the answer, respond with:
   "I couldn't find this information in your document."
3. Do not make up facts, hallucinate, or extrapolate beyond the provided text.
4. For every key point or claim in your answer, explicitly cite the source page (e.g., [Page X] or [Document Name, Page X]).
5. Present the answer clearly with concise explanations, bullet points, or step-by-step formatting when appropriate.
"""

def format_context_prompt(question: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
    context_blocks = []
    for i, chunk in enumerate(retrieved_chunks, 1):
        doc_name = chunk.get("document_name", "Document")
        page = chunk.get("page", 1)
        snippet = chunk.get("snippet", "").strip()
        context_blocks.append(f"--- [Source {i}: {doc_name} | Page {page}] ---\n{snippet}")
    
    full_context = "\n\n".join(context_blocks)
    
    prompt = f"""Context from uploaded documents:
{full_context}

Question: {question}

Please provide an accurate, grounded answer with page citations based strictly on the context above:"""
    return prompt

async def generate_gemini_response(prompt: str, api_key: str, model: str = settings.GEMINI_MODEL) -> str:
    """
    Calls Google Gemini REST API.
    """
    # Clean model name if user specified full path or short name
    clean_model = model.replace("models/", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_PROMPT + "\n\n" + prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1024,
            "topP": 0.8
        }
    }
    
    async with httpx.AsyncClient(timeout=45.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code != 200:
            error_details = res.text
            logger.error(f"Gemini API returned status {res.status_code}: {error_details}")
            # If 404 on model, try fallback to gemini-1.5-flash
            if res.status_code == 404 and clean_model != "gemini-1.5-flash":
                logger.info("Retrying with gemini-1.5-flash...")
                fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                fallback_res = await client.post(fallback_url, json=payload)
                if fallback_res.status_code == 200:
                    data = fallback_res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        return candidates[0]["content"]["parts"][0]["text"].strip()
            raise RuntimeError(f"Gemini API Error ({res.status_code}): {error_details}")
        
        data = res.json()
        candidates = data.get("candidates", [])
        if not candidates or "content" not in candidates[0]:
            return "I couldn't generate an answer from the provided document context."
        
        return candidates[0]["content"]["parts"][0]["text"].strip()

def offline_fallback_answer(question: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
    """
    Generates a structured citation synthesis if Gemini API Key is not set or network is unreachable.
    """
    if not retrieved_chunks:
        return "I couldn't find this information in your document."
    
    best_chunk = retrieved_chunks[0]
    pages = sorted(list(set(c["page"] for c in retrieved_chunks)))
    page_str = ", ".join(f"Page {p}" for p in pages)
    
    return (
        f"**Relevant passages found on {page_str}:**\n\n"
        f"> \"{best_chunk['snippet'][:350]}...\" ([{best_chunk.get('document_name', 'Doc')}, Page {best_chunk['page']}])\n\n"
        f"*Note: To generate full conversational natural-language answers, please add your Google Gemini API key in `backend/.env` or via the Settings button in the header.*"
    )

async def answer_question_with_rag(question: str, retrieved_chunks: List[Dict[str, Any]]) -> Tuple[str, bool]:
    """
    Dispatches prompt to Gemini or graceful fallback.
    Returns (answer_text, has_context).
    """
    if not retrieved_chunks:
        return "I couldn't find this information in your document.", False

    # Check top similarity score
    top_score = retrieved_chunks[0].get("score", 0.0)
    # If the score is extremely low, context is irrelevant
    if top_score < 0.05:
        return "I couldn't find this in your document.", False

    api_key = settings.GEMINI_API_KEY
    if api_key and api_key != "your_gemini_api_key_here":
        try:
            prompt = format_context_prompt(question, retrieved_chunks)
            answer = await generate_gemini_response(prompt, api_key)
            return answer, True
        except Exception as e:
            logger.error(f"Error calling Gemini: {e}")
            fallback = offline_fallback_answer(question, retrieved_chunks)
            return f"*(Gemini API connection error: {str(e)[:100]}; showing retrieved excerpts)*\n\n{fallback}", True
    
    # Offline fallback
    return offline_fallback_answer(question, retrieved_chunks), True
