from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from Chan_Data.database import Base
from Chan_Data.Entities.dtos import TopicGetDto, TopicShallowDto


class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    views = Column(Integer, nullable=False, default=0)
    totalmsgs = Column(Integer, nullable=False, default=0)

    threads = relationship("Thread", back_populates="topic")

    def toGetDto(self) -> TopicGetDto:
        return TopicGetDto(
            id=self.id,
            name=self.name,
            views=self.views,
            threads=[thread.toShallowDto() for thread in self.threads]
        )
    
    def toShallowDto(self) -> TopicShallowDto:
        return TopicShallowDto(
            id=self.id,
            name=self.name,
            views=self.views
        )