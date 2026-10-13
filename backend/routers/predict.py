from fastapi import APIRouter, UploadFile, File

from services.model_service import predict

router = APIRouter()


@router.post("/predict")
async def predict_disease(image: UploadFile = File(...)):
    """Accept an uploaded image and return the disease prediction."""
    image_bytes = await image.read()
    result = predict(image_bytes)
    return result
