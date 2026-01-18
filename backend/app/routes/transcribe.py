from fastapi import APIRouter, UploadFile, File
import torch
import librosa
import tempfile
import os
from transformers import WhisperProcessor, WhisperForConditionalGeneration

router = APIRouter(prefix="/api/v1", tags=["Transcription"])

device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

processor = WhisperProcessor.from_pretrained("openai/whisper-base")
model = WhisperForConditionalGeneration.from_pretrained(
    "openai/whisper-base",
    torch_dtype=dtype
).to(device)

model.eval()
model.config.forced_decoder_ids = None
model.config.suppress_tokens = []

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Save temp WAV
    suffix = os.path.splitext(file.filename)[-1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    audio, sr = librosa.load(tmp_path, sr=16000, mono=True)
    os.remove(tmp_path)

    inputs = processor(
        audio,
        sampling_rate=16000,
        return_tensors="pt"
    )

    input_features = inputs.input_features.to(device, dtype=dtype)

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

    return {
        "text": text.strip()
    }
