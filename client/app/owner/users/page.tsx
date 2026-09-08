"use client";

import React, { useEffect, useState } from "react";
import { getOwnerUsers } from "@/lib/api/users";
import { User } from "@/types";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Search, UserPlus, Phone, Calendar, ArrowRight, ShieldAlert, Sparkles, Filter } from "lucide-react";

export default function OwnerUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");

  const fetchUsersList = async () => {
    setIsLoading(true);
    try {
      const data = await getOwnerUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (e: any) {
      toast.error("Failed to load subscribers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  useEffect(() => {
    let result = users;

    // Search query check
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.userId?.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query)
      );
    }

    // Status check
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    // Diet check
    if (dietFilter !== "all") {
      result = result.filter((u) => u.dietType === dietFilter);
    }

    setFilteredUsers(result);
  }, [search, statusFilter, dietFilter, users]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "inactive":
        return "bg-slate-800 text-slate-400 border-slate-700";
      case "suspended":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Subscribers</h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage your tiffin customer accounts, preferences, and details.
          </p>
        </div>
        <Link
          href="/owner/users/new"
          className="inline-flex items-center gap-2 self-start md:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          <UserPlus className="h-4 w-4" />
          Add Subscriber
        </Link>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, ID prefix, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 bg-slate-950/60 border border-slate-850 rounded-xl pl-10 pr-4 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex bg-slate-950/60 border border-slate-850 p-1 rounded-xl">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  statusFilter === status
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Diet Filter */}
          <div className="flex bg-slate-950/60 border border-slate-850 p-1 rounded-xl">
            {(["all", "veg", "non-veg"] as const).map((diet) => (
              <button
                key={diet}
                type="button"
                onClick={() => setDietFilter(diet)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  dietFilter === diet ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {diet === "all" ? "All Diets" : diet === "veg" ? "🥗 Veg" : "🍖 Non-Veg"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-900 bg-slate-950 rounded-2xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-500 mt-4">Loading subscriber accounts...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-slate-850 rounded-2xl bg-slate-900/10 text-center">
          <span className="text-4xl">👥</span>
          <h3 className="text-lg font-bold text-slate-300 mt-4">No subscribers found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Try adjusting your search queries or register a new customer above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((client) => (
            <div
              key={client._id}
              className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-5 shadow-lg flex flex-col justify-between hover:border-slate-850 transition-all duration-200"
            >
              <div>
                {/* Hero row */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-md border border-indigo-400/10">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{client.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">
                      {client.userId}
                    </span>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${getStatusBadgeColor(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>
                </div>

                {/* Sub row */}
                <div className="space-y-2 border-t border-slate-850/60 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>
                      {client.planName || (client.planId === "plan_2" ? "Full Meal Plan" : "Basic Plan")}{" "}
                      <span className="text-[10px] text-slate-500">
                        ({client.subscriptionStatus || "active"})
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-slate-850/40 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                      client.dietType === "veg"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {client.dietType === "veg" ? "Veg 🥗" : "Non-Veg 🍖"}
                  </span>
                  {client.messStartSlot && (
                    <span className="inline-flex px-1.5 py-0.5 rounded-md bg-slate-800 text-[9px] font-semibold text-slate-400">
                      {client.messStartSlot === "night" ? "🌙 Night" : "☀️ Lunch"}
                    </span>
                  )}
                </div>

                <Link
                  href={`/owner/users/${client._id}`}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  View Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
