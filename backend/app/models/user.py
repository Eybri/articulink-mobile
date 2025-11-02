from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
from datetime import date, datetime
from bson import ObjectId
from app.db.database import db
import hashlib
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
    status: Optional[str] = "active"  # Add status field

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
    status: Optional[str] = "active"  # Add status field
    message: str = "Profile updated successfully"
    
    class Config:
        from_attributes = True
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: Optional[dict] = None

class TokenRefresh(BaseModel):
    refresh_token: str

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

class ProfilePicUpdate(BaseModel):
    profile_pic: str = Field(..., description="Cloudinary URL of the uploaded image")
    

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def hash_token(token: str) -> str:
    """Hash a token for secure storage using SHA-256"""
    return hashlib.sha256(token.encode()).hexdigest()

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
        "refresh_tokens": [],
        "created_at": datetime.utcnow()
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

# ============================================================================
# REFRESH TOKEN MANAGEMENT (3 SESSION LIMIT)
# ============================================================================

async def add_refresh_token(user_id: str, refresh_token: str, expires_at: datetime) -> bool:
    """Add hashed refresh token with automatic cleanup (max 3 sessions)"""
    try:
        token_hash = hash_token(refresh_token)
        now = datetime.utcnow()
        
        # Clean expired tokens
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"refresh_tokens": {"expires_at": {"$lt": now}}}}
        )
        
        # Enforce 3 session limit
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user and len(user.get("refresh_tokens", [])) >= 3:
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$pop": {"refresh_tokens": -1}}
            )
            logger.info(f"Removed oldest token for user {user_id} (limit: 3)")
        
        # Add new token
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$push": {"refresh_tokens": {
                "token_hash": token_hash,
                "expires_at": expires_at,
                "created_at": now,
                "last_used": now
            }}}
        )
        logger.info(f"Added refresh token for user {user_id}, expires: {expires_at}")
        return True
    except Exception as e:
        logger.error(f"Error adding refresh token for user {user_id}: {e}")
        return False

async def revoke_refresh_token(user_id: str, refresh_token: str) -> bool:
    """Remove a specific refresh token"""
    try:
        token_hash = hash_token(refresh_token)
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"refresh_tokens": {"token_hash": token_hash}}}
        )
        if result.modified_count > 0:
            logger.info(f"Revoked refresh token for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error revoking refresh token for user {user_id}: {e}")
        return False

async def revoke_all_refresh_tokens(user_id: str) -> bool:
    """Remove all refresh tokens (logout from all devices)"""
    try:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"refresh_tokens": []}}
        )
        logger.info(f"Revoked all refresh tokens for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error revoking all tokens for user {user_id}: {e}")
        return False

async def is_refresh_token_valid(user_id: str, refresh_token: str) -> bool:
    """Check if refresh token exists and is not expired"""
    try:
        token_hash = hash_token(refresh_token)
        user = await db.users.find_one({
            "_id": ObjectId(user_id),
            "refresh_tokens.token_hash": token_hash
        })
        
        if not user:
            logger.warning(f"Refresh token not found for user {user_id}")
            return False
        
        # Find and validate token
        for token_data in user.get("refresh_tokens", []):
            if token_data["token_hash"] == token_hash:
                if token_data["expires_at"] > datetime.utcnow():
                    # Update last_used timestamp
                    await db.users.update_one(
                        {"_id": ObjectId(user_id), "refresh_tokens.token_hash": token_hash},
                        {"$set": {"refresh_tokens.$.last_used": datetime.utcnow()}}
                    )
                    logger.info(f"Refresh token validated for user {user_id}")
                    return True
                else:
                    logger.warning(f"Expired refresh token for user {user_id}")
                    await revoke_refresh_token(user_id, refresh_token)
                    return False
        return False
    except Exception as e:
        logger.error(f"Error validating refresh token for user {user_id}: {e}")
        return False

async def cleanup_expired_tokens(user_id: str) -> bool:
    """Remove all expired tokens for a specific user"""
    try:
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$pull": {"refresh_tokens": {"expires_at": {"$lt": datetime.utcnow()}}}}
        )
        if result.modified_count > 0:
            logger.info(f"Cleaned up expired tokens for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Error cleaning up expired tokens for user {user_id}: {e}")
        return False

async def cleanup_all_expired_tokens() -> bool:
    """Clean up expired tokens for all users (run as scheduled job)"""
    try:
        result = await db.users.update_many(
            {},
            {"$pull": {"refresh_tokens": {"expires_at": {"$lt": datetime.utcnow()}}}}
        )
        logger.info(f"Global cleanup: removed expired tokens from {result.modified_count} users")
        return True
    except Exception as e:
        logger.error(f"Error in global token cleanup: {e}")
        return False

async def get_user_active_sessions(user_id: str) -> list:
    """Get all active (non-expired) sessions for a user"""
    try:
        user = await get_user_by_id(user_id)
        if not user:
            return []
        
        now = datetime.utcnow()
        return [
            {
                "created_at": token["created_at"],
                "last_used": token["last_used"],
                "expires_at": token["expires_at"]
            }
            for token in user.get("refresh_tokens", [])
            if token["expires_at"] > now
        ]
    except Exception as e:
        logger.error(f"Error getting active sessions for user {user_id}: {e}")
        return []