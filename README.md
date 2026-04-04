# MediSense AI

MediSense AI is a fast, intelligent backend service that analyzes clinical pathology lab reports (PDFs) and transforms them into patient-friendly insights and beautifully designed PDF health reports. Powered by Google's new **Gemini 3 Flash** model, MediSense AI understands complex medical terminology, extracts structured test data, identifies clinical patterns, and provides a digestible health score.

## Features
- **PDF Data Extraction**: Seamlessly parses text from digital pathology reports using `pypdf`.
- **Intelligent Medical Analysis**: Distills complex biometric markers into a comprehensive JSON format using `google-genai` and the Gemini 3 Flash model.
- **Scoring System**: Calculates an overall health score (0-100) and grade (Excellent to Poor) based on extracted biomarkers.
- **Export to PDF**: Dynamically renders visually rich, multi-page PDF health summaries directly from the API utilizing `reportlab`. The exported report includes score dials, actionable lifestyle tips, and dynamic clinical patterns.
- **RESTful API**: Built horizontally scalable and exceptionally fast with **FastAPI**.

## Getting Started

### Prerequisites
- Python 3.10+
- An API Key for Gemini (`GEMINI_API_KEY`)

### Setup and Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up Environment Variables:
   - Copy `.env.example` to `.env`.
   - Update `.env` with your `GEMINI_API_KEY`.

### Running the Server

Start the FastAPI application using `uvicorn`:
```bash
uvicorn main:app --reload --port 8000
```

Once running, the interactive API documentation (Swagger UI) is available at:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

## API Endpoints

### 1. JSON Analysis Core
`POST /analyze`
Accepts a patient's medical lab report as a PDF and returns the analysis in structured JSON.

**Request Form Data:**
- `file`: (File, required) The Medical report PDF.

**Returns:** JSON document detailing health score, summary, and individual biomarkers (normal, low, high).

### 2. Generate PDF Health Report
`POST /analyze/pdf`
Accepts a lab report and patient data, parses it, and dynamically generates a beautifully styled downloaded PDF Report.

**Request Form Data:**
- `file`: (File, required) The Medical report PDF.
- `age`: (Integer, required) Patient's age.
- `gender`: (String: 'M' or 'F', required) Patient's gender.
- `patient_name`: (String, optional) Defaults to "Patient".

**Returns:** An `application/pdf` file download.

## Project Structure

```text
backend/
├── main.py                 # FastAPI Application routes and setup
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (API Keys)
└── pipeline/
    ├── analyzer.py         # Google Gemini 3 Flash integration & prompts
    └── pdf_report.py       # Custom ReportLab PDF generator logic
```

## Technologies Used
* **[FastAPI](https://fastapi.tiangolo.com/)**: High-performance async web framework.
* **[Gemini 3 Flash](https://ai.google.dev/)**: Core Engine providing intelligent medical inference.
* **[ReportLab](https://pypi.org/project/reportlab/)**: Engine for laying out and designing actionable PDF reports.
* **[pyPDF](https://pypi.org/project/pypdf/)**: Pure-python library for PDF text extraction.
