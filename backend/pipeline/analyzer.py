from __future__ import annotations
import json
import os
from loguru import logger
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are a senior clinical pathologist. 
Return ONLY a valid JSON object. Do not include markdown formatting or prose.
Required keys: health_score (int 0-100), health_grade (string), health_summary (string), tests (list of objects)."""

ANALYSIS_PROMPT = """Analyze this lab report for a {age} year old {gender_full} patient.
Return this JSON structure:
{{
  "health_score": 85,
  "health_grade": "Good",
  "health_summary": "3-4 sentence summary...",
  "tests": [{{ "test_name": "Hemoglobin", "value": 14.5, "status": "normal" }}]
}}

REPORT TEXT:
{report_text}"""

class MedicalAnalyzer:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None
        if self.client: logger.info("Gemini 3 Medical Engine Ready.")

    def analyze(self, report_text: str, age: int, gender: str, medications: list = None) -> dict:
        if not self.client: return {"error": "No API Key"}
        
        # Limit text to 15k chars to ensure focus on the core results
        prompt = ANALYSIS_PROMPT.format(
            age=age, 
            gender_full="Male" if gender == "M" else "Female", 
            report_text=report_text[:15000]
        )

        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview", 
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            
            data = json.loads(response.text)
            
            # Unwrap if it's a list
            if isinstance(data, list):
                data = data[0]
                
            return data

        except Exception as e:
            logger.error(f"Analysis Failed: {e}")
            return {"error": str(e)}

_INSTANCE = None
def get_analyzer():
    global _INSTANCE
    if _INSTANCE is None: _INSTANCE = MedicalAnalyzer()
    return _INSTANCE
