import uuid
from typing import Optional
from app.core.supabase import supabase_service
import os


def generate_unique_filename(original_filename: str) -> str:
    file_extension = os.path.splitext(original_filename)[1]
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{file_extension}"


async def upload_file_to_supabase(
    file_content: bytes, 
    filename: str, 
    bucket_name: str = "images",
    mime_type: str = "application/octet-stream"
) -> str:
    unique_filename = generate_unique_filename(filename)
    
    try:
        result = supabase_service.storage.from_(bucket_name).upload(
            file=file_content,
            path=unique_filename
        )
        
        public_url_response = supabase_service.storage.from_(bucket_name).get_public_url(unique_filename)
        
        return public_url_response
        
    except Exception as e:
        raise Exception(f"Failed to upload file to Supabase: {str(e)}")


def get_public_url_from_supabase(bucket_name: str, file_path: str) -> str:
    return supabase_service.storage.from_(bucket_name).get_public_url(file_path) 