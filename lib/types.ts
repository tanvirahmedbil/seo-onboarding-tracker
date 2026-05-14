import { Timestamp } from "firebase/firestore";

export type ClientType = "new_site" | "no_prior_seo" | "prior_seo";
export type ProjectStatus = "active" | "completed" | "archived";
export type TaskStatus = "not_started" | "blocked";

export type AssignedTeam = "Team Tanvir" | "Team Debasish" | "Team Monir";

export interface Project {
  id: string;
  clientName: string;
  clientType: ClientType;
  assignedTeam: AssignedTeam;
  startDate: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
  status: ProjectStatus;
  completedAt?: Timestamp | null;
  completedPhases?: Record<string, boolean>;
}

export interface Task {
  id: string;
  title: string;
  phase: string;
  dayTarget: number;
  completed: boolean;
  completedAt: Timestamp | null;
  completedBy: string | null;
  status: TaskStatus;
  blockedReason: string | null;
  notes: string | null;
  order: number;
  isCustom: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  taskId?: string;
  taskTitle?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByEmail: string;
  createdAt: Timestamp;
}
