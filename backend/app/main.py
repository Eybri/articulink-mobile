from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
import os

import cloudinary
import cloudinary.uploader
import cloudinary.api

from app.routes import auth
from app.db.database import create_indexes

load_dotenv()

app = FastAPI(
    title="ArticuLink",
)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)
# CORS middleware - Add your React Native URLs
origins = os.getenv("ALLOWED_ORIGINS", "").split(",") + [
    "http://localhost:19006",
    "http://192.168.100.11:19006",
    "exp://192.168.100.11:19000"
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(auth.router)

@app.on_event("startup")
async def startup_event():
    await create_indexes()

@app.get("/")
async def root():
    return {"message": "ArticuLink API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ArticuLink API"}