from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from app.models.user import (
    UserCreate, UserOut, Token, LoginRequest, 
    UserUpdate, UserUpdateResponse, VerifyOTPRequest, ResendOTPRequest,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.models.user import (
    get_user_by_email, get_user_by_id, create_user, update_user, convert_dates
)
from app.utils.security import hash_password, verify_password
from app.utils.tokens import create_access_token
from app.utils.authMiddleware import require_auth, get_current_user_id
from app.utils.cloudinary_helper import (
    upload_profile_picture, 
    delete_profile_picture,
    extract_public_id_from_url
)
from app.utils.email_service import email_service
from datetime import datetime, timedelta
from app.db.database import db
import logging
import secrets

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    """Register a new user account with OTP verification (stored in temp collection)"""
    # 1. Check if user already exists in main users collection
    existing = await get_user_by_email(user.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Generate 6-digit OTP
    otp_code = str(secrets.randbelow(900000) + 100000)
    otp_expires_at = datetime.utcnow() + timedelta(minutes=10)

    user_dict = user.dict()
    user_dict = convert_dates(user_dict)
    user_dict["password"] = hash_password(user.password)
    user_dict["status"] = "pending"
    user_dict["otp_code"] = otp_code
    user_dict["otp_expires_at"] = otp_expires_at
    user_dict["last_sent_at"] = datetime.utcnow()
    user_dict["resend_count"] = 0
    user_dict["created_at"] = datetime.utcnow()
    user_dict = {k: v for k, v in user_dict.items() if v is not None}
    
    # 2. Store in temp_users collection (upsert to handle retries before verification)
    await db.temp_users.update_one(
        {"email": user.email.lower()},
        {"$set": user_dict},
        upsert=True
    )

    # Send OTP Email
    email_sent = await email_service.send_otp(user.email, otp_code)
    if not email_sent:
        logger.error(f"Failed to send registration OTP to {user.email}")

    return UserOut(
        id="pending", # ID is only assigned after verification
        email=user.email,
        username=user.username,
        role=user.role or "user",
        status="pending",
        created_at=user_dict["created_at"]
    )

@router.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    """Verify registration OTP and migrate account to main users collection"""
    # 1. Look for the pending registration in temp collection
    pending_user = await db.temp_users.find_one({"email": request.email.lower()})
    
    if not pending_user:
        # Check if already in main users (could happen if they verify twice)
        existing = await get_user_by_email(request.email)
        if existing:
            return {"message": "Account is already active and verified", "status": "active"}
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verification request not found. Please register again."
        )

    # 2. Check OTP and Expiration
    if pending_user.get("otp_code") != request.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )

    if datetime.utcnow() > pending_user.get("otp_expires_at"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new one."
        )

    # 3. Prepare data for main users collection
    user_data = pending_user.copy()
    user_data.pop("_id", None) # Remove temp ID
    user_data.pop("otp_code", None)
    user_data.pop("otp_expires_at", None)
    user_data["status"] = "active"
    user_data["updated_at"] = datetime.utcnow()

    # 4. Create actual user in main collection
    result = await create_user(user_data)

    # 5. Cleanup temp collection
    await db.temp_users.delete_one({"email": request.email.lower()})

    return {"message": "Account verified and activated successfully", "user_id": str(result["_id"])}

@router.post("/resend-otp")
async def resend_otp(request: ResendOTPRequest):
    """Resend a new OTP code to a pending registration"""
    # 1. Check if registration exists in temp collection
    pending_user = await db.temp_users.find_one({"email": request.email.lower()})
    
    # 2. Check for resend limits
    if not pending_user:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found."
        )
         
    last_sent = pending_user.get("last_sent_at")
    resend_count = pending_user.get("resend_count", 0)

    if last_sent and (datetime.utcnow() - last_sent) < timedelta(seconds=60):
        seconds_left = 60 - int((datetime.utcnow() - last_sent).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {seconds_left} seconds before requesting a new code."
        )

    if resend_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum resend attempts reached. Please register again if you still need a code."
        )

    # 3. Generate new OTP
    otp_code = str(secrets.randbelow(900000) + 100000)
    otp_expires_at = datetime.utcnow() + timedelta(minutes=10)

    # 4. Update temp_users with new OTP and increment count
    await db.temp_users.update_one(
        {"email": request.email.lower()},
        {
            "$set": {
                "otp_code": otp_code, 
                "otp_expires_at": otp_expires_at,
                "last_sent_at": datetime.utcnow()
            },
            "$inc": {"resend_count": 1}
        }
    )

    # 4. Send OTP Email
    email_sent = await email_service.send_otp(request.email, otp_code)
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please try again later."
        )

    return {"message": "New verification code sent successfully"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Initiate password reset by sending an OTP to the user's email"""
    user = await get_user_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate 6-digit OTP
    otp_code = str(secrets.randbelow(900000) + 100000)
    otp_expires_at = datetime.utcnow() + timedelta(hours=1) 

    # Store OTP in user record
    await db.users.update_one(
        {"email": request.email.lower()},
        {
            "$set": {
                "reset_otp_code": otp_code,
                "reset_otp_expires_at": otp_expires_at
            }
        }
    )

    # Send Email
    email_sent = await email_service.send_password_reset_otp(request.email, otp_code)
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset email."
        )

    return {"message": "Password reset code sent to your email."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using the OTP code"""
    user = await get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Check OTP
    stored_otp = user.get("reset_otp_code")
    expires_at = user.get("reset_otp_expires_at")

    if not stored_otp or stored_otp != request.otp_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset code")

    if not expires_at or datetime.utcnow() > expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset code has expired")

    # Update password and clear OTP
    new_hashed_password = hash_password(request.new_password)
    await db.users.update_one(
        {"email": request.email.lower()},
        {
            "$set": {"password": new_hashed_password, "updated_at": datetime.utcnow()},
            "$unset": {"reset_otp_code": "", "reset_otp_expires_at": ""}
        }
    )

    return {"message": "Password has been reset successfully."}

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

    # Check if user is pending or deactivated
    if user.get("status") == "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in."
        )

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

    # Create access token
    access_token = create_access_token(str(user["_id"]))

    user_data = {
        "_id": str(user["_id"]),
        "email": user["email"],
        "username": user.get("username"),
        "role": user.get("role", "user"),
        "profile_pic": user.get("profile_pic"),
        "birthdate": user.get("birthdate"),
        "gender": user.get("gender"),
        "status": user.get("status", "active")
    }

    return Token(
        access_token=access_token,
        refresh_token="", 
        token_type="bearer",
        user=user_data
    )

@router.post("/logout", dependencies=[Depends(require_auth)])
async def logout(user_id: str = Depends(get_current_user_id)):
    """Logout endpoint"""
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
        username=user.get("username"),
        role=user.get("role"),
        profile_pic=user.get("profile_pic"),
        birthdate=user.get("birthdate"),
        gender=user.get("gender"),
        status=user.get("status", "active"),
        created_at=user.get("created_at"),
        updated_at=user.get("updated_at")
    )

@router.put("/profile", response_model=UserUpdateResponse, dependencies=[Depends(require_auth)])
async def update_profile(
    profile_data: UserUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update user profile details"""
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    update_data = profile_data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided")
    
    updated_user = await update_user(user_id, update_data)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update profile")
    
    return UserUpdateResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        username=updated_user.get("username"),
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
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        old_public_id = None
        if user.get("profile_pic"):
            old_public_id = extract_public_id_from_url(user["profile_pic"])
        
        upload_result = await upload_profile_picture(file, user_id, old_public_id)
        
        update_data = {"profile_pic": upload_result["secure_url"]}
        updated_user = await update_user(user_id, update_data)
        
        if not updated_user:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update profile picture")
        
        return UserUpdateResponse(
            id=str(updated_user["_id"]),
            email=updated_user["email"],
            username=updated_user.get("username"),
            role=updated_user.get("role"),
            profile_pic=updated_user.get("profile_pic"),
            birthdate=updated_user.get("birthdate"),
            gender=updated_user.get("gender"),
            message="Profile picture updated successfully"
        )
    except Exception as e:
        logger.error(f"Error in upload_profile_pic: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
@router.delete("/profile/picture", response_model=dict, dependencies=[Depends(require_auth)])
async def delete_profile_pic(user_id: str = Depends(get_current_user_id)):
    """Delete profile picture"""
    user = await get_user_by_id(user_id)
    if not user or not user.get("profile_pic"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No profile picture to delete")
    
    old_public_id = extract_public_id_from_url(user["profile_pic"])
    if old_public_id:
        await delete_profile_picture(old_public_id)
    
    await update_user(user_id, {"profile_pic": None})
    return {"message": "Profile picture deleted successfully"}