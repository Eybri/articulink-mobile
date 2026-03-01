cd backend 
python -m venv venv
venv/Scripts/Activate
uvicorn app.main:app --host 0.0.0.0 --port 5000

cd frontend
npm i
npx expo start
