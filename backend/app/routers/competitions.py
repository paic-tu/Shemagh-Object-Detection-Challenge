from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
import uuid
from app import crud, schemas, models
import os
from datetime import datetime
import shutil

router = APIRouter(
    prefix="/competitions",
    tags=["competitions"],
)

UPLOAD_DIR = "uploads"
TRAIN_DIR = os.path.join(UPLOAD_DIR, "train")
SOLUTION_DIR = os.path.join(UPLOAD_DIR, "solution")
os.makedirs(TRAIN_DIR, exist_ok=True)
os.makedirs(SOLUTION_DIR, exist_ok=True)

@router.get("/", response_model=list[schemas.Competition])
async def read_competitions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    competitions = crud.get_competitions(db, skip=skip, limit=limit)
    return competitions

@router.post("/", response_model=schemas.Competition)
async def create_competition(
    title: str = Form(...),
    description: str = Form(...),
    deadline: str = Form(...),
    metric: str = Form(...),
    train_file: UploadFile = File(...),
    solution_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Save files
        file_id = str(uuid.uuid4())
        
        train_filename = f"{file_id}_train.csv"
        solution_filename = f"{file_id}_solution.csv"
        
        train_path = os.path.join(TRAIN_DIR, train_filename)
        solution_path = os.path.join(SOLUTION_DIR, solution_filename)
        
        with open(train_path, "wb") as buffer:
            shutil.copyfileobj(train_file.file, buffer)
        
        with open(solution_path, "wb") as buffer:
            shutil.copyfileobj(solution_file.file, buffer)
            
        # Parse deadline
        deadline_dt = datetime.fromisoformat(deadline)
        
        # Create DB record
        db_competition = models.Competition(
            title=title,
            description=description,
            deadline=deadline_dt,
            metric=metric,
            trainDataPath=train_path,
            solutionDataPath=solution_path
        )
        
        db.add(db_competition)
        db.commit()
        db.refresh(db_competition)
        
        return db_competition
        
    except Exception as e:
        print(f"Error creating competition: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{competition_id}/download")
async def download_train_data(competition_id: str, db: Session = Depends(get_db)):
    competition = crud.get_competition(db, competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    file_path = competition.trainDataPath
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_path, filename=f"train_{competition.title}.csv", media_type="text/csv")

@router.delete("/{competition_id}", status_code=204)
async def delete_competition(competition_id: str, db: Session = Depends(get_db)):
    competition = crud.get_competition(db, competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    # Delete files
    if competition.trainDataPath and os.path.exists(competition.trainDataPath):
        os.remove(competition.trainDataPath)
    if competition.solutionDataPath and os.path.exists(competition.solutionDataPath):
        os.remove(competition.solutionDataPath)
        
    # Delete from DB
    db.delete(competition)
    db.commit()
    
    return None

@router.put("/{competition_id}", response_model=schemas.Competition)
async def update_competition(
    competition_id: str,
    title: str = Form(None),
    description: str = Form(None),
    deadline: str = Form(None),
    metric: str = Form(None),
    train_file: UploadFile = File(None),
    solution_file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    competition = crud.get_competition(db, competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
        
    try:
        # Update fields if provided
        if title:
            competition.title = title
        if description:
            competition.description = description
        if deadline:
            competition.deadline = datetime.fromisoformat(deadline)
        if metric:
            competition.metric = metric
            
        # Update files if provided
        if train_file:
            # Delete old file
            if competition.trainDataPath and os.path.exists(competition.trainDataPath):
                os.remove(competition.trainDataPath)
                
            # Save new file
            file_id = str(uuid.uuid4())
            train_filename = f"{file_id}_train.csv"
            train_path = os.path.join(TRAIN_DIR, train_filename)
            with open(train_path, "wb") as buffer:
                shutil.copyfileobj(train_file.file, buffer)
            competition.trainDataPath = train_path
            
        if solution_file:
            # Delete old file
            if competition.solutionDataPath and os.path.exists(competition.solutionDataPath):
                os.remove(competition.solutionDataPath)
                
            # Save new file
            file_id = str(uuid.uuid4())
            solution_filename = f"{file_id}_solution.csv"
            solution_path = os.path.join(SOLUTION_DIR, solution_filename)
            with open(solution_path, "wb") as buffer:
                shutil.copyfileobj(solution_file.file, buffer)
            competition.solutionDataPath = solution_path
            
        db.commit()
        db.refresh(competition)
        return competition
        
    except Exception as e:
        print(f"Error updating competition: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
