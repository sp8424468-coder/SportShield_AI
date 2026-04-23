from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from utils.file_handler import save_temp_file, delete_file

# ✅ AI (CLIP)
from ai.embedding import get_embedding, cosine_similarity

# ✅ pHash
from ai.detection import compare_images

from database.memory_db import posts_db
from database.users_db import users_db
from auth.jwt_handler import verify_token

router = APIRouter()

# 🔐 Security
security = HTTPBearer()


# =========================
# 🔐 AUTH DEPENDENCY
# =========================
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return payload


# =========================
# ❤️ LIKE SYSTEM
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
# 🚀 CREATE POST (HYBRID AI - FIXED)
# =========================
@router.post("/create-post")
async def create_post(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")

    # 🔍 Find user
    user = next((u for u in users_db if u["id"] == user_id), None)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="User is blocked")

    # 💾 Save image
    img_path = save_temp_file(file)

    try:
        # 🧠 AI EMBEDDING
        new_embedding = get_embedding(img_path)

        best_clip = 0
        best_hash = 0

        # 🔁 Compare with existing posts
        for post in posts_db:
            try:
                # CLIP similarity
                if "embedding" in post:
                    clip_sim = cosine_similarity(new_embedding, post["embedding"])
                    best_clip = max(best_clip, clip_sim)

                # pHash similarity
                hash_sim = compare_images(img_path, post["path"])["similarity"]
                best_hash = max(best_hash, hash_sim)

            except Exception:
                continue

        # =========================
        # 🧠 FINAL DECISION (STRONG FIX)
        # =========================

        # 🔴 SAME IMAGE (very strict)
        if best_hash >= 85 or best_clip >= 0.95:
            status = "violation"

        # 🟡 CROPPED / EDITED
        elif best_hash >= 60:
            status = "suspicious"

        # 🟡 AI DETECTS SIMILAR CONTENT
        elif best_clip >= 0.88:
            status = "suspicious"

        # 🟢 SAFE
        else:
            status = "safe"

        # 🚨 ENFORCEMENT
        if status == "violation":
            user["demerit_points"] += 1

            if user["demerit_points"] >= 3:
                user["is_blocked"] = True

            delete_file(img_path)

            return {
                "status": status,
                "clip_similarity": round(best_clip * 100, 2),
                "hash_similarity": best_hash,
                "message": "Post rejected (duplicate content)",
                "demerit_points": user["demerit_points"],
                "is_blocked": user["is_blocked"]
            }

        # ✅ SAVE POST
        new_post = {
            "id": len(posts_db) + 1,
            "user_id": user_id,
            "username": user["username"],  # 🔥 ADD THIS
            "path": img_path,
            "embedding": new_embedding.tolist(),
            "status": status,
            "likes": [],
            "is_public": False if status == "suspicious" else True
        }

        posts_db.append(new_post)

        return {
            "status": status,
            "clip_similarity": round(best_clip * 100, 2),
            "hash_similarity": best_hash,
            "message": "Post uploaded successfully",
            "post_id": new_post["id"],
            "demerit_points": user["demerit_points"],
            "is_blocked": user["is_blocked"]
        }

    except Exception as e:
        delete_file(img_path)
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# 📄 GET POSTS (WITH USERNAME)
# =========================
@router.get("/get-posts")
def get_posts(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")

    visible_posts = []

    for p in posts_db:
        if p.get("is_public", True) or p["user_id"] == user_id:

            # 🔥 Ensure username exists
            if "username" not in p:
                user = next((u for u in users_db if u["id"] == p["user_id"]), None)
                p["username"] = user["username"] if user else "Unknown"

            visible_posts.append(p)

    return visible_posts