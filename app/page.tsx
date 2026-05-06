"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, getTasks } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";
import type { ProjectStatus } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskMap, setTaskMap] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProjectStatus | "all">("active");

  useEffect(() => {
    (async () => {
      const ps = await getProjects();
      setProjects(ps);
      const map: Record<string, Task[]> = {};
      await Promise.all(ps.map(async (p) => { map[p.id] = await getTasks(p.id); }));
      setTaskMap(map);
      setLoading(false);
    })();
  }, []);

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Client Onboardings</h1>
          <Link
            href="/projects/new"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + New Client
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {(["all", "active", "completed", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors capitalize ${
                filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            {filter === "active" ? "No active onboardings. " : "None found. "}
            <Link href="/projects/new" className="text-gray-900 underline">Add a client</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} tasks={taskMap[p.id] ?? []} />
            ))}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
