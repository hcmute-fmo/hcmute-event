from pydantic import BaseModel, HttpUrl
from typing import Optional


class DriveUrlRequest(BaseModel):
    drive_url: str


class UploadResponse(BaseModel):
    success: bool
    public_url: str
    filename: str
    mime_type: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: str 