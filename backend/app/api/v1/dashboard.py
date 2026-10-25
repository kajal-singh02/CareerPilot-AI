from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.entities import (
    User, Resume, ResumeAnalysis, JobApplication, JobMatch,
    LearningRoadmap, RoadmapMilestone, InterviewSession
)
from app.schemas.schemas import DashboardStatsOut

router = APIRouter()

@router.get("/stats", response_model=DashboardStatsOut)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Resumes
    resumes_count = db.query(Resume).filter(Resume.user_id == current_user.id).count()
    latest_analysis = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.id.desc())
        .first()
    )
    resume_score = latest_analysis.overall_score if latest_analysis else None

    # Applications
    applications = db.query(JobApplication).filter(JobApplication.user_id == current_user.id).all()
    apps_by_status = {}
    for a in applications:
        status_key = a.status.lower()
        apps_by_status[status_key] = apps_by_status.get(status_key, 0) + 1

    recent_apps = (
        db.query(JobApplication)
        .filter(JobApplication.user_id == current_user.id)
        .order_by(JobApplication.id.desc())
        .limit(5)
        .all()
    )

    # Job Matches
    top_match = (
        db.query(JobMatch)
        .filter(JobMatch.user_id == current_user.id)
        .order_by(JobMatch.match_score.desc())
        .first()
    )
    top_match_dict = None
    if top_match:
        top_match_dict = {
            "job_title": top_match.job_title,
            "company_name": top_match.company_name,
            "match_score": top_match.match_score
        }

    # Interviews
    interviews_completed = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id, InterviewSession.status == "completed")
        .count()
    )

    # Roadmap Progress
    total_milestones = (
        db.query(RoadmapMilestone)
        .join(LearningRoadmap)
        .filter(LearningRoadmap.user_id == current_user.id)
        .count()
    )
    completed_milestones = (
        db.query(RoadmapMilestone)
        .join(LearningRoadmap)
        .filter(LearningRoadmap.user_id == current_user.id, RoadmapMilestone.is_completed == True)
        .count()
    )
    roadmap_progress = round((completed_milestones / total_milestones * 100), 1) if total_milestones > 0 else 0.0

    # Composite Readiness Score
    # Components: Resume score (40%), Match quality (25%), Interview completion (20%), Roadmap progress (15%)
    r_pts = (resume_score or 50) * 0.40
    m_pts = (top_match.match_score if top_match else 50) * 0.25
    i_pts = min(100, interviews_completed * 35) * 0.20
    rm_pts = roadmap_progress * 0.15
    readiness = int(r_pts + m_pts + i_pts + rm_pts)

    if readiness >= 82:
        verdict = "Interview Ready & Highly Competitive"
    elif readiness >= 68:
        verdict = "Solid Baseline — Closing Final Gaps"
    elif readiness >= 50:
        verdict = "Active Preparation in Progress"
    else:
        verdict = "Getting Started"

    return DashboardStatsOut(
        resume_quality_score=resume_score,
        resumes_count=resumes_count,
        applications_count=len(applications),
        applications_by_status=apps_by_status,
        top_matched_job=top_match_dict,
        interviews_completed=interviews_completed,
        roadmap_progress=roadmap_progress,
        recent_applications=recent_apps,
        readiness_score=readiness,
        readiness_verdict=verdict
    )
