from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.board import Board
from app.models.list import List
from app.models.card import Card


async def init_db():
    """Initialize database connection and Beanie ODM."""
    client = AsyncIOMotorClient(settings.MONGODB_URL)

    # Initialize Beanie with ALL models
    await init_beanie(
        database=client[settings.MONGODB_DB_NAME],
        document_models=[User, Board, List, Card]  # ← THÊM List, Card
    )

    print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
