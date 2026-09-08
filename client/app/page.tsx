"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import {
  ChefHat,
  Users,
  Shield,
  Calendar,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Flame,
  Clock,
  Layers,
  Utensils,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  // If already authenticated, redirect to role home
  useEffect(() => {
    if (token && user) {
      if (user.role === "superAdmin") {
        router.replace("/super-admin/dashboard");
      } else if (user.role === "owner") {
        router.replace("/owner/dashboard");
      } else {
        router.replace("/user/home");
      }
    }
  }, [token, user, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-emerald-500/5 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-xl">
              🍱
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-wider text-white leading-tight">TFNS</span>
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">
                Tiffin Cloud
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
            >
              Sign In to Portal
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          Multi-Tenant Mess & Tiffin Service Operating System
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl">
          Automate Your Kitchen. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
            Delight Your Subscribers.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          TFNS streamlines daily meal scheduling, subscription billing, student cancellations,
          and doorstep delivery dispatches into a single seamless cloud platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link
            href="/login"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all scale-100 hover:scale-[1.02]"
          >
            Launch Web App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          {/* Customer */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-800 transition-all">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Utensils className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Customer & Student Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Subscribers check today&apos;s menu, advance cancellations, meal logs, and track
              monthly deductions with itemized bills.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
              <span>Automatic Cutoff Protection</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Owner */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-800 transition-all">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <ChefHat className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Mess Kitchen Suite</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Design daily meal recipes, dispatch delivery rosters, approve meal requests, and
              auto-calculate monthly subscriber bills.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
              <span>Automated Bill Generation</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Super Admin */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm relative overflow-hidden group hover:border-slate-800 transition-all">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multi-Tenant Super Admin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform governance, onboard independent kitchen owners with custom prefixes,
              and monitor revenue metrics.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-[11px] text-purple-400 font-semibold">
              <span>Tenant Prefix Isolation</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 relative z-10">
        <p>© 2026 TFNS Premium Tiffin Service Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}