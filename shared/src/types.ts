import type { AccentName } from "./tokens";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  name: string | null;
  createdAt: string;
}

export interface Habit {
  id: string;
  trackerId: string;
  name: string;
  position: number;
  createdAt: string;
}

export interface Tracker {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  accent: AccentName;
  position: number;
  archivedAt: string | null;
  createdAt: string;
  habits: Habit[];
}

export interface DeleteTrackerResponse {
  ok: true;
  archived?: true;
  deleted?: true;
}

export interface Completion {
  habitId: string;
  date: string; // YYYY-MM-DD
}

// Request bodies / responses
export interface SignupBody { email: string; password: string; firstName: string }
export interface SignupResponse { token: string; user: User }

export interface LoginBody { email: string; password: string }
export interface LoginResponse { token: string; user: User }

export interface UpdateProfileBody { firstName: string; lastName: string; email: string }
export interface UpdateProfileResponse { user: User }

export interface CreateTrackerBody {
  name: string;
  emoji: string;
  accent: AccentName;
  habits: { name: string }[];
}

export interface ToggleCompletionBody { habitId: string; date: string }
export interface ToggleCompletionResponse { on: boolean }
