from fastapi import APIRouter, UploadFile, File, HTTPException

from ai.detection import compare_images
from utils.file_handler import save_temp_file, delete_file

router = APIRouter()

@router.post("/scan")
async def scan(
    img1: UploadFile = File(...),
    img2: UploadFile = File(...)
):
    img1_path = save_temp_file(img1)
    img2_path = save_temp_file(img2)

    try:
        result = compare_images(img1_path, img2_path)

        return {
            "similarity": result["similarity"],
            "status": result["status"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        delete_file(img1_path)
        delete_file(img2_path)