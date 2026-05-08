import type {
  RequestOtpResponse,
  VerifyOtpResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
  User,
} from "@streak/shared";
import { api } from "./client";

export const requestOtp = (phone: string) =>
  api<RequestOtpResponse>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });

export const verifyOtp = (phone: string, code: string) =>
  api<VerifyOtpResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });

export const fetchMe = () => api<{ user: User }>("/auth/me");

export const updateProfile = (body: UpdateProfileBody) =>
  api<UpdateProfileResponse>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
