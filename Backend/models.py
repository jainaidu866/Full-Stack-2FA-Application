from sqlalchemy import Column, Integer, String, Boolean
from Backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(200))

    # 🔥 REQUIRED FOR 2FA
    is_2fa_enabled = Column(Boolean, default=False)
    secret = Column(String(100), nullable=True)