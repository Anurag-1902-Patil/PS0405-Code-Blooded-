"""
main.py — MediSense AI Backend
Run: uvicorn main:app --reload --port 8000
"""

import os
import re
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

# Load .env file automatically
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="MediSense AI",
    description="AI-powered medical report analysis",
    version="2.0.0",
)

# Allow all origins so any frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    from pipeline.pipeline import get_pipeline
    logger.info("Starting up — loading pipeline...")
    get_pipeline()
    logger.info("Ready to serve requests.")


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    from pipeline.pipeline import get_pipeline
    p = get_pipeline()
    api_key_set = bool(os.environ.get("ANTHROPIC_API_KEY", "").strip())
    return {
        "status": "ok",
        "anthropic_api_key_set": api_key_set,
        "analyzer_ready": p._analyzer.is_ready(),
    }


# ── Main analysis endpoint ────────────────────────────────────────────────────

@app.post("/analyze")
async def analyze_report(
    file: UploadFile = File(...),
    age: Optional[int] = Form(None),
    gender: Optional[str] = Form(None),
    language: str = Form("en"),
    medications: Optional[str] = Form(None),
):
    from pipeline.pipeline import get_pipeline
    from pipeline.models import PatientContext

    # Resolve MIME type from content_type or filename extension
    mime = file.content_type or ""
    fname = (file.filename or "").lower()
    if mime not in {"application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"}:
        if   fname.endswith(".pdf"):              mime = "application/pdf"
        elif fname.endswith((".jpg", ".jpeg")):   mime = "image/jpeg"
        elif fname.endswith(".png"):              mime = "image/png"
        elif fname.endswith(".webp"):             mime = "image/webp"
        else:
            raise HTTPException(400, "Unsupported file type. Please upload a PDF.")

    # Read file
    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(413, "File too large. Maximum size is 20MB.")
    if len(file_bytes) == 0:
        raise HTTPException(400, "Uploaded file is empty.")

    # Defaults — pipeline will auto-detect from PDF text
    age    = age    or 35
    gender = (gender or "M").upper()
    if gender not in ("M", "F"):
        raise HTTPException(400, "Gender must be M or F.")

    med_list = [m.strip() for m in medications.split(",")] if medications else []

    logger.info(f"Request: {file.filename} | age={age} gender={gender} lang={language}")

    try:
        pipeline = get_pipeline()
        patient  = PatientContext(age=age, gender=gender, language=language, medications=med_list)
        report   = pipeline.analyze(file_bytes, mime, patient)
        return JSONResponse(content=report.to_dict())
    except Exception as e:
        logger.exception(f"Analysis error: {e}")
        raise HTTPException(500, f"Analysis failed: {str(e)}")


# ── Languages ─────────────────────────────────────────────────────────────────

@app.get("/languages")
async def languages():
    return {"languages": [
        {"code": "en", "name": "English"},
        {"code": "hi", "name": "Hindi"},
        {"code": "mr", "name": "Marathi"},
        {"code": "ta", "name": "Tamil"},
        {"code": "te", "name": "Telugu"},
        {"code": "bn", "name": "Bengali"},
        {"code": "gu", "name": "Gujarati"},
    ]}