import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Resume, ResumeAnalysis
from app.schemas.schemas import ResumeOut, ResumeAnalysisOut
from app.core.config import settings
from app.services.resume_parser import extract_text_from_file, parse_resume_heuristics
from app.services.resume_analysis import analyze_resume

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}

@router.post("/upload", response_model=ResumeOut)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'. Allowed: PDF, DOCX, TXT."
        )

    # Read and validate size limit
    content = await file.read()
    file_size = len(content)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Secure random filename
    safe_filename = f"{uuid.uuid4().hex}_{os.path.basename(file.filename)}"
    dest_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(dest_path, "wb") as f:
        f.write(content)

    # Extract text
    try:
        raw_text = extract_text_from_file(dest_path, file.filename)
    except Exception as e:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    heuristics = parse_resume_heuristics(raw_text)

    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=dest_path,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        raw_text=raw_text,
        extracted_data=heuristics
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeOut(
        id=resume.id,
        filename=resume.filename,
        file_size=resume.file_size,
        mime_type=resume.mime_type,
        created_at=resume.created_at,
        has_analysis=False
    )


@router.get("/", response_model=List[ResumeOut])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).all()
    results = []
    for r in resumes:
        has_a = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == r.id).first() is not None
        results.append(ResumeOut(
            id=r.id,
            filename=r.filename,
            file_size=r.file_size,
            mime_type=r.mime_type,
            created_at=r.created_at,
            has_analysis=has_a
        ))
    return results


@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {
        "id": resume.id,
        "filename": resume.filename,
        "raw_text": resume.raw_text,
        "extracted_data": resume.extracted_data,
        "created_at": resume.created_at
    }


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}


@router.post("/{resume_id}/analyze", response_model=ResumeAnalysisOut)
def analyze_user_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Check if analysis exists
    existing = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).first()
    if existing:
        return existing

    result = analyze_resume(resume.raw_text, current_user.full_name or "Candidate")

    analysis = ResumeAnalysis(
        resume_id=resume.id,
        user_id=current_user.id,
        overall_score=result.get("overall_score", 75),
        rubric_scores=result.get("rubric_scores", {}),
        overview=result.get("overview", {}),
        strengths=result.get("strengths", []),
        weaknesses=result.get("weaknesses", []),
        missing_info=result.get("missing_info", []),
        improvements=result.get("improvements", []),
        categorized_skills=result.get("categorized_skills", {}),
        is_live_claude=result.get("is_live_claude", False)
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/{resume_id}/analysis", response_model=ResumeAnalysisOut)
def get_resume_analysis(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    analysis = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).first()
    if not analysis:
        # Generate automatically if not yet analyzed
        result = analyze_resume(resume.raw_text, current_user.full_name or "Candidate")
        analysis = ResumeAnalysis(
            resume_id=resume.id,
            user_id=current_user.id,
            overall_score=result.get("overall_score", 75),
            rubric_scores=result.get("rubric_scores", {}),
            overview=result.get("overview", {}),
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            missing_info=result.get("missing_info", []),
            improvements=result.get("improvements", []),
            categorized_skills=result.get("categorized_skills", {}),
            is_live_claude=result.get("is_live_claude", False)
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

    return analysis
