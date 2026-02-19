from sqlalchemy.orm import Session
from app import models, schemas
import uuid
from datetime import datetime

# User Operations
def get_user(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    # Note: Password hashing should be handled before calling this or inside here.
    # Since NextAuth handles auth, this might be redundant unless we want backend-only users.
    db_user = models.User(
        id=str(uuid.uuid4()), # Generating ID if not provided by Prisma logic
        email=user.email, 
        password=user.password, # Hashed password expected
        name=user.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Competition Operations
def get_competition(db: Session, competition_id: str):
    return db.query(models.Competition).filter(models.Competition.id == competition_id).first()

def get_competitions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Competition).offset(skip).limit(limit).all()

def create_competition(db: Session, competition: schemas.CompetitionCreate, train_path: str, solution_path: str):
    # Ensure deadline is stored as ISO string with Z
    deadline_iso = competition.deadline.isoformat()
    if not deadline_iso.endswith("Z"):
        deadline_iso += "Z"

    db_competition = models.Competition(
        id=str(uuid.uuid4()),
        title=competition.title,
        description=competition.description,
        deadline=deadline_iso,
        metric=competition.metric,
        trainDataPath=train_path,
        solutionDataPath=solution_path
    )
    db.add(db_competition)
    db.commit()
    db.refresh(db_competition)
    return db_competition

# Submission Operations
def get_submissions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Submission).offset(skip).limit(limit).all()

def get_submissions_by_competition(db: Session, competition_id: str, skip: int = 0, limit: int = 100):
    return db.query(models.Submission).filter(models.Submission.competitionId == competition_id).offset(skip).limit(limit).all()

def create_submission(db: Session, submission: schemas.SubmissionCreate):
    db_submission = models.Submission(
        id=str(uuid.uuid4()),
        score=submission.score,
        filePath=submission.filePath,
        userId=submission.userId,
        competitionId=submission.competitionId
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission
