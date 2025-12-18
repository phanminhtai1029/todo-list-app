from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Todo-List API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Todo-List Web Application API"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: List[str] = ["http://localhost:8000", "http://127.0.0.1:8000", "http://localhost:5173","http://127.0.0.1:5173"]
    MONGODB_URL: str = "mongodb://127.0.0.1:27017"
    MONGODB_DB_NAME: str = "todolist_db"
    REDIS_HOST: str = "127.0.0.1"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0
    MAX_FILE_SIZE: int = 10485760
    MAX_BOARDS_PER_USER: int = 7
    MAX_CARDS_PER_BOARD: int = 20

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
