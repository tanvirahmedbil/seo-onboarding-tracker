"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import TaskRow from "./TaskRow";
import { addCustomTask } from "@/lib/firestore";

interface Props {
  phase: string;
  tasks: Task[];
  projectId: string;
  onUpdate: (taskId: string, data: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onAdd: (task: Task) => void;
}

export default function PhaseAccordion({ phase, tasks, projectId, onUpdate, onDelete, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const done = tasks.filter((t) => t.completed).length;
  const blocked = tasks.filter((t) => t.status === "blocked" && !t.completed).length;
  const allDone = done === tasks.length && tasks.length > 0;

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
    <div className={`border rounded-xl overflow-hidden mb-2 transition-colors ${allDone ? "border-gray-200 bg-gray-50/50" : "border-gray-200 bg-white"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {allDone ? (
            <svg className="w-4 h-4 flex-shrink-0 text-green-500" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.15"/>
              <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${blocked > 0 ? "bg-red-400" : "bg-gray-300"}`} />
          )}
          <span className={`text-sm font-medium ${allDone ? "text-gray-400" : "text-gray-800"}`}>{phase}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${allDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {done}/{tasks.length}
          </span>
          {blocked > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              {blocked} blocked
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

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
