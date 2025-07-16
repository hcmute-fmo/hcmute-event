#!/usr/bin/env python3
"""
Example script demonstrating batch face operations with background processing
"""

import requests
import json
import time
from typing import List

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust to your API base URL
FACES_ENDPOINT = f"{BASE_URL}/faces"

def batch_register_faces(users_data: List[dict]) -> str:
    """
    Register multiple faces in background
    
    Args:
        users_data: List of dicts with 'user_id' and 'avatar_image_url'
    
    Returns:
        task_id: ID to track the background task
    """
    payload = {
        "users": [
            {
                "user_id": user["user_id"],
                "avatar_image_url": user["avatar_image_url"]
            }
            for user in users_data
        ]
    }
    
    response = requests.post(f"{FACES_ENDPOINT}/batch-register", json=payload)
    response.raise_for_status()
    
    result = response.json()
    print(f"Batch registration started: {result['message']}")
    print(f"Task ID: {result['task_id']}")
    print(f"Total users: {result['total_users']}")
    
    return result['task_id']

def batch_delete_faces(user_ids: List[str]) -> str:
    """
    Delete multiple faces in background
    
    Args:
        user_ids: List of user IDs to delete faces for
    
    Returns:
        task_id: ID to track the background task
    """
    payload = {
        "user_ids": user_ids
    }
    
    response = requests.post(f"{FACES_ENDPOINT}/batch-delete", json=payload)
    response.raise_for_status()
    
    result = response.json()
    print(f"Batch deletion started: {result['message']}")
    print(f"Task ID: {result['task_id']}")
    print(f"Total users: {result['total_users']}")
    
    return result['task_id']

def get_task_status(task_id: str) -> dict:
    """
    Get status of a background task
    
    Args:
        task_id: Task ID returned from batch operations
    
    Returns:
        Task status information
    """
    response = requests.get(f"{FACES_ENDPOINT}/task-status/{task_id}")
    response.raise_for_status()
    
    return response.json()

def monitor_task(task_id: str, check_interval: int = 2) -> dict:
    """
    Monitor a background task until completion
    
    Args:
        task_id: Task ID to monitor
        check_interval: Seconds between status checks
    
    Returns:
        Final task status
    """
    print(f"Monitoring task {task_id}...")
    
    while True:
        status = get_task_status(task_id)
        
        print(f"Status: {status['status']}")
        print(f"Progress: {status['progress']}%")
        print(f"Completed: {status['completed_items']}/{status['total_items']}")
        print(f"Failed: {status['failed_items']}")
        
        if status['status'] in ['completed', 'failed']:
            print(f"Task finished with status: {status['status']}")
            if status['results']:
                print("Results:")
                for result in status['results']:
                    print(f"  User {result['user_id']}: {'✓' if result['status'] else '✗'}")
                    if not result['status'] and 'error' in result:
                        print(f"    Error: {result['error']}")
            return status
        
        time.sleep(check_interval)

def main():
    """Example usage of batch operations"""
    
    # Example 1: Batch face registration
    print("=== Example 1: Batch Face Registration ===")
    
    # Sample user data (replace with real data)
    users_to_register = [
        {
            "user_id": "user1",
            "avatar_image_url": "https://example.com/avatar1.jpg"
        },
        {
            "user_id": "user2", 
            "avatar_image_url": "https://example.com/avatar2.jpg"
        },
        {
            "user_id": "user3",
            "avatar_image_url": "https://example.com/avatar3.jpg"
        }
    ]
    
    try:
        # Start batch registration
        register_task_id = batch_register_faces(users_to_register)
        
        # Monitor the task
        final_status = monitor_task(register_task_id)
        
    except requests.exceptions.RequestException as e:
        print(f"Error during batch registration: {e}")
        return
    
    # Example 2: Batch face deletion
    print("\n=== Example 2: Batch Face Deletion ===")
    
    # Sample user IDs to delete faces for
    users_to_delete = ["user1", "user2", "user3"]
    
    try:
        # Start batch deletion
        delete_task_id = batch_delete_faces(users_to_delete)
        
        # Monitor the task
        final_status = monitor_task(delete_task_id)
        
    except requests.exceptions.RequestException as e:
        print(f"Error during batch deletion: {e}")
        return

if __name__ == "__main__":
    main() 