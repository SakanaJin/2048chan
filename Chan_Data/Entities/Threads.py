from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from datetime import datetime

from Chan_Data.database import Base

class ThreadCreateDto(BaseModel):
    name: str

class ThreadGetDto(BaseModel):
    id: int
    name: str
    views: int
    expiresat: datetime

class ThreadShallowDto(BaseModel):
    id: int
    name: str
    views: int
    expiresat: datetime

class Thread(Base):
    __tablename__ = "threads"
    id = Column(Integer, primary_key=True)
    name = Column(String(256), nullable=False)
    views = Column(Integer, nullable=False, default=0)
    expiresat = Column(DateTime(timezone=True), nullable=False)

    creatorid = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User", back_populates="owned_threads")

    topicid = Column(Integer, ForeignKey("topics.id"))
    topic = relationship("Topic", back_populates="threads")

    subscribers = relationship("User", back_populates="subbedthreads", secondary="subscribedthreads")

    messages = relationship("Message", back_populates="thread")

    def toGetDto(self) -> ThreadGetDto:
        return ThreadGetDto(
            id=self.id,
            name=self.name,
            views=self.views,
            expiresat=self.expiresat
        )
    
    def toShallowDto(self) -> ThreadShallowDto:
        return ThreadShallowDto(
            id=self.id,
            name=self.name,
            views=self.views,
            expiresat=self.expiresat
        )