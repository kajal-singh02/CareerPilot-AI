from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.entities import User, UserProfile
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token, UserProfileUpdate
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=user_in.email,
        full_name=user_in.full_name or user_in.email.split("@")[0].title(),
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(user)
    db.flush()

    profile = UserProfile(
        user_id=user.id,
        preferred_role="Full Stack Developer",
        existing_skills=["JavaScript", "Python", "Git", "SQL"]
    )
    db.add(profile)
    db.commit()

    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled.")

    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


from typing import Optional
from pydantic import BaseModel

class ClerkSyncRequest(BaseModel):
    clerk_id: str
    email: str
    full_name: Optional[str] = None

@router.post("/clerk-sync", response_model=Token)
def clerk_sync(req: ClerkSyncRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        user = User(
            email=req.email,
            full_name=req.full_name or req.email.split("@")[0].title(),
            hashed_password=get_password_hash(f"clerk_{req.clerk_id}"),
            is_active=True
        )
        db.add(user)
        db.flush()

        profile = UserProfile(
            user_id=user.id,
            preferred_role="Full Stack Developer",
            existing_skills=["JavaScript", "Python", "Git", "SQL"]
        )
        db.add(profile)
        db.commit()
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled.")

    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me/profile")
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return {"message": "Profile updated successfully"}
