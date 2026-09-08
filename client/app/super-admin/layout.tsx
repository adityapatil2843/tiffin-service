"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "react-hot-toast";
import { LogOut, Menu, X, Shield, LayoutDashboard, Building2, Settings } from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Admin signed out");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
    { name: "Tiffin Services", href: "/super-admin/owners", icon: Building2 },
    { name: "Settings", href: "/super-admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/10 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <span className="text-lg">👑</span>
          </div>
          <span className="text-base font-bold tracking-wider text-white">TFNS Admin</span>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-30 border-b border-slate-800 bg-slate-950 px-4 py-3 space-y-1 shadow-2xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between px-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
              <span className="text-xs text-slate-500 font-mono">SUPER ADMIN</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-sm font-medium hover:bg-rose-900/20"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-900 bg-slate-950/50 backdrop-blur-md p-6 shrink-0 relative z-20">
        {/* Branding */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-xl">
            👑
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-widest text-white leading-none">TFNS</span>
            <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-1">
              Super Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile / Logout Card */}
        <div className="border-t border-slate-900 pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-950 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-200 truncate">{user?.name || "Admin"}</span>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider mt-0.5">
                SYSTEM PORTAL
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/30 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
        {children}
      </main>
    </div>
  );
}
