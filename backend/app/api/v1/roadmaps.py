from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.entities import User, LearningRoadmap, RoadmapMilestone
from app.schemas.schemas import RoadmapOut, MilestoneUpdate
from app.services.roadmap_service import generate_learning_roadmap

router = APIRouter()

class RoadmapCreateRequest(BaseModel):
    target_role: Optional[str] = None
    missing_skills: Optional[List[str]] = None

@router.post("/generate", response_model=RoadmapOut)
def create_roadmap(
    req: RoadmapCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = current_user.profile
    target_role = req.target_role or (profile.preferred_role if profile else "Full Stack Developer")
    user_skills = profile.existing_skills if profile and profile.existing_skills else ["Python", "JavaScript"]
    missing = req.missing_skills or ["Docker", "Kubernetes", "AWS", "CI/CD", "System Design"]

    roadmap_data = generate_learning_roadmap(target_role, user_skills, missing)

    roadmap = LearningRoadmap(
        user_id=current_user.id,
        target_role=target_role,
        objective=roadmap_data.get("objective", f"Bridge key competencies for {target_role}"),
        total_weeks=roadmap_data.get("total_weeks", 6)
    )
    db.add(roadmap)
    db.flush()

    for m in roadmap_data.get("milestones", []):
        milestone = RoadmapMilestone(
            roadmap_id=roadmap.id,
            week_number=m.get("week_number", 1),
            title=m.get("title", "Sprint Milestone"),
            description=m.get("description", ""),
            skills=m.get("skills", []),
            tasks=m.get("tasks", []),
            project_idea=m.get("project_idea"),
            resources=m.get("resources", []),
            is_completed=False
        )
        db.add(milestone)

    db.commit()
    db.refresh(roadmap)
    return roadmap


@router.get("/", response_model=List[RoadmapOut])
def list_roadmaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(LearningRoadmap).filter(LearningRoadmap.user_id == current_user.id).order_by(LearningRoadmap.id.desc()).all()


@router.get("/{roadmap_id}", response_model=RoadmapOut)
def get_roadmap(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.id == roadmap_id, LearningRoadmap.user_id == current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.patch("/{roadmap_id}/milestones/{milestone_id}")
def update_milestone_progress(
    roadmap_id: int,
    milestone_id: int,
    update: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    milestone = (
        db.query(RoadmapMilestone)
        .join(LearningRoadmap)
        .filter(RoadmapMilestone.id == milestone_id, LearningRoadmap.user_id == current_user.id)
        .first()
    )
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone.is_completed = update.is_completed
    db.commit()
    return {"message": "Milestone status updated", "is_completed": milestone.is_completed}
