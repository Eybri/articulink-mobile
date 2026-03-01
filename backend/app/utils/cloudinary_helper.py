# app/utils/cloudinary_helper.py
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)

# Allowed image types
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

async def validate_image(file: UploadFile, contents: bytes) -> None:
    """Validate uploaded image file"""
    # Check file extension
    if file.filename:
        extension = file.filename.split(".")[-1].lower()
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
    
    # Check file size using the actual content length
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )

async def upload_profile_picture(
    file: UploadFile, 
    user_id: str,
    old_public_id: Optional[str] = None
) -> Dict[str, str]:
    """
    Upload profile picture to Cloudinary
    
    Args:
        file: The uploaded file
        user_id: User ID for organizing uploads
        old_public_id: Previous image public_id to delete (if exists)
    
    Returns:
        Dict containing secure_url and public_id
    """
    try:
        logger.info(f"Starting upload for user {user_id}, filename: {file.filename}")
        
        # Read file content first
        contents = await file.read()
        logger.info(f"File read successfully, size: {len(contents)} bytes")
        
        # Validate image with contents
        await validate_image(file, contents)
        logger.info("Image validation passed")
        
        # Delete old image if exists
        if old_public_id:
            try:
                cloudinary.uploader.destroy(old_public_id)
                logger.info(f"Deleted old profile picture: {old_public_id}")
            except Exception as e:
                logger.warning(f"Failed to delete old image: {e}")
        
        # Upload to Cloudinary
        logger.info("Uploading to Cloudinary...")
        upload_result = cloudinary.uploader.upload(
            contents,
            folder=f"articuLink/profiles/{user_id}",
            transformation=[
                {"width": 500, "height": 500, "crop": "fill", "gravity": "face"},
                {"quality": "auto:good"},
                {"fetch_format": "auto"}
            ],
            resource_type="image"
        )
        
        logger.info(f"Successfully uploaded profile picture for user {user_id}")
        logger.info(f"Cloudinary URL: {upload_result['secure_url']}")
        
        return {
            "secure_url": upload_result["secure_url"],
            "public_id": upload_result["public_id"]
        }
        
    except HTTPException as he:
        logger.error(f"Validation error: {he.detail}")
        raise
    except Exception as e:
        logger.error(f"Cloudinary upload error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )

async def delete_profile_picture(public_id: str) -> bool:
    """Delete profile picture from Cloudinary"""
    try:
        result = cloudinary.uploader.destroy(public_id)
        logger.info(f"Delete result for {public_id}: {result}")
        return result.get("result") == "ok"
    except Exception as e:
        logger.error(f"Failed to delete image: {e}")
        return False

def extract_public_id_from_url(url: str) -> str | None:
    """
    Extract Cloudinary public_id from URL
    Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    """
    try:
        url_parts = url.split("/upload/")
        if len(url_parts) > 1:
            path_parts = url_parts[1].split("/", 1)
            if len(path_parts) > 1:
                public_id = path_parts[1].rsplit(".", 1)[0]
                logger.info(f"Extracted public_id: {public_id}")
                return public_id
    except Exception as e:
        logger.error(f"Failed to extract public_id from URL: {str(e)}")
    return None