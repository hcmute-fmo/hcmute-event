from fastapi import APIRouter, HTTPException
from app.schemas.sche_images import DriveUrlRequest, UploadResponse, ErrorResponse
from app.utils.drive_utils import download_file_from_drive
from app.utils.storage_utils import upload_file_to_supabase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/process-drive-url", response_model=UploadResponse)
async def process_drive_url(request: DriveUrlRequest):
    try:
        logger.info(f"Processing Google Drive URL: {request.drive_url}")
        
        file_content, filename, mime_type = await download_file_from_drive(request.drive_url)
        
        logger.info(f"Downloaded file: {filename} ({mime_type}) - {len(file_content)} bytes")
        
        public_url = await upload_file_to_supabase(
            file_content=file_content,
            filename=filename,
            bucket_name="images",
            mime_type=mime_type
        )
        
        logger.info(f"Successfully uploaded to Supabase: {public_url}")
        
        return UploadResponse(
            success=True,
            public_url=public_url,
            filename=filename,
            mime_type=mime_type,
            message="File successfully processed and uploaded to Supabase"
        )
        
    except ValueError as e:
        logger.error(f"Invalid input: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Error processing drive URL: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process Google Drive URL: {str(e)}"
        )

