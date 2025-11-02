from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils import tokens
from app.models.user import get_user_by_id
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True, optional: bool = False):
        super().__init__(auto_error=auto_error)
        self.optional = optional

    async def __call__(self, request: Request):
        try:
            credentials: HTTPAuthorizationCredentials = await super().__call__(request)
            if credentials:
                if credentials.scheme != "Bearer":
                    if self.optional:
                        request.state.user_id = None
                        return None
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Invalid authentication scheme."
                    )
                
                logger.info(f"Verifying token for request: {request.url}")
                
                # Verify token
                payload = tokens.decode_access_token(credentials.credentials)
                if payload.get("type") != "access":
                    if self.optional:
                        request.state.user_id = None
                        return None
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Invalid token type"
                    )
                
                user_id = payload.get("sub")
                
                # Verify user exists and is active
                user = await get_user_by_id(user_id)
                if not user:
                    logger.error(f"User {user_id} not found in database")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found"
                    )
                
                # Check if user is deactivated
                if user.get("status") == "inactive":
                    deactivation_type = user.get("deactivation_type")
                    deactivation_end_date = user.get("deactivation_end_date")
                    
                    # Check for temporary deactivation that should be auto-reactivated
                    if deactivation_type == "temporary" and deactivation_end_date:
                        if datetime.now() > deactivation_end_date:
                            # Auto-reactivate user
                            from app.models.user import update_user
                            await update_user(user_id, {
                                "status": "active",
                                "deactivation_type": None,
                                "deactivation_reason": None,
                                "deactivation_end_date": None
                            })
                            logger.info(f"Auto-reactivated user {user_id}")
                        else:
                            # User is still temporarily deactivated
                            remaining_time = deactivation_end_date - datetime.now()
                            days_remaining = remaining_time.days
                            raise HTTPException(
                                status_code=status.HTTP_403_FORBIDDEN,
                                detail=f"Account temporarily deactivated. {f'Available in {days_remaining} days' if days_remaining > 0 else 'Available soon'}."
                            )
                    else:
                        # Permanent deactivation or no end date
                        reason = user.get("deactivation_reason", "No reason provided")
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail=f"Account deactivated: {reason}"
                        )
                
                request.state.user_id = user_id
                logger.info(f"Authentication successful for user: {user_id}")
                return user_id
                
        except HTTPException as e:
            logger.error(f"HTTPException in auth: {e.detail}")
            if self.optional:
                request.state.user_id = None
                return None
            raise e
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            if self.optional:
                request.state.user_id = None
                return None
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

# Create auth dependencies
def get_current_user_id(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        logger.warning("No user_id found in request state")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return user_id

# Optional authentication for endpoints that work with or without auth
optional_auth = JWTBearer(auto_error=False, optional=True)
require_auth = JWTBearer()