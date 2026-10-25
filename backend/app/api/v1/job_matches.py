from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Resume, Job, JobMatch
from app.schemas.schemas import JobMatchRequest, JobMatchOut
from app.services.job_matcher import match_job_description

router = APIRouter()

@router.post("/analyze", response_model=JobMatchOut)
def analyze_job_match(
    req: JobMatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Selected resume not found")

    job_title = req.job_title
    company_name = req.company_name
    job_desc = req.job_description
    job_ref = None

    if req.job_id:
        job = db.query(Job).filter(Job.id == req.job_id).first()
        if job:
            job_ref = job
            job_title = job.title
            company_name = job.company
            job_desc = job.description

    if not job_title or not job_desc:
        raise HTTPException(status_code=400, detail="Job title and description are required for matching analysis")

    match_data = match_job_description(
        resume_text=resume.raw_text,
        job_title=job_title,
        job_description=job_desc,
        company_name=company_name
    )

    job_match = JobMatch(
        user_id=current_user.id,
        resume_id=resume.id,
        job_id=job_ref.id if job_ref else None,
        job_title=job_title,
        company_name=company_name,
        match_score=match_data.get("match_score", 70),
        component_scores=match_data.get("component_scores", {}),
        matching_skills=match_data.get("matching_skills", []),
        missing_skills=match_data.get("missing_skills", []),
        partial_skills=match_data.get("partial_skills", []),
        evidence=match_data.get("evidence", []),
        recommendations=match_data.get("recommendations", [])
    )
    db.add(job_match)
    db.commit()
    db.refresh(job_match)

    return job_match


@router.get("/", response_model=List[JobMatchOut])
def list_job_matches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    matches = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).order_by(JobMatch.id.desc()).all()
    return matches


@router.get("/{match_id}", response_model=JobMatchOut)
def get_job_match(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    match = db.query(JobMatch).filter(JobMatch.id == match_id, JobMatch.user_id == current_user.id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Job match record not found")
    return match
