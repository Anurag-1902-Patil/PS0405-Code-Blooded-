from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import io
import pypdf
from pipeline.analyzer import get_analyzer
from loguru import logger

app = FastAPI(title="MediSense AI API", version="3.0.0")

# --- ALLOW FRONTEND TO CONNECT ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS (The "Contracts") ---
class MedicalTest(BaseModel):
    test_name: str
    value: float | str
    status: str # "normal", "high", "low"

class AnalysisResponse(BaseModel):
    health_score: int
    health_grade: str
    health_summary: str
    tests: List[MedicalTest]

@app.get("/")
def home():
    return {"status": "online", "engine": "Gemini 3 Flash"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_report(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        # 1. Read PDF
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = "\n".join([page.extract_text() or "" for page in pdf_reader.pages])
        
        if not text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

        # 2. Run Gemini 3 Analysis
        logger.info(f"Analyzing file: {file.filename}")
        analyzer = get_analyzer()
        result = analyzer.analyze(text, 41, "M") # Defaulting to 41M for now

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error during analysis.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
