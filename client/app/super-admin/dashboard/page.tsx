"use client";

import React, { useEffect, useState } from "react";
import { getOwners } from "@/lib/api/super-admin";
import { User } from "@/types";
import { toast } from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Building2,
  Users2,
  CheckCircle,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

// Platform Mock Revenue Growth Data
const REVENUE_DATA = [
  { month: "Jan", revenue: 42000, registrations: 3 },
  { month: "Feb", revenue: 58000, registrations: 5 },
  { month: "Mar", revenue: 76000, registrations: 8 },
  { month: "Apr", revenue: 95000, registrations: 11 },
  { month: "May", revenue: 120000, registrations: 14 },
  { month: "Jun", revenue: 145000, registrations: 19 },
];

export default function SuperAdminDashboard() {
  const [owners, setOwners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await getOwners();
      setOwners(data);
    } catch (e: any) {
      toast.error("Failed to load platform data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalOwners = owners.length;
  const activeServices = owners.filter((o) => o.status === "active").length;
  // Estimated mock statistics
  const totalSubscribers = totalOwners * 24 + 18; 
  const platformRevenue = totalOwners * 8500 + 1200;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Platform Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">
            System metrics, subscription trends, and mess service registrations.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Owners */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <Building2 className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Services
          </span>
          <p className="text-3xl font-black text-white mt-2">
            {isLoading ? "—" : totalOwners}
          </p>
          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-3">
            <span className="text-indigo-400 font-bold flex items-center">
              +15% <TrendingUp className="h-3 w-3 inline" />
            </span>
            vs last month
          </span>
        </div>

        {/* Active Services */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <CheckCircle className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Services
          </span>
          <p className="text-3xl font-black text-emerald-400 mt-2">
            {isLoading ? "—" : activeServices}
          </p>
          <span className="text-[10px] font-medium text-slate-400 block mt-3">
            {totalOwners - activeServices} pending approval/inactive
          </span>
        </div>

        {/* Total Users */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <Users2 className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Platform Users
          </span>
          <p className="text-3xl font-black text-indigo-400 mt-2">
            {isLoading ? "—" : totalSubscribers}
          </p>
          <span className="text-[10px] font-medium text-slate-400 block mt-3">
            Active mess students & customers
          </span>
        </div>

        {/* Platform Revenue */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <IndianRupee className="h-9 w-9 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Platform Revenue
          </span>
          <p className="text-3xl font-black text-amber-400 mt-2">
            {isLoading ? "—" : `₹${platformRevenue.toLocaleString("en-IN")}`}
          </p>
          <span className="text-[10px] font-medium text-slate-400 block mt-3">
            Invoiced monthly collections
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            Platform Growth & Revenue Trends
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  labelStyle={{ fontWeight: "bold", color: "#94a3b8" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Registered Services */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-6">Recently Registered Mess Services</h3>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 w-full border border-slate-850 rounded-xl bg-slate-900/10 animate-pulse" />
                ))}
              </div>
            ) : owners.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-10">
                No active owners registered.
              </p>
            ) : (
              <div className="space-y-4">
                {owners.slice(0, 4).map((owner) => (
                  <div
                    key={owner._id}
                    className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-850/40"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200">
                        {owner.serviceId && typeof owner.serviceId === "object"
                          ? owner.serviceId.name
                          : "Unnamed Service"}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Owner: {owner.name}
                      </span>
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${
                        owner.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {owner.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <a
            href="/super-admin/owners"
            className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-2.5 text-xs font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-600/20 transition-all"
          >
            Manage Services
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
