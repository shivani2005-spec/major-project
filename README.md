# NoteWise AI 📚
### An Intelligent Document-Based Question Answering System Using Retrieval-Augmented Generation (RAG) & MongoDB

NoteWise AI is a modern full-stack academic assistant application designed for students and researchers. It allows users to upload course materials, lecture notes, and textbooks (PDFs) and ask natural-language questions about them. 

The system retrieves the most relevant passages using semantic vector search and generates accurate, grounded answers, complete with **exact source page citations** (`[Page X]`) and relevance scores, eliminating LLM hallucinations.

---

## 🚀 Key Features

- **Marketing Landing Page (`/`)**: High-converting, modern homepage featuring interactive RAG demo previews, system metrics, feature breakdowns, and workflow guides.
- **User Authentication (`/signup` & `/signin`)**:
  - Secure signup and signin using PBKDF2 password hashing and JWT (JSON Web Tokens).
  - 1-Click "Demo Account" button on the signin page for instant testing.
  - Private document libraries: documents and chat sessions are linked to the authenticated user.
- **Database Engine (MongoDB + Local Fallback)**:
  - Native MongoDB integration (`pymongo`) for users, documents, and chat history.
  - Configurable for local MongoDB (`mongodb://localhost:27017`) or MongoDB Atlas cloud connection strings.
  - Seamless local SQLite fallback if MongoDB service is offline, ensuring the app always runs out of the box.
- **Document Library (`/app`)**: Upload, inspect, manage, and delete multiple PDF documents with size and type validation.
- **Precision RAG Ingestion Pipeline**: Page-by-page text extraction with PyMuPDF/pypdf, boundary-aware recursive chunking (700 tokens, 120-char overlap), and dense vector embeddings.
- **Top-k Semantic Retrieval**: Cosine similarity search across document chunks with page-level metadata.
- **Strict Grounding & Hallucination Elimination**: Prompts instruct the LLM to rely strictly on retrieved document passages; answers default to *"I couldn't find this information in your document"* when context is insufficient.
- **Verifiable Citations**: Every answer provides interactive citation cards showing the source document, page number badge, relevance score, and the exact supporting excerpt.
- **Modular LLM Support**: Designed for Google Gemini API (`gemini-2.5-flash`), with offline/fallback citation synthesis mode out of the box.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, React Router v7, Vite, Tailwind CSS, Axios, Lucide React |
| **Backend** | Python 3.13, FastAPI, Uvicorn, PyJWT |
| **Database** | MongoDB (pymongo) with SQLite local fallback |
| **Document Parsing** | PyMuPDF (fitz), pypdf |
| **Vector Search** | Scikit-learn, NumPy vector index, Cosine similarity |
| **LLM & Embeddings** | Google Gemini API (`gemini-2.5-flash`, `text-embedding-004`) |

---

## 🌐 Application Routes

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **HomePage** | Product overview, features, metrics, interactive preview, and CTAs |
| `/signin` | **SignInPage** | Secure login with email/password + 1-click Demo Account login |
| `/signup` | **SignUpPage** | Student registration with validation |
| `/app` | **WorkspacePage** | Protected RAG workspace (upload notes, library, chat, citations) |

---

## 📁 Project Structure

```
major-project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & CORS configuration
│   │   ├── core/
│   │   │   ├── config.py        # Settings (MongoDB, JWT, Gemini, RAG)
│   │   │   └── database.py      # MongoDB client & SQLite fallback
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic schemas (Auth, Docs, Ask)
│   │   ├── routes/
│   │   │   ├── auth.py          # Signup, signin, and /me endpoints
│   │   │   ├── upload.py        # PDF upload & user ingestion
│   │   │   ├── documents.py     # Document library & delete endpoints
│   │   │   └── ask.py           # Question answering & citations endpoint
│   │   └── services/
│   │       ├── auth.py          # Password hashing & JWT token validation
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
│   ├── test_auth_api.py         # Auth & Database API test script
│   ├── .env.example             # Environment configuration template
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Axios API client with JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state & methods
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Header, DB status, user profile, logout
│   │   │   ├── ProtectedRoute.jsx# Auth route guard
│   │   │   ├── UploadBox.jsx    # Drag-and-drop PDF uploader
│   │   │   ├── DocumentList.jsx # Document library & selector
│   │   │   ├── SourceCard.jsx   # Citation card with page badges
│   │   │   ├── MessageBubble.jsx# Chat bubbles & formatted text
│   │   │   ├── ChatWindow.jsx   # Conversation view & input bar
│   │   │   └── SettingsModal.jsx# API key configuration modal
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Modern landing page
│   │   │   ├── SignInPage.jsx   # Sign in form + 1-click Demo Account
│   │   │   ├── SignUpPage.jsx   # Student registration form
│   │   │   └── WorkspacePage.jsx# Interactive RAG workspace
│   │   ├── App.jsx              # Client-side router configuration
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

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs on `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup

In a new terminal:
```bash
cd frontend

# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🗄️ MongoDB Setup

In `backend/.env`, set your MongoDB connection string:
```env
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=notewise

# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
```
*Note: If MongoDB is offline, NoteWise AI automatically falls back to local storage so you can continue testing without interruption.*

---

## 🧪 Testing

1. **Authentication & API Tests**:
   ```bash
   python backend/test_auth_api.py
   ```
2. **RAG Pipeline & Retrieval Tests**:
   ```bash
   python backend/test_rag_pipeline.py
   ```
