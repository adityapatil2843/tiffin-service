"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getOwners, updateOwner } from "@/lib/api/super-admin";
import { User, TiffinService } from "@/types";
import { toast } from "react-hot-toast";
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function SuperAdminOwnersPage() {
  const [owners, setOwners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Status Change Modal State
  const [selectedOwner, setSelectedOwner] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "inactive" | "suspended">("active");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOwnersList = async () => {
    setIsLoading(true);
    try {
      const data = await getOwners();
      setOwners(data);
    } catch (err: any) {
      toast.error("Failed to load mess services directory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnersList();
  }, []);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwner) return;

    setIsUpdatingStatus(true);
    try {
      await updateOwner(selectedOwner._id, { status: newStatus });
      toast.success(`Service status updated to "${newStatus}"`);
      setOwners((prev) =>
        prev.map((o) => (o._id === selectedOwner._id ? { ...o, status: newStatus } : o))
      );
      setSelectedOwner(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update service status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredOwners = owners.filter((owner) => {
    const serviceName =
      owner.serviceId && typeof owner.serviceId === "object"
        ? owner.serviceId.name
        : "";
    const prefix =
      owner.prefix ||
      (owner.serviceId && typeof owner.serviceId === "object"
        ? owner.serviceId.prefix
        : "");

    const matchesSearch =
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (owner.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prefix || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || owner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Tiffin Services</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Platform Registry
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400">
            Registered mess kitchen businesses, owner contacts, and operational statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOwnersList}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            Refresh
          </button>

          <Link
            href="/super-admin/owners/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Register New Service
          </Link>
        </div>
      </div>

      {/* Directory Content */}
      <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search service name, prefix, owner, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 w-80"
            />
          </div>

          <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl">
            {[
              { id: "all", label: "All Services" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Inactive" },
              { id: "suspended", label: "Suspended" },
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

        {/* Services Table */}
        {isLoading ? (
          <div className="flex justify-center py-28">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="text-center py-20 rounded-xl border border-dashed border-slate-850 bg-slate-950/40">
            <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">No mess services found</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click &quot;Register New Service&quot; to onboard your first kitchen.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-3">Service & Prefix</th>
                  <th className="py-3 px-3">Owner Contact</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Registered On</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {filteredOwners.map((owner) => {
                  const service =
                    owner.serviceId && typeof owner.serviceId === "object"
                      ? (owner.serviceId as TiffinService)
                      : null;
                  const prefix = owner.prefix || service?.prefix || "—";
                  const serviceName = service?.name || "Standard Mess Service";
                  const city = service?.city || "Local Area";

                  return (
                    <tr
                      key={owner._id}
                      className="hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-indigo-950 border border-indigo-500/20 flex items-center justify-center font-black text-xs text-indigo-400">
                            {prefix}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{serviceName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Prefix: <strong className="text-indigo-400">{prefix}</strong> (IDs: {prefix}0001)
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200">{owner.name}</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-600" /> {owner.email}
                          </span>
                          {owner.phone && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                              <Phone className="h-2.5 w-2.5 text-slate-600" /> {owner.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-300 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {city}
                        </span>
                        {service?.address && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs">
                            {service.address}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(owner.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border capitalize ${
                            owner.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : owner.status === "suspended"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {owner.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedOwner(owner);
                            setNewStatus(owner.status as any);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800 text-[11px] font-bold transition-all"
                        >
                          Edit Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: EDIT SERVICE STATUS ────────────────────────────────────────── */}
      {selectedOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-slate-850 bg-slate-950 p-6 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white mb-1">Update Service Status</h3>
            <p className="text-xs text-slate-400 mb-4">
              Change account standing for <strong className="text-white">{selectedOwner.name}</strong>.
            </p>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Account Status
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: "active",
                      label: "Active",
                      desc: "Kitchen is fully operational and open for subscribers",
                      color: "text-emerald-400",
                    },
                    {
                      id: "inactive",
                      label: "Inactive",
                      desc: "Temporarily offlined by owner or admin",
                      color: "text-amber-400",
                    },
                    {
                      id: "suspended",
                      label: "Suspended",
                      desc: "Revoke login and block subscriber access",
                      color: "text-rose-400",
                    },
                  ].map((st) => (
                    <label
                      key={st.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        newStatus === st.id
                          ? "bg-indigo-950/40 border-indigo-500"
                          : "bg-slate-900 border-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={st.id}
                        checked={newStatus === st.id}
                        onChange={() => setNewStatus(st.id as any)}
                        className="mt-0.5 accent-indigo-600"
                      />
                      <div>
                        <span className={`text-xs font-bold block ${st.color}`}>
                          {st.label}
                        </span>
                        <span className="text-[10px] text-slate-500 leading-tight block">
                          {st.desc}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setSelectedOwner(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Updating..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
