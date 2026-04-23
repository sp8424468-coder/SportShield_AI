from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from database.users_db import users_db
from auth.jwt_handler import create_access_token
from database.memory_db import posts_db
from dotenv import load_dotenv

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import random
import os

router = APIRouter()
load_dotenv()

# ---------------- EMAIL CONFIG ----------------


conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_USERNAME"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

# ---------------- TEMP STORAGE ----------------
pending_users = {}

# ---------------- MODELS ----------------
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    age: int

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class UserLogin(BaseModel):
    username: str
    password: str

# ---------------- REGISTER (SEND OTP) ----------------
@router.post("/register")
async def register(data: RegisterRequest):

    # ❌ username unique
    for u in users_db:
        if u["username"] == data.username:
            raise HTTPException(status_code=400, detail="Username already exists")

    # ❌ email unique
    for u in users_db:
        if u["username"] == data.email:
            raise HTTPException(status_code=400, detail="Email already exists")

    otp = str(random.randint(1000, 9999))

    # 💾 store temp user
    pending_users[data.email] = {
        "username": data.username,
        "email": data.email,
        "password": data.password,
        "age": data.age,
        "otp": otp
    }

    # 📧 send OTP
    message = MessageSchema(
        subject="SportShield AI - OTP",
        recipients=[data.email],
        body=f"Your OTP is: {otp}",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)

    return {"message": "OTP sent to email"}


# ---------------- VERIFY OTP ----------------
@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest):

    user = pending_users.get(data.email)

    if not user:
        raise HTTPException(status_code=400, detail="No registration found")

    if user["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # ✅ create user
    new_user = {
        "id": len(users_db) + 1,
        "username": user["username"],
        "password": user["password"],
        "age": user["age"],
        "demerit_points": 0,
        "is_blocked": False
    }

    users_db.append(new_user)

    # 🧹 cleanup
    del pending_users[data.email]

    return {"message": "Registration successful"}


# ---------------- LOGIN ----------------
@router.post("/login")
def login(user: UserLogin):
    for u in users_db:
        if u["username"] == user.username and u["password"] == user.password:

            token = create_access_token({
                "user_id": u["id"],
                "username": u["username"]
            })

            return {
                "access_token": token,
                "token_type": "bearer"
            }

    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/profile/{user_id}")
def get_profile(user_id: int):

    user = next((u for u in users_db if u["id"] == user_id), None)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_posts = [p for p in posts_db if p["user_id"] == user_id]

    return {
        "username": user["username"],
        "age": user.get("age"),
        "total_posts": len(user_posts),
        "posts": user_posts
    }


# ---------------- GET USERS ----------------
@router.get("/users")
def get_users():
    return users_db