import {
  User, Resume, ResumeAnalysis, Job, JobMatch, Roadmap,
  InterviewSession, JobApplication, Conversation, DashboardStats
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('careerpilot_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string):Promise<{ access_token: string; token_type: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(email: string, password: string, full_name?: string): Promise<{ access_token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });
    return handleResponse(res);
  },

  async clerkSync(clerk_id: string, email: string, full_name?: string): Promise<{ access_token: string }> {
    const res = await fetch(`${API_BASE}/auth/clerk-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerk_id, email, full_name }),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateProfile(profileData: Partial<User['profile']>): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/me/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Resumes
  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    return handleResponse(res);
  },

  async listResumes(): Promise<Resume[]> {
    const res = await fetch(`${API_BASE}/resumes/`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getResume(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async deleteResume(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getResumeAnalysis(resumeId: number): Promise<ResumeAnalysis> {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/analysis`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Jobs
  async listJobs(params?: { search?: string; work_mode?: string; location?: string; experience_level?: string }): Promise<Job[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.work_mode) query.append('work_mode', params.work_mode);
    if (params?.location) query.append('location', params.location);
    if (params?.experience_level) query.append('experience_level', params.experience_level);

    const res = await fetch(`${API_BASE}/jobs/?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getJob(id: number): Promise<Job> {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async saveJob(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/jobs/${id}/save`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async unsaveJob(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/jobs/${id}/save`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async listSavedJobs(): Promise<Job[]> {
    const res = await fetch(`${API_BASE}/jobs/saved/all`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Job Matching
  async matchJob(data: { resume_id: number; job_id?: number; job_title?: string; company_name?: string; job_description?: string }): Promise<JobMatch> {
    const res = await fetch(`${API_BASE}/job-matches/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async listJobMatches(): Promise<JobMatch[]> {
    const res = await fetch(`${API_BASE}/job-matches/`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Roadmaps
  async generateRoadmap(target_role?: string, missing_skills?: string[]): Promise<Roadmap> {
    const res = await fetch(`${API_BASE}/roadmaps/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ target_role, missing_skills }),
    });
    return handleResponse(res);
  },

  async listRoadmaps(): Promise<Roadmap[]> {
    const res = await fetch(`${API_BASE}/roadmaps/`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateMilestone(roadmapId: number, milestoneId: number, is_completed: boolean): Promise<any> {
    const res = await fetch(`${API_BASE}/roadmaps/${roadmapId}/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ is_completed }),
    });
    return handleResponse(res);
  },

  // Resume Builder / Tailoring
  async tailorResume(data: { resume_id: number; target_role: string; job_description?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/resume-builder/tailor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Interviews
  async startInterview(data: { target_role: string; interview_type?: string; difficulty?: string; total_questions?: number }): Promise<InterviewSession> {
    const res = await fetch(`${API_BASE}/interviews/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getInterview(sessionId: number): Promise<InterviewSession> {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async listInterviews(): Promise<InterviewSession[]> {
    const res = await fetch(`${API_BASE}/interviews/`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async submitAnswer(sessionId: number, questionId: number, user_response: string): Promise<any> {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ question_id: questionId, user_response }),
    });
    return handleResponse(res);
  },

  async completeInterview(sessionId: number): Promise<InterviewSession> {
    const res = await fetch(`${API_BASE}/interviews/${sessionId}/complete`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Applications
  async listApplications(): Promise<JobApplication[]> {
    const res = await fetch(`${API_BASE}/applications/`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createApplication(data: Partial<JobApplication>): Promise<JobApplication> {
    const res = await fetch(`${API_BASE}/applications/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateApplication(id: number, data: Partial<JobApplication>): Promise<JobApplication> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteApplication(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Career Assistant Chatbot
  async sendChatMessage(
    content: string,
    conversation_id?: number,
    selected_resume_id?: number,
    selected_job_id?: number
  ): Promise<{ conversation_id: number; message_id: number; role: string; content: string; metadata_json?: any; created_at: string }> {
    const res = await fetch(`${API_BASE}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        content,
        conversation_id,
        selected_resume_id,
        selected_job_id,
      }),
    });
    return handleResponse(res);
  },

  async listConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/chat/conversations`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async createConversation(data?: { title?: string; selected_resume_id?: number; selected_job_id?: number }): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data || {}),
    });
    return handleResponse(res);
  },

  async getConversation(id: number): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateConversation(
    id: number,
    data: { title?: string; selected_resume_id?: number; selected_job_id?: number }
  ): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteConversation(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async confirmToolAction(actionId: string, confirmed: boolean = true): Promise<{
    success: boolean;
    message: string;
    action_type: string;
    conversation_id: number;
    result?: any;
  }> {
    const res = await fetch(`${API_BASE}/chat/tool-confirmations/${actionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ confirmed }),
    });
    return handleResponse(res);
  },
};
