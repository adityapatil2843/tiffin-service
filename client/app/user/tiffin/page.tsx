"use client";

import React, { useEffect, useState } from "react";
import { getMyTiffinRequests, submitTiffinRequest } from "@/lib/api/tiffin";
import { TiffinRequest } from "@/types";
import { toast } from "react-hot-toast";
import { Plus, X, Calendar, MessageSquare, MapPin, CheckCircle2, AlertCircle, Clock, Trash } from "lucide-react";

const MEAL_EMOJI: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
};

export default function UserTiffinPage() {
  const [requests, setRequests] = useState<TiffinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [requestType, setRequestType] = useState<"cancellation" | "extra">("cancellation");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner">("lunch");
  const [targetDate, setTargetDate] = useState("");
  const [reason, setReason] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getMyTiffinRequests();
      setRequests(data);
    } catch (e: any) {
      toast.error("Failed to load tiffin requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Default targetDate to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTargetDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) {
      toast.error("Please select a target date");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitTiffinRequest({
        type: requestType,
        date: targetDate,
        mealType,
        reason: reason.trim() || undefined,
        ...(requestType === "extra" && deliveryAddress.trim() ? { deliveryAddress: deliveryAddress.trim() } : {}),
      });

      toast.success(`${requestType === "extra" ? "Extra tiffin" : "Cancellation"} request submitted!`);
      setModalOpen(false);
      // Reset form
      setReason("");
      setDeliveryAddress("");
      fetchRequests();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to submit request";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: CheckCircle2,
        };
      case "rejected":
        return {
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          icon: AlertCircle,
        };
      default:
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Tiffin Requests</h1>
          <p className="mt-2 text-sm text-slate-400">
            Submit meal cancellations or request extra deliveries.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-900 bg-slate-950 rounded-2xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-500 mt-4">Fetching tiffin logs...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-slate-850 rounded-2xl bg-slate-900/10 text-center">
          <span className="text-4xl">📋</span>
          <h3 className="text-lg font-bold text-slate-300 mt-4">No requests found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            You haven't submitted any cancellation or extra tiffin requests yet.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-semibold"
          >
            Create first request
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => {
            const statusConfig = getStatusBadge(req.status);
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={req._id}
                className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-5 shadow-lg flex flex-col justify-between hover:border-slate-850 transition-all duration-200"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <span className="text-sm font-bold text-white flex items-center gap-2 capitalize">
                      <span className="text-lg">{MEAL_EMOJI[req.mealType]}</span>
                      {req.mealType}
                    </span>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          req.type === "extra"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {req.type === "extra" ? "➕ Extra" : "❌ Cancel"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.bg}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        <span className="capitalize">{req.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 bg-slate-900/60 p-2 rounded-lg border border-slate-850/40">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <span>
                      {new Date(req.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {req.reason && (
                    <div className="flex gap-2 items-start mt-3 mb-2">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 italic">"{req.reason}"</p>
                    </div>
                  )}

                  {req.deliveryAddress && (
                    <div className="flex gap-2 items-start mt-3 mb-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 truncate">Address: {req.deliveryAddress}</p>
                    </div>
                  )}
                </div>

                {req.reviewNote && (
                  <div className="mt-4 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block">
                      Owner Response
                    </span>
                    <p className="text-xs text-rose-300 mt-1 font-medium">"{req.reviewNote}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Create Tiffin Request</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Request Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Request Type
                </label>
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRequestType("cancellation")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      requestType === "cancellation"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ❌ Cancel Meal
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType("extra")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      requestType === "extra"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ➕ Extra Meal
                  </button>
                </div>
              </div>

              {/* Meal Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Meal Type
                </label>
                <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
                  {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setMealType(meal)}
                      className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all capitalize flex items-center justify-center gap-1 ${
                        mealType === meal
                          ? "bg-slate-800 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span>{MEAL_EMOJI[meal]}</span>
                      {meal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Reason input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Reason / Notes
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Out of town, Guest visiting"
                  rows={2}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Delivery Address (only for Extra tiffin) */}
              {requestType === "extra" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Custom Delivery Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Leave blank to use default address"
                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-11 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center justify-center"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
