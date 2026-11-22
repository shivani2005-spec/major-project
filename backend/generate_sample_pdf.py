import pymupdf as fitz
from pathlib import Path

def create_sample_pdf():
    doc = fitz.open()
    
    # Page 1: Introduction to Retrieval-Augmented Generation (RAG)
    page1 = doc.new_page()
    p1_text = """NoteWise AI Lecture Notes: Machine Learning & RAG Systems
Page 1: Introduction to Retrieval-Augmented Generation

Retrieval-Augmented Generation (RAG) is an artificial intelligence framework that enhances large language model (LLM) outputs by referencing an authoritative external knowledge base before generating a response. 

Traditional LLMs suffer from two main challenges:
1. Knowledge cutoff dates: The model cannot know facts beyond its training corpus.
2. Hallucinations: When uncertain, models may fabricate convincing but incorrect statements.

RAG addresses these limitations by dynamically fetching relevant document chunks from a vector database using semantic similarity search. The retrieved context is then provided to the LLM alongside the user prompt, ensuring that the final answer is strictly grounded in verifiable source facts.
"""
    page1.insert_text((50, 72), p1_text, fontsize=11, fontname="helv")

    # Page 2: Vector Embeddings and Similarity Search
    page2 = doc.new_page()
    p2_text = """NoteWise AI Lecture Notes: Machine Learning & RAG Systems
Page 2: Vector Embeddings and Semantic Search

Vector embeddings are numerical representations of text in a high-dimensional vector space. Dense embedding models like all-MiniLM-L6-v2 or text-embedding-004 map semantically similar sentences close to one another in this space.

Cosine similarity is the primary metric used to determine relevance between query vectors and document vectors. The formula for cosine similarity between vector A and vector B is:
Similarity(A, B) = (A . B) / (||A|| * ||B||)

When a student asks a question, the query string is converted into a 384-dimensional or 768-dimensional vector. The system calculates the dot product against pre-computed document chunk vectors and selects the top-k highest scoring chunks.
"""
    page2.insert_text((50, 72), p2_text, fontsize=11, fontname="helv")

    # Page 3: Chunking Strategies and Citation Grounding
    page3 = doc.new_page()
    p3_text = """NoteWise AI Lecture Notes: Machine Learning & RAG Systems
Page 3: Chunking Strategies and Citation Grounding

Text chunking is the process of breaking long documents into manageable segments. Effective chunking balances two conflicting needs:
- Specificity: Smaller chunks (300-500 tokens) ensure precise retrieval without noisy padding.
- Context: Larger chunks (700-1000 tokens) preserve cohesive ideas and complete explanations.

Chunk overlap (typically 10-20% or 100-150 characters) ensures that sentences straddling boundary splits are not severed. 

Crucially, every chunk must retain page metadata (page number, document title, and chunk index). This allows the generation stage to produce verifiable citations, giving students confidence and an audit trail to trace every claim back to the original textbook.
"""
    page3.insert_text((50, 72), p3_text, fontsize=11, fontname="helv")

    output_dir = Path(__file__).parent / "test_data"
    output_dir.mkdir(exist_ok=True)
    pdf_path = output_dir / "rag_lecture_notes.pdf"
    doc.save(str(pdf_path))
    doc.close()
    print(f"Sample PDF created at: {pdf_path}")

if __name__ == "__main__":
    create_sample_pdf()
