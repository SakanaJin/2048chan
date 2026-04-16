from sqlalchemy import Column, Integer, ForeignKey

from Chan_Data.database import Base

class SubscribedThread(Base):
    __tablename__ = "subscribedthreads"
    userid = Column(Integer, ForeignKey("users.id"), primary_key=True)
    threadid = Column(Integer, ForeignKey("threads.id"), primary_key=True)