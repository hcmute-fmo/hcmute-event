from app.core.deepface import process_faces_image
from app.core.supabase import supabase_anon, supabase_service
from app.schemas.sche_user import *
import json
import uuid
import requests
import numpy as np
import cv2
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import threading
import time

class UserService:
    def __init__(self):
        pass

    def face_register(self, request: UserFaceRegisterRequest) -> UserFaceRegisterResponse:
        try:
            user = supabase_anon.table('users').select('id').eq('id', request.user_id).execute()
            if not user.data:
                raise ValueError("User not found")
            user_id = user.data[0]['id']
            user_in_user_faces = supabase_service.table('user_faces').select('id').eq('user_id', user_id).execute()
            if user_in_user_faces.data:
                raise ValueError("User already has a face")
            face_data = process_faces_image(request.avatar_image_url, include_embedding=True, single_face_only=True)
            response = supabase_service.table('user_faces').insert({
                'user_id': user_id,
                'face_embedding': face_data["embedding"] if isinstance(face_data, dict) and "embedding" in face_data else []
            }).execute()
            if response.data:
                return UserFaceRegisterResponse(status=True)
            else:
                raise ValueError("Failed to save face to database")
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Error saving face: {str(e)}")
   
    def face_update(self, request: UserFaceUpdateRequest ) -> UserFaceUpdateResponse:
        try:
            user = supabase_anon.table('users').select('id').eq('id', request.user_id).execute()
            if not user.data:
                raise ValueError("User not found")
            user_id = user.data[0]['id']
            user_in_user_faces = supabase_service.table('user_faces').select('id').eq('user_id', user_id).execute()
            if not user_in_user_faces.data:
                raise ValueError("User does not have a face")
            face_data = process_faces_image(request.avatar_image_url, include_embedding=True, single_face_only=True)
            response = supabase_service.table('user_faces').update({
                'face_embedding': face_data["embedding"] if isinstance(face_data, dict) and "embedding" in face_data else []
            }).eq('id', user_in_user_faces.data[0]['id']).execute()
            if response.data:
                return UserFaceUpdateResponse(status=True)
            else:
                raise ValueError("Failed to update face in database")
        except ValueError:
            raise ValueError("User not found")
    
    def face_delete(self, request: UserFaceDeleteRequest) -> UserFaceDeleteResponse:
        try:
            status_list = []
            for user_id in request.user_ids:
                user_in_user_faces = supabase_service.table('user_faces').select('id').eq('user_id', user_id).execute()
                if not user_in_user_faces.data:
                    status_list.append({
                        "user_id": user_id,
                        "status": False,
                        "error": "User does not have a face"
                    })
                    continue
                response = supabase_service.table('user_faces').delete().eq('id', user_in_user_faces.data[0]['id']).execute()
                if response.data:
                    status_list.append({
                        "user_id": user_id,
                        "status": True
                    })
                else:
                    status_list.append({
                        "user_id": user_id,
                        "status": False,
                        "error": "Failed to delete face"
                    })
            return UserFaceDeleteResponse(status=status_list)
        except Exception as e:
            raise ValueError(f"Error deleting face: {str(e)}")

    def batch_face_register_background(self, request: BatchFaceRegisterRequest) -> str:
        task_id = str(uuid.uuid4())
        
        task_data = {
            "task_id": task_id,
            "status": "processing",
            "progress": 0,
            "total_items": len(request.users),
            "completed_items": 0,
            "failed_items": 0,
            "results": [],
            "error_message": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        try:
            supabase_service.table('background_tasks').insert(task_data).execute()
        except Exception:
            pass
        
        thread = threading.Thread(
            target=self._process_batch_face_register,
            args=(task_id, request.users)
        )
        thread.daemon = True
        thread.start()
        
        return task_id

    def _process_batch_face_register(self, task_id: str, users: List[UserFaceRegisterRequest]):
        try:
            for i, user_request in enumerate(users):
                try:
                    user = supabase_anon.table('users').select('id').eq('id', user_request.user_id).execute()
                    if not user.data:
                        self._update_task_result(task_id, user_request.user_id, False, "User not found")
                        continue
                    
                    user_id = user.data[0]['id']
                    
                    user_in_user_faces = supabase_service.table('user_faces').select('id').eq('user_id', user_id).execute()
                    if user_in_user_faces.data:
                        self._update_task_result(task_id, user_request.user_id, False, "User already has a face")
                        continue
                    
                    face_data = process_faces_image(user_request.avatar_image_url, include_embedding=True, single_face_only=True)
                    
                    response = supabase_service.table('user_faces').insert({
                        'user_id': user_id,
                        'face_embedding': face_data["embedding"] if isinstance(face_data, dict) and "embedding" in face_data else []
                    }).execute()
                    
                    if response.data:
                        self._update_task_result(task_id, user_request.user_id, True)
                    else:
                        self._update_task_result(task_id, user_request.user_id, False, "Failed to save face to database")
                        
                except Exception as e:
                    self._update_task_result(task_id, user_request.user_id, False, str(e))
                
                self._update_task_progress(task_id, i + 1, len(users))
            
            self._update_task_status(task_id, "completed")
            
        except Exception as e:
            self._update_task_status(task_id, "failed", str(e))

    def batch_face_delete_background(self, request: BatchFaceDeleteRequest) -> str:
        task_id = str(uuid.uuid4())
        
        task_data = {
            "task_id": task_id,
            "status": "processing",
            "progress": 0,
            "total_items": len(request.user_ids),
            "completed_items": 0,
            "failed_items": 0,
            "results": [],
            "error_message": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        try:
            supabase_service.table('background_tasks').insert(task_data).execute()
        except Exception:
            pass
        
        thread = threading.Thread(
            target=self._process_batch_face_delete,
            args=(task_id, request.user_ids)
        )
        thread.daemon = True
        thread.start()
        
        return task_id

    def _process_batch_face_delete(self, task_id: str, user_ids: List[str]):
        try:
            for i, user_id in enumerate(user_ids):
                try:
                    user_in_user_faces = supabase_service.table('user_faces').select('id').eq('user_id', user_id).execute()
                    if not user_in_user_faces.data:
                        self._update_task_result(task_id, user_id, False, "User does not have a face")
                        continue
                    
                    response = supabase_service.table('user_faces').delete().eq('id', user_in_user_faces.data[0]['id']).execute()
                    
                    if response.data:
                        self._update_task_result(task_id, user_id, True)
                    else:
                        self._update_task_result(task_id, user_id, False, "Failed to delete face")
                        
                except Exception as e:
                    self._update_task_result(task_id, user_id, False, str(e))
                
                self._update_task_progress(task_id, i + 1, len(user_ids))
            
            self._update_task_status(task_id, "completed")
            
        except Exception as e:
            self._update_task_status(task_id, "failed", str(e))

    def _update_task_result(self, task_id: str, user_id: str, status: bool, error: Optional[str] = None):
        try:
            task = supabase_service.table('background_tasks').select('*').eq('task_id', task_id).execute()
            if task.data:
                current_task = task.data[0]
                results = current_task.get('results', [])
                results.append({
                    "user_id": user_id,
                    "status": status,
                    "error": error
                })
                
                update_data = {
                    "results": results,
                    "completed_items": current_task.get('completed_items', 0) + (1 if status else 0),
                    "failed_items": current_task.get('failed_items', 0) + (0 if status else 1),
                    "updated_at": datetime.now().isoformat()
                }
                
                supabase_service.table('background_tasks').update(update_data).eq('task_id', task_id).execute()
        except Exception:
            pass

    def _update_task_progress(self, task_id: str, completed: int, total: int):
        try:
            progress = int((completed / total) * 100)
            supabase_service.table('background_tasks').update({
                "progress": progress,
                "updated_at": datetime.now().isoformat()
            }).eq('task_id', task_id).execute()
        except Exception:
            pass

    def _update_task_status(self, task_id: str, status: str, error_message: Optional[str] = None):
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.now().isoformat()
            }
            if error_message is not None:
                update_data["error_message"] = error_message
            
            supabase_service.table('background_tasks').update(update_data).eq('task_id', task_id).execute()
        except Exception:
            pass

    def get_background_task_status(self, task_id: str) -> BackgroundTaskStatus:
        try:
            task = supabase_service.table('background_tasks').select('*').eq('task_id', task_id).execute()
            if not task.data:
                raise ValueError("Task not found")
            
            task_data = task.data[0]
            return BackgroundTaskStatus(**task_data)
        except Exception:
            raise ValueError("Task not found")

    def face_search(self, request: UserFaceSearchRequest) -> UserFaceSearchResponse:
        try:
            face_data = process_faces_image(request.image_url, include_embedding=True, single_face_only=False)
            
            results = []
            for face in face_data:
                if isinstance(face, dict) and 'embedding' in face:
                    embedding = face['embedding']
                    
                    response = supabase_service.rpc('match_user_faces', {
                        'query_embedding': embedding,
                        'match_threshold': 0.6,
                        'match_count': 10
                    }).execute()
                    
                    if response.data:
                        for match in response.data:
                            bounding_box = []
                            if 'facial_area' in face and isinstance(face['facial_area'], dict):
                                facial_area = face['facial_area']
                                if facial_area.get('x') is not None and facial_area.get('w') is not None and facial_area.get('h') is not None:
                                    x = facial_area.get('x', 0)
                                    y = facial_area.get('y', 0)
                                    w = facial_area.get('w', 0)
                                    h = facial_area.get('h', 0)
                                    bounding_box = [
                                        {"x": x, "y": y},
                                        {"x": x + w, "y": y},
                                        {"x": x + w, "y": y + h},
                                        {"x": x, "y": y + h}
                                    ]
                            
                            results.append(UserFaceRecognitionResult(
                                user_id=match['user_id'],
                                confidence=match['similarity'],
                                bounding_box=bounding_box
                            ))
            
            return UserFaceSearchResponse(results=results)
        except Exception as e:
            raise ValueError(f"Error searching for face: {str(e)}")

    def face_tagging_background(self, request: FaceTaggingRequest) -> str:
        task_id = str(uuid.uuid4())
        
        task_data = {
            "task_id": task_id,
            "status": "processing",
            "progress": 0,
            "total_items": 1,
            "completed_items": 0,
            "failed_items": 0,
            "results": [],
            "error_message": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        try:
            supabase_service.table('background_tasks').insert(task_data).execute()
        except Exception:
            pass
        
        thread = threading.Thread(
            target=self._process_face_tagging,
            args=(task_id, request)
        )
        thread.daemon = True
        thread.start()
        
        return task_id

    def _process_face_tagging(self, task_id: str, request: FaceTaggingRequest):
        start_time = time.time()
        try:
            # Fetch image URL from database using image_id
            image_response = supabase_service.table('event_images').select('raw_image_url').eq('id', request.image_id).execute()
            if not image_response.data:
                raise ValueError(f"Image with ID {request.image_id} not found")
            
            image_url = image_response.data[0]['raw_image_url']
            
            face_data = process_faces_image(image_url, include_embedding=True, single_face_only=False)
            
            recognized_users = []
            detected_faces = 0
            
            for face in face_data:
                if isinstance(face, dict) and 'embedding' in face:
                    detected_faces += 1
                    embedding = face['embedding']
                    
                    response = supabase_service.rpc('match_user_faces', {
                        'query_embedding': embedding,
                        'match_threshold': 0.6,
                        'match_count': 1
                    }).execute()
                    
                    if response.data and len(response.data) > 0:
                        match = response.data[0]
                        if match['similarity'] >= 0.6:
                            recognized_users.append({
                                "user_id": match['user_id'],
                                "similarity": match['similarity']
                            })
            
            processing_time = time.time() - start_time
            
            metadata = {
                "detected_faces": detected_faces,
                "recognized_users": recognized_users,
                "processing_time": processing_time,
                "face_tagging_task_id": task_id
            }
            
            supabase_service.table('event_images').update({
                "metadata": metadata,
                "updated_at": datetime.now().isoformat()
            }).eq('id', request.image_id).execute()
            
            self._update_task_result(task_id, str(request.image_id), True, f"Processed {detected_faces} faces, found {len(recognized_users)} users")
            self._update_task_progress(task_id, 1, 1)
            self._update_task_status(task_id, "completed")
            
        except Exception as e:
            processing_time = time.time() - start_time
            self._update_task_result(task_id, str(request.image_id), False, str(e))
            self._update_task_status(task_id, "failed", str(e))