"use client";

import React, { useEffect, useState } from "react";
import { getServiceRequests, reviewTiffinRequest } from "@/lib/api/tiffin";
import { getPendingCorrections, reviewCorrectionRequest } from "@/lib/api/meal-log";
import { TiffinRequest, MealLog } from "@/types";
import { toast } from "react-hot-toast";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Calendar,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
};

export default function OwnerRequestsPage() {
  const [requests, setRequests] = useState<TiffinRequest[]>([]);
  const [corrections, setCorrections] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<"all" | "cancellation" | "extra" | "disputes">(
    "all"
  );

  const fetchPendingData = async () => {
    setIsLoading(true);
    try {
      const [reqData, corrData] = await Promise.all([
        getServiceRequests(),
        getPendingCorrections().catch(() => ({ logs: [], count: 0 })),
      ]);
      setRequests(reqData);
      setCorrections(corrData.logs || []);
    } catch (e: any) {
      toast.error("Failed to load requests directory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  const handleReviewRequest = async (requestId: string, status: "approved" | "rejected") => {
    const reviewNote =
      status === "rejected"
        ? prompt("Provide a rejection note for the client (optional):") || undefined
        : undefined;

    setIsSubmitting(true);
    try {
      await reviewTiffinRequest(requestId, { status, reviewNote });
      toast.success(`Request ${status} successfully`);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to process review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewDispute = async (logId: string, status: "approved" | "rejected") => {
    const reviewNote =
      status === "rejected"
        ? prompt("Provide explanation for rejecting the dispute:") || undefined
        : undefined;

    setIsSubmitting(true);
    try {
      await reviewCorrectionRequest(logId, { status, reviewNote });
      toast.success(`Dispute ${status} successfully`);
      setCorrections((prev) => prev.filter((c) => c._id !== logId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to process dispute review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((r) => r.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Pending Requests</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {requests.length + corrections.length} Unresolved
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Review cancellations, extra meal bookings, and student attendance dispute claims.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
          {[
            { id: "all", label: `All (${requests.length})` },
            { id: "cancellation", label: `❌ Cancellations (${requests.filter((r) => r.type === "cancellation").length})` },
            { id: "extra", label: `➕ Extras (${requests.filter((r) => r.type === "extra").length})` },
            { id: "disputes", label: `⚠️ Disputes (${corrections.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-900 bg-slate-950 rounded-2xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-500 mt-4">Loading requests & disputes...</p>
        </div>
      ) : activeTab === "disputes" ? (
        /* ── DISPUTES QUEUE ─────────────────────────────────────────────────── */
        corrections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-900 bg-slate-950/40 rounded-2xl">
            <CheckCircle2 className="h-12 w-12 text-emerald-500/40 mb-3" />
            <h3 className="text-sm font-bold text-white">No pending disputes!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              All student meal grievances and missing delivery claims have been resolved.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {corrections.map((corr) => {
              const studentName =
                typeof corr.userId === "object" ? corr.userId.name : "Subscriber";
              const studentId =
                typeof corr.userId === "object" ? corr.userId.userId : "";
              const studentPhone =
                typeof corr.userId === "object" ? corr.userId.phone : "";

              return (
                <div
                  key={corr._id}
                  className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-white text-sm">{studentName}</span>
                      <span className="font-mono text-xs text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                        {studentId || studentPhone || "ID"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Disputed Delivery Claim
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        {new Date(corr.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="capitalize text-slate-300">
                        {MEAL_EMOJI[corr.mealType] || "🍱"} {corr.mealType}
                      </span>
                      <span>
                        Requested: <strong className="text-white capitalize">{corr.correctionRequest?.requestedStatus}</strong>
                      </span>
                    </div>

                    {corr.correctionRequest?.reason && (
                      <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-850 p-3 rounded-xl leading-relaxed">
                        &quot;{corr.correctionRequest.reason}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleReviewDispute(corr._id, "rejected")}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/20 text-rose-400 border border-slate-800 hover:border-rose-900/30 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Reject Dispute
                    </button>
                    <button
                      onClick={() => handleReviewDispute(corr._id, "approved")}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      Approve & Credit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ── STANDARD CANCELLATION / EXTRA REQUESTS ──────────────────────────── */
        filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-900 bg-slate-950/40 rounded-2xl">
            <CheckCircle2 className="h-12 w-12 text-emerald-500/40 mb-3" />
            <h3 className="text-sm font-bold text-white">All caught up!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              No pending cancellation or extra meal requests awaiting kitchen approval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((req) => {
              const studentName =
                typeof req.userId === "object" ? req.userId.name : "Subscriber";
              const studentId =
                typeof req.userId === "object" ? req.userId.userId : "";
              const studentPhone =
                typeof req.userId === "object" ? req.userId.phone : "";

              return (
                <div
                  key={req._id}
                  className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-800 transition-all"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-white text-sm">{studentName}</span>
                      <span className="font-mono text-xs text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
                        {studentId || studentPhone || "ID"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          req.type === "cancellation"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {req.type === "cancellation" ? "❌ Cancellation" : "➕ Extra Meal"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        {new Date(req.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="capitalize text-slate-300">
                        {MEAL_EMOJI[req.mealType] || "🍱"} {req.mealType}
                      </span>
                    </div>

                    {req.reason && (
                      <p className="text-xs text-slate-400 italic">
                        Reason: &quot;{req.reason}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleReviewRequest(req._id, "rejected")}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/20 text-rose-400 border border-slate-800 hover:border-rose-900/30 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReviewRequest(req._id, "approved")}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
