from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.scoring import calculate_score
from app import crud, schemas
import os
from datetime import datetime
import shutil

router = APIRouter(
    prefix="/submissions",
    tags=["submissions"],
)

UPLOAD_DIR = "uploads/submissions"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=schemas.Submission)
async def create_submission(
    file: UploadFile = File(...),
    competition_id: str = Form(...),
    user_id: str = Form(...),
    db: Session = Depends(get_db)
):
    # 1. Check if competition exists
    competition = crud.get_competition(db, competition_id)
    if not competition:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    # 2. Check if user exists
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 3. Save uploaded file
    file_ext = file.filename.split(".")[-1]
    if file_ext.lower() != "csv":
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{user_id}_{timestamp}.csv"
    competition_upload_dir = os.path.join(UPLOAD_DIR, competition_id)
    os.makedirs(competition_upload_dir, exist_ok=True)
    file_path = os.path.join(competition_upload_dir, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
    # 4. Calculate score
    try:
        solution_path = competition.solutionDataPath
        if not os.path.exists(solution_path):
             solution_path = os.path.join(os.getcwd(), solution_path)
             if not os.path.exists(solution_path):
                raise HTTPException(status_code=500, detail=f"Solution file not found at {competition.solutionDataPath}")

        score = calculate_score(file_path, solution_path, competition.metric)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")

    # 5. Save submission to DB
    submission_data = schemas.SubmissionCreate(
        score=score,
        filePath=file_path,
        userId=user_id,
        competitionId=competition_id
    )
    
    return crud.create_submission(db, submission_data)
