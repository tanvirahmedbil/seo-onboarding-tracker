import { Timestamp } from "firebase/firestore";
import type { Task, Project } from "./types";

export const ONBOARDING_DAYS = 15;

export function daysElapsed(startDate: Timestamp): number {
  const start = startDate.toDate();
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff) + 1;
}

export function daysRemaining(startDate: Timestamp): number {
  return Math.max(0, ONBOARDING_DAYS - daysElapsed(startDate) + 1);
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

export function phaseProgress(completedPhases: Record<string, boolean> | undefined, phases: string[]): number {
  if (phases.length === 0) return 0;
  const done = phases.filter((p) => completedPhases?.[p]).length;
  return Math.round((done / phases.length) * 100);
}

export function groupTasksByPhase(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.phase]) acc[task.phase] = [];
    acc[task.phase].push(task);
    return acc;
  }, {});
}

export type DeliveryBucket = "timely" | "delayed";

export function projectDeliveryDays(project: Project): number {
  if (project.completedAt) {
    const diff = Math.floor(
      (project.completedAt.toDate().getTime() - project.startDate.toDate().getTime()) /
      (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff) + 1;
  }

  return daysElapsed(project.startDate);
}

export function projectDeliveryBucket(project: Project): DeliveryBucket | null {
  if (project.status === "archived") return null;
  return projectDeliveryDays(project) <= ONBOARDING_DAYS ? "timely" : "delayed";
}
