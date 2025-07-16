from deepface import DeepFace
import json
import os
from pathlib import Path
import cv2
import requests
import numpy as np
import uuid
from typing import List, Dict, Any, Union, Optional

EMBEDDING_MODEL: str = "Facenet512"
DETECTOR_BACKEND: str = "fastmtcnn"
def dict_structure(d):
    if isinstance(d, dict):
        return {k: dict_structure(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [dict_structure(d[0])] if d else []
    else:
        return None
def process_faces_image(
    image_path: str, 
    include_embedding: bool = True, 
    single_face_only: bool = False
) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Process faces in an image and optionally extract embeddings.
    
    Args:
        image_path: Path or URL to the image
        include_embedding: Whether to include face embeddings in the result
        single_face_only: If True, raises error if multiple faces detected
        
    Returns:
        Single face dict if single_face_only=True, otherwise list of face dicts
        
    Raises:
        ValueError: If no faces detected or multiple faces when single_face_only=True
    """
    face_objs: List[Dict[str, Any]] = DeepFace.extract_faces(
        img_path=image_path, detector_backend=DETECTOR_BACKEND, align=True
    )
    if not face_objs:
        raise ValueError("No face detected in the image")
    if single_face_only and len(face_objs) > 1:
        raise ValueError(f"Multiple faces detected ({len(face_objs)}). Expected only one face.")
    
    image: Optional[np.ndarray]
    if image_path.startswith(('http://', 'https://')):
        response: requests.Response = requests.get(image_path)
        response.raise_for_status()
        image_array: np.ndarray = np.frombuffer(response.content, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    else:
        image = cv2.imread(image_path)
    
    if image is None:
        raise ValueError(f"Could not load image from: {image_path}")
    
    processed_faces: List[Dict[str, Any]] = []
    for i, face_obj in enumerate(face_objs):
        facial_area: Dict[str, int] = face_obj["facial_area"]
        x: int = facial_area["x"]
        y: int = facial_area["y"]
        w: int = facial_area["w"]
        h: int = facial_area["h"]
        cropped_face: np.ndarray = image[y:y+h, x:x+w]
        
        face_data: Dict[str, Any] = {
            "facial_area": facial_area,
            "cropped_face": cropped_face,
            "face_index": i
        }
        
        if include_embedding:
            temp_crop_path: str = f"temp_crop_{uuid.uuid4()}.jpg"
            
            try:
                cv2.imwrite(temp_crop_path, cropped_face)
                
                embedding_result: List[Dict[str, Any]] = DeepFace.represent(img_path=temp_crop_path, model_name=EMBEDDING_MODEL)
                embedding_obj: List[float] = embedding_result[0]["embedding"] if embedding_result and "embedding" in embedding_result[0] else []
                face_data["embedding"] = embedding_obj
                
            finally:
                try:
                    if os.path.exists(temp_crop_path):
                        os.remove(temp_crop_path)
                except Exception:
                    pass
        
        processed_faces.append(face_data)
    
    if single_face_only:
        return processed_faces[0]
    else:
        return processed_faces




