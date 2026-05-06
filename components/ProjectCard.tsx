"use client";

import Link from "next/link";
import type { Project, Task } from "@/lib/types";
import { daysElapsed, daysRemaining, taskProgress, projectHealth } from "@/lib/utils";
import StatusChip from "./StatusChip";
import TypeBadge from "./TypeBadge";
import ProgressBar from "./ProgressBar";

interface Props {
  project: Project;
  tasks: Task[];
}

export default function ProjectCard({ project, tasks }: Props) {
  const elapsed = daysElapsed(project.startDate);
  const remaining = daysRemaining(project.startDate);
  const pct = taskProgress(tasks);
  const health = projectHealth(project, tasks);
  const startDateStr = project.startDate.toDate().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{project.clientName}</h3>
          <StatusChip health={health} />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <TypeBadge type={project.clientType} />
          {project.assignedTeam && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{project.assignedTeam}</span>
          )}
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{pct}% complete</span>
            <span>Day {elapsed} of 15</span>
          </div>
          <ProgressBar pct={pct} />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
          <span>Started {startDateStr}</span>
          <span>{remaining} day{remaining !== 1 ? "s" : ""} left</span>
        </div>
      </div>
    </Link>
  );
}
