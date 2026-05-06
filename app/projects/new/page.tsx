"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createProject } from "@/lib/firestore";
import type { ClientType, AssignedTeam } from "@/lib/types";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";

const clientTypes: { value: ClientType; label: string; desc: string }[] = [
  { value: "new_site", label: "New Website", desc: "Brand new site with no SEO history" },
  { value: "no_prior_seo", label: "Existing Site — No Prior SEO", desc: "Site exists but no SEO work done" },
  { value: "prior_seo", label: "Existing Site — Prior SEO", desc: "Site with previous SEO agency or work" },
];

const teams: AssignedTeam[] = ["Team Tanvir", "Team Debasish", "Team Monir"];

export default function NewProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [clientType, setClientType] = useState<ClientType>("new_site");
  const [assignedTeam, setAssignedTeam] = useState<AssignedTeam>("Team Tanvir");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) { setError("Client name required."); return; }
    setLoading(true);
    setError("");
    try {
      const id = await createProject(
        clientName.trim(),
        clientType,
        new Date(startDate + "T00:00:00"),
        user!.uid,
        assignedTeam
      );
      router.push(`/projects/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            ← Dashboard
          </Link>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-8">New Client Onboarding</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Acme Corporation"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Type</label>
            <div className="space-y-2">
              {clientTypes.map((ct) => (
                <label
                  key={ct.value}
                  className={`flex items-start gap-3 border rounded-lg p-3.5 cursor-pointer transition-colors ${
                    clientType === ct.value ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="clientType"
                    value={ct.value}
                    checked={clientType === ct.value}
                    onChange={() => setClientType(ct.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{ct.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{ct.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned Team</label>
              <select
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value as AssignedTeam)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors bg-white"
              >
                {teams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Onboarding"}
          </button>
        </form>
      </main>
    </AuthGuard>
  );
}
