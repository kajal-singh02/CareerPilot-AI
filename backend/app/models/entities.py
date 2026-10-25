from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON, Float
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="user", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("ChatConversation", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    phone = Column(String(50), nullable=True)
    degree = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    years_of_experience = Column(Float, default=0.0)
    preferred_role = Column(String(255), default="Full Stack Developer")
    preferred_location = Column(String(255), default="Remote")
    work_mode = Column(String(50), default="remote")  # remote, hybrid, onsite
    target_industry = Column(String(255), nullable=True)
    existing_skills = Column(JSON, default=list)  # list of strings
    career_goals = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="profile")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String(100), nullable=False)
    raw_text = Column(Text, nullable=False)
    extracted_data = Column(JSON, default=dict)  # structured parsed fields
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="resumes")
    analysis = relationship("ResumeAnalysis", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    matches = relationship("JobMatch", back_populates="resume", cascade="all, delete-orphan")


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Integer, nullable=False)  # 0 to 100
    rubric_scores = Column(JSON, default=dict)       # structure: 20, technical: 25, etc.
    overview = Column(JSON, default=dict)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    missing_info = Column(JSON, default=list)
    improvements = Column(JSON, default=list)        # bullet rewrites XYZ
    categorized_skills = Column(JSON, default=dict)
    is_live_claude = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    resume = relationship("Resume", back_populates="analysis")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    location = Column(String(255), default="Remote")
    work_mode = Column(String(50), default="remote")
    experience_level = Column(String(100), default="Entry-to-Mid")
    salary_range = Column(String(100), nullable=True)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    application_url = Column(String(500), nullable=True)
    source = Column(String(100), default="CareerPilot Seed")
    is_sample = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")
    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    match_score = Column(Integer, nullable=False)   # 0 to 100
    component_scores = Column(JSON, default=dict)   # skills: 40, experience: 30, etc.
    matching_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    partial_skills = Column(JSON, default=list)
    evidence = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="job_matches")
    resume = relationship("Resume", back_populates="matches")
    job = relationship("Job", back_populates="matches")


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(255), nullable=False)
    objective = Column(Text, nullable=False)
    total_weeks = Column(Integer, default=6)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="roadmaps")
    milestones = relationship("RoadmapMilestone", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapMilestone.week_number")


class RoadmapMilestone(Base):
    __tablename__ = "roadmap_milestones"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("learning_roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    week_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    skills = Column(JSON, default=list)
    tasks = Column(JSON, default=list)
    project_idea = Column(Text, nullable=True)
    resources = Column(JSON, default=list)  # list of {title, url, type}
    is_completed = Column(Boolean, default=False)

    roadmap = relationship("LearningRoadmap", back_populates="milestones")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(255), nullable=False)
    interview_type = Column(String(50), default="mixed")  # technical, hr, behavioral, mixed
    difficulty = Column(String(50), default="intermediate")
    total_questions = Column(Integer, default=5)
    current_index = Column(Integer, default=0)
    status = Column(String(50), default="in_progress")   # in_progress, completed
    overall_score = Column(Float, nullable=True)
    feedback_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan", order_by="InterviewQuestion.question_order")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_order = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    category = Column(String(100), default="Technical")
    target_skill = Column(String(100), nullable=True)

    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_response = Column(Text, nullable=False)
    score = Column(Float, nullable=False)  # 0 to 100
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    star_feedback = Column(JSON, default=dict)
    improved_answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    question = relationship("InterviewQuestion", back_populates="answer")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    status = Column(String(50), default="applied")  # interested, saved, applied, assessment, interview, offer, rejected, withdrawn
    application_date = Column(DateTime, default=utcnow)
    notes = Column(Text, nullable=True)
    next_action = Column(String(255), nullable=True)
    next_action_date = Column(DateTime, nullable=True)
    salary_offered = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="applications")


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="Career Strategy Session")
    selected_resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    selected_job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)  # tool execution result or pending action payload
    created_at = Column(DateTime, default=utcnow)

    conversation = relationship("ChatConversation", back_populates="messages")


class ChatPendingAction(Base):
    __tablename__ = "chat_pending_actions"

    id = Column(String(64), primary_key=True)  # uuid string
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(64), nullable=False)  # e.g. "save_job", "create_learning_roadmap", "create_job_application"
    description = Column(String(255), nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String(32), default="pending")  # pending, executed, cancelled, expired
    created_at = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime, nullable=False)
