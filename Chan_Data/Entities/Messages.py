from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from datetime import datetime

from Chan_Data.database import Base
from Chan_Data.Entities.Users import UserShallowDto
from Chan_Data.Entities.Threads import ThreadShallowDto

class MessageCreateDto(BaseModel):
    content: str

class MessageGetDto(BaseModel):
    id: int
    content: str
    createdat: datetime
    author: UserShallowDto
    thread: ThreadShallowDto

class MessageShallowDto(BaseModel):
    id: int
    content: str
    createdat: datetime
    author: UserShallowDto

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    createdat = Column(DateTime(timezone=True), nullable=False)

    authorid = Column(Integer, ForeignKey("users.id"))
    author = relationship("User", back_populates="messages")

    threadid = Column(Integer, ForeignKey("threads.id"))
    thread = relationship("Thread", back_populates="messages")

    def toGetDto(self) -> MessageGetDto:
        return MessageShallowDto(
            id=self.id,
            content=self.content,
            createdat=self.createdat,
            author=self.author.toShallowDto()
        )

    def toShallowDto(self) -> MessageShallowDto:
        return MessageShallowDto(
            id=self.id,
            content=self.content,
            createdat=self.createdat,
            author=self.author.toShallowDto(),
            thread=self.thread.toShallowDto()
        )
    