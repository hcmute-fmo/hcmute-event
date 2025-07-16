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


# def save_face_background(request: UserFaceCreateRequest, service: UserService):
#     try:
#         service.save_face(request)
#     except Exception as e:
#         print(f"Background face saving failed: {str(e)}")

# def auto_tag_users_background(request: AutoTagUsersRequest, service: UserService):
#     try:
#         service.auto_tag_users(request)
#     except Exception as e:
#         print(f"Background auto-tagging users failed: {str(e)}")

# @router.post("/save")
# def save_face(request: UserFaceCreateRequest, background_tasks: BackgroundTasks, service: UserService = Depends(get_user_service)):
#     try:
#         background_tasks.add_task(save_face_background, request, service)
#         return {"message": "Face saving started in background", "user_id": request.user_id}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# @router.post("/auto-tag-users")
# def auto_tag_users(request: AutoTagUsersRequest, background_tasks: BackgroundTasks, service: UserService = Depends(get_user_service)):
#     try:
#         background_tasks.add_task(auto_tag_users_background, request, service)
#         return {"message": "Auto-tagging users started in background", "event_id": request.event_id, "image_url": request.image_url}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# @router.get("/auto-tag-results/{event_id}")
# def get_auto_tag_results(event_id: int, image_url: str = Query(..., description="Image URL to get results for")):
#     try:
#         response = supabase.table('event_images').select('metadata').eq('event_id', event_id).eq('raw_image_url', image_url).execute()
        
#         if not response.data:
#             raise HTTPException(status_code=404, detail="No results found for this event and image")
        
#         metadata = response.data[0].get('metadata', {})
        
#         if not metadata.get('face_search_completed'):
#             return {"message": "Auto-tagging is still in progress", "status": "processing"}
        
#         return {
#             "status": "completed",
#             "user_ids": metadata.get('user_ids', []),
#             "bounding_boxes_scores": metadata.get('bounding_boxes_scores', []),
#             "total_faces_detected": metadata.get('total_faces_detected', 0),
#             "timestamp": metadata.get('timestamp')
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# @router.post("/delete")
# def delete_face(request: DeleteFaceRequest, service: UserService = Depends(get_user_service)):
#     try:
#         return service.delete_face(request)
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# @router.post("/update")
# def update_face(request: UpdateFaceRequest, service: UserService = Depends(get_user_service)):
#     try:
#         return service.update_face(request)
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# @router.post("/bounding-boxes")
# def get_face_bounding_boxes(request: FaceBoundingBoxRequest, service: UserService = Depends(get_user_service)):
#     try:
#         return service.get_face_bounding_boxes(request)
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

