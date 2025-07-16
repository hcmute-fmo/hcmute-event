from fastapi import APIRouter
from app.api.routers import  faces

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(faces.router, prefix="/faces", tags=["Faces"])