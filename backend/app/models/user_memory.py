from datetime import datetime
from typing import Optional, Dict, Any
from bson import ObjectId
from app.db.database import db

COLLECTION = db.user_memory

async def get_user_memory(user_id: str) -> Optional[Dict[str, Any]]:
    return await COLLECTION.find_one({"user_id": ObjectId(user_id)})

async def create_or_update_memory(
    user_id: str,
    summary: str
):
    await COLLECTION.update_one(
        {"user_id": ObjectId(user_id)},
        {
            "$set": {
                "summary": summary,
                "updated_at": datetime.utcnow()
            },
            "$setOnInsert": {
                "created_at": datetime.utcnow()
            }
        },
        upsert=True
    )
