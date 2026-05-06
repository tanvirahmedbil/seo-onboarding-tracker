import { Timestamp } from "firebase/firestore";
import type { Task, Project } from "./types";

export function daysElapsed(startDate: Timestamp): number {
  const start = startDate.toDate();
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff) + 1;
}

export function daysRemaining(startDate: Timestamp): number {
  return Math.max(0, 15 - daysElapsed(startDate) + 1);
}

export function taskProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
}

export type ProjectHealth = "On Track" | "At Risk" | "Blocked" | "Completed";

export function projectHealth(project: Project, tasks: Task[]): ProjectHealth {
  if (project.status === "completed") return "Completed";
  if (tasks.some((t) => t.status === "blocked")) return "Blocked";
  const elapsed = daysElapsed(project.startDate);
  const pct = taskProgress(tasks);
  if (elapsed >= 7 && pct < 40) return "At Risk";
  return "On Track";
}

export function clientTypeLabel(type: string): string {
  if (type === "new_site") return "New Website";
  if (type === "no_prior_seo") return "No Prior SEO";
  if (type === "prior_seo") return "Prior SEO";
  return type;
}

export function groupTasksByPhase(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.phase]) acc[task.phase] = [];
    acc[task.phase].push(task);
    return acc;
  }, {});
}
