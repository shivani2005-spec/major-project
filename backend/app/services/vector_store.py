import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.core.config import settings

class VectorStore:
    def __init__(self, storage_dir: Path = settings.VECTOR_DIR):
        self.storage_dir = storage_dir
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _get_doc_index_path(self, document_id: str) -> Path:
        return self.storage_dir / f"{document_id}.json"

    def save_index(self, document_id: str, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        """
        Persists chunks along with their embeddings to disk.
        """
        file_path = self._get_doc_index_path(document_id)
        records = []
        for chunk, emb in zip(chunks, embeddings):
            records.append({
                "chunk": chunk,
                "embedding": emb
            })
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(records, f)

    def load_index(self, document_id: str) -> List[Dict[str, Any]]:
        file_path = self._get_doc_index_path(document_id)
        if not file_path.exists():
            return []
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def delete_index(self, document_id: str) -> bool:
        file_path = self._get_doc_index_path(document_id)
        if file_path.exists():
            file_path.unlink()
            return True
        return False

    def search_similarity(
        self,
        query_embedding: List[float],
        document_id: Optional[str] = None,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Calculates cosine similarity between query embedding and stored chunk embeddings.
        Returns top_k most similar chunks with metadata and score.
        """
        all_records = []
        
        if document_id:
            all_records = self.load_index(document_id)
        else:
            # Multi-document search: load all indices
            for index_file in self.storage_dir.glob("*.json"):
                try:
                    with open(index_file, "r", encoding="utf-8") as f:
                        all_records.extend(json.load(f))
                except Exception:
                    continue

        if not all_records:
            return []

        q_vec = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            return []

        doc_embeddings = np.array([r["embedding"] for r in all_records], dtype=np.float32)
        
        # Normalize doc embeddings
        doc_norms = np.linalg.norm(doc_embeddings, axis=1, keepdims=True)
        # Avoid division by zero
        doc_norms[doc_norms == 0] = 1.0
        normalized_docs = doc_embeddings / doc_norms

        # Cosine similarity: dot product of normalized vectors
        scores = np.dot(normalized_docs, q_vec / q_norm)
        
        # Get top-k indices
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(scores[idx])
            chunk_data = all_records[idx]["chunk"]
            results.append({
                "page": chunk_data.get("page_number", 1),
                "snippet": chunk_data.get("text", ""),
                "score": round(score, 4),
                "document_name": chunk_data.get("document_name", "Unknown"),
                "document_id": chunk_data.get("document_id", "")
            })

        return results

vector_store = VectorStore()
