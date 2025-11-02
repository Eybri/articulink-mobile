from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional
import logging
import secrets

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable must be set")

REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", SECRET_KEY + "_refresh")

# Token expiration settings
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", 1))  # 1 hour default
REFRESH_TOKEN_EXPIRE_DAYS = float(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))  # 7 days default

def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token for user authentication"""
    if expires_delta is None:
        expires_delta = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    }
    
    token = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    logger.info(f"Created access token for user {user_id}, expires: {expire}")
    return token

def create_refresh_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT refresh token for getting new access tokens"""
    if expires_delta is None:
        expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh",
        "jti": secrets.token_hex(16)  # Unique token identifier
    }
    
    token = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm="HS256")
    logger.info(f"Created refresh token for user {user_id}, expires: {expire}")
    return token

def decode_access_token(token: str) -> dict:
    """
    Decode and verify JWT access token
    
    Raises:
        ValueError: If token is invalid, expired, or malformed
    """
    try:
        logger.info(f"Attempting to decode access token: {token[:20]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        
        # Verify token type
        if payload.get("type") != "access":
            logger.error("Invalid token type")
            raise ValueError("Invalid token type")
        
        # Verify required fields
        if "sub" not in payload:
            logger.error("Token missing user ID")
            raise ValueError("Token missing user ID")
        
        # Check expiration
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            exp_datetime = datetime.utcfromtimestamp(exp_timestamp)
            if datetime.utcnow() > exp_datetime:
                logger.error(f"Token expired at {exp_datetime}")
                raise ValueError("Token expired")
        
        logger.info(f"Access token decoded successfully for user: {payload.get('sub')}")
        return payload
        
    except JWTError as e:
        logger.error(f"JWTError decoding access token: {str(e)}")
        raise ValueError(f"Invalid token: {str(e)}")

def decode_refresh_token(token: str) -> dict:
    """
    Decode and verify JWT refresh token
    
    Raises:
        ValueError: If token is invalid, expired, or malformed
    """
    try:
        logger.info(f"Attempting to decode refresh token: {token[:20]}...")
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=["HS256"])
        
        # Verify token type
        if payload.get("type") != "refresh":
            logger.error("Invalid refresh token type")
            raise ValueError("Invalid refresh token type")
        
        # Verify required fields
        if "sub" not in payload:
            logger.error("Refresh token missing user ID")
            raise ValueError("Refresh token missing user ID")
        
        # Check expiration
        exp_timestamp = payload.get("exp")
        if exp_timestamp:
            exp_datetime = datetime.utcfromtimestamp(exp_timestamp)
            if datetime.utcnow() > exp_datetime:
                logger.error(f"Refresh token expired at {exp_datetime}")
                raise ValueError("Refresh token expired")
        
        logger.info(f"Refresh token decoded successfully for user: {payload.get('sub')}")
        return payload
        
    except JWTError as e:
        logger.error(f"JWTError decoding refresh token: {str(e)}")
        raise ValueError(f"Invalid refresh token: {str(e)}")

def get_user_id_from_token(token: str) -> Optional[str]:
    """Extract user ID from access token, return None if invalid"""
    try:
        payload = decode_access_token(token)
        return payload.get("sub")
    except (ValueError, JWTError) as e:
        logger.error(f"Failed to get user ID from token: {str(e)}")
        return None

def get_user_id_from_refresh_token(token: str) -> Optional[str]:
    """Extract user ID from refresh token, return None if invalid"""
    try:
        payload = decode_refresh_token(token)
        return payload.get("sub")
    except (ValueError, JWTError) as e:
        logger.error(f"Failed to get user ID from refresh token: {str(e)}")
        return None