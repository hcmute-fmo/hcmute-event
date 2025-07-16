from fastapi import APIRouter
from app.api.routers import faces, images

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(faces.router, prefix="/faces", tags=["Faces"])
api_router.include_router(images.router, prefix="/images", tags=["Images"])