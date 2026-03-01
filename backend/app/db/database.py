from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "articulink"

# Configure connection pooling
client = AsyncIOMotorClient(
    MONGO_URI,
    maxPoolSize=100,  # Increase connection pool
    minPoolSize=10,
    maxIdleTimeMS=30000,
    socketTimeoutMS=5000,
    connectTimeoutMS=5000,
    serverSelectionTimeoutMS=5000
)
db = client[DB_NAME]

async def create_indexes():
    # Create unique index on email
    await db.users.create_index("email", unique=True)
    # Create index on refresh_jti for faster queries
    await db.users.create_index("refresh_jti")