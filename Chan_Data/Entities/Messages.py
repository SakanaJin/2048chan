from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from Chan_Data.database import Base
from Chan_Data.Entities.dtos import MessageGetDto, MessageShallowDto
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
    