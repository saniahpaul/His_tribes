const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

export function getToken() { return localStorage.getItem("his_tribes_token"); }
export function clearAuth() { localStorage.removeItem("his_tribes_token"); localStorage.removeItem("his_tribes_user"); }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data as T;
}

export const api = {
  signup: (body: {name:string;email:string;password:string}) => request<{token:string;user:User}>("/api/auth/signup", {method:"POST",body:JSON.stringify(body)}),
  login: (body: {email:string;password:string}) => request<{token:string;user:User}>("/api/auth/login", {method:"POST",body:JSON.stringify(body)}),
  me: () => request<User>("/api/auth/me"),
  readingStats: () => request<ReadingStats>("/api/reading/stats"),
  completeReading: () => request<ReadingStats>("/api/reading/complete", {method:"POST"}),
  readingHistory: () => request<{dates:string[];readings:number;streak:number}>("/api/reading/history"),
  soap: () => request<SoapEntry[]>("/api/soap"),
  addSoap: (body: SoapPayload) => request<SoapEntry>("/api/soap", {method:"POST",body:JSON.stringify(body)}),
  prayers: () => request<Prayer[]>("/api/prayers"),
  addPrayer: (body:{text:string;anonymous:boolean}) => request<Prayer>("/api/prayers", {method:"POST",body:JSON.stringify(body)}),
  pray: (id:number) => request<{prayed:boolean;count:number}>(`/api/prayers/${id}/pray`, {method:"POST"}),
  scoreboard: () => request<ScoreRow[]>("/api/scoreboard"),
  leaderDashboard: () => request<LeaderDashboard>("/api/leader/dashboard"),
  leaderSoap: () => request<SoapEntry[]>("/api/leader/soap"),
  updateGoal: (body:{title:string;target_days:number;deadline:string}) => request("/api/leader/monthly-goal", {method:"PUT",body:JSON.stringify(body)}),
  togglePrayerStatus: (id:number) => request<{status:string}>(`/api/leader/prayers/${id}`, {method:"PATCH"}),
};

export type Role = "youth" | "leader";
export type User = { id:number; name:string; email:string; role:Role };
export type ReadingStats = { completed:boolean; readings:number; streak:number; goal:number; goal_title:string; deadline:string|null };
export type SoapEntry = { id:number; author:string; leader?:boolean; date:string; scripture:string; observation:string; application:string; prayer:string };
export type SoapPayload = Omit<SoapEntry,"id"|"author"|"leader"|"date">;
export type Prayer = { id:number; author:string; leader?:boolean; text:string; count:number; mine?:boolean; anonymous?:boolean; status:"Active"|"Answered" };
export type ScoreRow = {name:string;days:number;streak:number;you?:boolean;leader?:boolean};
export type LeaderDashboard = {youth:number;total_reading_days:number;community:number;goal:{id?:number;title:string;target_days:number;deadline:string};rows:ScoreRow[]};
