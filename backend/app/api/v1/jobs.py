from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.entities import User, Job, SavedJob
from app.schemas.schemas import JobOut

router = APIRouter()

@router.get("/", response_model=List[JobOut])
def list_jobs(
    search: Optional[str] = None,
    work_mode: Optional[str] = None,
    location: Optional[str] = None,
    experience_level: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Job).filter(Job.is_active == True)

    if search:
        term = f"%{search}%"
        query = query.filter(or_(Job.title.ilike(term), Job.company.ilike(term), Job.description.ilike(term)))
    if work_mode and work_mode.lower() != "all":
        query = query.filter(Job.work_mode.ilike(work_mode))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if experience_level and experience_level.lower() != "all":
        query = query.filter(Job.experience_level.ilike(f"%{experience_level}%"))

    jobs = query.order_by(Job.id.desc()).offset(skip).limit(limit).all()
    saved_ids = set(s.job_id for s in db.query(SavedJob.job_id).filter(SavedJob.user_id == current_user.id).all())

    results = []
    for j in jobs:
        results.append(JobOut(
            id=j.id,
            title=j.title,
            company=j.company,
            description=j.description,
            location=j.location,
            work_mode=j.work_mode,
            experience_level=j.experience_level,
            salary_range=j.salary_range,
            required_skills=j.required_skills or [],
            preferred_skills=j.preferred_skills or [],
            application_url=j.application_url,
            is_sample=j.is_sample,
            is_saved=(j.id in saved_ids),
            created_at=j.created_at
        ))
    return results


@router.get("/saved/all", response_model=List[JobOut])
def list_saved_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_jobs = (
        db.query(Job)
        .join(SavedJob, SavedJob.job_id == Job.id)
        .filter(SavedJob.user_id == current_user.id)
        .all()
    )
    return [
        JobOut(
            id=j.id,
            title=j.title,
            company=j.company,
            description=j.description,
            location=j.location,
            work_mode=j.work_mode,
            experience_level=j.experience_level,
            salary_range=j.salary_range,
            required_skills=j.required_skills or [],
            preferred_skills=j.preferred_skills or [],
            application_url=j.application_url,
            is_sample=j.is_sample,
            is_saved=True,
            created_at=j.created_at
        )
        for j in saved_jobs
    ]


@router.get("/{job_id}", response_model=JobOut)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    is_saved = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job.id).first() is not None

    return JobOut(
        id=job.id,
        title=job.title,
        company=job.company,
        description=job.description,
        location=job.location,
        work_mode=job.work_mode,
        experience_level=job.experience_level,
        salary_range=job.salary_range,
        required_skills=job.required_skills or [],
        preferred_skills=job.preferred_skills or [],
        application_url=job.application_url,
        is_sample=job.is_sample,
        is_saved=is_saved,
        created_at=job.created_at
    )


@router.post("/{job_id}/save")
def save_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job.id).first()
    if not existing:
        saved = SavedJob(user_id=current_user.id, job_id=job.id)
        db.add(saved)
        db.commit()
    return {"message": "Job saved successfully", "is_saved": True}


@router.delete("/{job_id}/save")
def unsave_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(SavedJob).filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id).first()
    if existing:
        db.delete(existing)
        db.commit()
    return {"message": "Job unsaved successfully", "is_saved": False}
