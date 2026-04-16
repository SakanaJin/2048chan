from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from Chan_Data.database import get_db
from Chan_Data.Utils.Response import Response, HttpException
from Chan_Data.Utils.Role import Role
from Chan_Data.Utils.Pfp import get_pfp_path
from Chan_Data.Controllers.AuthController import require_admin
from Chan_Data.Entities.Users import User, UserCreateDto
from Chan_Data.Entities.Auth import Auth, create_password_hash

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("")
def create_user(userdto: UserCreateDto, db: Session = Depends(get_db)):
    response = Response()
    if len(userdto.username) == 0:
        response.add_error("username", "username cannot be empty")
    if len(userdto.password) == 0:
        response.add_error("password", "password cannot be empty")
    if userdto.password != userdto.confirm_password:
        response.add_error("confirm_password", "password fields do not match")
    if response.has_errors:
        raise HttpException(status_code=400, response=response)
    pfp_path = get_pfp_path()
    user = User(
        username=userdto.username,
        role=Role.USER,
        created_at=datetime.now(),
        pfp_path=pfp_path
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        response.add_error("username", "username already taken")
        raise HttpException(status_code=400, response=response)
    auth = Auth(
        id=user.id,
        password_hash=create_password_hash(userdto.password)
    )
    db.add(auth)
    db.commit()
    db.refresh(user)
    response.data = user.toGetDto()
    return response

@router.get("")
def get_all_users(db: Session = Depends(get_db)):
    response = Response()
    users = db.scalars(
        select(User)
    ).all()
    response.data = [user.toGetDto() for user in users]
    return response

@router.get("/{id}")
def get_user_by_id(id: int, db: Session = Depends(get_db)):
    response = Response()
    user = db.get(User, id)
    if not user:
        response.add_error("id", "user not found")
        raise HttpException(status_code=404, response=response)
    response.data = user.toGetDto()
    return response

@router.delete("/{id}")
def delete_user(id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    response = Response()
    user = db.get(User, id)
    if not user:
        response.add_error("id", "user not found")
        raise HttpException(status_code=404, response=response)
    db.delete(user)
    db.commit()
    response.data = True
    return response