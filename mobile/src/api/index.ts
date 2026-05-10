import type {
  SignupBody, SignupResponse, LoginBody, LoginResponse, User,
  Tracker, Habit, CreateTrackerBody, Completion,
  ToggleCompletionResponse, AccentName,
  UpdateProfileBody, UpdateProfileResponse,
  DeleteTrackerResponse,
} from "@streak/shared";
import { api } from "./client";

export const signup = (body: SignupBody) =>
  api<SignupResponse>("/auth/signup", {
    method: "POST", body: JSON.stringify(body),
  });

export const login = (body: LoginBody) =>
  api<LoginResponse>("/auth/login", {
    method: "POST", body: JSON.stringify(body),
  });

export const fetchMe = () => api<{ user: User }>("/auth/me");

export const updateProfile = (body: UpdateProfileBody) =>
  api<UpdateProfileResponse>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const listTrackers = () => api<Tracker[]>("/trackers");

export const listArchivedTrackers = () => api<Tracker[]>("/trackers/archived");

export const createTracker = (body: CreateTrackerBody) =>
  api<Tracker>("/trackers", { method: "POST", body: JSON.stringify(body) });

export const updateTracker = (
  id: string,
  body: Partial<{ name: string; emoji: string; accent: AccentName }>,
) =>
  api<Tracker>(`/trackers/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const deleteTracker = (id: string) =>
  api<DeleteTrackerResponse>(`/trackers/${id}`, { method: "DELETE" });

export const unarchiveTracker = (id: string) =>
  api<Tracker>(`/trackers/${id}/unarchive`, { method: "POST" });

export const addHabit = (trackerId: string, name: string) =>
  api<Habit>(`/trackers/${trackerId}/habits`, {
    method: "POST", body: JSON.stringify({ name }),
  });

export const updateHabit = (id: string, name: string) =>
  api<Habit>(`/habits/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });

export const deleteHabit = (id: string) =>
  api<{ ok: true }>(`/habits/${id}`, { method: "DELETE" });

export const fetchCompletions = (
  trackerId: string, from: string, to: string,
) =>
  api<Completion[]>(`/trackers/${trackerId}/completions?from=${from}&to=${to}`);

export const toggleCompletion = (habitId: string, date: string) =>
  api<ToggleCompletionResponse>("/completions/toggle", {
    method: "POST", body: JSON.stringify({ habitId, date }),
  });
