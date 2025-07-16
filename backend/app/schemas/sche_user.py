from pydantic import BaseModel  
from typing import Optional, List
from datetime import datetime
from fastapi import UploadFile

class User(BaseModel):
    id: str
    full_name: str
    email: str
    position: str
    avatar_image_url: str
    metadata: dict

class UserFaceRegisterRequest(BaseModel):
    user_id: str
    avatar_image_url: str

class UserFaceUpdateRequest(BaseModel):
    user_id: str
    avatar_image_url: str

class UserFaceDeleteRequest(BaseModel):
    user_ids: List[str]

class UserFaceCreateRequest(BaseModel):
    user_id: str
    avatar_image_url: str

class UserFaceCreateResponse(BaseModel):
    status: bool

class UserFaceDeleteResponse(BaseModel):
    status: List[dict]

class UserFaceUpdateResponse(BaseModel):
    status: bool
    
class UserFaceRegisterResponse(BaseModel):
    status: bool

# New schemas for batch operations
class BatchFaceRegisterRequest(BaseModel):
    users: List[UserFaceRegisterRequest]

class BatchFaceDeleteRequest(BaseModel):
    user_ids: List[str]

class BatchFaceRegisterResponse(BaseModel):
    task_id: str
    message: str
    total_users: int

class BatchFaceDeleteResponse(BaseModel):
    task_id: str
    message: str
    total_users: int

class BackgroundTaskStatus(BaseModel):
    task_id: str
    status: str  # "processing", "completed", "failed"
    progress: int  # percentage (0-100)
    total_items: int
    completed_items: int
    failed_items: int
    results: Optional[List[dict]] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class UserFaceSearchRequest(BaseModel):
    image_url: str

class UserFaceRecognitionResult(BaseModel):
    user_id: str
    confidence: float
    bounding_box: List[dict]

class UserFaceSearchResponse(BaseModel):
    results: List[UserFaceRecognitionResult]

class FaceTaggingRequest(BaseModel):
    image_id: int

class FaceTaggingResponse(BaseModel):
    task_id: str
    message: str
    image_id: int

class FaceTaggingResult(BaseModel):
    image_id: int
    detected_faces: int
    recognized_users: List[str]
    processing_time: float
    status: str 
    