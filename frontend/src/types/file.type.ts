export interface DriveUrlRequest {
    drive_url: string;
}

export interface UploadResponse {
    success: boolean;
    public_url: string;
    filename: string;
    mime_type: string;
    message: string;
}
