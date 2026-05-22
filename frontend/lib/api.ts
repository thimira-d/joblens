import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("joblens_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface UserProfile {
  id?: number;
  email?: string;
  name: string;
  role: string;
  years_experience: number;
  skills: string[];
  location: string;
  cv_text: string;
}

export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string;
  job_country: string;
  job_employment_type: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_description: string;
  job_apply_link: string;
  job_posted_at_datetime_utc?: string;
  employer_logo?: string;
  job_publisher?: string;
}

export interface JobAnalysis {
  match_score: number;
  summary: string[];
  skill_gaps: string[];
  why_good_fit: string;
}

export interface AnalyzedJob extends Job {
  analysis?: JobAnalysis;
}

export interface SavedJob {
  id: number;
  job_id: string;
  job_title: string;
  company: string;
  date_saved: string;
  match_score?: number;
  skill_gaps?: string[];
  matching_skills?: string[];
  why_good_fit?: string;
  recommendation?: string;
  job_description?: string;
  saved_type?: string;
}

// Auth
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  changePassword: (data: { password: string; new_password: string }) =>
    api.post("/auth/change-password", data),
};

// Jobs
export const jobsAPI = {
  search: (data: {
    cv_text?: string;
    skills?: string[];
    location?: string;
    job_type?: string;
    query?: string;
  }) => api.post<Job[]>("/jobs/search", data),

  analyze: (data: { jobs: Job[]; user_profile: UserProfile }) =>
    api.post<JobAnalysis[]>("/jobs/analyze", data),

  parseCV: (cv_text: string) =>
    api.post<Partial<UserProfile>>("/jobs/parse-cv", { cv_text }),
};

// Match
export const matchAPI = {
  uploadCVPdf: async (file: File) => {
    const formData = new FormData();
    formData.append("cv_file", file);
    const response = await api.post("/match/upload-cv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  analyze: (cvText: string, jobDescription: string) =>
    api.post("/match/analyze", {
      cv_text: cvText,
      job_description: jobDescription,
    }),
};

// User
export const userAPI = {
  getProfile: () => api.get<UserProfile>("/users/profile"),
  updateProfile: (data: UserProfile) => api.put<UserProfile>("/users/profile", data),
  updateEmail: (email: string) => api.put("/users/email", { email }),
};

// Saved Jobs
export const savedAPI = {
  save: (data: {
    job_id: string;
    job_title: string;
    company: string;
    match_score?: number;
    skill_gaps?: string[];
    matching_skills?: string[];
    why_good_fit?: string;
    recommendation?: string;
    job_description?: string;
    saved_type?: string;
  }) => api.post("/saved/", data),
  getAll: () => api.get<SavedJob[]>("/saved/"),
  remove: (job_id: string) => api.delete(`/saved/${job_id}`),
};

// AI Cache helpers
export const aiCache = {
  get: (job_id: string): JobAnalysis | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`joblens_analysis_${job_id}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  set: (job_id: string, analysis: JobAnalysis) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`joblens_analysis_${job_id}`, JSON.stringify(analysis));
    } catch {}
  },
};

export default api;
