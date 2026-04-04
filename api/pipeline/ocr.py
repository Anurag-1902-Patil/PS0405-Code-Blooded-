from __future__ import annotations
import io
import pypdf
from dataclasses import dataclass, field
from loguru import logger


@dataclass
class ExtractionResult:
    raw_text: str
    method_used: str
    ocr_confidence: float
    warnings: list[str] = field(default_factory=list)


class DocumentExtractor:
    def extract_from_bytes(self, data: bytes, mime_type: str) -> ExtractionResult:
        if "pdf" not in mime_type:
            return ExtractionResult("", "error", 0.0, ["Unsupported file type. Please upload a PDF."])
        try:
            reader = pypdf.PdfReader(io.BytesIO(data))
            text = "\n".join([page.extract_text() or "" for page in reader.pages])
            word_count = len(text.split())
            logger.info(f"pypdf extracted {word_count} words from {len(reader.pages)} pages.")
            if word_count < 20:
                return ExtractionResult(
                    text, "pypdf", 0.5,
                    ["Very little text extracted. PDF may be image-based or scanned."]
                )
            return ExtractionResult(text, "pypdf", 1.0)
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            return ExtractionResult("", "error", 0.0, [str(e)])


_INSTANCE = None

def get_extractor():
    global _INSTANCE
    if _INSTANCE is None:
        _INSTANCE = DocumentExtractor()
    return _INSTANCE