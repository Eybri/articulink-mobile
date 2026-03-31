"""
Supabase Storage utility for uploading/deleting audio files.
Reads config from environment variables:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - SUPABASE_BUCKET
"""

import os
import uuid
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "audio-clips")

_STORAGE_BASE = f"{SUPABASE_URL}/storage/v1" if SUPABASE_URL else ""

_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
}


async def upload_audio(file_bytes: bytes, user_id: str, extension: str = ".wav") -> str:
    """
    Upload audio bytes to Supabase Storage.
    Returns the public URL of the uploaded file.
    Path format: clips/{user_id}/{uuid}{extension}
    """
    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = f"clips/{user_id}/{filename}"

    url = f"{_STORAGE_BASE}/object/{SUPABASE_BUCKET}/{file_path}"
    
    # Map extension to MIME type
    mime_types = {
        ".wav": "audio/wav",
        ".m4a": "audio/x-m4a",
        ".mp3": "audio/mpeg",
        ".mp4": "audio/mp4",
        ".3gp": "audio/3gpp",
        ".caf": "audio/x-caf",
        ".webm": "audio/webm",
        ".aac": "audio/aac",
        ".ogg": "audio/ogg",
    }
    content_type = mime_types.get(extension.lower(), "application/octet-stream")
    
    # If the extension wasn't found, try to guess the content type or default to audio/wav if it's likely audio
    if content_type == "application/octet-stream" and extension:
        content_type = "audio/wav"  # Fallback for unknown audio extensions

    print(f"Uploading {len(file_bytes)} bytes to {url} with Content-Type: {content_type}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            url,
            headers={
                **_HEADERS,
                "Content-Type": content_type,
            },
            content=file_bytes,
        )

    if resp.status_code not in (200, 201):
        logger.error(f"Supabase upload failed ({resp.status_code}): {resp.text}")
        raise Exception(f"Supabase upload failed: {resp.text}")

    # Build public URL
    public_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{file_path}"
    logger.info(f"Uploaded audio to: {public_url}")
    return public_url


async def delete_audio(file_path: str) -> bool:
    """
    Delete an audio file from Supabase Storage.
    file_path should be the path within the bucket (e.g. clips/user_id/file.wav)
    """
    # Extract path from full URL if needed
    prefix = f"/storage/v1/object/public/{SUPABASE_BUCKET}/"
    if prefix in file_path:
        file_path = file_path.split(prefix)[-1]
    elif file_path.startswith("http"):
        # Handle full public URL
        parts = file_path.split(f"{SUPABASE_BUCKET}/")
        if len(parts) > 1:
            file_path = parts[-1]

    url = f"{_STORAGE_BASE}/object/{SUPABASE_BUCKET}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.request(
            "DELETE",
            url,
            headers={**_HEADERS, "Content-Type": "application/json"},
            json={"prefixes": [file_path]},
        )

    if resp.status_code not in (200, 201):
        logger.error(f"Supabase delete failed ({resp.status_code}): {resp.text}")
        return False

    logger.info(f"Deleted audio: {file_path}")
    return True
