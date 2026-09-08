"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getOwnerUser, updateOwnerUser, pauseSubscription, resumeSubscription } from "@/lib/api/users";
import { getUserMealLogs } from "@/lib/api/meal-log";
import { getServiceBills } from "@/lib/api/bill";
import { User, MealLog, Bill } from "@/types";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Power,
  ShieldAlert,
  Check,
  Utensils,
  Receipt,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [activeTab, setActiveTab] = useState<"profile" | "meals" | "billing">("profile");

  const [client, setClient] = useState<User | null>(null);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [userBills, setUserBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    dietType: "veg" as "veg" | "non-veg",
    status: "active" as "active" | "inactive",
    planId: "plan_1" as "plan_1" | "plan_2",
    messStartSlot: "morning" as "morning" | "night",
    roomNumber: "",
    hostelName: "",
    line1: "",
    city: "",
    pincode: "",
  });

  const fetchClientDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getOwnerUser(id);
      if (data) {
        setClient(data);
        setForm({
          name: data.name,
          phone: data.phone || "",
          email: data.email || "",
          dietType: data.dietType || "veg",
          status: data.status === "active" ? "active" : "inactive",
          planId: (data.planId as any) || "plan_1",
          messStartSlot: data.messStartSlot || "morning",
          roomNumber: data.roomNumber || "",
          hostelName: data.hostelName || "",
          line1: data.deliveryAddress?.line1 || "",
          city: data.deliveryAddress?.city || "",
          pincode: data.deliveryAddress?.pincode || "",
        });
      }
    } catch (e: any) {
      toast.error("Failed to load subscriber details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMealLogs = async () => {
    setIsLoadingMeals(true);
    try {
      const data = await getUserMealLogs(id, { limit: 50 });
      setMealLogs(data.logs || []);
    } catch (e: any) {
      // silent fallback
    } finally {
      setIsLoadingMeals(false);
    }
  };

  const fetchUserBills = async () => {
    setIsLoadingBills(true);
    try {
      const now = new Date();
      const allBills = await getServiceBills(now.getMonth() + 1, now.getFullYear());
      const filtered = allBills.filter((b) => {
        const uid = typeof b.userId === "object" ? b.userId._id : b.userId;
        return uid === id;
      });
      setUserBills(filtered);
    } catch (e: any) {
      // silent fallback
    } finally {
      setIsLoadingBills(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === "meals" && mealLogs.length === 0) {
      fetchMealLogs();
    }
    if (activeTab === "billing" && userBills.length === 0) {
      fetchUserBills();
    }
  }, [activeTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and Phone are required");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateOwnerUser(id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        dietType: form.dietType,
        status: form.status,
        planId: form.planId,
        messStartSlot: form.messStartSlot,
        roomNumber: form.roomNumber.trim() || undefined,
        hostelName: form.hostelName.trim() || undefined,
        deliveryAddress: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          pincode: form.pincode.trim(),
        },
      });
      setClient(updated);
      toast.success("Subscriber details updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save subscriber details");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePause = async () => {
    setIsSaving(true);
    try {
      await pauseSubscription(id, { reason: "Paused by owner" });
      toast.success("Subscription paused!");
      fetchClientDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to pause subscription");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResume = async () => {
    setIsSaving(true);
    try {
      await resumeSubscription(id);
      toast.success("Subscription resumed!");
      fetchClientDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resume subscription");
    } finally {
      setIsSaving(false);
    }
  };

  const getAddressString = () => {
    const addr = client?.deliveryAddress;
    if (!addr) return null;
    return [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-slate-500 mt-4">Loading subscriber 360° view...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="mx-auto h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-white">Subscriber not found</h3>
        <button
          onClick={() => router.push("/owner/users")}
          className="mt-4 text-sm text-indigo-400 font-bold hover:underline"
        >
          Back to directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => router.push("/owner/users")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Subscribers
      </button>

      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-600/20">
            {client.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{client.name}</h1>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border capitalize ${
                  client.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {client.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              ID: <strong className="text-indigo-400">{client.userId || "—"}</strong> • Registered{" "}
              {new Date(client.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: "profile", label: "Profile & Plan", icon: UserIcon },
            { id: "meals", label: `Meal History (${mealLogs.length})`, icon: Utensils },
            { id: "billing", label: "Invoices", icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB 1: PROFILE & PLAN ──────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            <form
              onSubmit={handleSave}
              className="bg-slate-900/10 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-5"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserIcon className="h-4.5 w-4.5 text-indigo-400" />
                Subscriber Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Room / Flat Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 302"
                      value={form.roomNumber}
                      onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Hostel / Building Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tagore Hostel"
                      value={form.hostelName}
                      onChange={(e) => setForm({ ...form, hostelName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Plan Selection & Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Mess Plan
                    </label>
                    <select
                      value={form.planId}
                      onChange={(e) => setForm({ ...form, planId: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="plan_1">Plan 1: Basic Plan (₹60/tiffin)</option>
                      <option value="plan_2">Plan 2: Full Meal Plan (₹80/tiffin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Start Slot
                    </label>
                    <select
                      value={form.messStartSlot}
                      onChange={(e) => setForm({ ...form, messStartSlot: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="morning">Morning (Lunch)</option>
                      <option value="night">Night (Dinner)</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Address Fields */}
                <div className="space-y-3 pt-2 border-t border-slate-850/60">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Delivery Address
                  </span>
                  <input
                    type="text"
                    placeholder="Street Address (Line 1)"
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Pincode (6 digits)"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Dietary Preference & Status */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-850/60">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Diet Preference
                    </label>
                    <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, dietType: "veg" })}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          form.dietType === "veg"
                            ? "bg-emerald-500 text-slate-950 shadow-sm"
                            : "text-slate-400"
                        }`}
                      >
                        🥗 Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, dietType: "non-veg" })}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          form.dietType === "non-veg"
                            ? "bg-rose-500 text-white shadow-sm"
                            : "text-slate-400"
                        }`}
                      >
                        🍗 Non-Veg
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Account Status
                    </label>
                    <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, status: "active" })}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          form.status === "active"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, status: "inactive" })}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          form.status === "inactive"
                            ? "bg-rose-950 text-rose-400 shadow-sm"
                            : "text-slate-400"
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-850 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Subscriber Details"}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Subscription Actions & Address */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 shadow-md space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                Delivery Address
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl">
                {getAddressString() || "No street address recorded."}
              </p>
            </div>

            {/* Subscription State & Pause Toggle */}
            <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-5 shadow-md space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Power className="h-3.5 w-3.5 text-indigo-400" />
                Subscription Details
              </h4>

              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span>Mess Plan</span>
                  <strong className="text-white">
                    {client.planName || (client.planId === "plan_2" ? "Full Meal Plan" : "Basic Plan")}
                  </strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span>Rate per Tiffin</span>
                  <strong className="text-emerald-400">
                    ₹{client.pricePerTiffin || (client.planId === "plan_2" ? 80 : 60)} / tiffin
                  </strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span>Mess Start Date</span>
                  <strong className="text-white">
                    {client.messStartDate ? new Date(client.messStartDate).toLocaleDateString() : "—"}
                  </strong>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span>Start Slot</span>
                  <span className="capitalize text-slate-200">
                    {client.messStartSlot === "night" ? "🌙 Night (Dinner)" : "☀️ Morning (Lunch)"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span>Subscription Standing</span>
                  <span
                    className={`font-bold capitalize ${
                      client.subscriptionStatus === "active" ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {client.subscriptionStatus || "active"}
                  </span>
                </div>
              </div>

              {client.subscriptionStatus === "active" ? (
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={isSaving}
                  className="w-full py-2.5 border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  ⏸️ Pause Subscription (Hold Deliveries)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={isSaving}
                  className="w-full py-2.5 border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  ▶️ Resume Subscription
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MEAL HISTORY & ATTENDANCE ──────────────────────────────────── */}
      {activeTab === "meals" && (
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Daily Meal Dispatch & Attendance</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chronological record of lunch and dinner tiffins scheduled for {client.name}.
              </p>
            </div>
            <button
              onClick={fetchMealLogs}
              disabled={isLoadingMeals}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-850 rounded-lg"
            >
              Refresh Logs
            </button>
          </div>

          {isLoadingMeals ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : mealLogs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-850 rounded-xl bg-slate-950/40">
              <Utensils className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-300">No meal logs recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Slot</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Disputes / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {mealLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-900/20">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {new Date(log.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-2.5 px-3 capitalize text-slate-300">
                        {log.mealType === "lunch" ? "☀️ Lunch" : "🌙 Dinner"}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            log.status === "delivered" || log.status === "taken"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : log.status === "cancelled"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              : log.status === "correction_requested"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {log.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {log.correctionRequest?.reason || log.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: INVOICES & BILLING ──────────────────────────────────────────── */}
      {activeTab === "billing" && (
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Invoicing & Collections History</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Past subscription bills generated for {client.name}.
              </p>
            </div>
            <button
              onClick={fetchUserBills}
              disabled={isLoadingBills}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-850 rounded-lg"
            >
              Refresh Invoices
            </button>
          </div>

          {isLoadingBills ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : userBills.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-850 rounded-xl bg-slate-950/40">
              <Receipt className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-300">No invoices on record for this cycle</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Use the Billing Portal to generate monthly bills for this subscriber.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Scheduled / Delivered</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3">Paid Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60">
                  {userBills.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-900/20">
                      <td className="py-2.5 px-3 font-bold text-white">
                        Month {b.month} / {b.year}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {b.totalScheduledDays} scheduled / {b.deliveredDays} delivered
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        ₹{b.totalAmount}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">
                        ₹{b.paidAmount || 0}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            b.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
