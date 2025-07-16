import os
from dotenv import load_dotenv
load_dotenv(".env", override=True)

class Settings:
    APP_NAME = os.getenv("APP_NAME", "HCMUTE Event Backend")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    DEBUG = os.getenv("DEBUG", "False") == "True"
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

settings = Settings()