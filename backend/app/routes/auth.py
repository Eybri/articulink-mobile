from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.models.user import (
    UserCreate, UserOut, Token, LoginRequest, 
    UserUpdate, UserUpdateResponse
)
from app.models.user import (
    get_user_by_email, get_user_by_id, create_user, update_user
)
from app.utils.security import hash_password, verify_password
from app.utils.tokens import create_access_token
from app.utils.authMiddleware import require_auth, get_current_user_id
from app.utils.cloudinary_helper import (
    upload_profile_picture, 
    delete_profile_picture,
    extract_public_id_from_url
)
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user account"""
    existing = await get_user_by_email(user.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    user_dict = {k: v for k, v in user_dict.items() if v is not None}
    
    result = await create_user(user_dict)

    return UserOut(
        id=str(result["_id"]),
        email=result["email"],
        first_name=result.get("first_name"),
        last_name=result.get("last_name"),
        role=result.get("role", "user"),
        profile_pic=result.get("profile_pic"),
        birthdate=result.get("birthdate"),
        gender=result.get("gender"),
        status=result.get("status", "active"),
        created_at=result.get("created_at"),
        updated_at=result.get("updated_at")
    )

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    """Authenticate user and return access token"""
    user = await get_user_by_email(login_data.email)
    
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )
    
    if not user or not verify_password(login_data.password, user["password"]):
        raise invalid_credentials

    if user.get("role") != "user":
        raise invalid_credentials

    # Check if user is deactivated
    if user.get("status") == "inactive":
        deactivation_type = user.get("deactivation_type")
        deactivation_end_date = user.get("deactivation_end_date")
        deactivation_reason = user.get("deactivation_reason", "No reason provided")
        
        # Check for temporary deactivation that should be auto-reactivated
        if deactivation_type == "temporary" and deactivation_end_date:
            if datetime.now() > deactivation_end_date:
                # Auto-reactivate user
                await update_user(str(user["_id"]), {
                    "status": "active",
                    "deactivation_type": None,
                    "deactivation_reason": None,
                    "deactivation_end_date": None
                })
                logger.info(f"Auto-reactivated user {user['_id']} during login")
            else:
                # User is still temporarily deactivated
                remaining_time = deactivation_end_date - datetime.now()
                days_remaining = remaining_time.days
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Account temporarily deactivated. {f'Available in {days_remaining} days' if days_remaining > 0 else 'Available soon'}. Reason: {deactivation_reason}"
                )
        else:
            # Permanent deactivation or no end date
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account deactivated: {deactivation_reason}"
            )

    # Create access token only (no refresh token)
    access_token = create_access_token(str(user["_id"]))

    user_data = {
        "_id": str(user["_id"]),
        "email": user["email"],
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "role": user.get("role", "user"),
        "profile_pic": user.get("profile_pic"),
        "birthdate": user.get("birthdate"),
        "gender": user.get("gender"),
        "status": user.get("status", "active")
    }

    return Token(
        access_token=access_token,
        refresh_token="",  # Empty string since we removed refresh tokens
        token_type="bearer",
        user=user_data
    )

@router.post("/logout", dependencies=[Depends(require_auth)])
async def logout(user_id: str = Depends(get_current_user_id)):
    """
    Logout endpoint (kept for compatibility, no token revocation needed)
    """
    logger.info(f"User {user_id} logged out")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserOut, dependencies=[Depends(require_auth)])
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Get current authenticated user's profile"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserOut(
        id=str(user["_id"]),
        email=user["email"],
        first_name=user.get("first_name"),
        last_name=user.get("last_name"),
        role=user.get("role"),
        profile_pic=user.get("profile_pic"),
        birthdate=user.get("birthdate"),
        gender=user.get("gender"),
        status=user.get("status", "active"),  # Make sure status is included
        created_at=user.get("created_at"),
        updated_at=user.get("updated_at")
    )

@router.put("/profile", response_model=UserUpdateResponse, dependencies=[Depends(require_auth)])
async def update_profile(
    profile_data: UserUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update user profile details (name, birthdate, gender)"""
    logger.info(f"Update profile request for user: {user_id}")
    
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = profile_data.dict(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update"
        )
    
    logger.info(f"Updating user {user_id} with data: {update_data}")
    
    updated_user = await update_user(user_id, update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    return UserUpdateResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        first_name=updated_user.get("first_name"),
        last_name=updated_user.get("last_name"),
        role=updated_user.get("role"),
        profile_pic=updated_user.get("profile_pic"),
        birthdate=updated_user.get("birthdate"),
        gender=updated_user.get("gender"),
        message="Profile updated successfully"
    )

@router.post("/profile/picture", response_model=UserUpdateResponse, dependencies=[Depends(require_auth)])
async def upload_profile_pic(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload or update profile picture"""
    try:
        logger.info(f"Received upload request for user: {user_id}")
        logger.info(f"File info - Name: {file.filename}, Content-Type: {file.content_type}")
        
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Extract old public_id for cleanup
        old_public_id = None
        if user.get("profile_pic"):
            old_public_id = extract_public_id_from_url(user["profile_pic"])
            logger.info(f"Found existing profile pic with public_id: {old_public_id}")
        
        # Upload to Cloudinary (will replace old image if old_public_id provided)
        upload_result = await upload_profile_picture(file, user_id, old_public_id)
        logger.info(f"Upload successful: {upload_result['secure_url']}")
        
        # Update user with new profile picture URL
        update_data = {"profile_pic": upload_result["secure_url"]}
        updated_user = await update_user(user_id, update_data)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile picture in database"
            )
        
        logger.info(f"Database updated successfully for user {user_id}")
        
        return UserUpdateResponse(
            id=str(updated_user["_id"]),
            email=updated_user["email"],
            first_name=updated_user.get("first_name"),
            last_name=updated_user.get("last_name"),
            role=updated_user.get("role"),
            profile_pic=updated_user.get("profile_pic"),
            birthdate=updated_user.get("birthdate"),
            gender=updated_user.get("gender"),
            message="Profile picture updated successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in upload_profile_pic: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    
@router.delete("/profile/picture", response_model=dict, dependencies=[Depends(require_auth)])
async def delete_profile_pic(user_id: str = Depends(get_current_user_id)):
    """Delete profile picture"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.get("profile_pic"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No profile picture to delete"
        )
    
    # Extract public_id from Cloudinary URL
    old_public_id = extract_public_id_from_url(user["profile_pic"])
    
    # Delete from Cloudinary
    if old_public_id:
        await delete_profile_picture(old_public_id)
    
    # Remove profile_pic from user document
    await update_user(user_id, {"profile_pic": None})
    
    return {"message": "Profile picture deleted successfully"}