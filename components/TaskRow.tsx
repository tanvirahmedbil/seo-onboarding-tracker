"use client";

import { useState, useRef, useEffect } from "react";
import { Timestamp } from "firebase/firestore";
import type { Task, TaskStatus } from "@/lib/types";
import { updateTask, deleteTask, logActivity } from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";

interface Props {
  projectId: string;
  task: Task;
  onUpdate: (taskId: string, data: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskRow({ projectId, task, onUpdate, onDelete }: Props) {
  const { user } = useAuth();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(task.title);
  const [notesOpen, setNotesOpen] = useState(!!task.notes);
  const [notesVal, setNotesVal] = useState(task.notes ?? "");
  const [blockedReason, setBlockedReason] = useState(task.blockedReason ?? "");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  const save = async (data: Partial<Task>) => {
    onUpdate(task.id, data);
    await updateTask(projectId, task.id, data);
    if (user) {
      await logActivity(projectId, {
        action: "updated_task",
        taskId: task.id,
        taskTitle: task.title,
        field: Object.keys(data)[0],
        newValue: String(Object.values(data)[0]),
        performedBy: user.uid,
        performedByEmail: user.email ?? "",
      });
    }
  };

  const handleCheck = async () => {
    const now = Timestamp.now();
    await save({
      completed: !task.completed,
      completedAt: !task.completed ? now : null,
      completedBy: !task.completed ? (user?.email ?? null) : null,
      status: task.completed ? "not_started" : task.status,
    });
  };

  const handleTitleBlur = async () => {
    setEditingTitle(false);
    if (titleVal.trim() && titleVal !== task.title) await save({ title: titleVal.trim() });
    else setTitleVal(task.title);
  };

  const handleStatusToggle = async () => {
    const next: TaskStatus = task.status === "blocked" ? "not_started" : "blocked";
    await save({ status: next, blockedReason: next === "not_started" ? null : task.blockedReason });
  };

  const handleBlockedReasonBlur = async () => {
    await save({ blockedReason: blockedReason || null });
  };

  const handleNotesBlur = async () => {
    await save({ notes: notesVal || null });
  };

  const handleDelete = async () => {
    onDelete(task.id);
    await deleteTask(projectId, task.id);
  };

  const isBlocked = task.status === "blocked";
  const isDone = task.completed;

  return (
    <div className={`group border-b border-gray-100 last:border-0 transition-colors ${isBlocked ? "bg-red-50/40" : ""}`}>
      <div className={`flex items-start gap-3 px-4 py-3 ${isBlocked ? "border-l-2 border-red-400" : ""}`}>

        {/* Checkbox */}
        <button
          onClick={handleCheck}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isDone
              ? "bg-gray-800 border-gray-800"
              : "border-gray-300 hover:border-gray-500 bg-white"
          }`}
          aria-label={isDone ? "Mark incomplete" : "Mark complete"}
        >
          {isDone && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {editingTitle ? (
              <input
                ref={titleRef}
                value={titleVal}
                onChange={(e) => setTitleVal(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => { if (e.key === "Enter") titleRef.current?.blur(); if (e.key === "Escape") { setTitleVal(task.title); setEditingTitle(false); } }}
                className="flex-1 text-sm border-b-2 border-gray-400 outline-none bg-transparent py-0.5"
              />
            ) : (
              <span
                onClick={() => !isDone && setEditingTitle(true)}
                className={`flex-1 text-sm leading-snug transition-colors ${
                  isDone
                    ? "line-through text-gray-400"
                    : "text-gray-800 cursor-text hover:text-gray-600"
                }`}
              >
                {task.title}
              </span>
            )}

          </div>

          {/* Blocked reason */}
          {isBlocked && (
            <input
              value={blockedReason}
              onChange={(e) => setBlockedReason(e.target.value)}
              onBlur={handleBlockedReasonBlur}
              placeholder="What's blocking this?"
              className="mt-2 w-full text-xs border border-red-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-red-400 placeholder-red-300 text-red-700"
            />
          )}

          {/* Notes */}
          {notesOpen && (
            <textarea
              value={notesVal}
              onChange={(e) => setNotesVal(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes..."
              rows={2}
              className="mt-2 w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 resize-none placeholder-gray-300 bg-gray-50"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
          {/* Blocked toggle */}
          {!isDone && (
            <button
              onClick={handleStatusToggle}
              title={isBlocked ? "Remove blocked" : "Mark as blocked"}
              className={`text-xs px-2 py-1 rounded-md border transition-all ${
                isBlocked
                  ? "bg-red-100 border-red-300 text-red-700 font-medium"
                  : "border-transparent text-gray-300 hover:border-gray-200 hover:text-gray-500 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
              }`}
            >
              {isBlocked ? "Blocked" : "Block"}
            </button>
          )}

          {/* Notes toggle */}
          <button
            onClick={() => setNotesOpen(!notesOpen)}
            title={notesOpen ? "Hide notes" : "Add notes"}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
              task.notes
                ? "text-blue-500 bg-blue-50"
                : "text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12M2 6h8M2 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            title="Delete task"
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
