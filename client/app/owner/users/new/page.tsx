"use client";

import React, { useState } from "react";
import { createOwnerUser } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  Sparkles,
} from "lucide-react";

interface PlanDefinition {
  id: "plan_1" | "plan_2";
  name: string;
  tagline: string;
  pricePerTiffin: number;
  dailyCharge: number;
  monthlyEstimate: number;
  items: { name: string; emoji: string; qty: string }[];
  badge: string;
  badgeColor: string;
}

const MESS_PLANS: PlanDefinition[] = [
  {
    id: "plan_1",
    name: "Basic Plan",
    tagline: "Essential daily nutrition",
    pricePerTiffin: 60,
    dailyCharge: 120,
    monthlyEstimate: 3600,
    items: [
      { name: "Chapati", emoji: "🫓", qty: "4 pcs" },
      { name: "Bhaji", emoji: "🥘", qty: "1 bowl" },
    ],
    badge: "Popular",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    id: "plan_2",
    name: "Full Meal Plan",
    tagline: "Complete wholesome thali",
    pricePerTiffin: 80,
    dailyCharge: 160,
    monthlyEstimate: 4800,
    items: [
      { name: "Chapati", emoji: "🫓", qty: "4 pcs" },
      { name: "Bhaji", emoji: "🥘", qty: "1 bowl" },
      { name: "Varan (Dal)", emoji: "🍲", qty: "1 bowl" },
      { name: "Bhat (Rice)", emoji: "🍚", qty: "1 bowl" },
    ],
    badge: "Most Complete",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
];

export default function NewSubscriberPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Today's date string YYYY-MM-DD for min / default
  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    // Identity
    name: "",
    phone: "",
    alternatePhone: "",
    email: "",
    password: "",

    // Plan & Preferences
    dietType: "veg" as "veg" | "non-veg",
    planId: "plan_1" as "plan_1" | "plan_2",
    messStartDate: todayStr,
    messStartSlot: "morning" as "morning" | "night",

    // Accommodation
    roomNumber: "",
    hostelName: "",

    // Delivery Address
    line1: "",
    line2: "",
    city: "",
    pincode: "",

    // Emergency Contact
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",

    // Payment & Notes
    paymentMethod: "cash" as "cash" | "upi" | "bank_transfer" | "other",
    paymentStatus: "pending" as "paid" | "pending" | "due",
    notes: "",
  });

  const updateField = (key: string, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handlePhoneChange = (key: "phone" | "alternatePhone" | "emergencyPhone", value: string) => {
    // Keep only digits, max 10 chars
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    updateField(key, cleaned);
  };

  const handlePincodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    updateField("pincode", cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!form.name.trim()) {
      toast.error("Please enter subscriber's full name");
      return;
    }

    if (form.phone.length !== 10) {
      toast.error("Phone number must be a valid 10-digit mobile number");
      return;
    }

    if (form.alternatePhone && form.alternatePhone.length !== 10) {
      toast.error("Alternate phone must be a 10-digit number");
      return;
    }

    if (form.emergencyPhone && form.emergencyPhone.length !== 10) {
      toast.error("Emergency contact phone must be a 10-digit number");
      return;
    }

    if (!form.password || form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!form.messStartDate) {
      toast.error("Please select a mess start date");
      return;
    }

    if (!form.line1.trim()) {
      toast.error("Please provide a delivery street address");
      return;
    }

    if (!form.city.trim()) {
      toast.error("Please enter city");
      return;
    }

    if (form.pincode.length !== 6) {
      toast.error("Postal pincode must be exactly 6 digits");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOwnerUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        alternatePhone: form.alternatePhone.trim() || undefined,
        email: form.email.trim() || undefined,
        password: form.password,
        dietType: form.dietType,
        planId: form.planId,
        subscriptionType: "monthly",
        messStartDate: form.messStartDate,
        messStartSlot: form.messStartSlot,
        roomNumber: form.roomNumber.trim() || undefined,
        hostelName: form.hostelName.trim() || undefined,
        deliveryAddress: {
          line1: form.line1.trim(),
          line2: form.line2.trim() || undefined,
          city: form.city.trim(),
          pincode: form.pincode.trim(),
        },
        emergencyContact: form.emergencyPhone
          ? {
              name: form.emergencyName.trim() || undefined,
              phone: form.emergencyPhone.trim(),
              relation: form.emergencyRelation.trim() || undefined,
            }
          : undefined,
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentStatus,
        notes: form.notes.trim() || undefined,
      });

      toast.success("Subscriber registered successfully!");
      router.push("/owner/users");
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create subscriber account";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = MESS_PLANS.find((p) => p.id === form.planId)!;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back navigation */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to subscriber list
      </button>

      {/* Header */}
      <div className="border-b border-slate-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Enroll New Subscriber
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Configure student/customer details, select tiffin meal plan, and schedule delivery start.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Section 1: Mess Plan Selection ──────────────────────────────── */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850/60 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 bg-indigo-500 rounded-full" />
                1. Select Mess Plan & Pricing
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the daily meal subscription tier for this customer.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-400">
              2 Tiffins Daily (Lunch + Dinner)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MESS_PLANS.map((plan) => {
              const isSelected = form.planId === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => updateField("planId", plan.id)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-950/20 border-indigo-500 shadow-[0_0_24px_rgba(99,102,241,0.15)]"
                      : "bg-slate-950/60 border-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${plan.badgeColor} mb-2`}
                        >
                          {plan.badge}
                        </span>
                        <h4 className="text-base font-bold text-white">{plan.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{plan.tagline}</p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-600 text-white"
                            : "border-slate-700 bg-slate-900"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </div>

                    {/* Meal items breakdown */}
                    <div className="mt-4 pt-3 border-t border-slate-850/60 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Included in each tiffin:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                          >
                            <span>{item.emoji}</span>
                            <span>{item.name}</span>
                            <span className="text-[10px] text-slate-500">({item.qty})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing footer */}
                  <div className="mt-5 pt-3 border-t border-slate-850/60 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-white">₹{plan.pricePerTiffin}</span>
                      <span className="text-[11px] text-slate-400 ml-1">/ tiffin</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-400">
                        ₹{plan.dailyCharge}/day
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ~₹{plan.monthlyEstimate}/mo
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diet Preference & Schedule Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-850/60">
            {/* Diet Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Dietary Preference *
              </label>
              <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => updateField("dietType", "veg")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    form.dietType === "veg"
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🥗 Pure Veg
                </button>
                <button
                  type="button"
                  onClick={() => updateField("dietType", "non-veg")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    form.dietType === "non-veg"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🍖 Non-Veg
                </button>
              </div>
            </div>

            {/* Mess Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                Mess Start Date *
              </label>
              <input
                type="date"
                required
                value={form.messStartDate}
                onChange={(e) => updateField("messStartDate", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Mess Start Slot */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                First Meal Slot *
              </label>
              <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => updateField("messStartSlot", "morning")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    form.messStartSlot === "morning"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ☀️ Morning (Lunch)
                </button>
                <button
                  type="button"
                  onClick={() => updateField("messStartSlot", "night")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    form.messStartSlot === "night"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🌙 Night (Dinner)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Identity & Account Credentials ──────────────────── */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850/60 pb-3">
            <span className="h-2 w-2 bg-indigo-500 rounded-full" />
            2. Customer Identity & Login
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Mobile Phone Number * (10 Digits)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => handlePhoneChange("phone", e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                  {form.phone.length}/10
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Alternate Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="Optional 10-digit number"
                value={form.alternatePhone}
                onChange={(e) => handlePhoneChange("alternatePhone", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="subscriber@email.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Initial Account Password * (Min 6 characters)
              </label>
              <input
                type="password"
                required
                placeholder="Secure password for subscriber login"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
              />
              <p className="text-[11px] text-slate-500">
                Subscriber will log in using their phone number and this password.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 3: Accommodation & Delivery Address ─────────────────── */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850/60 pb-3">
            <span className="h-2 w-2 bg-indigo-500 rounded-full" />
            3. Accommodation & Delivery Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                Room / Flat Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 302 / Room B-12"
                value={form.roomNumber}
                onChange={(e) => updateField("roomNumber", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Hostel / PG / Apartment Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Shanti Niketan Boys Hostel"
                value={form.hostelName}
                onChange={(e) => updateField("hostelName", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                Street Address *
              </label>
              <input
                type="text"
                required
                placeholder="Street name, landmark, building number"
                value={form.line1}
                onChange={(e) => updateField("line1", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pune, Mumbai, Kota"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Postal Pincode * (6 Digits)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 411001"
                value={form.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700 font-mono"
              />
            </div>
          </div>
        </div>

        {/* ── Section 4: Emergency Contact & Payment Details ──────────────── */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850/60 pb-3">
            <span className="h-2 w-2 bg-indigo-500 rounded-full" />
            4. Emergency Contact & Initial Payment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Emergency Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Father, Guardian"
                value={form.emergencyName}
                onChange={(e) => updateField("emergencyName", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                placeholder="10-digit number"
                value={form.emergencyPhone}
                onChange={(e) => handlePhoneChange("emergencyPhone", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Relationship
              </label>
              <input
                type="text"
                placeholder="e.g. Parent, Sibling"
                value={form.emergencyRelation}
                onChange={(e) => updateField("emergencyRelation", e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-850/60">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Payment Method
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) => updateField("paymentMethod", e.target.value as any)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors capitalize"
              >
                <option value="cash">Cash in hand</option>
                <option value="upi">UPI / QR Code</option>
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Initial Payment Status
              </label>
              <select
                value={form.paymentStatus}
                onChange={(e) => updateField("paymentStatus", e.target.value as any)}
                className="h-10 w-full rounded-xl border border-slate-850 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors capitalize"
              >
                <option value="pending">Pending (Collect later)</option>
                <option value="paid">Paid (Advance received)</option>
                <option value="due">Due</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Special Delivery Instructions or Owner Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Less spicy, call on arrival, deliver at security gate"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="w-full rounded-xl border border-slate-850 bg-slate-950 p-3 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Summary & Submit Bar ────────────────────────────────────────── */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Selected: {selectedPlan.name} • ₹{selectedPlan.pricePerTiffin}/tiffin
              </p>
              <p className="text-[11px] text-slate-400">
                Starts {form.messStartDate} ({form.messStartSlot === "morning" ? "Lunch" : "Dinner"}) •{" "}
                {form.dietType === "veg" ? "Pure Veg 🥗" : "Non-Veg 🍖"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none px-5 h-11 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Enrolling Subscriber...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Register & Activate Subscription</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
