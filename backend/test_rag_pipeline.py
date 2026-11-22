import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.services.pdf_parser import extract_text_from_pdf
from app.services.chunker import split_text_into_chunks
from app.services.embeddings import generate_embeddings
from app.services.vector_store import vector_store
from app.services.llm import answer_question_with_rag

async def run_test():
    print("=" * 60)
    print("Starting NoteWise AI RAG Pipeline End-to-End Test")
    print("=" * 60)
    
    pdf_path = backend_dir / "test_data" / "rag_lecture_notes.pdf"
    if not pdf_path.exists():
        print(f"Test PDF not found at: {pdf_path}")
        return

    # 1. Text Extraction
    print("\n[Step 1] Extracting text page-by-page...")
    pages = extract_text_from_pdf(pdf_path)
    print(f"-> Extracted {len(pages)} pages.")
    for p in pages:
        print(f"   * Page {p.page_num}: {len(p.text)} chars -> '{p.text[:60]}...'")

    # 2. Text Chunking
    print("\n[Step 2] Splitting text into overlapping chunks...")
    chunks = split_text_into_chunks(pages, "test_doc_001", "rag_lecture_notes.pdf", chunk_size=400, chunk_overlap=80)
    print(f"-> Created {len(chunks)} chunks.")
    for c in chunks[:3]:
        print(f"   * Chunk {c.chunk_id} (Page {c.page_number}): '{c.text[:70]}...'")

    # 3. Vector Embeddings
    print("\n[Step 3] Generating vector embeddings...")
    texts = [c.text for c in chunks]
    embeddings = await generate_embeddings(texts)
    print(f"-> Generated {len(embeddings)} vectors of dimension {len(embeddings[0])}.")

    # 4. Vector Store Indexing
    print("\n[Step 4] Storing in Vector Store...")
    chunk_dicts = [c.to_dict() for c in chunks]
    vector_store.save_index("test_doc_001", chunk_dicts, embeddings)
    print("-> Successfully indexed chunks to disk.")

    # 5. Test Queries
    queries = [
        "What is the formula for cosine similarity?",
        "What are the two main challenges of traditional LLMs?",
        "What is the capital of Mars?"  # Irrelevant query test
    ]

    for q in queries:
        print(f"\n" + "-" * 50)
        print(f"Question: \"{q}\"")
        q_emb = await generate_embeddings([q])
        results = vector_store.search_similarity(q_emb[0], document_id="test_doc_001", top_k=2)
        
        answer, has_context = await answer_question_with_rag(q, results)
        print(f"Has Context: {has_context}")
        print(f"Top Match Score: {results[0]['score'] if results else 0.0}")
        if results:
            print(f"Best Citation: Page {results[0]['page']} (Doc: {results[0]['document_name']})")
        print(f"Answer Output:\n{answer}")

    print("\n" + "=" * 60)
    print("RAG Pipeline Test Completed Successfully!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_test())
