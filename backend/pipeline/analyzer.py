from __future__ import annotations
import json
import os
from loguru import logger
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are a Senior Medical Consultant specializing in Clinical Pathology and Patient Communication.
Your task is to transform a raw medical report into a high-literacy, professional "Patient Health Blueprint".
Maintain a professional, authoritative, yet reassuring tone.
Return ONLY a valid JSON object. Do not include markdown formatting like ```json."""

ANALYSIS_PROMPT = """Analyze this lab report for a {age} year old {gender_full} patient.

JSON Structure Requirements:
{{
  "health_score": 0,
  "health_grade": "Excellent/Good/Fair/Poor",
  "health_summary": "Short 1-2 sentence intro summary.",
  "doctors_narrative": "A professional causal analysis explaining 'what is what' and 'what leads to what'. Explain interactions between markers (e.g. high Triglycerides + borderline Glucose -> Metabolic syndrome risk).",
  "tests": [
    {{
      "test_name": "Name",
      "value": "Value",
      "unit": "Clean string representation of unit (e.g., mg/dL, 10^9/L, mmol/L)",
      "status": "normal/high/low/critical_high/critical_low",
      "reference_range": "Normal range",
      "deviation_pct": 0.0,
      "explanation": "Jargon-checked explanation. Explain complex terms with analogies (e.g., 'Think of eGFR as the speed limit').",
      "category": "Category",
      "severity": "normal/mild/moderate/critical",
      "gauge_position": 0.5
    }}
  ],
  "path_to_normal": {{
    "dietary_swaps": ["Direct replacements (e.g., 'Replace red meat with plant-based proteins to reduce kidney load')"],
    "activity_prescription": "Specific exercise types (e.g., Aerobic vs Resistance) based on findings."
  }},
  "curated_resources": {{
    "youtube": [{{"title": "Title (e.g. Mayo Clinic: Understanding Cholesterol)", "url": "Actual or constructed search url"}}],
    "articles": [{{"title": "American Heart Association / NIDDK article", "url": "Actual URL"}}]
  }}
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
