from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    FIRST_ADMIN_EMAIL: str = "admin@library.com"
    FIRST_ADMIN_PASSWORD: str = "Admin@123"
    FIRST_ADMIN_NAME: str = "Administrator"

    class Config:
        env_file = ".env"


settings = Settings()
