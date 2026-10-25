from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.entities import User, JobApplication
from app.schemas.schemas import ApplicationCreate, ApplicationUpdate, ApplicationOut

router = APIRouter()

@router.get("/", response_model=List[ApplicationOut])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(JobApplication).filter(JobApplication.user_id == current_user.id).order_by(JobApplication.id.desc()).all()


@router.post("/", response_model=ApplicationOut)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = JobApplication(
        user_id=current_user.id,
        job_id=app_in.job_id,
        job_title=app_in.job_title,
        company=app_in.company,
        status=app_in.status,
        notes=app_in.notes,
        next_action=app_in.next_action,
        next_action_date=app_in.next_action_date,
        salary_offered=app_in.salary_offered
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.patch("/{app_id}", response_model=ApplicationOut)
def update_application(
    app_id: int,
    app_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(JobApplication).filter(JobApplication.id == app_id, JobApplication.user_id == current_user.id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application record not found")

    update_data = app_update.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(application, field, val)

    db.commit()
    db.refresh(application)
    return application


@router.delete("/{app_id}")
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(JobApplication).filter(JobApplication.id == app_id, JobApplication.user_id == current_user.id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application record not found")

    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}
