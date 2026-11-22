import logging
import numpy as np
import httpx
from typing import List
from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback lightweight TF-IDF / character-ngram semantic hashing embedder when offline
class FallbackLocalEmbedder:
    def __init__(self, dim: int = 384):
        self.dim = dim

    def embed_text(self, text: str) -> List[float]:
        tokens = text.lower().split()
        if not tokens:
            return [0.0] * self.dim
        
        vec = np.zeros(self.dim, dtype=np.float32)
        for i, token in enumerate(tokens):
            # Deterministic hash projecting token onto dimension
            h = hash(token)
            idx = abs(h) % self.dim
            sign = 1.0 if (h // self.dim) % 2 == 0 else -1.0
            vec[idx] += sign * (1.0 / (1.0 + np.log1p(i)))
            
            # Character bigrams
            for j in range(len(token) - 1):
                bi_h = hash(token[j:j+2])
                bi_idx = abs(bi_h) % self.dim
                vec[bi_idx] += 0.5 * (1.0 if bi_h % 2 == 0 else -1.0)
                
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

fallback_embedder = FallbackLocalEmbedder()

async def get_gemini_embeddings(texts: List[str], api_key: str) -> List[List[float]]:
    """
    Fetches embeddings from Google Gemini API (gemini-embedding-001).
    """
    if not api_key:
        raise ValueError("No Gemini API key provided")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key={api_key}"
    
    requests = [{"model": "models/gemini-embedding-001", "content": {"parts": [{"text": t[:2048]}]}} for t in texts]
    payload = {"requests": requests}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code != 200:
            logger.warning(f"Gemini embedding API returned status {res.status_code}: {res.text}")
            raise RuntimeError(f"Gemini embedding error: {res.text}")
        
        data = res.json()
        embeddings = []
        for item in data.get("embeddings", []):
            embeddings.append(item.get("values", []))
        return embeddings

async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Main embedding dispatcher. Attempts Gemini embeddings if a valid Google AI Studio API key
    is configured; otherwise uses deterministic local embedding with instant response.
    """
    if not texts:
        return []
    
    api_key = settings.GEMINI_API_KEY
    if api_key and api_key.startswith("AIza"):
        try:
            batch_size = 50
            results = []
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]
                batch_embeddings = await get_gemini_embeddings(batch, api_key)
                results.extend(batch_embeddings)
            return results
        except Exception as e:
            logger.warning(f"Could not fetch Gemini embeddings ({e}), switching to local embedder")
    
    # Fallback to local high-performance embedder
    return fallback_embedder.embed_batch(texts)
