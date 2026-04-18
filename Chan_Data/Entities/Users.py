from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from Chan_Data.database import Base
from Chan_Data.Utils.Role import Role
from Chan_Data.Entities.dtos import UserGetDto, UserShallowDto

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    role = Column(Enum(Role), default=Role.GUEST, nullable=False)
    pfp_path = Column(String(256), nullable=False, default="")
    created_at = Column(DateTime(timezone=True), default=datetime.now)

    auth = relationship("Auth", back_populates="user", uselist=False, cascade="all, delete-orphan")

    owned_threads = relationship("Thread", back_populates="creator")

    subbedthreads = relationship("Thread", back_populates="subscribers", secondary="subscribedthreads")

    messages = relationship("Message", back_populates="author")

    def toGetDto(self) -> UserGetDto:
        return UserGetDto(
            id=self.id,
            username=self.username,
            role=self.role,
            pfp_path=self.pfp_path,
            subbedthreads=[thread.toShallowDto() for thread in self.subbedthreads],
            ownedthreads=[thread.toShallowDto() for thread in self.owned_threads]
        )
    
    def toShallowDto(self) -> UserShallowDto:
        return UserShallowDto(
            id=self.id,
            username=self.username,
            pfp_path=self.pfp_path,
        )