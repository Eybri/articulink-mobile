from fastapi import APIRouter, UploadFile, File, Depends
import torch
import librosa
import soundfile as sf
import tempfile
import os
import traceback
import asyncio
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from app.utils.authMiddleware import require_auth, get_current_user_id
from app.utils.supabase_storage import upload_audio
from app.models.transcription import create_audio_clip

router = APIRouter(prefix="/api/v1", tags=["Transcription"])

device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

processor = WhisperProcessor.from_pretrained("openai/whisper-small")
model = WhisperForConditionalGeneration.from_pretrained(
    "openai/whisper-small",
    torch_dtype=dtype
).to(device)

model.eval()
# Use generation_config instead of model.config for generation settings
model.generation_config.forced_decoder_ids = None
model.generation_config.suppress_tokens = []

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
        # 1. Start upload task (I/O bound)
        upload_task = upload_audio(content, user_id, suffix)
        
        # 2. Start audio loading (can be slow, run in thread)
        transcription_task = asyncio.to_thread(librosa.load, tmp_path, sr=16000, mono=True)
        
        # Wait for audio to be loaded so we can start Whisper
        audio, sr = await transcription_task
        
        # Clean up temp file as soon as it's loaded into memory
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            tmp_path = None
        
        # 3. Normalize to a standard WAV for the upload (Ensures playability everywhere)
        # We use a second temp file for the clean wav export
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav", mode='wb') as clean_tmp:
            clean_wav_path = clean_tmp.name
            # Re-save the normalized audio we loaded (16kHz, float) as a standard wav
            sf.write(clean_wav_path, audio, sr)
        
        with open(clean_wav_path, 'rb') as f:
            clean_content = f.read()

        # 4. Start Whisper transcription (Compute bound) and Upload in parallel
        # We upload the normalized clean_content (always .wav) instead of raw bytes
        text_result, audio_url = await asyncio.gather(
            asyncio.to_thread(run_transcription_sync, audio, sr),
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
        print(f"GENERAL ERROR: {str(e)}")
        print(traceback.format_exc())
        return {"error": "transcription_error", "detail": str(e)}

def run_transcription_sync(audio, sr):
    """Whisper inference - should be run in a separate thread to avoid blocking the event loop."""
    inputs = processor(audio, sampling_rate=sr, return_tensors="pt")
    input_features = inputs.input_features.to(device, dtype=dtype)
    with torch.no_grad():
        predicted_ids = model.generate(
            input_features,
            task="transcribe",
            max_new_tokens=128,
            do_sample=False,
            num_beams=1
        )
    return processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
