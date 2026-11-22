import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db, get_all_documents
from app.models.schemas import HealthStatus, ApiKeyRequest
from app.routes import upload, documents, ask

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("notewise-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing NoteWise AI Database and Vector Directories...")
    init_db()
    yield
    # Shutdown
    logger.info("NoteWise AI server shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NoteWise AI: An Intelligent Document-Based Question Answering System Using RAG",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(upload.router)
app.include_router(documents.router)
app.include_router(ask.router)

@app.get("/api/health", response_model=HealthStatus)
async def health_check():
    docs = get_all_documents()
    has_key = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here")
    return HealthStatus(
        status="healthy",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        llm_configured=has_key,
        document_count=len(docs)
    )

@app.post("/api/config/key")
async def update_api_key(req: ApiKeyRequest):
    """
    Allows setting the Gemini API key dynamically from the UI settings modal.
    """
    settings.GEMINI_API_KEY = req.api_key.strip()
    return {"success": True, "message": "Gemini API key updated successfully."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
