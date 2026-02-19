from fastapi import FastAPI
from app.routers import submissions, competitions
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DataComp API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(submissions.router)
app.include_router(competitions.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to DataComp API"}
