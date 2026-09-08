"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOwner } from "@/lib/api/super-admin";
import { toast } from "react-hot-toast";
import {
  Building2,
  UserCheck,
  ArrowLeft,
  KeyRound,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function NewOwnerServicePage() {
  const router = useRouter();

  // Mess Service Information
  const [serviceName, setServiceName] = useState("");
  const [servicePrefix, setServicePrefix] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // Owner Account Information
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto clean prefix (uppercase letters only, 2-4 chars)
  const handlePrefixChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
    setServicePrefix(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!servicePrefix || servicePrefix.length < 2) {
      toast.error("Prefix must be 2 to 4 uppercase letters (e.g. KP, TFNS)");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Temporary password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOwner({
        name: ownerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password,
        serviceName: serviceName.trim(),
        servicePrefix: servicePrefix.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
      });

      toast.success("Mess service and owner account created successfully!");
      router.push("/super-admin/owners");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register mess service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Back & Breadcrumb */}
      <div>
        <Link
          href="/super-admin/owners"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Tiffin Services Directory
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Onboard New Mess Service
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Set up a new kitchen service instance and generate initial owner credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Mess Service Identity */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <Building2 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Mess Kitchen Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mess Service Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Swad Tiffin Service"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Service Prefix (2-4 letters) *
              </label>
              <input
                type="text"
                required
                maxLength={4}
                placeholder="e.g. RS"
                value={servicePrefix}
                onChange={(e) => handlePrefixChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 font-mono font-bold tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 uppercase"
              />
            </div>
          </div>

          {/* Prefix Live Preview Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-indigo-300">
                Subscriber Customer ID Format:
              </span>
            </div>
            <span className="font-mono font-bold text-xs text-white bg-indigo-900/40 px-2.5 py-1 rounded-lg border border-indigo-500/30">
              {servicePrefix ? `${servicePrefix}0001, ${servicePrefix}0002...` : "PREFIX0001"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Address / Area
              </label>
              <input
                type="text"
                placeholder="e.g. Near University North Gate, Model Colony"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                City / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Pune, Maharashtra"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Owner Account Information */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 shadow-xl backdrop-blur-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <UserCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Owner Account Credentials</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Owner Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patil"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address (Login ID) *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. owner@royalswad.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Initial Account Password *
              </label>
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/super-admin/owners"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                Complete Service Registration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
