import re
import httpx
import mimetypes
from typing import Optional, Tuple
from io import BytesIO


def extract_file_id_from_drive_url(url: str) -> Optional[str]:
    patterns = [
        r'/file/d/([a-zA-Z0-9-_]+)',
        r'[?&]id=([a-zA-Z0-9-_]+)',
        r'/uc\?id=([a-zA-Z0-9-_]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


def get_drive_download_url(file_id: str) -> str:
    return f"https://drive.google.com/uc?export=download&id={file_id}"


async def download_file_from_drive(url: str) -> Tuple[bytes, str, str]:
    file_id = extract_file_id_from_drive_url(url)
    if not file_id:
        raise ValueError("Invalid Google Drive URL format")
    
    download_url = get_drive_download_url(file_id)
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(download_url)
        response.raise_for_status()
        
        content_disposition = response.headers.get('content-disposition', '')
        filename = file_id
        
        if 'filename=' in content_disposition:
            filename_match = re.search(r'filename[^;=\n]*=(([\'"]).*?\2|[^;\n]*)', content_disposition)
            if filename_match:
                filename = filename_match.group(1).strip('"\'')
        
        mime_type = response.headers.get('content-type', 'application/octet-stream')
        if mime_type == 'application/octet-stream' and filename:
            guessed_type, _ = mimetypes.guess_type(filename)
            if guessed_type:
                mime_type = guessed_type
        
        if filename == file_id and mime_type:
            extension = mimetypes.guess_extension(mime_type)
            if extension:
                filename = f"{file_id}{extension}"
        
        return response.content, filename, mime_type 