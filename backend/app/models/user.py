from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
from datetime import date, datetime
from bson import ObjectId
from app.db.database import db
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = "user"
    profile_pic: Optional[str] = None
    birthdate: Optional[date] = None
    gender: Optional[str] = None
    status: Optional[str] = "active"

    @validator('email')
    def email_to_lowercase(cls, v):
        return v.lower()

class UserOut(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    profile_pic: Optional[str] = None
    birthdate: Optional[date] = None
    gender: Optional[str] = None
    status: Optional[str] = "active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserUpdateResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    profile_pic: Optional[str] = None
    birthdate: Optional[date] = None
    gender: Optional[str] = None
    status: Optional[str] = "active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    message: str = "Profile updated successfully"
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str  # Keep field for compatibility but will be empty
    token_type: str
    user: Optional[dict] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @validator('email')
    def email_to_lowercase(cls, v):
        return v.lower()

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birthdate: Optional[str] = None
    gender: Optional[str] = None
    
    class Config:
        from_attributes = True
        extra = "ignore"

# ============================================================================
# USER CRUD OPERATIONS
# ============================================================================

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Retrieve user by email address"""
    return await db.users.find_one({"email": email.lower()})

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve user by ID"""
    try:
        return await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception as e:
        logger.error(f"Error getting user by ID {user_id}: {e}")
        return None

async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new user account"""
    user_data.update({
        "email": user_data["email"].lower(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "status": user_data.get("status", "active"),
        "role": user_data.get("role", "user")
    })
    result = await db.users.insert_one(user_data)
    return await db.users.find_one({"_id": result.inserted_id})

async def update_user(user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update user profile information"""
    try:
        update_data["updated_at"] = datetime.utcnow()
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        return await get_user_by_id(user_id)
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        return None

async def delete_user(user_id: str) -> bool:
    """Delete a user account"""
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        return False