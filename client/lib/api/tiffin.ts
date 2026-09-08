import api from "./client";
import { TiffinRequest, ApiResponse } from "@/types";

export async function getMyTiffinRequests(): Promise<TiffinRequest[]> {
  const res = await api.get<ApiResponse<{ requests: TiffinRequest[] }>>("/tiffin/my");
  return res.data.data.requests;
}

export async function submitTiffinRequest(data: {
  type: "cancellation" | "extra";
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
  reason?: string;
}): Promise<TiffinRequest> {
  const res = await api.post<ApiResponse<{ tiffinRequest: TiffinRequest }>>(
    "/tiffin/request",
    data
  );
  return res.data.data.tiffinRequest;
}

export async function getServiceRequests(): Promise<TiffinRequest[]> {
  const res = await api.get<ApiResponse<{ requests: TiffinRequest[] }>>("/owner/requests");
  return res.data.data.requests;
}

export async function reviewTiffinRequest(
  requestId: string,
  data: { status: "approved" | "rejected"; reviewNote?: string }
): Promise<boolean> {
  const res = await api.put<ApiResponse<any>>(`/owner/requests/${requestId}`, data);
  return res.data.success;
}
