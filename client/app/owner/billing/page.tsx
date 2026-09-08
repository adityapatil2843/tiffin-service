"use client";

import React, { useEffect, useState } from "react";
import { getServiceBills, generateBill, recordPayment } from "@/lib/api/bill";
import { getUsers } from "@/lib/api/users";
import { Bill, User } from "@/types";
import { toast } from "react-hot-toast";
import {
  Wallet,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  CreditCard,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  Receipt,
  UserCheck,
  TrendingUp,
  X,
  Check,
} from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function OwnerBillingPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoadingBills, setIsLoadingBills] = useState(true);
  const [subscribers, setSubscribers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Generate Bill Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Record Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeBill, setActiveBill] = useState<Bill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "bank_transfer" | "other">(
    "upi"
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Fetch Bills
  const fetchBills = async () => {
    setIsLoadingBills(true);
    try {
      const data = await getServiceBills(selectedMonth, selectedYear);
      setBills(data);
    } catch (err: any) {
      toast.error("Failed to load service billing ledger");
    } finally {
      setIsLoadingBills(false);
    }
  };

  // Fetch Subscribers for Bill Generation
  const fetchSubscribers = async () => {
    try {
      const users = await getUsers();
      setSubscribers(users);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchBills();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Handle Generate Bill
  const handleGenerateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a subscriber");
      return;
    }

    setIsGenerating(true);
    try {
      await generateBill({
        userId: selectedUserId,
        month: selectedMonth,
        year: selectedYear,
      });

      toast.success("Monthly invoice generated successfully!");
      setShowGenerateModal(false);
      setSelectedUserId("");
      fetchBills();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate bill");
    } finally {
      setIsGenerating(false);
    }
  };

  // Open Payment Modal
  const openPaymentModal = (bill: Bill) => {
    setActiveBill(bill);
    const dueAmount = bill.totalAmount - (bill.paidAmount || 0);
    setPaymentAmount(dueAmount > 0 ? dueAmount.toString() : "0");
    setPaymentMode("upi");
    setPaymentReference("");
    setPaymentNotes("");
    setShowPaymentModal(true);
  };

  // Handle Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBill) return;

    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsRecordingPayment(true);
    try {
      await recordPayment(activeBill._id, {
        amount: amountNum,
        paymentMode,
        reference: paymentReference.trim() || undefined,
        notes: paymentNotes.trim() || undefined,
      });

      toast.success("Payment recorded successfully!");
      setShowPaymentModal(false);
      setActiveBill(null);
      fetchBills();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record payment");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  // Filtered Bills
  const filteredBills = bills.filter((b) => {
    const userName = typeof b.userId === "object" ? b.userId.name : "";
    const customUserId = typeof b.userId === "object" ? b.userId.userId || "" : "";
    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customUserId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalInvoiced = bills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const totalCollected = bills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
  const totalDue = totalInvoiced - totalCollected;
  const collectionRate =
    totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Billing & Invoices</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Finance
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Generate monthly subscription invoices, track collections, and record subscriber payments.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-slate-200 px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx + 1} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-indigo-400 px-2 py-1.5 focus:outline-none cursor-pointer border-l border-slate-800"
            >
              {[2025, 2026, 2027].map((yr) => (
                <option key={yr} value={yr} className="bg-slate-900 text-white">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Generate Bill
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Invoiced */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <Receipt className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Invoiced
          </span>
          <p className="text-3xl font-black text-white mt-2">
            ₹{totalInvoiced.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-slate-500 block mt-2">
            Across {bills.length} subscriber bills ({MONTHS[selectedMonth - 1]})
          </span>
        </div>

        {/* Collected */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <CheckCircle2 className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Collected
          </span>
          <p className="text-3xl font-black text-emerald-400 mt-2">
            ₹{totalCollected.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-slate-500 block mt-2">
            Recorded receipts & transfers
          </span>
        </div>

        {/* Outstanding Due */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <AlertCircle className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Outstanding Dues
          </span>
          <p className="text-3xl font-black text-rose-400 mt-2">
            ₹{totalDue.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-slate-500 block mt-2">
            Unpaid / balance amount
          </span>
        </div>

        {/* Collection Efficiency */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 top-3 text-slate-800">
            <TrendingUp className="h-10 w-10 stroke-[1.5]" />
          </div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Collection Rate
          </span>
          <p className="text-3xl font-black text-indigo-400 mt-2">
            {collectionRate}%
          </p>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(collectionRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search subscriber name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 w-72"
            />
          </div>

          <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
            {[
              { id: "all", label: "All Bills" },
              { id: "pending", label: "Pending" },
              { id: "partially_paid", label: "Partial" },
              { id: "paid", label: "Paid" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg capitalize transition-colors ${
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

        {/* Invoices Table */}
        {isLoadingBills ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="text-center py-20 rounded-xl border border-dashed border-slate-850 bg-slate-950/40">
            <Receipt className="h-9 w-9 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">No invoices for this month</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click &quot;Generate Bill&quot; to compute subscription bills based on meal logs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3">Subscriber</th>
                  <th className="py-3 px-3">Days (Sch / Del / Can)</th>
                  <th className="py-3 px-3">Extra Tiffins</th>
                  <th className="py-3 px-3">Base Bill</th>
                  <th className="py-3 px-3">Net Total</th>
                  <th className="py-3 px-3">Paid / Due</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {filteredBills.map((bill) => {
                  const subscriberName =
                    typeof bill.userId === "object" ? bill.userId.name : "Subscriber";
                  const subscriberId =
                    typeof bill.userId === "object" ? bill.userId.userId : "";
                  const subscriberPhone =
                    typeof bill.userId === "object" ? bill.userId.phone : "";
                  const balanceDue = bill.totalAmount - (bill.paidAmount || 0);

                  return (
                    <tr
                      key={bill._id}
                      className="hover:bg-slate-900/20 transition-colors group"
                    >
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{subscriberName}</span>
                          <span className="text-[10px] font-mono text-indigo-400">
                            {subscriberId || subscriberPhone || "No ID"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-slate-300" title="Scheduled Days">
                            {bill.totalScheduledDays}
                          </span>
                          <span className="text-slate-600">/</span>
                          <span className="text-emerald-400 font-bold" title="Delivered Days">
                            {bill.deliveredDays}
                          </span>
                          <span className="text-slate-600">/</span>
                          <span className="text-rose-400" title="Cancelled Days">
                            {bill.cancelledDays}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-300">
                          {bill.extraTiffins > 0 ? `+${bill.extraTiffins}` : "0"}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-400">
                        ₹{bill.baseAmount}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-white text-sm">
                          ₹{bill.totalAmount}
                        </span>
                        {bill.deductions > 0 && (
                          <span className="text-[9px] text-emerald-400 block">
                            -₹{bill.deductions} off
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-col font-mono text-[11px]">
                          <span className="text-emerald-400 font-bold">
                            ₹{bill.paidAmount || 0}
                          </span>
                          {balanceDue > 0 && (
                            <span className="text-rose-400 text-[10px]">
                              Due: ₹{balanceDue}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                            bill.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : bill.status === "partially_paid"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {bill.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {bill.status !== "paid" ? (
                          <button
                            onClick={() => openPaymentModal(bill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold transition-all"
                          >
                            <CreditCard className="h-3 w-3" />
                            Record Pay
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Settled
                          </span>
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

      {/* ── MODAL: GENERATE MONTHLY BILL ───────────────────────────────────────── */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white mb-1">Generate Monthly Invoice</h3>
            <p className="text-xs text-slate-400 mb-5">
              Select a subscriber to automatically calculate meal deliveries and bill total for{" "}
              <strong className="text-indigo-400">{MONTHS[selectedMonth - 1]} {selectedYear}</strong>.
            </p>

            <form onSubmit={handleGenerateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Subscriber *
                </label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Choose subscriber...</option>
                  {subscribers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} {u.userId ? `(${u.userId})` : ""} - {u.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-850 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Billing Period:</span>
                  <span className="font-bold text-white">{MONTHS[selectedMonth - 1]} {selectedYear}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calculation Basis:</span>
                  <span className="text-slate-300">Daily delivered meal logs & deductions</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isGenerating ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD PAYMENT ─────────────────────────────────────────────── */}
      {showPaymentModal && activeBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white mb-1">Record Subscriber Payment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Recording payment for{" "}
              <strong className="text-white">
                {typeof activeBill.userId === "object" ? activeBill.userId.name : "Subscriber"}
              </strong>{" "}
              ({MONTHS[activeBill.month - 1]} {activeBill.year})
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-850 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Invoiced</span>
                  <span className="font-bold text-white text-sm">₹{activeBill.totalAmount}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Balance Due</span>
                  <span className="font-bold text-rose-400 text-sm">
                    ₹{activeBill.totalAmount - (activeBill.paidAmount || 0)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["upi", "cash", "bank_transfer", "other"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                        paymentMode === mode
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reference / UPI Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-20260908-9872"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at mess counter"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isRecordingPayment ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
