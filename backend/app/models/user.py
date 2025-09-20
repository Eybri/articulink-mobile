from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
from datetime import date
from bson import ObjectId
from app.db.database import db

# Pydantic Schemas
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

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @validator('email')
    def email_to_lowercase(cls, v):
        return v.lower()

# MongoDB Model Functions
async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    user = await db.users.find_one({"email": email.lower()})
    return user

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        return user
    except:
        return None

async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    user_data["email"] = user_data["email"].lower()
    result = await db.users.insert_one(user_data)
    new_user = await db.users.find_one({"_id": result.inserted_id})
    return new_user

async def set_refresh_jti(user_id: str, jti: Optional[str]) -> None:
    try:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"refresh_jti": jti}}
        )
    except:
        pass

async def update_user(user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    try:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        return await get_user_by_id(user_id)
    except:
        return None

async def delete_user(user_id: str) -> bool:
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    except:
        return False