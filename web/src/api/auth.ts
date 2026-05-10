import type {
  SignupBody,
  SignupResponse,
  LoginBody,
  LoginResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
  User,
} from "@streak/shared";
import { api } from "./client";

export const signup = (body: SignupBody) =>
  api<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const login = (body: LoginBody) =>
  api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const fetchMe = () => api<{ user: User }>("/auth/me");

export const updateProfile = (body: UpdateProfileBody) =>
  api<UpdateProfileResponse>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
