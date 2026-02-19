from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class Metric(str, Enum):
    ACCURACY = "ACCURACY"
    MSE = "MSE"

class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class UserBase(BaseModel):
    email: str
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    role: Role
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class CompetitionBase(BaseModel):
    title: str
    description: str
    deadline: datetime
    metric: Metric

class CompetitionCreate(CompetitionBase):
    pass

class Competition(CompetitionBase):
    id: str
    trainDataPath: str
    solutionDataPath: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    score: float
    filePath: str

class SubmissionCreate(SubmissionBase):
    userId: str
    competitionId: str

class Submission(SubmissionBase):
    id: str
    userId: str
    competitionId: str
    createdAt: datetime

    class Config:
        from_attributes = True
