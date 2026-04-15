from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
import bcrypt

from Chan_Data.database import Base

def create_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

class Auth(Base):
    __tablename__ = "auth"
    id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    password_hash = Column(String(256), unique=True, nullable=False)

    user = relationship("User", back_populates="auth")