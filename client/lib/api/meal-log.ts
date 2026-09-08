import api from "./client";
import { MealLog, ApiResponse } from "@/types";

export interface MealHistoryResponse {
  logs: MealLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface MealAttendanceSummary {
  totalScheduled: number;
  delivered: number;
  taken: number;
  missed: number;
  cancelled: number;
  extra: number;
  paused: number;
  disputed: number;
}

export async function getMyMealLogs(params?: {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  mealType?: string;
}): Promise<MealHistoryResponse> {
  const res = await api.get<ApiResponse<MealHistoryResponse>>("/meal-logs/my", { params });
  return res.data.data;
}

export async function submitCorrectionRequest(
  logId: string,
  data: {
    reason: string;
    requestedStatus: "taken" | "cancelled" | "skipped";
  }
): Promise<{ log: MealLog }> {
  const res = await api.post<ApiResponse<{ log: MealLog }>>(
    `/meal-logs/${logId}/correction`,
    data
  );
  return res.data.data;
}

export async function getPendingCorrections(): Promise<{ logs: MealLog[]; count: number }> {
  const res = await api.get<ApiResponse<{ logs: MealLog[]; count: number }>>(
    "/owner/meal-logs/corrections"
  );
  return res.data.data;
}

export async function reviewCorrectionRequest(
  logId: string,
  data: {
    status: "approved" | "rejected";
    reviewNote?: string;
  }
): Promise<{ log: MealLog }> {
  const res = await api.put<ApiResponse<{ log: MealLog }>>(
    `/owner/meal-logs/${logId}/review-correction`,
    data
  );
  return res.data.data;
}

export async function getUserMealLogs(
  userId: string,
  params?: {
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }
): Promise<MealHistoryResponse & { user: any }> {
  const res = await api.get<ApiResponse<MealHistoryResponse & { user: any }>>(
    `/owner/users/${userId}/meal-logs`,
    { params }
  );
  return res.data.data;
}

export async function getServiceMealLogs(params?: {
  userId?: string;
  from?: string;
  to?: string;
  mealType?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<MealHistoryResponse> {
  const res = await api.get<ApiResponse<MealHistoryResponse>>("/owner/meal-logs", { params });
  return res.data.data;
}
