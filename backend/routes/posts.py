from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests

from backend.utils.file_handler import save_temp_file, delete_file

from database.memory_db import posts_db
from database.users_db import users_db
from auth.jwt_handler import verify_token

router = APIRouter()
security = HTTPBearer()

HF_URL = "https://swathishettigar-swathi.hf.space/run/predict"


def get_similarity(img1, img2):
    with open(img1, "rb") as f1, open(img2, "rb") as f2:
        res = requests.post(
            HF_URL,
            files={"img1": f1, "img2": f2}
        )
    return res.json()["data"][0]


# =========================
# 🔐 AUTH
# =========================
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return payload


# =========================
# ❤️ LIKE
# =========================
@router.post("/like/{post_id}")
def like_post(post_id: int, user_id: int):

    post = next((p for p in posts_db if p["id"] == post_id), None)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if "likes" not in post:
        post["likes"] = []

    if user_id in post["likes"]:
        post["likes"].remove(user_id)
    else:
        post["likes"].append(user_id)

    return {
        "likes_count": len(post["likes"]),
        "liked": user_id in post["likes"]
    }


# =========================
# 🚀 CREATE POST (HF BASED)
# =========================
@router.post("/create-post")
async def create_post(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")

    user = next((u for u in users_db if u["id"] == user_id), None)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="User is blocked")

    img_path = save_temp_file(file)

    try:
        best_sim = 0

        for post in posts_db:
            try:
                sim = get_similarity(img_path, post["path"])
                best_sim = max(best_sim, sim)
            except:
                continue

        # 🔥 Decision logic
        if best_sim >= 0.95:
            status = "violation"
        elif best_sim >= 0.85:
            status = "suspicious"
        else:
            status = "safe"

        if status == "violation":
            user["demerit_points"] += 1

            if user["demerit_points"] >= 3:
                user["is_blocked"] = True

            delete_file(img_path)

            return {
                "status": status,
                "similarity": best_sim,
                "message": "Duplicate content",
                "demerit_points": user["demerit_points"],
                "is_blocked": user["is_blocked"]
            }

        new_post = {
            "id": len(posts_db) + 1,
            "user_id": user_id,
            "username": user["username"],
            "path": img_path,
            "status": status,
            "likes": [],
            "is_public": False if status == "suspicious" else True
        }

        posts_db.append(new_post)

        return {
            "status": status,
            "similarity": best_sim,
            "message": "Uploaded",
            "post_id": new_post["id"]
        }

    except Exception as e:
        delete_file(img_path)
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# 📄 GET POSTS
# =========================
@router.get("/get-posts")
def get_posts(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")

    visible_posts = []

    for p in posts_db:
        if p.get("is_public", True) or p["user_id"] == user_id:

            if "username" not in p:
                user = next((u for u in users_db if u["id"] == p["user_id"]), None)
                p["username"] = user["username"] if user else "Unknown"

            visible_posts.append(p)

    return visible_posts