from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from datetime import datetime

from Chan_Data.database import Base
from Chan_Data.Utils.Role import Role

class LoginDto(BaseModel):
    username: str
    password: str

class UserCreateDto(BaseModel):
    username: str
    password: str
    confirm_password: str

class UserGetDto(BaseModel):
    id: int
    username: str
    role: Role
    
class UserShallowDto(BaseModel):
    id: int
    username: str

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    role = Column(Enum(Role), default=Role.GUEST, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)

    auth = relationship("Auth", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def toGetDto(self) -> UserGetDto:
        return UserGetDto(
            id=self.id,
            username=self.username,
            role=self.role,
        )
    
    def toShallowDto(self) -> UserShallowDto:
        return UserShallowDto(
            id=self.id,
            username=self.username,
        )