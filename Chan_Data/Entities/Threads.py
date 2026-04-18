from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from Chan_Data.database import Base
from Chan_Data.Entities.dtos import ThreadShallowDto, ThreadGetDto

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
            subscribers=len(self.subscribers),
            expiresat=self.expiresat,
            creator=self.creator.toShallowDto()
        )
    
    def toShallowDto(self) -> ThreadShallowDto:
        return ThreadShallowDto(
            id=self.id,
            name=self.name,
            views=self.views,
            subscribers=len(self.subscribers),
            expiresat=self.expiresat
        )