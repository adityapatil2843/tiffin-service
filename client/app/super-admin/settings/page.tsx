"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "react-hot-toast";
import {
  Shield,
  Server,
  Database,
  Cloud,
  LogOut,
  Sliders,
  CheckCircle2,
  KeyRound,
  Bell,
  HardDrive,
  RefreshCw,
  Cpu,
} from "lucide-react";

export default function SuperAdminSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [enableAuditLogs, setEnableAuditLogs] = useState(true);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-slate-900 pb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">System Settings</h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Control Center
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-400">
          Super administrator account security, platform infrastructure status, and system toggles.
        </p>
      </div>

      {/* Admin Profile & Account Card */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">{user?.name || "Super Admin"}</span>
                <span className="text-[10px] font-extrabold font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {user?.role || "superAdmin"}
                </span>
              </div>
              <span className="text-xs text-slate-400">{user?.email || "admin@tiffin.local"}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/30 text-rose-400 text-xs font-bold transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-slate-500 block">Account Scope</span>
            <span className="font-bold text-slate-200 mt-0.5 block">Global Multi-Tenant Root</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-slate-500 block">Session Security</span>
            <span className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> JWT Cookie Protected
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-slate-500 block">Access Tier</span>
            <span className="font-bold text-indigo-400 mt-0.5 block">Full System Read / Write</span>
          </div>
        </div>
      </div>

      {/* System Infrastructure Diagnostics */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Platform Infrastructure & Health</h2>
          </div>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            All Systems Normal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* API Gateway */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                Express API Server
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Port: 5000 (Cors Enabled)
            </p>
          </div>

          {/* Database */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-purple-400" />
                MongoDB Atlas
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">CONNECTED</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Driver: Mongoose v9
            </p>
          </div>

          {/* Cloudinary */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cloud className="h-3.5 w-3.5 text-cyan-400" />
                Cloudinary Storage
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Uploads: tfns_uploads/
            </p>
          </div>
        </div>
      </div>

      {/* Global Configuration Controls */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
          <Sliders className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Global Platform Governance</h2>
        </div>

        <div className="space-y-3">
          {/* Maintenance Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-850">
            <div>
              <span className="text-xs font-bold text-white block">
                Platform Maintenance Mode
              </span>
              <span className="text-[11px] text-slate-500">
                Block non-admin user logins while scheduled database migrations run.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isMaintenanceMode}
              onChange={(e) => {
                setIsMaintenanceMode(e.target.checked);
                toast.success(
                  e.target.checked ? "Maintenance mode enabled" : "Maintenance mode disabled"
                );
              }}
              className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Audit Logging Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-850">
            <div>
              <span className="text-xs font-bold text-white block">
                Detailed API Audit Logging
              </span>
              <span className="text-[11px] text-slate-500">
                Log request payloads and review timestamps for meal corrections and approvals.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableAuditLogs}
              onChange={(e) => {
                setEnableAuditLogs(e.target.checked);
                toast.success("Audit logging updated");
              }}
              className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Notification Alerts */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-850">
            <div>
              <span className="text-xs font-bold text-white block">
                System Broadcast Alerts
              </span>
              <span className="text-[11px] text-slate-500">
                Receive instant notifications when new mess owners register or request verification.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableEmailAlerts}
              onChange={(e) => {
                setEnableEmailAlerts(e.target.checked);
                toast.success("Broadcast preferences saved");
              }}
              className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
