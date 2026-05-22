from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from services.match_service import analyze_match
import fitz

router = APIRouter(prefix="/match", tags=["match"])


class MatchRequest(BaseModel):
    cv_text: str
    job_description: str


@router.post("/upload-cv")
async def upload_cv(cv_file: UploadFile = File(...)):
    if not cv_file.filename or not cv_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    file_bytes = await cv_file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be under 5MB")

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        page_count = len(doc)
        doc.close()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        raise HTTPException(status_code=400, detail="Could not extract text from this PDF. Please try a text-based PDF or paste your CV manually.")

    if len(text.strip()) < 100:
        raise HTTPException(status_code=400, detail="Could not extract text from this PDF. Please try a text-based PDF or paste your CV manually.")

    return {
        "cv_text": text,
        "page_count": page_count,
        "success": True,
    }


@router.post("/analyze")
async def analyze(data: MatchRequest):
    if not data.cv_text.strip() or not data.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Please provide both CV text and job description (minimum 50 characters each)"
        )
    if len(data.cv_text.strip()) < 50 or len(data.job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Please provide both CV text and job description (minimum 50 characters each)"
        )
    try:
        result = analyze_match(data.cv_text, data.job_description)
        return result
    except Exception:
        raise HTTPException(status_code=500, detail="AI analysis failed, please try again")
