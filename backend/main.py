from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import io
import pypdf
from pipeline.analyzer import get_analyzer
from pipeline.pdf_report import generate_pdf
from loguru import logger

app = FastAPI(title="MediSense AI API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class MedicalTest(BaseModel):
    test_name: str
    value: float | str
    status: str

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
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = "\n".join([page.extract_text() or "" for page in pdf_reader.pages])

        if not text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

        logger.info(f"Analyzing file: {file.filename}")
        analyzer = get_analyzer()
        result = analyzer.analyze(text, 41, "M")

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

class ExportPDFRequest(BaseModel):
    analysis: dict
    patient_name: str = "Patient"
    age: int = 30
    gender: str = "M"

@app.post("/export/pdf")
async def export_pdf(req: ExportPDFRequest):
    try:
        pdf_bytes = generate_pdf(
            req.analysis,
            patient_name=req.patient_name,
            patient_age=req.age,
            patient_gender=req.gender,
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="MediSense_Report.pdf"'},
        )
    except Exception as e:
        logger.error(f"PDF Export Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/pdf")
async def analyze_and_download_pdf(
    file: UploadFile = File(...),
    age: int = Form(...),
    gender: str = Form(...),
    patient_name: str = Form("Patient"),
    language: str = Form("en"),
    medications: Optional[str] = Form(None),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        text = "\n".join([page.extract_text() or "" for page in pdf_reader.pages])

        if not text.strip():
            raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

        logger.info(f"Analyzing file for PDF report: {file.filename}")
        analyzer = get_analyzer()
        analysis = analyzer.analyze(text, age, gender)

        if "error" in analysis:
            raise HTTPException(status_code=500, detail=analysis["error"])

        pdf_bytes = generate_pdf(
            analysis,
            patient_name=patient_name,
            patient_age=age,
            patient_gender=gender,
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="MediSense_Report.pdf"'},
        )

    except Exception as e:
        logger.error(f"PDF Export Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)