
from fastapi import APIRouter, File, UploadFile

from services.upload_service import save_image

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    return await save_image(file)
