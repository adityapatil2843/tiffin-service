import api from "./client";
import { User, TiffinService, ApiResponse } from "@/types";

export interface CreateOwnerPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  serviceName: string;
  servicePrefix: string;
  address?: string;
  city?: string;
}

export async function getOwners(): Promise<User[]> {
  const res = await api.get<ApiResponse<{ owners: User[] }>>("/super-admin/owners");
  return res.data.data.owners;
}

export async function createOwner(data: CreateOwnerPayload): Promise<{ owner: User; service: TiffinService }> {
  const res = await api.post<ApiResponse<{ owner: User; service: TiffinService }>>(
    "/super-admin/owners",
    data
  );
  return res.data.data;
}

export async function updateOwner(
  ownerId: string,
  data: Partial<User>
): Promise<User> {
  const res = await api.put<ApiResponse<{ owner: User }>>(
    `/super-admin/owners/${ownerId}`,
    data
  );
  return res.data.data.owner;
}
