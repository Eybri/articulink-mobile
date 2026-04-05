import numpy as np
import av
import torch
import tempfile
import os
import traceback
import asyncio
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from faster_whisper import WhisperModel
from app.utils.authMiddleware import require_auth, get_current_user_id
from app.utils.supabase_storage import upload_audio
from app.models.transcription import create_audio_clip, get_clips_by_user, delete_audio_clip

router = APIRouter(prefix="/api/v1", tags=["Transcription"])

device = "cuda" if torch.cuda.is_available() else "cpu"
# Using float16 for GPU or int8 for CPU to maximize speed
compute_type = "float16" if device == "cuda" else "int8"

print(f"--- Initializing Optimized Whisper Model (Small) on {device} ({compute_type}) ---")
model = WhisperModel("small", device=device, compute_type=compute_type)

@router.post("/transcribe", dependencies=[Depends(require_auth)])
async def transcribe_audio(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    tmp_path = None
    try:
        print(f"--- Processing Transcription (Optimized) ---")
        print(f"Received file: {file.filename}, type: {file.content_type}")
        
        # Save temp WAV
        suffix = os.path.splitext(file.filename)[-1] or ".wav"
        content = await file.read()
        file_size = len(content)
        print(f"File size: {file_size} bytes, suffix: {suffix}")
        
        if file_size == 0:
            return {"error": "empty_file", "detail": "The audio file received was empty."}

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode='wb') as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        # ─── Parallel Execution ───
        # 1. Start audio decoding (supports 3GP, M4A, etc. via 'av')
        transcription_task = asyncio.to_thread(decode_audio_to_numpy, tmp_path)
        
        # Wait for audio to be decoded so we can start Whisper
        audio = await transcription_task
        sr = 16000  # Our decoder always outputs 16kHz
        
        # Clean up temp file as soon as it's loaded into memory
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            tmp_path = None
        
        # 3. Normalize to a standard WAV for the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav", mode='wb') as clean_tmp:
            clean_wav_path = clean_tmp.name
            # Re-save the normalized audio as a standard wav for storage
            import soundfile as sf
            sf.write(clean_wav_path, audio, sr)
        
        with open(clean_wav_path, 'rb') as f:
            clean_content = f.read()

        # 4. Start Whisper transcription and Upload in parallel
        text_result, audio_url = await asyncio.gather(
            asyncio.to_thread(decode_whisper, audio),
            upload_audio(clean_content, user_id, ".wav")
        )
        
        # Clean up both temp files
        for p in [tmp_path, clean_wav_path]:
            if p and os.path.exists(p):
                os.remove(p)
        tmp_path = None
        clean_wav_path = None
        
        text = text_result.strip()
        duration = float(len(audio) / sr)
        print(f"Transcription: {text[:50]}...")
        print(f"Audio URL: {audio_url}, Duration: {duration:.2f}s")

        # 4. Create clip record in MongoDB
        clip_data = {
            "user_id": user_id,
            "audio_url": audio_url,
            "transcript": text,
            "corrected_transcript": text,  # Initial match
            "speech_type": "unknown",     # Based on user example
            "duration_seconds": duration,
            "processing_status": "completed",
            "device_type": "mobile",      # Hardcoded for app context
            "language": "fil" if any(kw in text.lower() for kw in ["tagalog", "filipino", "po", "opo"]) else "en",
        }
        clip_record = await create_audio_clip(clip_data)
        return clip_record

    except Exception as e:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
        print(f"CRITICAL ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )

def decode_audio_to_numpy(path):
    """Robust audio decoding using 'av' (FFmpeg based) for various formats like 3GP, M4A, etc."""
    container = av.open(path)
    stream = container.streams.audio[0]
    resampler = av.AudioResampler(
        format='fltp',   # float32 Planar (Whisper expects float32/16)
        layout='mono',
        rate=16000,      # Whisper requires 16kHz
    )
    
    frames = []
    
    # 1. Decode stream
    for frame in container.decode(stream):
        resampled_frames = resampler.resample(frame)
        if resampled_frames:
            for rf in resampled_frames:
                # Convert resampled frame to a 1D numpy array
                frames.append(rf.to_ndarray().flatten())
    
    # 2. Flush resampler buffer
    final_resampled = resampler.resample(None)
    if final_resampled:
        for rf in final_resampled:
            frames.append(rf.to_ndarray().flatten())

    container.close()
    
    if not frames:
        raise Exception("Could not decode any audio frames from the file.")
    
    # Standardize result as a single float32 numpy array
    return np.concatenate(frames).astype(np.float32)

def decode_whisper(audio_data):
    """Whisper inference - using faster-whisper for 4x-10x speed boost."""
    # beam_size=1 and language="tl" maximize speed for Filipino speech
    segments, info = model.transcribe(
        audio_data, 
        beam_size=1, 
        language="tl", 
        task="transcribe"
    )
    
    # Concatenate segments into one string
    text = " ".join([segment.text for segment in segments])
    return text.strip()

@router.get("/history", dependencies=[Depends(require_auth)])
async def get_history(
    user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 50
):
    """Fetch transcription history for the current user"""
    try:
        clips = await get_clips_by_user(user_id, skip=skip, limit=limit)
        return clips
    except Exception as e:
        print(f"Error fetching history: {e}")
        return {"error": "history_fetch_error", "detail": str(e)}

@router.delete("/history/{clip_id}", dependencies=[Depends(require_auth)])
async def delete_history_item(
    clip_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a specific history item"""
    try:
        # Note: In a real app, verify the clip belongs to the user first
        success = await delete_audio_clip(clip_id)
        if success:
            return {"message": "Deleted successfully"}
        return {"error": "delete_failed", "detail": "Item not found or could not be deleted"}
    except Exception as e:
        print(f"Error deleting history item: {e}")
        return {"error": "delete_error", "detail": str(e)}
