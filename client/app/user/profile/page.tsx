"use client";

import React from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { User as UserIcon, Phone, Mail, MapPin, Calendar, LogOut, ArrowRight, Settings } from "lucide-react";

export default function UserProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const getAddressString = () => {
    const addr = user?.deliveryAddress;
    if (!addr) return null;
    return [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(", ");
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "paused":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-slate-400 bg-slate-800 border-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-900 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">My Account</h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your personal details, subscription plan preferences, and addresses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Card: Hero Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-6 text-center shadow-xl backdrop-blur-sm">
            <div className="absolute right-0 top-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Avatar Mock */}
            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center justify-center text-3xl font-bold text-white mb-4 border border-indigo-400/20">
              {user?.name ? user.name.charAt(0) : "?"}
            </div>

            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{user?.userId}</p>

            {/* Status indicators */}
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                  user?.dietType === "veg"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {user?.dietType === "veg" ? "🥗 Veg" : "🍖 Non-Veg"}
              </span>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                {user?.planType || "monthly"}
              </span>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusColor(
                  user?.subscriptionStatus
                )}`}
              >
                {user?.subscriptionStatus || "active"}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-slate-850/60">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm font-semibold transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns: Forms & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-md">
            <h4 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <UserIcon className="h-4.5 w-4.5 text-indigo-400" />
              Contact Information
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 py-3 border-b border-slate-850/40">
                <Phone className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="text-[10px] font-medium text-slate-500 block">Phone Number</span>
                  <span className="text-sm font-semibold text-slate-200">{user?.phone || "—"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 py-3 border-b border-slate-850/40">
                <Mail className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="text-[10px] font-medium text-slate-500 block">Email Address</span>
                  <span className="text-sm font-semibold text-slate-200">{user?.email || "—"}</span>
                </div>
              </div>

              <div className="flex items-start gap-4 py-3">
                <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                <div>
                  <span className="text-[10px] font-medium text-slate-500 block">Delivery Address</span>
                  <span className="text-sm font-semibold text-slate-200 block mt-1 leading-relaxed">
                    {getAddressString() || "No address provided"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Schedules */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-md">
            <h4 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-indigo-400" />
              Subscription Details
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 py-3 border-b border-slate-850/40">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 block">Mess Plan Type</span>
                  <span className="text-sm font-semibold text-slate-200 block mt-0.5 uppercase">
                    {user?.planType || "monthly"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 py-3">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 block">Subscription Start Date</span>
                  <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                    {user?.planStartDate
                      ? new Date(user.planStartDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
