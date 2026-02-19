from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

def get_iso_now():
    return datetime.utcnow().isoformat() + "Z"

class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class Metric(str, enum.Enum):
    ACCURACY = "ACCURACY"
    MSE = "MSE"

class User(Base):
    __tablename__ = "User"
    id = Column(String, primary_key=True) # Prisma uses CUID, we might need to generate it or let DB handle if using uuid
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String, nullable=True)
    role = Column(String, default="USER") # Using String to simplify, or Enum
    createdAt = Column(String, default=get_iso_now)
    updatedAt = Column(String, default=get_iso_now, onupdate=get_iso_now)

    submissions = relationship("Submission", back_populates="user")

import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Competition(Base):
    __tablename__ = "Competition"
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String)
    description = Column(String)
    deadline = Column(String)
    metric = Column(String) # Enum storage as string
    trainDataPath = Column(String)
    solutionDataPath = Column(String)
    createdAt = Column(String, default=get_iso_now)
    updatedAt = Column(String, default=get_iso_now, onupdate=get_iso_now)

    submissions = relationship("Submission", back_populates="competition")

class Submission(Base):
    __tablename__ = "Submission"
    id = Column(String, primary_key=True)
    score = Column(Float)
    filePath = Column(String)
    createdAt = Column(String, default=get_iso_now)
    
    userId = Column(String, ForeignKey("User.id"))
    competitionId = Column(String, ForeignKey("Competition.id"))
    
    user = relationship("User", back_populates="submissions")
    competition = relationship("Competition", back_populates="submissions")
