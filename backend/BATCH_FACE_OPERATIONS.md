# Batch Face Operations with Background Processing

This document describes the new batch face operations feature that allows you to register or delete multiple faces at once using background processing.

## Overview

The batch operations system provides:
- **Background Processing**: Operations run in the background without blocking the API response
- **Progress Tracking**: Real-time progress monitoring for each operation
- **Error Handling**: Individual error tracking for each user in the batch
- **Task Management**: Unique task IDs for tracking and status checking

## API Endpoints

### 1. Batch Face Registration

**Endpoint**: `POST /faces/batch-register`

**Request Body**:
```json
{
  "users": [
    {
      "user_id": "user1",
      "avatar_image_url": "https://example.com/avatar1.jpg"
    },
    {
      "user_id": "user2", 
      "avatar_image_url": "https://example.com/avatar2.jpg"
    }
  ]
}
```

**Response**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Batch face registration started in background",
  "total_users": 2
}
```

### 2. Batch Face Deletion

**Endpoint**: `POST /faces/batch-delete`

**Request Body**:
```json
{
  "user_ids": ["user1", "user2", "user3"]
}
```

**Response**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Batch face deletion started in background",
  "total_users": 3
}
```

### 3. Task Status Check

**Endpoint**: `GET /faces/task-status/{task_id}`

**Response**:
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": 50,
  "total_items": 4,
  "completed_items": 2,
  "failed_items": 0,
  "results": [
    {
      "user_id": "user1",
      "status": true
    },
    {
      "user_id": "user2",
      "status": true
    }
  ],
  "error_message": null,
  "created_at": "2024-01-01T12:00:00",
  "updated_at": "2024-01-01T12:01:00"
}
```

## Task Status Values

- **`processing`**: Task is currently running
- **`completed`**: Task has finished successfully
- **`failed`**: Task encountered an error and stopped

## Usage Examples

### Python Example

```python
import requests
import time

# Start batch registration
users_data = [
    {"user_id": "user1", "avatar_image_url": "https://example.com/avatar1.jpg"},
    {"user_id": "user2", "avatar_image_url": "https://example.com/avatar2.jpg"}
]

response = requests.post("http://localhost:8000/faces/batch-register", 
                        json={"users": users_data})
task_id = response.json()["task_id"]

# Monitor progress
while True:
    status = requests.get(f"http://localhost:8000/faces/task-status/{task_id}").json()
    print(f"Progress: {status['progress']}%")
    
    if status['status'] in ['completed', 'failed']:
        print("Task finished!")
        break
    
    time.sleep(2)
```

### cURL Examples

**Start batch registration**:
```bash
curl -X POST "http://localhost:8000/faces/batch-register" \
  -H "Content-Type: application/json" \
  -d '{
    "users": [
      {"user_id": "user1", "avatar_image_url": "https://example.com/avatar1.jpg"},
      {"user_id": "user2", "avatar_image_url": "https://example.com/avatar2.jpg"}
    ]
  }'
```

**Check task status**:
```bash
curl "http://localhost:8000/faces/task-status/550e8400-e29b-41d4-a716-446655440000"
```

**Start batch deletion**:
```bash
curl -X POST "http://localhost:8000/faces/batch-delete" \
  -H "Content-Type: application/json" \
  -d '{"user_ids": ["user1", "user2", "user3"]}'
```

## Error Handling

The system handles various error scenarios:

1. **User not found**: If a user ID doesn't exist in the database
2. **User already has a face**: For registration, if user already has a face registered
3. **User doesn't have a face**: For deletion, if user has no face to delete
4. **Image processing errors**: If face detection or embedding extraction fails
5. **Database errors**: If database operations fail

Each error is tracked individually, so a failure for one user doesn't affect others in the batch.

## Performance Considerations

- **Memory Usage**: Face embeddings are processed in memory during the operation
- **Concurrency**: Each batch operation runs in a separate thread
- **Database Connections**: Uses existing Supabase connection pool
- **Timeout**: Consider implementing timeouts for very large batches

## Best Practices

1. **Batch Size**: Keep batch sizes reasonable (10-50 users per batch)
2. **Monitoring**: Always check task status to ensure completion
3. **Error Handling**: Review failed items in the results
4. **Retry Logic**: Implement retry logic for failed operations
5. **Resource Management**: Monitor server resources during large batch operations

## Implementation Details

The background processing uses Python's `threading` module to run operations asynchronously. Task status is stored in memory (consider using Redis or database for production use with multiple server instances).

Key components:
- `UserService.batch_face_register_background()`: Starts batch registration
- `UserService.batch_face_delete_background()`: Starts batch deletion
- `UserService.get_background_task_status()`: Retrieves task status
- Background worker threads: Process individual face operations 