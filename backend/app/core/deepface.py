from deepface import DeepFace
import json
import os
from pathlib import Path
import cv2
import requests
import numpy as np
import uuid
from typing import List, Dict, Any, Union, Optional
from datetime import datetime

EMBEDDING_MODEL: str = "Facenet512"
DETECTOR_BACKEND: str = "fastmtcnn"

def dict_structure(d):
    if isinstance(d, dict):
        return {k: dict_structure(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [dict_structure(d[0])] if d else []
    else:
        return None

def create_logs_folder() -> str:
    """Create logs folder if it doesn't exist and return the path."""
    logs_path = os.path.join(os.getcwd(), "logs")
    os.makedirs(logs_path, exist_ok=True)
    return logs_path

def save_image_with_bounding_boxes(image: np.ndarray, face_objs: List[Dict[str, Any]], original_path: str) -> str:
    """
    Draw bounding boxes on the image and save it to logs folder.
    
    Args:
        image: Original image as numpy array
        face_objs: List of face objects with facial_area information
        original_path: Original image path for naming
        
    Returns:
        Path to the saved image with bounding boxes
    """
    # Create a copy of the image to draw on
    image_with_boxes = image.copy()
    
    # Draw bounding boxes for each face
    for i, face_obj in enumerate(face_objs):
        facial_area = face_obj["facial_area"]
        x, y, w, h = facial_area["x"], facial_area["y"], facial_area["w"], facial_area["h"]
        
        # Draw rectangle (bounding box) with OpenCV
        cv2.rectangle(image_with_boxes, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        # Add face index label
        cv2.putText(image_with_boxes, f"Face {i+1}", (x, y-10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    # Create logs folder
    logs_path = create_logs_folder()
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    original_filename = os.path.basename(original_path)
    name, ext = os.path.splitext(original_filename)
    log_filename = f"multiple_faces_{timestamp}_{name}_{len(face_objs)}faces{ext}"
    log_filepath = os.path.join(logs_path, log_filename)
    
    # Save the image with bounding boxes
    cv2.imwrite(log_filepath, image_with_boxes)
    
    return log_filepath

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
        single_face_only: If True, processes only the first face when multiple faces detected
        
    Returns:
        Single face dict if single_face_only=True, otherwise list of face dicts
        
    Raises:
        ValueError: If no faces detected
    """
    face_objs: List[Dict[str, Any]] = DeepFace.extract_faces(
        img_path=image_path, detector_backend=DETECTOR_BACKEND, align=True
    )
    if not face_objs:
        raise ValueError("No face detected in the image")
    
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
    
    # If multiple faces detected and not in single face mode, save image with bounding boxes to logs
    if len(face_objs) > 1 and not single_face_only:
        log_filepath = save_image_with_bounding_boxes(image, face_objs, image_path)
        print(f"Multiple faces detected ({len(face_objs)}). Image with bounding boxes saved to: {log_filepath}")
    
    # If single_face_only, only process the first face
    if single_face_only:
        if len(face_objs) > 1:
            print(f"Multiple faces detected ({len(face_objs)}). Processing only the first face as requested.")
        
        # Process only the first face
        first_face_obj = face_objs[0]
        first_facial_area: Dict[str, int] = first_face_obj["facial_area"]
        first_x: int = first_facial_area["x"]
        first_y: int = first_facial_area["y"]
        first_w: int = first_facial_area["w"]
        first_h: int = first_facial_area["h"]
        first_cropped_face: np.ndarray = image[first_y:first_y+first_h, first_x:first_x+first_w]
        
        first_face_data: Dict[str, Any] = {
            "facial_area": first_facial_area,
            "cropped_face": first_cropped_face,
            "face_index": 0
        }
        
        if include_embedding:
            first_temp_crop_path: str = f"temp_crop_{uuid.uuid4()}.jpg"
            
            try:
                cv2.imwrite(first_temp_crop_path, first_cropped_face)
                
                first_embedding_result: List[Dict[str, Any]] = DeepFace.represent(img_path=first_temp_crop_path, model_name=EMBEDDING_MODEL)
                first_embedding_obj: List[float] = first_embedding_result[0]["embedding"] if first_embedding_result and "embedding" in first_embedding_result[0] else []
                first_face_data["embedding"] = first_embedding_obj
                
            finally:
                try:
                    if os.path.exists(first_temp_crop_path):
                        os.remove(first_temp_crop_path)
                except Exception:
                    pass
        
        return first_face_data
    
    # Process all faces (when single_face_only=False)
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
    
    return processed_faces




