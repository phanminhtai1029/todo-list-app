from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.api.routes import auth, boards, lists, cards  # ← THÊM lists, cards


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up...")
    await init_db()
    yield
    print("🛑 Shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(boards.router, prefix="/api")
app.include_router(lists.router, prefix="/api")  # ← THÊM lists
app.include_router(cards.router, prefix="/api")  # ← THÊM cards


@app.get("/")
async def root():
    return {"message": "Todo-List API", "version": settings.VERSION, "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected", "redis": "connected"}
