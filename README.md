# NoteWise AI 📚
### An Intelligent Document-Based Question Answering System Using Retrieval-Augmented Generation (RAG)

NoteWise AI is a full-stack academic assistant application designed for students and researchers. It allows users to upload course materials, lecture notes, and textbooks (PDFs) and ask natural-language questions about them. 

The system retrieves the most relevant passages using semantic vector search and generates accurate, grounded answers, complete with **exact source page citations** (`[Page X]`) and relevance scores, eliminating LLM hallucinations.

---

## 🚀 Key Features

- **Document Library**: Upload, manage, inspect, and delete multiple PDF documents with size and type validation.
- **Precision RAG Ingestion Pipeline**: Page-by-page text extraction with PyMuPDF/pypdf, recursive chunking with boundary & overlap management, and dense vector embeddings.
- **Top-k Semantic Retrieval**: Cosine similarity search across document chunks with page-level metadata.
- **Strict Grounding & Hallucination Elimination**: Prompts instruct the LLM to rely strictly on retrieved document passages; answers default to *"I couldn't find this information in your document"* when context is insufficient.
- **Verifiable Citations**: Every answer provides interactive citation cards showing the source document, page number badge, relevance score, and the exact supporting excerpt.
- **Interactive Chat Interface**: Built with React, Vite, Tailwind CSS, and Lucide Icons with conversation history and suggested study prompts.
- **Modular LLM Support**: Designed for Google Gemini API (`gemini-2.5-flash`), with offline/fallback citation synthesis mode out of the box.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, Lucide React |
| **Backend** | Python 3.13, FastAPI, Uvicorn, SQLite |
| **Document Parsing** | PyMuPDF (fitz), pypdf |
| **Vector Search** | Scikit-learn, NumPy vector index, Cosine similarity |
| **LLM & Embeddings** | Google Gemini API (`gemini-2.5-flash`, `text-embedding-004`) |

---

## 📁 Project Structure

```
major-project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & CORS configuration
│   │   ├── core/
│   │   │   ├── config.py        # Settings & directory initialization
│   │   │   └── database.py      # SQLite document & chat persistence
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic schemas (Ask, Upload, Citations)
│   │   ├── routes/
│   │   │   ├── upload.py        # PDF upload & ingestion endpoint
│   │   │   ├── documents.py     # Document library & delete endpoints
│   │   │   └── ask.py           # Question answering & citations endpoint
│   │   └── services/
│   │       ├── pdf_parser.py    # PyMuPDF/pypdf page extractor
│   │       ├── chunker.py       # Recursive text chunker with overlap
│   │       ├── embeddings.py    # Gemini & local embedding service
│   │       ├── vector_store.py  # Local vector search & disk persistence
│   │       └── llm.py           # Gemini API client & grounded prompts
│   ├── test_data/               # Sample lecture notes PDF
│   ├── uploads/                 # Storage for uploaded PDF files
│   ├── vector_indices/          # Persisted vector embeddings
│   ├── generate_sample_pdf.py   # Script to generate test PDFs
│   ├── test_rag_pipeline.py     # Standalone RAG evaluation script
│   ├── .env.example             # Environment configuration template
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Axios API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Header & status indicators
│   │   │   ├── UploadBox.jsx    # Drag-and-drop PDF uploader
│   │   │   ├── DocumentList.jsx # Document library & selector
│   │   │   ├── SourceCard.jsx   # Citation card with page badges
│   │   │   ├── MessageBubble.jsx# Chat bubbles & formatted text
│   │   │   ├── ChatWindow.jsx   # Conversation view & input bar
│   │   │   └── SettingsModal.jsx# API key configuration modal
│   │   ├── App.jsx              # Main application layout
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quickstart Guide

### 1. Backend Setup

```bash
cd backend

# Create .env from example (optional: add your Gemini API Key)
copy .env.example .env

# Install backend dependencies (FastAPI, PyMuPDF, etc.)
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API documentation is available at: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

In a new terminal:
```bash
cd frontend

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🧪 Testing the RAG Pipeline

Run the automated standalone evaluation script:
```bash
python backend/test_rag_pipeline.py
```
This tests:
1. Multi-page PDF text extraction.
2. Boundary-aware chunking with page number tracking.
3. Vector generation and similarity search.
4. Answering factual questions with exact page references.
5. Verifying fallback response on irrelevant questions.

---

## 🔑 Adding your Gemini API Key

You can configure your Google Gemini API key either:
1. In `backend/.env`: `GEMINI_API_KEY=your_key_here`
2. Directly inside the web UI by clicking the **Settings (⚙️)** button in the top navbar.
Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
