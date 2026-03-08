from fastapi import APIRouter, Depends, Request, HTTPException, status, Query
import logging

from app.utils.authMiddleware import require_auth, get_current_user_id
from app.utils.supabase_storage import delete_audio
from app.models.transcription import (
    get_audio_clip_by_id,
    get_clips_by_user,
    count_clips_by_user,
    delete_audio_clip,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Audio Clips"])


@router.get("/clips", dependencies=[Depends(require_auth)])
async def list_clips(
    request: Request,
    user_id: str = Depends(get_current_user_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    """List the current user's audio clips (newest first)."""
    clips = await get_clips_by_user(user_id, skip=skip, limit=limit)
    total = await count_clips_by_user(user_id)
    return {"clips": clips, "total": total, "skip": skip, "limit": limit}


@router.get("/clips/{clip_id}", dependencies=[Depends(require_auth)])
async def get_clip(
    clip_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a single audio clip by ID (must belong to the current user)."""
    clip = await get_audio_clip_by_id(clip_id)
    if not clip or clip["user_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clip not found")
    return clip


@router.delete("/clips/{clip_id}", dependencies=[Depends(require_auth)])
async def remove_clip(
    clip_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete an audio clip and its file from Supabase Storage."""
    clip = await get_audio_clip_by_id(clip_id)
    if not clip or clip["user_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clip not found")

    # Remove from Supabase
    if clip.get("audio_url"):
        try:
            await delete_audio(clip["audio_url"])
        except Exception as e:
            logger.error(f"Failed to delete audio from Supabase: {e}")

    # Remove from MongoDB
    deleted = await delete_audio_clip(clip_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete clip")

    return {"message": "Clip deleted", "clip_id": clip_id}
