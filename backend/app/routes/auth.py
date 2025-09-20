from fastapi import APIRouter, HTTPException, status, Depends
from app.models.user import UserCreate, UserOut, Token, LoginRequest
from app.models.user import get_user_by_email, get_user_by_id, create_user, set_refresh_jti
from app.utils.security import hash_password, verify_password
from app.utils import tokens

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    # Check if user already exists
    existing = await get_user_by_email(user.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create user data
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    
    # Remove None values
    user_dict = {k: v for k, v in user_dict.items() if v is not None}
    
    # Create user
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
    )

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    # Get user by email
    user = await get_user_by_email(login_data.email)
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Create tokens
    access_token = tokens.create_access_token(str(user["_id"]))
    refresh_jti, refresh_token = tokens.create_refresh_token(str(user["_id"]))
    
    # Store refresh token identifier
    await set_refresh_jti(str(user["_id"]), refresh_jti)

    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token
    )

@router.post("/refresh", response_model=Token)
async def refresh_token_endpoint(payload: dict):
    refresh_token = payload.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="refresh_token required"
        )
    
    try:
        decoded = tokens.decode_token(refresh_token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    if decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not a refresh token"
        )

    user_id = decoded.get("sub")
    jti = decoded.get("jti")
    
    # Verify user and token
    user = await get_user_by_id(user_id)
    if not user or user.get("refresh_jti") != jti:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked"
        )

    # Create new tokens
    access_token = tokens.create_access_token(str(user["_id"]))
    new_jti, new_refresh_token = tokens.create_refresh_token(str(user["_id"]))
    await set_refresh_jti(str(user["_id"]), new_jti)

    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=new_refresh_token
    )

@router.post("/logout")
async def logout(payload: dict):
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id required"
        )
    
    await set_refresh_jti(user_id, None)
    return {"msg": "Logged out successfully"}

@router.get("/me", response_model=UserOut)
async def get_current_user(user_id: str = Depends(lambda: None)):  # You'll need to add JWT auth middleware
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
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
    )