export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  pincode?: string;
}

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relation?: string;
}

export interface PauseDate {
  from: string;
  to?: string;
  reason?: string;
}

export type UserRole = "superAdmin" | "owner" | "user";
export type UserStatus = "active" | "inactive" | "suspended";
export type DietType = "veg" | "non-veg";
export type PlanType = "monthly" | "weekly" | "trial";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";
export type PaymentMethod = "cash" | "upi" | "bank_transfer" | "other";
export type PaymentStatus = "paid" | "pending" | "due";

export interface TiffinService {
  _id: string;
  name: string;
  prefix: string;
  ownerId: string | User;
  address?: string;
  city?: string;
  phone?: string;
  logo?: string;
  settings: {
    cancellationCutoffTime: string;
    extraTiffinDailyLimit: number;
    breakfastPrice: number;
    lunchPrice: number;
    dinnerPrice: number;
    mealTypes: ("breakfast" | "lunch" | "dinner")[];
    deliveryDays: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  userId?: string; // sparse custom formatted user ID, e.g. AP0001
  name: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  emergencyContact?: EmergencyContact;
  role: UserRole;
  status: UserStatus;
  serviceId?: string | TiffinService;
  prefix?: string; // owner specific prefix, e.g. "AP"
  dietType?: DietType;
  planType?: PlanType;
  planId?: string;
  planName?: string;
  pricePerTiffin?: number;
  planStartDate?: string;
  messStartDate?: string;
  messStartSlot?: "morning" | "night";
  planEndDate?: string;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionType?: "monthly";
  roomNumber?: string;
  hostelName?: string;
  deliveryAddress?: Address;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  pauseDates?: PauseDate[];
  notes?: string;
  cancellationAccepted?: boolean;
  profileImage?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type MealCategory = "vegetarian" | "non-vegetarian" | "vegan";
export type MealType = "breakfast" | "lunch" | "dinner" | "all";

export interface MenuItem {
  _id: string;
  serviceId: string;
  name: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  category: MealCategory;
  mealType: MealType;
  tags?: string[];
  nutrition?: {
    calories?: number;
    protein?: string;
    carbs?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MenuStatus = "draft" | "published";

export interface Menu {
  _id: string;
  serviceId: string | TiffinService;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
  items: string[] | MenuItem[];
  status: MenuStatus;
  specialNote?: string;
  isTodaysSpecial: boolean;
  bannerImage?: string;
  bannerImagePublicId?: string;
  averageRating: number;
  totalRatings: number;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export type BillStatus = "pending" | "paid" | "partially_paid";

export interface Bill {
  _id: string;
  userId: string | User;
  serviceId: string;
  month: number;
  year: number;
  totalScheduledDays: number;
  deliveredDays: number;
  cancelledDays: number;
  missedDays: number;
  extraTiffins: number;
  baseAmount: number;
  deductions: number;
  additions: number;
  totalAmount: number;
  paidAmount: number;
  status: BillStatus;
  invoiceUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TiffinRequestType = "cancellation" | "extra";
export type TiffinRequestStatus = "pending" | "approved" | "rejected";

export interface TiffinRequest {
  _id: string;
  userId: string | User;
  serviceId: string;
  type: TiffinRequestType;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
  reason?: string;
  status: TiffinRequestStatus;
  reviewedBy?: string | User;
  reviewedAt?: string;
  reviewNote?: string;
  cutoffEnforced: boolean;
  deliveryAddress?: string;
  deliveryId?: string;
  createdAt: string;
  updatedAt: string;
}

export type MealLogStatus =
  | "pending"
  | "taken"
  | "accepted"
  | "delivered"
  | "cancelled"
  | "skipped"
  | "paused"
  | "on_hold"
  | "rejected"
  | "missed"
  | "refunded"
  | "correction_requested";

export interface CorrectionRequest {
  reason: string;
  requestedStatus: "taken" | "cancelled" | "skipped";
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string | User;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface MealLog {
  _id: string;
  userId: string | User;
  serviceId: string;
  date: string;
  mealType: "lunch" | "dinner" | "breakfast";
  status: MealLogStatus;
  planId?: string;
  planName?: string;
  pricePerTiffin?: number;
  correctionRequest?: CorrectionRequest;
  isAutoGenerated?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
