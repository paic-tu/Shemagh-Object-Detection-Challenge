# DataComp - AI Competition Platform

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL

### Database Setup
1. Create a PostgreSQL database named `datacomp`.
2. Update `frontend/.env` with your database credentials.

### Frontend Setup
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies (already done):
   ```bash
   npm install
   ```
3. Run Prisma migration:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Activate virtual environment (already created):
   ```bash
   .\venv\Scripts\activate
   ```
3. Install dependencies (already done):
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Features
- **Authentication**: Sign up and login (Admin/User).
- **Competitions**: Create competitions (Admin), View details, Download data.
- **Submissions**: Upload predictions, Automatic scoring (Accuracy/MSE).
- **Leaderboard**: Real-time ranking based on best scores.

## Notes
- To create an Admin user, sign up first, then manually update the `role` to `ADMIN` in the database.
