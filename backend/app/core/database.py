import sqlite3
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.core.config import settings

def get_connection():
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Documents table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
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
            document_id TEXT,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            sources_json TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    conn.close()

def save_document(doc_id: str, filename: str, file_path: str, file_size: int, page_count: int, chunk_count: int):
    conn = get_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO documents (id, filename, file_path, file_size, page_count, chunk_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (doc_id, filename, file_path, file_size, page_count, chunk_count, created_at))
    conn.commit()
    conn.close()

def get_all_documents() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_document_by_id(doc_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_document(doc_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    cursor.execute("DELETE FROM chat_history WHERE document_id = ?", (doc_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def save_chat_message(document_id: Optional[str], sender: str, message: str, sources: Optional[List[Dict[str, Any]]] = None):
    conn = get_connection()
    cursor = conn.cursor()
    created_at = datetime.utcnow().isoformat()
    sources_json = json.dumps(sources) if sources else None
    cursor.execute("""
        INSERT INTO chat_history (document_id, sender, message, sources_json, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (document_id, sender, message, sources_json, created_at))
    conn.commit()
    conn.close()

def get_chat_history(document_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if document_id:
        cursor.execute("SELECT * FROM chat_history WHERE document_id = ? ORDER BY id ASC LIMIT ?", (document_id, limit))
    else:
        cursor.execute("SELECT * FROM chat_history ORDER BY id ASC LIMIT ?", (limit,))
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
