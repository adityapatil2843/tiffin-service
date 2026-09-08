import api from "./client";
import { User, ApiResponse } from "@/types";

export interface CreateUserPayload {
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  password?: string;
  dietType?: "veg" | "non-veg";
  planId: "plan_1" | "plan_2";
  planType?: "monthly" | "weekly" | "trial";
  subscriptionType?: "monthly";
  messStartDate?: string;
  messStartSlot?: "morning" | "night";
  roomNumber?: string;
  hostelName?: string;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    pincode: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  paymentMethod?: "cash" | "upi" | "bank_transfer" | "other";
  paymentStatus?: "paid" | "pending" | "due";
  notes?: string;
}

export async function getOwnerUsers(): Promise<User[]> {
  const res = await api.get<ApiResponse<{ users: User[] }>>("/owner/users");
  return res.data.data.users;
}

export const getUsers = getOwnerUsers;

export async function getOwnerUser(userId: string): Promise<User | null> {
  // Try direct endpoint
  try {
    const res = await api.get<ApiResponse<{ user: User }>>(`/owner/users/${userId}`);
    return res.data.data.user;
  } catch (error) {
    // Fallback: search in list
    const users = await getOwnerUsers();
    return users.find((u) => u._id === userId) || null;
  }
}

export async function createOwnerUser(data: CreateUserPayload): Promise<User> {
  const res = await api.post<ApiResponse<{ user: User }>>("/owner/users", data);
  return res.data.data.user;
}

export async function updateOwnerUser(
  userId: string,
  data: Partial<User>
): Promise<User> {
  const res = await api.put<ApiResponse<{ user: User }>>(`/owner/users/${userId}`, data);
  return res.data.data.user;
}

export async function pauseSubscription(
  userId: string,
  payload?: { fromDate?: string; toDate?: string; reason?: string }
): Promise<boolean> {
  const res = await api.post<ApiResponse<any>>(`/owner/users/${userId}/pause`, payload || {});
  return res.data.success;
}

export async function resumeSubscription(userId: string): Promise<boolean> {
  const res = await api.post<ApiResponse<any>>(`/owner/users/${userId}/resume`);
  return res.data.success;
}
