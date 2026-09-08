"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getUsers } from "@/lib/api/users";
import { getServiceRequests } from "@/lib/api/tiffin";
import { getDailyOrders, getDailySummary, updateOrderStatus, DailyOrder, DailySummary } from "@/lib/api/owner";
import { getServiceBills } from "@/lib/api/bill";
import { User, TiffinRequest, Bill } from "@/types";
import { toast } from "react-hot-toast";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Users,
  Utensils,
  Inbox,
  IndianRupee,
  Calendar,
  ChefHat,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Search,
  Check,
  Flame,
  UserPlus,
} from "lucide-react";

// Mock Weekly Trend Data for chart
const WEEKLY_TREND = [
  { day: "Mon", deliveries: 48, cancellations: 3 },
  { day: "Tue", deliveries: 52, cancellations: 2 },
  { day: "Wed", deliveries: 50, cancellations: 5 },
  { day: "Thu", deliveries: 54, cancellations: 1 },
  { day: "Fri", deliveries: 49, cancellations: 4 },
  { day: "Sat", deliveries: 42, cancellations: 11 },
  { day: "Sun", deliveries: 38, cancellations: 14 },
];

export default function OwnerDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TiffinRequest[]>([]);
  const [orders, setOrders] = useState<DailyOrder[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [monthlyBills, setMonthlyBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter for today's orders table
  const [selectedMealFilter, setSelectedMealFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState("");

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [usersData, requestsData, ordersData, summaryData, billsData] = await Promise.allSettled([
        getUsers(),
        getServiceRequests(),
        getDailyOrders(),
        getDailySummary(),
        getServiceBills(currentMonth, currentYear),
      ]);

      if (usersData.status === "fulfilled") setUsers(usersData.value);
      if (requestsData.status === "fulfilled") setPendingRequests(requestsData.value);
      if (ordersData.status === "fulfilled") setOrders(ordersData.value.orders);
      if (summaryData.status === "fulfilled") setDailySummary(summaryData.value);
      if (billsData.status === "fulfilled") setMonthlyBills(billsData.value);
    } catch (err) {
      toast.error("Failed to refresh dashboard stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick mark order as delivered
  const handleToggleDeliveryStatus = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === "delivered" ? "pending" : "delivered";
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(newStatus === "delivered" ? "Marked as Delivered" : "Marked as Pending");
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update order status");
    }
  };

  // KPIs
  const activeSubscribers = users.filter((u) => u.status === "active").length;
  const vegCount = users.filter((u) => u.dietType === "veg" && u.status === "active").length;
  const nonVegCount = activeSubscribers - vegCount;

  const totalDeliveredToday = orders.filter((o) => o.status === "delivered").length;
  const totalOrdersToday = orders.length || activeSubscribers;
  const pendingRequestsCount = pendingRequests.length;

  const monthlyCollections = monthlyBills.reduce(
    (acc, b) => acc + (b.paidAmount || 0),
    0
  );

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const studentName = typeof o.userId === "object" ? o.userId.name : "";
    const studentId = typeof o.userId === "object" ? o.userId.userId || "" : "";
    const matchesSearch =
      studentName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      studentId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.roomNumber || "").toLowerCase().includes(orderSearch.toLowerCase());
    const matchesMeal =
      selectedMealFilter === "all" || o.mealType === selectedMealFilter;
    return matchesSearch && matchesMeal;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Kitchen Overview</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Ops
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Real-time delivery counts, subscriber metrics, pending requests, and kitchen revenue.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
          Sync Dashboard
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Subscribers */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <Users className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Active Subscribers
          </span>
          <p className="text-3xl font-black text-white mt-2">
            {isLoading ? "—" : activeSubscribers}
          </p>
          <div className="flex items-center gap-3 mt-3 text-[10px] font-semibold">
            <span className="text-emerald-400 flex items-center gap-1">
              🥗 {vegCount} Veg
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400 flex items-center gap-1">
              🍗 {nonVegCount} Non-Veg
            </span>
          </div>
        </div>

        {/* Today's Deliveries */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <Utensils className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Deliveries Today
          </span>
          <p className="text-3xl font-black text-emerald-400 mt-2">
            {isLoading ? "—" : `${totalDeliveredToday} / ${totalOrdersToday}`}
          </p>
          <span className="text-[10px] text-slate-400 block mt-3">
            {totalOrdersToday - totalDeliveredToday} tiffins pending dispatch
          </span>
        </div>

        {/* Pending Requests */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <Inbox className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Pending Requests
          </span>
          <p className="text-3xl font-black text-amber-400 mt-2">
            {isLoading ? "—" : pendingRequestsCount}
          </p>
          <Link
            href="/owner/requests"
            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 mt-3"
          >
            Review cancellations & extras <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Monthly Collections */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <IndianRupee className="h-9 w-9 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Monthly Collections
          </span>
          <p className="text-3xl font-black text-indigo-400 mt-2">
            {isLoading ? "—" : `₹${monthlyCollections.toLocaleString("en-IN")}`}
          </p>
          <Link
            href="/owner/billing"
            className="text-[10px] font-bold text-slate-400 hover:text-slate-200 flex items-center gap-0.5 mt-3"
          >
            View billing ledger <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/owner/menu"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-850 hover:border-indigo-500/40 transition-all group"
        >
          <div className="h-9 w-9 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ChefHat className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Menu Planner</span>
            <span className="text-[10px] text-slate-500">Plan daily meal</span>
          </div>
        </Link>

        <Link
          href="/owner/requests"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-850 hover:border-indigo-500/40 transition-all group"
        >
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
            <Inbox className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Review Requests</span>
            <span className="text-[10px] text-slate-500">{pendingRequestsCount} waiting</span>
          </div>
        </Link>

        <Link
          href="/owner/users/new"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-850 hover:border-indigo-500/40 transition-all group"
        >
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <UserPlus className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Add Subscriber</span>
            <span className="text-[10px] text-slate-500">Register student</span>
          </div>
        </Link>

        <Link
          href="/owner/billing"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-850 hover:border-indigo-500/40 transition-all group"
        >
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <Wallet className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">Generate Invoices</span>
            <span className="text-[10px] text-slate-500">Monthly billing</span>
          </div>
        </Link>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Delivery Volume Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Weekly Tiffin Dispatch Trends</h2>
              <p className="text-xs text-slate-400 mt-0.5">Delivered vs Cancelled tiffins across 7 days</p>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              Avg: 48 / day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                  labelStyle={{ fontWeight: "bold", color: "#94a3b8" }}
                />
                <Bar dataKey="deliveries" fill="#6366f1" radius={[4, 4, 0, 0]} name="Delivered Tiffins" />
                <Bar dataKey="cancellations" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Cancellations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diet & Kitchen Capacity Distribution */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Subscriber Breakdown</h2>
            <p className="text-xs text-slate-400 mb-6">Dietary preference distribution</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Vegetarian Diet</span>
                  <span className="text-emerald-400 font-bold">{vegCount} students ({activeSubscribers > 0 ? Math.round((vegCount / activeSubscribers) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${activeSubscribers > 0 ? (vegCount / activeSubscribers) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Non-Vegetarian Diet</span>
                  <span className="text-rose-400 font-bold">{nonVegCount} students ({activeSubscribers > 0 ? Math.round((nonVegCount / activeSubscribers) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${activeSubscribers > 0 ? (nonVegCount / activeSubscribers) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Active Mess Plan</span>
                <strong className="text-white">Monthly Standard</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Auto Cutoff Time</span>
                <strong className="text-indigo-400 font-mono">07:00 AM / 04:00 PM</strong>
              </div>
            </div>
          </div>

          <Link
            href="/owner/users"
            className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-2.5 text-xs font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-600/20 transition-all"
          >
            Manage All Subscribers
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Live Daily Operations Feed */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              Today&apos;s Meal Delivery Dispatch Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live roster of scheduled meals for today with quick delivery check-off.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search student or room..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 w-52"
              />
            </div>

            <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
              {["all", "breakfast", "lunch", "dinner"].map((meal) => (
                <button
                  key={meal}
                  onClick={() => setSelectedMealFilter(meal)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors ${
                    selectedMealFilter === meal
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-slate-850 bg-slate-950/40">
            <Utensils className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">No active meal orders in current filter</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              All deliveries for today are accounted for.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3">Subscriber</th>
                  <th className="py-3 px-3">Room / Address</th>
                  <th className="py-3 px-3">Meal Slot</th>
                  <th className="py-3 px-3">Diet</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {filteredOrders.map((order) => {
                  const studentName =
                    typeof order.userId === "object" ? order.userId.name : "Student";
                  const studentId =
                    typeof order.userId === "object" ? order.userId.userId : "";
                  const diet =
                    order.dietType ||
                    (typeof order.userId === "object" ? order.userId.dietType : "veg");

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{studentName}</span>
                          <span className="text-[10px] font-mono text-indigo-400">
                            {studentId || order.phone || ""}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {order.roomNumber ? `Room ${order.roomNumber}` : "Standard Delivery"}
                        {order.hostelName && (
                          <span className="text-[10px] text-slate-500 block">
                            {order.hostelName}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-xs font-semibold text-slate-200 capitalize">
                          {order.mealType === "breakfast"
                            ? "🌅 Breakfast"
                            : order.mealType === "lunch"
                            ? "☀️ Lunch"
                            : "🌙 Dinner"}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            diet === "veg" ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              diet === "veg" ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          {diet === "veg" ? "Veg" : "Non-Veg"}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            order.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : order.status === "cancelled"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : order.status === "extra"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            handleToggleDeliveryStatus(order._id, order.status)
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            order.status === "delivered"
                              ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-sm"
                          }`}
                        >
                          {order.status === "delivered" ? "Undo" : "Deliver"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
