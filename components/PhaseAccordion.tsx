"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import TaskRow from "./TaskRow";
import { addCustomTask } from "@/lib/firestore";

interface Props {
  phase: string;
  tasks: Task[];
  projectId: string;
  phaseCompleted: boolean;
  onPhaseToggle: (phase: string, completed: boolean) => void;
  onUpdate: (taskId: string, data: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onAdd: (task: Task) => void;
}

export default function PhaseAccordion({ phase, tasks, projectId, phaseCompleted, onPhaseToggle, onUpdate, onDelete, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const done = tasks.filter((t) => t.completed).length;
  const blocked = tasks.filter((t) => t.status === "blocked" && !t.completed).length;

  const handleAddTask = async () => {
    const maxOrder = tasks.reduce((m, t) => Math.max(m, t.order), 0);
    const id = await addCustomTask(projectId, phase, maxOrder + 1);
    onAdd({
      id,
      title: "New task",
      phase,
      dayTarget: 1,
      completed: false,
      completedAt: null,
      completedBy: null,
      status: "not_started",
      blockedReason: null,
      notes: null,
      order: maxOrder + 1,
      isCustom: true,
    });
    setOpen(true);
  };

  return (
    <div className={`border rounded-xl overflow-hidden mb-2 transition-colors ${phaseCompleted ? "border-gray-200 bg-gray-50/50" : "border-gray-200 bg-white"}`}>
      <div className="w-full flex items-center px-4 py-3.5 gap-3">
        {/* Phase completion checkbox */}
        <button
          onClick={() => onPhaseToggle(phase, !phaseCompleted)}
          className="flex-shrink-0 focus:outline-none"
          aria-label={phaseCompleted ? "Unmark phase complete" : "Mark phase complete"}
        >
          {phaseCompleted ? (
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.15"/>
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6 10.5l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-300 hover:text-gray-400 transition-colors" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          )}
        </button>

        {/* Clickable row to expand */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span className={`text-sm font-medium ${phaseCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}>{phase}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${phaseCompleted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {done}/{tasks.length}
          </span>
          {blocked > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              {blocked} blocked
            </span>
          )}
        </button>

        <button onClick={() => setOpen(!open)} className="flex-shrink-0">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 16 16" fill="none"
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              projectId={projectId}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
          <div className="px-4 py-2.5">
            <button
              onClick={handleAddTask}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
