from fastapi import APIRouter, UploadFile, File
import torch
import librosa
import tempfile
import os
import traceback
from transformers import WhisperProcessor, WhisperForConditionalGeneration

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

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        print(f"--- Processing Transcription ---")
        print(f"Received file: {file.filename}, type: {file.content_type}")
        
        # Save temp WAV
        suffix = os.path.splitext(file.filename)[-1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode='wb') as tmp:
            content = await file.read()
            print(f"File size: {len(content)} bytes")
            tmp.write(content)
            tmp_path = tmp.name

        print(f"Temp file at: {tmp_path}")
        
        try:
            print(f"Loading librosa...")
            audio, sr = librosa.load(tmp_path, sr=16000, mono=True)
            print(f"Librosa loaded audio. Shape: {audio.shape}, SR: {sr}")
            os.remove(tmp_path)
        except Exception as e:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            print(f"LIBROSA ERROR: {str(e)}")
            print(traceback.format_exc())
            return {"error": "librosa_failed", "detail": str(e), "traceback": traceback.format_exc()}

        print(f"Processing with Whisper...")
        inputs = processor(
            audio,
            sampling_rate=16000,
            return_tensors="pt"
        )

        input_features = inputs.input_features.to(device, dtype=dtype)

        print(f"Generating output...")
        with torch.no_grad():
            predicted_ids = model.generate(
                input_features,
                task="transcribe",
                max_new_tokens=128,        # limits rambling
                do_sample=False,           # deterministic
                num_beams=1                # faster than beam search
            )

        text = processor.batch_decode(
            predicted_ids,
            skip_special_tokens=True
        )[0]

        print(f"Transcription complete: {text[:50]}...")
        return {
            "text": text.strip()
        }
    except Exception as e:
        print(f"GENERAL ERROR: {str(e)}")
        print(traceback.format_exc())
        return {"error": "transcription_error", "detail": str(e), "traceback": traceback.format_exc()}
