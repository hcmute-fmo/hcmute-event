# Face API Documentation

This document describes the face recognition and detection API endpoints available in the backend.

## Endpoints

### 1. Save Face Embedding
**POST** `/faces/save`

Saves a user's face embedding to the database for future recognition.

**Request Body:**
```json
{
  "user_id": "string",
  "avatar_image_url": "string"
}
```

**Response:**
```json
{
  "id": 1
}
```

### 2. Search Faces
**POST** `/faces/search`

Searches for faces in an image and matches them with stored embeddings.

**Request Body:**
```json
{
  "image_url": "string"
}
```

**Response:**
```json
{
  "results": [
    {
      "user_id": "string",
      "score": 0.85,
      "bounding_box": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 200
      }
    }
  ]
}
```

### 3. Get Face Bounding Boxes
**POST** `/faces/bounding-boxes`

Gets only the bounding boxes of faces detected in an image without generating embeddings (fastest option).

**Request Body:**
```json
{
  "image_url": "string"
}
```

**Response:**
```json
{
  "bounding_boxes": [
    {
      "x": 100,
      "y": 150,
      "width": 200,
      "height": 200
    }
  ]
}
```

### 4. Update Face
**POST** `/faces/update`

Updates a user's face embedding in the database.

**Request Body:**
```json
{
  "user_id": "string",
  "face_image_url": "string"
}
```

**Response:**
```json
{
  "message": "Successfully updated face embeddings for user user123"
}
```

### 5. Delete Face
**POST** `/faces/delete`

Deletes all face embeddings for a user from the database.

**Request Body:**
```json
{
  "user_id": "string"
}
```

**Response:**
```json
{
  "message": "Successfully deleted 2 face embeddings for user user123"
}
```

## Usage Examples

### Fast Face Detection (Bounding Boxes Only)
```bash
curl -X POST "http://localhost:8000/faces/bounding-boxes" \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

### Face Recognition with Embeddings
```bash
curl -X POST "http://localhost:8000/faces/search" \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

## Performance Notes

1. **Bounding Boxes Only** (`/faces/bounding-boxes`): Fastest, only detects face locations without generating embeddings
2. **Face Search** (`/faces/search`): Full face recognition with embedding generation and matching

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid image URL, no faces detected)
- `500`: Internal server error

## Database Schema

The face embeddings are stored in a `user_faces` table with the following structure:
- `user_id`: User identifier
- `embedding`: Face embedding vector
- `facial_area`: Bounding box coordinates
- `image_url`: Source image URL 