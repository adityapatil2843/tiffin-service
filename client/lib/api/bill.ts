import api from "./client";
import { Bill, ApiResponse } from "@/types";

export async function getMyBills(): Promise<Bill[]> {
  const res = await api.get<ApiResponse<{ bills: Bill[] }>>("/bill/my");
  return res.data.data.bills;
}

export async function getServiceBills(month: number, year: number): Promise<Bill[]> {
  const res = await api.get<ApiResponse<{ bills: Bill[] }>>("/bill/service", {
    params: { month, year },
  });
  return res.data.data.bills;
}

export async function generateBill(payload: {
  userId: string;
  month: number;
  year: number;
}): Promise<Bill> {
  const res = await api.post<ApiResponse<{ bill: Bill }>>("/bill/generate", payload);
  return res.data.data.bill;
}

export async function recordPayment(
  billId: string,
  payload: {
    amount: number;
    paymentMode: "cash" | "upi" | "bank_transfer" | "other";
    reference?: string;
    notes?: string;
  }
): Promise<{ payment: any; bill: Bill }> {
  const res = await api.post<ApiResponse<{ payment: any; bill: Bill }>>(
    `/bill/${billId}/payment`,
    payload
  );
  return res.data.data;
}
