from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from pydantic import BaseModel, Field
from app.db.database import db
import logging

logger = logging.getLogger(__name__)

COLLECTION = db.chat_history

# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class ChatMessageCreate(BaseModel):
    """Schema for creating a new chat message"""
    user_id: str
    role: str  # 'user' or 'assistant'
    content: str

class ChatMessageOut(BaseModel):
    """Schema for returning a chat message"""
    id: str
    user_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================================================
# HELPER — format document for API response
# ============================================================================

def _format_message(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB document to API-friendly dict"""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    doc["user_id"] = str(doc["user_id"])
    return doc

# ============================================================================
# CRUD OPERATIONS
# ============================================================================

async def save_chat_message(user_id: str, role: str, content: str) -> Dict[str, Any]:
    """Save a new chat message to the user's message array"""
    message_data = {
        "role": role,
        "content": content,
        "created_at": datetime.utcnow(),
    }
    
    await COLLECTION.update_one(
        {"user_id": ObjectId(user_id)},
        {
            "$push": {"messages": message_data},
            "$set": {"updated_at": datetime.utcnow()},
            "$setOnInsert": {"created_at": datetime.utcnow()}
        },
        upsert=True
    )
    return message_data

async def get_chat_history(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve chat history for a user from their message array"""
    doc = await COLLECTION.find_one({"user_id": ObjectId(user_id)})
    
    if not doc or "messages" not in doc:
        return []
        
    # Return the last 'limit' messages
    return doc["messages"][-limit:]

async def delete_chat_history(user_id: str) -> int:
    """Delete the chat history document for a user"""
    try:
        result = await COLLECTION.delete_one({"user_id": ObjectId(user_id)})
        return result.deleted_count
    except Exception as e:
        logger.error(f"Error deleting chat history for user {user_id}: {e}")
        return 0
