"use client";

import React, { useEffect, useState } from "react";
import { getTodaysMenu, getWeeklyMenu } from "@/lib/api/menu";
import { useAuthStore } from "@/lib/store/authStore";
import { Menu, User } from "@/types";
import { toast } from "react-hot-toast";
import { Star, Flame, Sparkles, RefreshCw, CalendarRange, Heart } from "lucide-react";

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
};

export default function UserHomePage() {
  const { user } = useAuthStore();
  const [todaysMenu, setTodaysMenu] = useState<Menu[]>([]);
  const [weeklyMenu, setWeeklyMenu] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenuData = async () => {
    setIsLoading(true);
    try {
      const [today, week] = await Promise.all([getTodaysMenu(), getWeeklyMenu()]);
      setTodaysMenu(today);
      setWeeklyMenu(week);
    } catch (e: any) {
      toast.error("Failed to load tiffin menus");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning";
    if (hours < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "paused":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Here's what's cooking in the kitchen today.
          </p>
        </div>
        <button
          onClick={fetchMenuData}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
          Refresh Menu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Today's Menu & Plan Summary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Subscription details */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl backdrop-blur-sm">
            <div className="absolute right-0 top-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Subscription Plan
                </span>
                <h3 className="text-xl font-bold text-white capitalize mt-1">
                  {user?.planName || `${user?.planType || "monthly"} Plan`}
                </h3>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                  user?.subscriptionStatus
                )}`}
              >
                {user?.subscriptionStatus || "active"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-medium text-slate-500">Your ID</span>
                <p className="text-sm font-bold text-white mt-1">{user?.userId || "—"}</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-medium text-slate-500">Diet Type</span>
                <p className="text-sm font-bold text-indigo-400 mt-1">
                  {user?.dietType === "veg" ? "🥗 Veg" : "🍖 Non-Veg"}
                </p>
              </div>
              <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-medium text-slate-500">Plan Type</span>
                <p className="text-sm font-bold text-white capitalize mt-1">{user?.planType || "monthly"}</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-medium text-slate-500">Diet Preference</span>
                <p className="text-sm font-bold text-white mt-1 capitalize">{user?.dietType || "veg"}</p>
              </div>
            </div>
          </div>

          {/* Today's Meals */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                Today's Tiffin Plan
              </h2>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                <p className="text-xs text-slate-500 mt-4">Loading today's menu...</p>
              </div>
            ) : todaysMenu.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20 text-center">
                <span className="text-4xl">🍽️</span>
                <h4 className="text-base font-bold text-slate-300 mt-4">No meals planned today</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Your tiffin service provider hasn't scheduled today's menu details yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {todaysMenu.map((menu) => (
                  <div
                    key={menu._id}
                    className="relative overflow-hidden rounded-2xl border border-slate-850 bg-slate-900/30 p-5 shadow-lg flex flex-col justify-between hover:border-slate-800 transition-all duration-200"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-base font-bold text-white flex items-center gap-2">
                          <span className="text-xl">{MEAL_EMOJI[menu.mealType]}</span>
                          <span className="capitalize">{menu.mealType}</span>
                        </span>
                        {menu.isTodaysSpecial && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                            <Flame className="h-3 w-3" /> Special
                          </span>
                        )}
                      </div>

                      {/* Special Note */}
                      {menu.specialNote && (
                        <p className="text-xs italic text-indigo-400 mb-4 bg-indigo-500/5 px-3 py-2 rounded-lg border border-indigo-500/10">
                          "{menu.specialNote}"
                        </p>
                      )}

                      {/* Items */}
                      <div className="space-y-2 mb-6">
                        {((menu.items || []) as any[]).map((item, idx) => (
                          <div key={item._id || idx} className="flex items-center gap-2.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                item.category === "vegetarian" ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            <span className="text-sm font-medium text-slate-200">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer: Rating */}
                    {menu.totalRatings > 0 ? (
                      <div className="flex items-center gap-1 border-t border-slate-850/60 pt-4 text-xs text-slate-400">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-semibold text-slate-200">
                          {menu.averageRating.toFixed(1)}
                        </span>
                        <span>({menu.totalRatings} user reviews)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 border-t border-slate-850/60 pt-4 text-[10px] text-slate-500">
                        <Heart className="h-3 w-3" /> No ratings yet
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weekly Preview */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-indigo-400" />
            Weekly Menu Preview
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 w-full border border-slate-850 rounded-2xl bg-slate-900/10 animate-pulse" />
              ))}
            </div>
          ) : weeklyMenu.filter(
              (m) => new Date(m.date).toDateString() !== new Date().toDateString()
            ).length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-slate-900/20 rounded-2xl border border-slate-850 p-4 text-center">
              No upcoming weekly plan registered.
            </p>
          ) : (
            <div className="space-y-4">
              {weeklyMenu
                .filter((menu) => new Date(menu.date).toDateString() !== new Date().toDateString())
                .map((menu) => (
                  <div
                    key={menu._id}
                    className="border border-slate-900 hover:border-slate-850 bg-slate-900/10 rounded-2xl p-4 transition-all"
                  >
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5 capitalize">
                        <span className="text-lg">{MEAL_EMOJI[menu.mealType]}</span>
                        {menu.mealType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(menu.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {((menu.items || []) as any[]).map((item, idx) => (
                        <span
                          key={item._id || idx}
                          className="inline-flex items-center text-[10px] font-medium bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-full"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
