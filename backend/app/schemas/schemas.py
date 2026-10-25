from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- Auth & User ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserProfileUpdate(BaseModel):
    phone: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    years_of_experience: Optional[float] = None
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None
    work_mode: Optional[str] = None
    target_industry: Optional[str] = None
    existing_skills: Optional[List[str]] = None
    career_goals: Optional[str] = None

class UserProfileOut(BaseModel):
    phone: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    years_of_experience: Optional[float] = 0.0
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None
    work_mode: Optional[str] = "remote"
    target_industry: Optional[str] = None
    existing_skills: List[str] = []
    career_goals: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    profile: Optional[UserProfileOut] = None

    model_config = ConfigDict(from_attributes=True)

# --- Resume & Analysis ---
class ResumeOut(BaseModel):
    id: int
    filename: str
    file_size: int
    mime_type: str
    created_at: datetime
    has_analysis: bool = False

    model_config = ConfigDict(from_attributes=True)

class ResumeAnalysisOut(BaseModel):
    id: int
    resume_id: int
    overall_score: int
    rubric_scores: Dict[str, int]
    overview: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]
    missing_info: List[str]
    improvements: List[Dict[str, str]]
    categorized_skills: Dict[str, List[str]]
    is_live_claude: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Job & Matching ---
class JobOut(BaseModel):
    id: int
    title: str
    company: str
    description: str
    location: str
    work_mode: str
    experience_level: str
    salary_range: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    application_url: Optional[str] = None
    is_sample: bool = True
    is_saved: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class JobMatchRequest(BaseModel):
    resume_id: int
    job_id: Optional[int] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    job_description: Optional[str] = None

class JobMatchOut(BaseModel):
    id: int
    resume_id: int
    job_id: Optional[int] = None
    job_title: str
    company_name: Optional[str] = None
    match_score: int
    component_scores: Dict[str, int]
    matching_skills: List[str] = []
    missing_skills: List[str] = []
    partial_skills: List[str] = []
    evidence: List[Dict[str, str]] = []
    recommendations: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Roadmap & Milestones ---
class MilestoneOut(BaseModel):
    id: int
    week_number: int
    title: str
    description: str
    skills: List[str] = []
    tasks: List[str] = []
    project_idea: Optional[str] = None
    resources: List[Dict[str, str]] = []
    is_completed: bool

    model_config = ConfigDict(from_attributes=True)

class RoadmapOut(BaseModel):
    id: int
    target_role: str
    objective: str
    total_weeks: int
    created_at: datetime
    milestones: List[MilestoneOut] = []

    model_config = ConfigDict(from_attributes=True)

class MilestoneUpdate(BaseModel):
    is_completed: bool

# --- Interview Module ---
class InterviewStartRequest(BaseModel):
    target_role: str
    interview_type: str = "mixed"  # technical, hr, behavioral, mixed
    difficulty: str = "intermediate"
    total_questions: int = 5

class InterviewAnswerRequest(BaseModel):
    user_response: str

class InterviewAnswerOut(BaseModel):
    score: float
    strengths: List[str]
    weaknesses: List[str]
    star_feedback: Dict[str, str] = {}
    improved_answer: Optional[str] = None

class InterviewQuestionOut(BaseModel):
    id: int
    question_order: int
    question_text: str
    category: str
    target_skill: Optional[str] = None
    answer: Optional[InterviewAnswerOut] = None

    model_config = ConfigDict(from_attributes=True)

class InterviewSessionOut(BaseModel):
    id: int
    target_role: str
    interview_type: str
    difficulty: str
    total_questions: int
    current_index: int
    status: str
    overall_score: Optional[float] = None
    feedback_summary: Optional[str] = None
    created_at: datetime
    questions: List[InterviewQuestionOut] = []

    model_config = ConfigDict(from_attributes=True)

# --- Applications ---
class ApplicationCreate(BaseModel):
    job_title: str
    company: str
    job_id: Optional[int] = None
    status: str = "applied"
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    salary_offered: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    salary_offered: Optional[str] = None

class ApplicationOut(BaseModel):
    id: int
    job_id: Optional[int] = None
    job_title: str
    company: str
    status: str
    application_date: datetime
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[datetime] = None
    salary_offered: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Chatbot ---
class ChatMessageCreate(BaseModel):
    content: str
    conversation_id: Optional[int] = None
    selected_resume_id: Optional[int] = None
    selected_job_id: Optional[int] = None

class ChatMessageOut(BaseModel):
    id: int
    role: str
    content: str
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    selected_resume_id: Optional[int] = None
    selected_job_id: Optional[int] = None

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    selected_resume_id: Optional[int] = None
    selected_job_id: Optional[int] = None

class ConversationOut(BaseModel):
    id: int
    title: str
    selected_resume_id: Optional[int] = None
    selected_job_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[ChatMessageOut] = []

    model_config = ConfigDict(from_attributes=True)

class ToolConfirmationRequest(BaseModel):
    confirmed: bool = True

class ToolConfirmationResponse(BaseModel):
    success: bool
    message: str
    action_type: str
    conversation_id: int
    result: Optional[Dict[str, Any]] = None

# --- Resume Tailoring & Builder ---
class ResumeTailorRequest(BaseModel):
    resume_id: int
    target_role: str
    job_description: Optional[str] = None

class ResumeTailorResponse(BaseModel):
    tailored_summary: str
    optimized_bullets: List[Dict[str, str]]
    recommended_skills: List[str]
    tailored_cover_letter: str

# --- Dashboard Overview Stats ---
class DashboardStatsOut(BaseModel):
    resume_quality_score: Optional[int] = None
    resumes_count: int = 0
    applications_count: int = 0
    applications_by_status: Dict[str, int] = {}
    top_matched_job: Optional[Dict[str, Any]] = None
    interviews_completed: int = 0
    roadmap_progress: float = 0.0
    recent_applications: List[ApplicationOut] = []
    readiness_score: int = 0
    readiness_verdict: str = "Getting Started"
