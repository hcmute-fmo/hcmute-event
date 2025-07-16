// src/types/faces.ts

export interface User {
    id: string;
    full_name: string;
    email: string;
    position: string;
    avatar_image_url: string;
    metadata: Record<string, any>;
}

export interface UserFaceRegisterRequest {
    user_id: string;
    avatar_image_url: string;
}

export interface UserFaceUpdateRequest {
    user_id: string;
    avatar_image_url: string;
}

export interface UserFaceDeleteRequest {
    user_ids: string[];
}

export interface UserFaceCreateRequest {
    user_id: string;
    avatar_image_url: string;
}

export interface UserFaceCreateResponse {
    status: boolean;
}

export interface UserFaceDeleteResponse {
    status: Record<string, any>[];
}

export interface UserFaceUpdateResponse {
    status: boolean;
}

export interface UserFaceRegisterResponse {
    status: boolean;
}

// Batch operation schemas
export interface BatchFaceRegisterRequest {
    users: UserFaceRegisterRequest[];
}

export interface BatchFaceDeleteRequest {
    user_ids: string[];
}

export interface BatchFaceUpdateRequest {
    users: UserFaceUpdateRequest[];
}

export interface BatchFaceRegisterResponse {
    task_id: string;
    message: string;
    total_users: number;
}

export interface BatchFaceDeleteResponse {
    task_id: string;
    message: string;
    total_users: number;
}

export interface BatchFaceUpdateResponse {
    task_id: string;
    message: string;
    total_users: number;
}

export interface BackgroundTaskStatus {
    task_id: string;
    status: "processing" | "completed" | "failed";
    progress: number; // percentage (0-100)
    total_items: number;
    completed_items: number;
    failed_items: number;
    results?: Record<string, any>[];
    error_message?: string;
    created_at: string; // ISO datetime string
    updated_at: string; // ISO datetime string
}

export interface UserFaceSearchRequest {
    image_url: string;
}

export interface UserFaceRecognitionResult {
    user_id: string;
    confidence: number;
    bounding_box: Record<string, any>[];
}

export interface UserFaceSearchResponse {
    results: UserFaceRecognitionResult[];
}

export interface FaceTaggingRequest {
    image_id: number;
}

export interface FaceTaggingResponse {
    task_id: string;
    message: string;
    image_id: number;
}

export interface FaceTaggingResult {
    image_id: number;
    detected_faces: number;
    recognized_users: string[];
    processing_time: number;
    status: string;
}