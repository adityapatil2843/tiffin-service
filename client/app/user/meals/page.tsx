"use client";

import React, { useEffect, useState } from "react";
import { getMyMealLogs, submitCorrectionRequest } from "@/lib/api/meal-log";
import { MealLog, MealLogStatus } from "@/types";
import { toast } from "react-hot-toast";
import {
  CalendarCheck,
  Utensils,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  HelpCircle,
  X,
} from "lucide-react";

export default function UserMealsAttendancePage() {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dispute / Correction Modal State
  const [disputeLog, setDisputeLog] = useState<MealLog | null>(null);
  const [disputeReasonCategory, setDisputeReasonCategory] = useState("Did not receive meal");
  const [disputeNotes, setDisputeNotes] = useState("");
  const [requestedStatus, setRequestedStatus] = useState<"cancelled" | "skipped">("cancelled");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getMyMealLogs({ limit: 60 });
      setLogs(data.logs || []);
    } catch (err: any) {
      toast.error("Failed to load your meal attendance records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleOpenDispute = (log: MealLog) => {
    setDisputeLog(log);
    setDisputeReasonCategory("Did not receive meal");
    setDisputeNotes("");
    setRequestedStatus("cancelled");
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeLog) return;

    const combinedReason = disputeNotes.trim()
      ? `${disputeReasonCategory}: ${disputeNotes.trim()}`
      : disputeReasonCategory;

    setIsSubmittingDispute(true);
    try {
      await submitCorrectionRequest(disputeLog._id, {
        reason: combinedReason,
        requestedStatus,
      });

      toast.success("Dispute submitted for owner review!");
      setDisputeLog(null);
      fetchLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit dispute");
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesMeal = mealTypeFilter === "all" || log.mealType === mealTypeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "delivered" && (log.status === "delivered" || log.status === "taken" || log.status === "pending")) ||
      (statusFilter === "cancelled" && log.status === "cancelled") ||
      (statusFilter === "missed" && log.status === "missed") ||
      (statusFilter === "disputed" && log.status === "correction_requested");
    return matchesMeal && matchesStatus;
  });

  // Calculate Metrics
  const totalScheduled = logs.length;
  const totalDelivered = logs.filter(
    (l) => l.status === "delivered" || l.status === "taken" || l.status === "pending"
  ).length;
  const totalCancelled = logs.filter((l) => l.status === "cancelled").length;
  const totalMissed = logs.filter((l) => l.status === "missed").length;
  const attendanceRate = totalScheduled > 0 ? Math.round((totalDelivered / totalScheduled) * 100) : 0;

  const getStatusDisplay = (status: MealLogStatus) => {
    switch (status) {
      case "delivered":
      case "taken":
        return {
          label: "Delivered",
          class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: CheckCircle2,
        };
      case "cancelled":
        return {
          label: "Cancelled (Credit)",
          class: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          icon: CalendarCheck,
        };
      case "missed":
        return {
          label: "Missed / Absent",
          class: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          icon: XCircle,
        };
      case "correction_requested":
        return {
          label: "Dispute Pending",
          class: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: Clock,
        };
      case "paused":
        return {
          label: "Plan Paused",
          class: "bg-slate-800 text-slate-400 border-slate-700",
          icon: Clock,
        };
      default:
        return {
          label: status,
          class: "bg-slate-800 text-slate-300 border-slate-700",
          icon: Utensils,
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Meal Attendance</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Personal Ledger
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Track daily delivered tiffins, verified attendances, excused cancellations, and report disputes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 self-start md:self-auto px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
          Refresh Attendance
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Scheduled */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <Utensils className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Scheduled Meals
          </span>
          <p className="text-3xl font-black text-white mt-2">
            {isLoading ? "—" : totalScheduled}
          </p>
          <span className="text-[10px] text-slate-500 block mt-2">
            Current subscription cycle
          </span>
        </div>

        {/* Delivered / Consumed */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <CheckCircle2 className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Consumed Tiffins
          </span>
          <p className="text-3xl font-black text-emerald-400 mt-2">
            {isLoading ? "—" : totalDelivered}
          </p>
          <span className="text-[10px] text-slate-400 block mt-2">
            {attendanceRate}% attendance compliance
          </span>
        </div>

        {/* Excused Cancellations */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <CalendarCheck className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Excused Cancellations
          </span>
          <p className="text-3xl font-black text-indigo-400 mt-2">
            {isLoading ? "—" : totalCancelled}
          </p>
          <span className="text-[10px] text-emerald-400 block mt-2">
            Credited on your monthly bill
          </span>
        </div>

        {/* Missed Meals */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <XCircle className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Missed Meals
          </span>
          <p className="text-3xl font-black text-rose-400 mt-2">
            {isLoading ? "—" : totalMissed}
          </p>
          <span className="text-[10px] text-slate-500 block mt-2">
            Unexcused absences without prior cancellation
          </span>
        </div>
      </div>

      {/* Attendance Ledger */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl self-start">
            {[
              { id: "all", label: "All Slots" },
              { id: "lunch", label: "☀️ Lunch" },
              { id: "dinner", label: "🌙 Dinner" },
            ].map((slot) => (
              <button
                key={slot.id}
                onClick={() => setMealTypeFilter(slot.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  mealTypeFilter === slot.id
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl self-start sm:self-auto">
            {[
              { id: "all", label: "All Statuses" },
              { id: "delivered", label: "Delivered" },
              { id: "cancelled", label: "Cancelled" },
              { id: "missed", label: "Missed" },
              { id: "disputed", label: "Disputes" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors ${
                  statusFilter === st.id
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 rounded-xl border border-dashed border-slate-850 bg-slate-950/40">
            <Utensils className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">No meal records found</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Your meal logs will automatically populate as the kitchen schedules daily services.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3">Date & Day</th>
                  <th className="py-3 px-3">Meal Slot</th>
                  <th className="py-3 px-3">Plan Details</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Dispute / Notes</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {filteredLogs.map((log) => {
                  const logDate = new Date(log.date);
                  const isRecent =
                    new Date().getTime() - logDate.getTime() < 7 * 24 * 60 * 60 * 1000;
                  const statusInfo = getStatusDisplay(log.status);
                  const StatusIcon = statusInfo.icon;

                  const canDispute =
                    isRecent &&
                    log.status !== "cancelled" &&
                    log.status !== "paused" &&
                    log.status !== "correction_requested";

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">
                            {logDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {logDate.getFullYear()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-xs font-semibold text-slate-200 capitalize">
                          {log.mealType === "lunch" ? "☀️ Lunch" : "🌙 Dinner"}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-300 block">
                          {log.planName || "Monthly Standard"}
                        </span>
                        {log.pricePerTiffin ? (
                          <span className="text-[10px] text-slate-500 font-mono">
                            ₹{log.pricePerTiffin} / meal
                          </span>
                        ) : null}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.class}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs">
                        {log.correctionRequest ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-amber-400 font-semibold truncate">
                              Dispute: {log.correctionRequest.reason}
                            </span>
                            {log.correctionRequest.reviewNote && (
                              <span className="text-[10px] text-slate-500">
                                Owner: {log.correctionRequest.reviewNote}
                              </span>
                            )}
                          </div>
                        ) : log.notes ? (
                          log.notes
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {canDispute && (
                          <button
                            onClick={() => handleOpenDispute(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-amber-400 border border-slate-800 text-[11px] font-semibold transition-colors"
                          >
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            Report Issue
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: SUBMIT DISPUTE / CORRECTION ──────────────────────────────────── */}
      {disputeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Report Meal Dispute
              </h3>
              <button
                onClick={() => setDisputeLog(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Dispute meal record for{" "}
              <strong className="text-white">
                {new Date(disputeLog.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                ({disputeLog.mealType})
              </strong>
              . Disputes are reviewed directly by the kitchen manager.
            </p>

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason Category *
                </label>
                <select
                  value={disputeReasonCategory}
                  onChange={(e) => setDisputeReasonCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Did not receive meal">Did not receive meal</option>
                  <option value="Tiffin delivered spoiled or cold">Tiffin delivered spoiled or cold</option>
                  <option value="Previously cancelled but charged">Previously cancelled but charged</option>
                  <option value="Wrong meal type delivered">Wrong meal type delivered</option>
                  <option value="Other grievance">Other grievance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Additional Details / Notes
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. I was in class from 12pm to 2pm and no tiffin was left at my door."
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Requested Adjustment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestedStatus("cancelled")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      requestedStatus === "cancelled"
                        ? "bg-indigo-950/40 border-indigo-500 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="text-xs font-bold block">Mark as Cancelled</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Deducts price from monthly invoice
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestedStatus("skipped")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      requestedStatus === "skipped"
                        ? "bg-indigo-950/40 border-indigo-500 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="text-xs font-bold block">Mark as Skipped</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Excuses absence from meal count
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setDisputeLog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  {isSubmittingDispute ? "Submitting..." : "Submit Dispute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
