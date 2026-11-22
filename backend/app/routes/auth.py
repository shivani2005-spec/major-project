from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any
from app.models.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.core.database import create_user, get_user_by_email
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate):
    existing = get_user_by_email(user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in."
        )

    hashed_pw = hash_password(user_in.password)
    user = create_user(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pw
    )

    token = create_access_token(user_id=user["id"], email=user["email"])

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    )

@router.post("/signin", response_model=TokenResponse)
async def signin(credentials: UserLogin):
    user = get_user_by_email(credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(user_id=user["id"], email=user["email"])

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user.get("created_at", "")
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user.get("created_at", "")
    )
