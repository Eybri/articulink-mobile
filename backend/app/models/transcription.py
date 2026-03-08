from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from app.db.database import db
import logging
import uuid

logger = logging.getLogger(__name__)

COLLECTION = db.audio_clips

# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class AudioClipCreate(BaseModel):
    """Schema for creating a new audio clip"""
    user_id: str
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    corrected_transcript: Optional[str] = None
    speech_type: Optional[str] = None
    duration_seconds: Optional[float] = None
    language: Optional[str] = None
    confidence_score: Optional[float] = None
    processing_status: Optional[str] = "pending"
    device_type: Optional[str] = None
    app_version: Optional[str] = None


class AudioClipOut(BaseModel):
    """Schema for returning an audio clip"""
    id: str
    user_id: str
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    corrected_transcript: Optional[str] = None
    speech_type: Optional[str] = None
    duration_seconds: Optional[float] = None
    language: Optional[str] = None
    confidence_score: Optional[float] = None
    processing_status: Optional[str] = None
    device_type: Optional[str] = None
    app_version: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AudioClipUpdate(BaseModel):
    """Schema for updating an audio clip"""
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    corrected_transcript: Optional[str] = None
    speech_type: Optional[str] = None
    duration_seconds: Optional[float] = None
    language: Optional[str] = None
    confidence_score: Optional[float] = None
    processing_status: Optional[str] = None
    device_type: Optional[str] = None
    app_version: Optional[str] = None

    class Config:
        from_attributes = True
        extra = "ignore"


# ============================================================================
# HELPER — format document for API response
# ============================================================================

def _format_clip(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB document to API-friendly dict"""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    doc["user_id"] = str(doc["user_id"])
    return doc


# ============================================================================
# CRUD OPERATIONS
# ============================================================================

async def create_audio_clip(clip_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new audio clip linked to a user"""
    clip_data.update({
        "user_id": ObjectId(clip_data["user_id"]),
        "created_at": datetime.utcnow(),
    })
    result = await COLLECTION.insert_one(clip_data)
    doc = await COLLECTION.find_one({"_id": result.inserted_id})
    return _format_clip(doc)


async def get_audio_clip_by_id(clip_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a single audio clip by its ID"""
    try:
        doc = await COLLECTION.find_one({"_id": ObjectId(clip_id)})
        return _format_clip(doc)
    except Exception as e:
        logger.error(f"Error getting audio clip {clip_id}: {e}")
        return None


async def get_clips_by_user(
    user_id: str,
    skip: int = 0,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    """Retrieve all audio clips for a user, newest first"""
    cursor = COLLECTION.find({"user_id": ObjectId(user_id)}) \
        .sort("created_at", -1) \
        .skip(skip) \
        .limit(limit)
    clips = []
    async for doc in cursor:
        clips.append(_format_clip(doc))
    return clips


async def count_clips_by_user(user_id: str) -> int:
    """Count total clips for a user"""
    return await COLLECTION.count_documents({"user_id": ObjectId(user_id)})


async def update_audio_clip(
    clip_id: str,
    update_data: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Update fields on an audio clip"""
    try:
        update_data["updated_at"] = datetime.utcnow()
        await COLLECTION.update_one(
            {"_id": ObjectId(clip_id)},
            {"$set": update_data},
        )
        return await get_audio_clip_by_id(clip_id)
    except Exception as e:
        logger.error(f"Error updating audio clip {clip_id}: {e}")
        return None


async def delete_audio_clip(clip_id: str) -> bool:
    """Delete a single audio clip"""
    try:
        result = await COLLECTION.delete_one({"_id": ObjectId(clip_id)})
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"Error deleting audio clip {clip_id}: {e}")
        return False


async def delete_clips_by_user(user_id: str) -> int:
    """Delete all audio clips for a user (e.g. on account deletion)"""
    try:
        result = await COLLECTION.delete_many({"user_id": ObjectId(user_id)})
        return result.deleted_count
    except Exception as e:
        logger.error(f"Error deleting clips for user {user_id}: {e}")
        return 0
