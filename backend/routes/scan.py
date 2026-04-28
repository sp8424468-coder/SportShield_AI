from fastapi import APIRouter, UploadFile, File, HTTPException
import requests

from backend.utils.file_handler import save_temp_file, delete_file

router = APIRouter()

HF_URL = "https://swathishettigar-swathi.hf.space/run/predict"

def get_similarity_from_hf(img1_path, img2_path):
    with open(img1_path, "rb") as f1, open(img2_path, "rb") as f2:
        response = requests.post(
            HF_URL,
            files={
                "img1": f1,
                "img2": f2
            }
        )
    return response.json()


@router.post("/scan")
async def scan(
    img1: UploadFile = File(...),
    img2: UploadFile = File(...)
):
    img1_path = save_temp_file(img1)
    img2_path = save_temp_file(img2)

    try:
        result = get_similarity_from_hf(img1_path, img2_path)

        similarity = result["data"][0]

        status = "Duplicate" if similarity > 0.9 else "Different"

        return {
            "similarity": similarity,
            "status": status
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        delete_file(img1_path)
        delete_file(img2_path)