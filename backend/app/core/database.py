import sqlite3
import json
import uuid
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

# State
_mongo_client = None
_mongo_db = None
_use_mongo = False

def init_db():
    global _mongo_client, _mongo_db, _use_mongo
    
    # Attempt to connect to MongoDB
    try:
        from pymongo import MongoClient
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI} (Database: {settings.MONGODB_DB_NAME})...")
        client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2500)
        # Test connection
        client.admin.command('ping')
        _mongo_client = client
        _mongo_db = client[settings.MONGODB_DB_NAME]
        
        # Create indexes
        _mongo_db.users.create_index("email", unique=True)
        _mongo_db.documents.create_index("user_id")
        _mongo_db.chat_history.create_index([("user_id", 1), ("document_id", 1)])
        
        _use_mongo = True
        logger.info("Successfully connected to MongoDB! All data will be stored in MongoDB.")
        return
    except Exception as e:
        logger.warning(f"MongoDB connection failed ({e}). Falling back to local SQLite database.")
        _use_mongo = False

    # Initialize SQLite fallback
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    
    # Documents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            page_count INTEGER NOT NULL,
            chunk_count INTEGER NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    
    # Chat messages history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            document_id TEXT,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            sources_json TEXT,
            created_at TEXT NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()

def get_db_info() -> Dict[str, Any]:
    return {
        "engine": "mongodb" if _use_mongo else "sqlite_fallback",
        "uri": settings.MONGODB_URI if _use_mongo else str(settings.DB_PATH),
        "is_connected": True
    }

# --- SQLite Connection Helper ---
def get_sqlite_connection():
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- User Operations ---
def create_user(name: str, email: str, hashed_password: str) -> Dict[str, Any]:
    user_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    clean_email = email.strip().lower()

    if _use_mongo and _mongo_db is not None:
        user_doc = {
            "_id": user_id,
            "id": user_id,
            "name": name.strip(),
            "email": clean_email,
            "hashed_password": hashed_password,
            "created_at": created_at
        }
        _mongo_db.users.insert_one(user_doc)
        return {"id": user_id, "name": name.strip(), "email": clean_email, "created_at": created_at}
    
    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (id, name, email, hashed_password, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, name.strip(), clean_email, hashed_password, created_at))
    conn.commit()
    conn.close()
    return {"id": user_id, "name": name.strip(), "email": clean_email, "created_at": created_at}

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    clean_email = email.strip().lower()
    if _use_mongo and _mongo_db is not None:
        user = _mongo_db.users.find_one({"email": clean_email})
        if user:
            user["id"] = user.get("id", str(user.get("_id")))
            return user
        return None

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    if _use_mongo and _mongo_db is not None:
        user = _mongo_db.users.find_one({"$or": [{"_id": user_id}, {"id": user_id}]})
        if user:
            user["id"] = user.get("id", str(user.get("_id")))
            return user
        return None

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# --- Document Operations ---
def save_document(
    doc_id: str,
    filename: str,
    file_path: str,
    file_size: int,
    page_count: int,
    chunk_count: int,
    user_id: Optional[str] = None
):
    created_at = datetime.utcnow().isoformat()
    if _use_mongo and _mongo_db is not None:
        doc = {
            "_id": doc_id,
            "id": doc_id,
            "user_id": user_id,
            "filename": filename,
            "file_path": file_path,
            "file_size": file_size,
            "page_count": page_count,
            "chunk_count": chunk_count,
            "created_at": created_at
        }
        _mongo_db.documents.insert_one(doc)
        return

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO documents (id, user_id, filename, file_path, file_size, page_count, chunk_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (doc_id, user_id, filename, file_path, file_size, page_count, chunk_count, created_at))
    conn.commit()
    conn.close()

def get_all_documents(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if _use_mongo and _mongo_db is not None:
        query = {}
        if user_id:
            query = {"$or": [{"user_id": user_id}, {"user_id": None}]}
        docs = list(_mongo_db.documents.find(query).sort("created_at", -1))
        results = []
        for d in docs:
            d["id"] = d.get("id", str(d.get("_id")))
            d.pop("_id", None)
            results.append(d)
        return results

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    if user_id:
        cursor.execute("SELECT * FROM documents WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC", (user_id,))
    else:
        cursor.execute("SELECT * FROM documents ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_document_by_id(doc_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if _use_mongo and _mongo_db is not None:
        doc = _mongo_db.documents.find_one({"$or": [{"_id": doc_id}, {"id": doc_id}]})
        if doc:
            doc["id"] = doc.get("id", str(doc.get("_id")))
            doc.pop("_id", None)
            return doc
        return None

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_document(doc_id: str, user_id: Optional[str] = None) -> bool:
    if _use_mongo and _mongo_db is not None:
        res = _mongo_db.documents.delete_one({"$or": [{"_id": doc_id}, {"id": doc_id}]})
        _mongo_db.chat_history.delete_many({"document_id": doc_id})
        return res.deleted_count > 0

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    cursor.execute("DELETE FROM chat_history WHERE document_id = ?", (doc_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# --- Chat History Operations ---
def save_chat_message(
    document_id: Optional[str],
    sender: str,
    message: str,
    sources: Optional[List[Dict[str, Any]]] = None,
    user_id: Optional[str] = None
):
    created_at = datetime.utcnow().isoformat()
    if _use_mongo and _mongo_db is not None:
        msg_doc = {
            "user_id": user_id,
            "document_id": document_id,
            "sender": sender,
            "message": message,
            "sources": sources or [],
            "created_at": created_at
        }
        _mongo_db.chat_history.insert_one(msg_doc)
        return

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    sources_json = json.dumps(sources) if sources else None
    cursor.execute("""
        INSERT INTO chat_history (user_id, document_id, sender, message, sources_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, document_id, sender, message, sources_json, created_at))
    conn.commit()
    conn.close()

def get_chat_history(
    user_id: Optional[str] = None,
    document_id: Optional[str] = None,
    limit: int = 50
) -> List[Dict[str, Any]]:
    if _use_mongo and _mongo_db is not None:
        query = {}
        if user_id:
            query["user_id"] = user_id
        if document_id:
            query["document_id"] = document_id
            
        messages = list(_mongo_db.chat_history.find(query).sort("created_at", 1).limit(limit))
        results = []
        for m in messages:
            m["id"] = str(m.get("_id"))
            m.pop("_id", None)
            results.append(m)
        return results

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    conditions = []
    params = []
    if user_id:
        conditions.append("(user_id = ? OR user_id IS NULL)")
        params.append(user_id)
    if document_id:
        conditions.append("document_id = ?")
        params.append(document_id)
        
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    query = f"SELECT * FROM chat_history {where_clause} ORDER BY id ASC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for row in rows:
        item = dict(row)
        if item.get("sources_json"):
            item["sources"] = json.loads(item["sources_json"])
        else:
            item["sources"] = []
        results.append(item)
    return results

def clear_chat_history(user_id: Optional[str] = None, document_id: Optional[str] = None):
    if _use_mongo and _mongo_db is not None:
        query = {}
        if user_id:
            query["user_id"] = user_id
        if document_id:
            query["document_id"] = document_id
        _mongo_db.chat_history.delete_many(query)
        return

    conn = get_sqlite_connection()
    cursor = conn.cursor()
    conditions = []
    params = []
    if user_id:
        conditions.append("user_id = ?")
        params.append(user_id)
    if document_id:
        conditions.append("document_id = ?")
        params.append(document_id)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    cursor.execute(f"DELETE FROM chat_history {where_clause}", tuple(params))
    conn.commit()
    conn.close()
