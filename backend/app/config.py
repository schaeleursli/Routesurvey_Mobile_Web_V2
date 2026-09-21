from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    database_url: str = Field(
        default="postgresql+asyncpg://postgres:supabase_password@localhost:54322/postgres"
    )
    environment: str = "development"
    debug: bool = True
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    routesurvey_jwt_secret: str = "change-me-in-env"
    routesurvey_jwt_algorithm: str = "HS256"
    crm_admin_roles: list[str] = ["Admin", "admin"]
    crm_admin_subjects: list[str] = []

    project_name: str = "RouteSurvey CRM API"
    version: str = "0.1.0"

    def validate_security(self) -> None:
        if self.environment.lower() == "production" and self.routesurvey_jwt_secret == "change-me-in-env":
            raise RuntimeError("ROUTESURVEY_JWT_SECRET must be configured in production")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_security()
    return settings
