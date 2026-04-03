from __future__ import annotations
import json
import os
from loguru import logger
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are a senior clinical pathologist. 
Return ONLY a valid JSON object.
Required keys: health_score (int), health_grade (string), health_summary (string), tests (list)."""

ANALYSIS_PROMPT = """Analyze this lab report for a {age} year old {gender_full} patient.
JSON Structure:
{{
  "health_score": 0-100,
  "health_grade": "Excellent/Good/Fair/Poor",
  "health_summary": "3-4 sentence summary...",
  "tests": [{{ "test_name": "Name", "value": "Value", "status": "normal/high/low" }}]
}}

REPORT: {report_text}"""

class MedicalAnalyzer:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None
        if self.client: logger.info("Gemini 3 Medical Engine Ready.")

    def analyze(self, report_text: str, age: int, gender: str) -> dict:
        if not self.client: return {"error": "No API Key"}
        
        prompt = ANALYSIS_PROMPT.format(
            age=age, 
            gender_full="Male" if gender == "M" else "Female", 
            report_text=report_text[:20000] # Gemini 3 handles large text easily
        )

        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview", # <--- THE CRITICAL FIX
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            
            data = json.loads(response.text)
            return data[0] if isinstance(data, list) else data

        except Exception as e:
            logger.error(f"Analysis Failed: {e}")
            return {"error": str(e)}

_INSTANCE = None
def get_analyzer():
    global _INSTANCE
    if _INSTANCE is None: _INSTANCE = MedicalAnalyzer()
    return _INSTANCE
