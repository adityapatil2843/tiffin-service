import api from "./client";
import { ApiResponse, User } from "@/types";

export interface DailyOrder {
  _id: string;
  userId: User;
  serviceId: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
  status: "pending" | "delivered" | "cancelled" | "extra" | "missed";
  dietType?: "veg" | "non-veg";
  roomNumber?: string;
  hostelName?: string;
  phone?: string;
  notes?: string;
  deliveryId?: string;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  mealType?: string;
  totalScheduled: number;
  delivered: number;
  cancelled: number;
  extra: number;
  missed: number;
  pending: number;
  vegCount?: number;
  nonVegCount?: number;
}

export async function getDailyOrders(params?: {
  date?: string;
  mealType?: string;
}): Promise<{ orders: DailyOrder[]; total: number }> {
  const res = await api.get<ApiResponse<{ orders: DailyOrder[]; total: number }>>(
    "/owner/orders",
    { params }
  );
  return res.data.data;
}

export async function updateOrderStatus(
  logId: string,
  status: string,
  notes?: string
): Promise<DailyOrder> {
  const res = await api.put<ApiResponse<{ order: DailyOrder }>>(
    `/owner/orders/${logId}/status`,
    { status, notes }
  );
  return res.data.data.order;
}

export async function bulkUpdateOrderStatus(
  logIds: string[],
  status: string
): Promise<{ modifiedCount: number }> {
  const res = await api.put<ApiResponse<{ modifiedCount: number }>>(
    "/owner/orders/bulk-status",
    { logIds, status }
  );
  return res.data.data;
}

export async function getDailySummary(params?: {
  date?: string;
  mealType?: string;
}): Promise<DailySummary> {
  const res = await api.get<ApiResponse<{ summary: DailySummary }>>(
    "/owner/orders/summary",
    { params }
  );
  return res.data.data.summary;
}

export async function getDateWiseSummary(
  from: string,
  to: string
): Promise<any[]> {
  const res = await api.get<ApiResponse<{ summary: any[] }>>(
    "/owner/summary/date-wise",
    { params: { from, to } }
  );
  return res.data.data.summary;
}

export async function getRevenueReport(
  from: string,
  to: string
): Promise<any> {
  const res = await api.get<ApiResponse<{ report: any }>>(
    "/owner/summary/revenue",
    { params: { from, to } }
  );
  return res.data.data.report;
}
