"use client";

import React, { useEffect, useState } from "react";
import { getMyBills } from "@/lib/api/bill";
import { Bill } from "@/types";
import { toast } from "react-hot-toast";
import { FileText, Download, TrendingUp, Calendar, ShieldCheck, HelpCircle } from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function UserBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const data = await getMyBills();
      setBills(data);
    } catch (e: any) {
      toast.error("Failed to load billing history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "partially_paid":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Billing History</h1>
          <p className="mt-2 text-sm text-slate-400">
            View monthly statements, payment records, and service breakdowns.
          </p>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-900 bg-slate-950 rounded-2xl">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-500 mt-4">Generating statement records...</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-slate-850 rounded-2xl bg-slate-900/10 text-center">
          <span className="text-4xl">💳</span>
          <h3 className="text-lg font-bold text-slate-300 mt-4">No bills generated yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Invoices appear here once your tiffin service owner runs the monthly billing generator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map((bill) => (
            <div
              key={bill._id}
              className="relative overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-5 shadow-lg flex flex-col justify-between hover:border-slate-850 transition-all duration-200"
            >
              <div>
                {/* Header info */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                    <span>
                      {MONTHS[bill.month - 1]} {bill.year}
                    </span>
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${getStatusBadge(
                      bill.status
                    )}`}
                  >
                    {bill.status.replace("_", " ")}
                  </span>
                </div>

                {/* Amount display */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Invoiced
                  </span>
                  <p className="text-3xl font-extrabold text-white mt-1">
                    {formatCurrency(bill.totalAmount)}
                  </p>
                  {bill.paidAmount > 0 && bill.status !== "paid" && (
                    <div className="mt-2 text-xs text-slate-400 flex gap-2">
                      <span className="font-semibold text-emerald-400">
                        Paid: {formatCurrency(bill.paidAmount)}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="font-semibold text-rose-400">
                        Due: {formatCurrency(bill.totalAmount - bill.paidAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Breakdown summary */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-850/60 my-4 text-center">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Delivered
                    </span>
                    <span className="text-xs font-bold text-slate-200 block mt-1">
                      {bill.deliveredDays} Days
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Deductions
                    </span>
                    <span className="text-xs font-bold text-rose-400 block mt-1">
                      -{formatCurrency(bill.deductions)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Extras
                    </span>
                    <span className="text-xs font-bold text-emerald-400 block mt-1">
                      +{formatCurrency(bill.additions)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: Invoice Download */}
              <div className="border-t border-slate-850/60 pt-4 mt-2">
                {bill.invoiceUrl ? (
                  <a
                    href={bill.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-indigo-400 bg-indigo-600/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-600/20 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF Invoice
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-950 border border-slate-850 rounded-xl cursor-not-allowed"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Statement Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
