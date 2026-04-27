from fastapi import FastAPI
from routes import scan, posts, users
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure folder exists
os.makedirs("temp_images", exist_ok=True)

app.include_router(scan.router)
app.include_router(posts.router)
app.include_router(users.router)

app.mount("/temp_images", StaticFiles(directory="temp_images"), name="images")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8080))
    )