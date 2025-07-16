from fastapi import APIRouter, HTTPException, Query, Path, Depends, BackgroundTasks
from typing import List, Optional
from app.services.srv_users import UserService
from app.core.supabase import supabase_anon, supabase_service
from app.schemas.sche_user import *

router = APIRouter()
def get_user_service() -> UserService:
    return UserService()

@router.post("/search")
def face_search(request: UserFaceSearchRequest, service: UserService = Depends(
    get_user_service
)):
    try:
        return service.face_search(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@router.post("/register")
def face_register(request: UserFaceRegisterRequest, service: UserService = Depends(
    get_user_service
)):
    try:
        return service.face_register(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/update")
def face_update(request: UserFaceUpdateRequest, service: UserService = Depends(
    get_user_service
)):
    try:
        return service.face_update(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/delete")
def face_delete(request: UserFaceDeleteRequest, service: UserService = Depends(
    get_user_service
)):
    try:
        return service.face_delete(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# New batch operations endpoints
@router.post("/batch-register")
def batch_face_register(request: BatchFaceRegisterRequest, service: UserService = Depends(
    get_user_service
)):
    """Register multiple faces in background"""
    try:
        task_id = service.batch_face_register_background(request)
        return BatchFaceRegisterResponse(
            task_id=task_id,
            message="Batch face registration started in background",
            total_users=len(request.users)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/batch-delete")
def batch_face_delete(request: BatchFaceDeleteRequest, service: UserService = Depends(
    get_user_service
)):
    """Delete multiple faces in background"""
    try:
        task_id = service.batch_face_delete_background(request)
        return BatchFaceDeleteResponse(
            task_id=task_id,
            message="Batch face deletion started in background",
            total_users=len(request.user_ids)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/batch-update")
def batch_face_update(request: BatchFaceUpdateRequest, service: UserService = Depends(
    get_user_service
)):
    """Update multiple faces in background"""
    try:
        task_id = service.batch_face_update_background(request)
        return BatchFaceUpdateResponse(
            task_id=task_id,
            message="Batch face update started in background",
            total_users=len(request.users)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/task-status/{task_id}")
def get_task_status(task_id: str, service: UserService = Depends(
    get_user_service
)):
    """Get status of a background task"""
    try:
        return service.get_background_task_status(task_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/face-tagging")
def face_tagging(request: FaceTaggingRequest, service: UserService = Depends(
    get_user_service
)):
    try:
        task_id = service.face_tagging_background(request)
        return FaceTaggingResponse(
            task_id=task_id,
            message="Face tagging started in background",
            image_id=request.image_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
