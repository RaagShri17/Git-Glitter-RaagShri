from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext

from app.db.store import db
from app.dependencies import create_access_token, get_current_user
from app.models.schemas import Token, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    if db.get_user_by_email(payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(payload.password)
    user = db.create_user(payload.email, payload.name, hashed)
    return UserOut(id=user["id"], email=user["email"], name=user["name"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.get_user_by_email(form_data.username)
    if not user or not pwd_context.verify(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token(user["id"])
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    return UserOut(id=current_user["id"], email=current_user["email"], name=current_user["name"])



@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    return UserOut(id=current_user["id"], email=current_user["email"], name=current_user["name"])
