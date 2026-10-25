export interface UserProfile {
  phone?: string;
  degree?: string;
  graduation_year?: number;
  years_of_experience: number;
  preferred_role: string;
  preferred_location: string;
  work_mode: string;
  target_industry?: string;
  existing_skills: string[];
  career_goals?: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  profile?: UserProfile;
}

export interface Resume {
  id: number;
  filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  has_analysis: boolean;
}

export interface ResumeAnalysis {
  id: number;
  resume_id: number;
  overall_score: number;
  rubric_scores: {
    structure_readability: number;
    skills_technical_relevance: number;
    projects_experience: number;
    clarity_impact: number;
    completeness: number;
  };
  overview: {
    candidate_summary: string;
    detected_domain: string;
    education_overview: string;
    experience_level: string;
  };
  strengths: string[];
  weaknesses: string[];
  missing_info: string[];
  improvements: Array<{
    original: string;
    improved: string;
    rationale: string;
  }>;
  categorized_skills: {
    languages?: string[];
    frameworks?: string[];
    databases?: string[];
    tools_cloud?: string[];
    methodologies?: string[];
  };
  is_live_claude: boolean;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  work_mode: string;
  experience_level: string;
  salary_range?: string;
  required_skills: string[];
  preferred_skills: string[];
  application_url?: string;
  is_sample: boolean;
  is_saved: boolean;
  created_at: string;
}

export interface JobMatch {
  id: number;
  resume_id: number;
  job_id?: number;
  job_title: string;
  company_name?: string;
  match_score: number;
  component_scores: {
    skills_match: number;
    projects_experience: number;
    education_qualifications: number;
    explicit_requirements: number;
  };
  matching_skills: string[];
  missing_skills: string[];
  partial_skills: string[];
  evidence: Array<{
    requirement: string;
    resume_evidence: string;
    status: string;
  }>;
  recommendations: string[];
  created_at: string;
}

export interface Milestone {
  id: number;
  week_number: number;
  title: string;
  description: string;
  skills: string[];
  tasks: string[];
  project_idea?: string;
  resources: Array<{ title: string; url: string; type: string }>;
  is_completed: boolean;
}

export interface Roadmap {
  id: number;
  target_role: string;
  objective: string;
  total_weeks: number;
  created_at: string;
  milestones: Milestone[];
}

export interface InterviewAnswer {
  user_response?: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  star_feedback: Record<string, string>;
  improved_answer?: string;
}

export interface InterviewQuestion {
  id: number;
  question_order: number;
  question_text: string;
  category: string;
  target_skill?: string;
  answer?: InterviewAnswer;
}

export interface InterviewSession {
  id: number;
  target_role: string;
  interview_type: string;
  difficulty: string;
  total_questions: number;
  current_index: number;
  status: string;
  overall_score?: number;
  feedback_summary?: string;
  created_at: string;
  questions: InterviewQuestion[];
}

export interface JobApplication {
  id: number;
  job_id?: number;
  job_title: string;
  company: string;
  status: 'interested' | 'saved' | 'applied' | 'assessment' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  application_date: string;
  notes?: string;
  next_action?: string;
  next_action_date?: string;
  salary_offered?: string;
  created_at: string;
}

export interface ChatActionPayload {
  action_id: string;
  action_type: string;
  description: string;
  payload: Record<string, any>;
  expires_in_minutes?: number;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata_json?: {
    action_required?: ChatActionPayload;
    [key: string]: any;
  };
  created_at?: string;
}

export interface Conversation {
  id: number;
  title: string;
  selected_resume_id?: number;
  selected_job_id?: number;
  created_at: string;
  updated_at?: string;
  messages: ChatMessage[];
}

export interface DashboardStats {
  resume_quality_score?: number;
  resumes_count: number;
  applications_count: number;
  applications_by_status: Record<string, number>;
  top_matched_job?: {
    job_title: string;
    company_name: string;
    match_score: number;
  };
  interviews_completed: number;
  roadmap_progress: number;
  recent_applications: JobApplication[];
  readiness_score: number;
  readiness_verdict: string;
}
