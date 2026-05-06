"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProject, getTasks, updateProject, getActivityLog } from "@/lib/firestore";
import type { Project, Task, ActivityLog } from "@/lib/types";
import { daysElapsed, daysRemaining, phaseProgress, projectHealth, groupTasksByPhase } from "@/lib/utils";
import PhaseAccordion from "@/components/PhaseAccordion";
import StatusChip from "@/components/StatusChip";
import TypeBadge from "@/components/TypeBadge";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";

const PHASE_ORDER = [
  "Kickoff",
  "Access Collection",
  "Technical Setup",
  "Technical Audit",
  "Historical Analysis",
  "Research",
  "Roadmap",
  "Reporting",
];

function sortedPhases(grouped: Record<string, Task[]>): string[] {
  const known = PHASE_ORDER.filter((p) => grouped[p]);
  const unknown = Object.keys(grouped).filter((p) => !PHASE_ORDER.includes(p));
  return [...known, ...unknown];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, t] = await Promise.all([getProject(id), getTasks(id)]);
      if (!p) { router.push("/"); return; }
      setProject(p);
      setTasks(t);
      setLoading(false);
    })();
  }, [id, router]);

  const handleTaskUpdate = useCallback((taskId: string, data: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data } : t)));
  }, []);

  const handleTaskDelete = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const handleTaskAdd = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const handlePhaseToggle = async (phase: string, completed: boolean) => {
    if (!project) return;
    const updated = { ...project.completedPhases, [phase]: completed };
    setProject({ ...project, completedPhases: updated });
    await updateProject(id, { completedPhases: updated });
  };

  const handleStatusChange = async (status: Project["status"]) => {
    if (!project) return;
    setProject({ ...project, status });
    await updateProject(id, { status });
  };

  const loadActivity = async () => {
    if (showActivity) { setShowActivity(false); return; }
    setActivityLoading(true);
    const logs = await getActivityLog(id);
    setActivity(logs);
    setActivityLoading(false);
    setShowActivity(true);
  };

  if (loading) {
    return (
      <AuthGuard>
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthGuard>
    );
  }

  if (!project) return null;

  const elapsed = daysElapsed(project.startDate);
  const remaining = daysRemaining(project.startDate);
  const grouped = groupTasksByPhase(tasks);
  const phases = sortedPhases(grouped);
  const pct = phaseProgress(project.completedPhases, phases);
  const health = projectHealth(project, tasks);
  const completedCount = tasks.filter((t) => t.completed).length;
  const blockedCount = tasks.filter((t) => t.status === "blocked" && !t.completed).length;

  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-5">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard
        </Link>

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5">

          {/* Top bar with name + actions */}
          <div className="px-6 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-gray-900 truncate">{project.clientName}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <TypeBadge type={project.clientType} />
                  <StatusChip health={health} />
                  {project.assignedTeam && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{project.assignedTeam}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0 pt-0.5">
                {project.status === "active" ? (
                  <>
                    <button
                      onClick={() => handleStatusChange("completed")}
                      className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors text-gray-600"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => handleStatusChange("archived")}
                      className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors text-gray-500"
                    >
                      Archive
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleStatusChange("active")}
                    className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">{phases.filter(p => project.completedPhases?.[p]).length} of {phases.length} phases complete</span>
              <span className="text-xs font-semibold text-gray-700">{pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct === 100 ? "#22c55e" : "#111827",
                }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 divide-x divide-gray-100 border-t border-gray-100">
            <div className="px-5 py-3.5">
              <div className="text-xs text-gray-400 mb-0.5">Day</div>
              <div className="text-base font-semibold text-gray-900">{elapsed} <span className="text-sm font-normal text-gray-400">/ 15</span></div>
            </div>
            <div className="px-5 py-3.5">
              <div className="text-xs text-gray-400 mb-0.5">Days left</div>
              <div className={`text-base font-semibold ${remaining <= 3 ? "text-red-600" : "text-gray-900"}`}>{remaining}</div>
            </div>
            <div className="px-5 py-3.5">
              <div className="text-xs text-gray-400 mb-0.5">Blocked</div>
              <div className={`text-base font-semibold ${blockedCount > 0 ? "text-red-600" : "text-gray-400"}`}>{blockedCount}</div>
            </div>
            <div className="px-5 py-3.5">
              <div className="text-xs text-gray-400 mb-0.5">Started</div>
              <div className="text-sm font-medium text-gray-700">
                {project.startDate.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="mb-6">
          {phases.map((phase) => (
            <PhaseAccordion
              key={phase}
              phase={phase}
              tasks={grouped[phase] ?? []}
              projectId={id}
              phaseCompleted={!!project.completedPhases?.[phase]}
              onPhaseToggle={handlePhaseToggle}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
              onAdd={handleTaskAdd}
            />
          ))}
        </div>

        {/* Activity log */}
        <div>
          <button
            onClick={loadActivity}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            {showActivity ? "Hide" : "Show"} activity log
          </button>

          {activityLoading && <div className="text-xs text-gray-400 mt-3">Loading...</div>}

          {showActivity && (
            <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
              {activity.length === 0 ? (
                <div className="px-4 py-4 text-xs text-gray-400">No activity yet.</div>
              ) : (
                activity.map((log) => (
                  <div key={log.id} className="flex items-baseline justify-between px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="text-xs text-gray-600 min-w-0">
                      <span className="font-medium text-gray-800">{log.performedByEmail}</span>{" "}
                      {log.action === "updated_task" && (
                        <>updated <span className="italic">{log.taskTitle}</span></>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-4">
                      {log.createdAt?.toDate().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
