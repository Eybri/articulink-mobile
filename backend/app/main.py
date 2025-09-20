from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
import os

from app.routes import auth
from app.db.database import create_indexes

load_dotenv()

app = FastAPI(
    title="ArticuLink API",
    description="Authentication API for ArticuLink",
    version="1.0.0"
)

# CORS middleware - Add your React Native URLs
origins = os.getenv("ALLOWED_ORIGINS", "").split(",") + [
    "http://localhost:19006",
    "http://192.168.100.11:19006",
    "exp://192.168.100.11:19000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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