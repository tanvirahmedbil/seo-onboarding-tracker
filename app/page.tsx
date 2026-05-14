"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects, getTasks } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";
import type { ProjectStatus } from "@/lib/types";
import { ONBOARDING_DAYS, projectDeliveryBucket, projectDeliveryDays } from "@/lib/utils";
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
  const reportRows = projects
    .filter((project) => project.status !== "archived")
    .map((project) => ({
      project,
      day: projectDeliveryDays(project),
      bucket: projectDeliveryBucket(project),
    }))
    .filter((row) => row.bucket !== null)
    .sort((a, b) => a.day - b.day || a.project.clientName.localeCompare(b.project.clientName));
  const timelyRows = reportRows.filter((row) => row.bucket === "timely");
  const delayedRows = reportRows.filter((row) => row.bucket === "delayed");

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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <ProjectCard key={p.id} project={p} tasks={taskMap[p.id] ?? []} />
              ))}
            </div>

            <section className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-900">Delivery report</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Projects within Day {ONBOARDING_DAYS} count as timely. Past Day {ONBOARDING_DAYS} counts as delayed.
                  </p>
                </div>
                <div className="text-sm text-gray-400 whitespace-nowrap">{reportRows.length} tracked</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <DeliveryColumn title="Timely delivered" count={timelyRows.length} rows={timelyRows} emptyText="No timely projects yet." />
                <DeliveryColumn title="Delayed" count={delayedRows.length} rows={delayedRows} emptyText="No delayed projects." />
              </div>
            </section>
          </>
        )}
      </main>
    </AuthGuard>
  );
}

function DeliveryColumn({
  title,
  count,
  rows,
  emptyText,
}: {
  title: string;
  count: number;
  rows: Array<{ project: Project; day: number }>;
  emptyText: string;
}) {
  return (
    <div className="px-5 py-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <div className="text-4xl leading-none font-semibold text-gray-900">{count}</div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map(({ project, day }) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="truncate text-gray-800">{project.clientName}</span>
              <span className="text-gray-400 whitespace-nowrap">Day {day}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
