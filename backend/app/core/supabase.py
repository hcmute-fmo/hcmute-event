import os
from supabase.client import create_client, Client
from app.core.config import settings
import vecs
from typing import List, Dict, Any

url: str = settings.SUPABASE_URL or ""
anon_key: str = settings.SUPABASE_ANON_KEY or ""
service_key: str = settings.SUPABASE_SERVICE_KEY or ""
if not url or not anon_key or not service_key:
    raise ValueError("SUPABASE_URL, SUPABASE_SERVICE_KEY and SUPABASE_ANON_KEY must be set in environment variables")

supabase_anon: Client = create_client(url, anon_key)
supabase_service: Client = create_client(url, service_key)
