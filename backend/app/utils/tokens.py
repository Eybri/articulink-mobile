from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import uuid

SECRET_KEY = os.getenv("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

def create_access_token(user_id: str) -> str:
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "type": "access"
    }
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

def create_refresh_token(user_id: str) -> tuple[str, str]:
    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    expire = datetime.utcnow() + expires_delta
    jti = str(uuid.uuid4())
    
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "type": "refresh",
        "jti": jti
    }
    
    refresh_token = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return jti, refresh_token

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise ValueError("Invalid token")