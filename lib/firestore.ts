import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { getTasksForClientType } from "./sop-templates";
import type { ClientType, Project, Task, ActivityLog } from "./types";

export async function createProject(
  clientName: string,
  clientType: ClientType,
  startDate: Date,
  userId: string,
  assignedTeam: string
): Promise<string> {
  const projectRef = await addDoc(collection(db, "projects"), {
    clientName,
    clientType,
    assignedTeam,
    startDate: Timestamp.fromDate(startDate),
    createdAt: serverTimestamp(),
    createdBy: userId,
    status: "active",
    completedAt: null,
  });

  const templates = getTasksForClientType(clientType);
  const batch = writeBatch(db);
  for (const t of templates) {
    const taskRef = doc(collection(db, "projects", projectRef.id, "tasks"));
    batch.set(taskRef, {
      title: t.title,
      phase: t.phase,
      dayTarget: t.dayTarget,
      completed: false,
      completedAt: null,
      completedBy: null,
      status: "not_started",
      blockedReason: null,
      notes: null,
      order: t.order,
      isCustom: false,
    });
  }
  await batch.commit();

  return projectRef.id;
}

export async function getProjects(): Promise<Project[]> {
  const snap = await getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
}

export async function getProject(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, "projects", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Project;
}

export async function updateProject(id: string, data: Partial<Omit<Project, "id">>) {
  await updateDoc(doc(db, "projects", id), data as Record<string, unknown>);
}

export async function getTasks(projectId: string): Promise<Task[]> {
  const snap = await getDocs(
    query(collection(db, "projects", projectId, "tasks"), orderBy("order", "asc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<Omit<Task, "id">>
) {
  await updateDoc(doc(db, "projects", projectId, "tasks", taskId), data as Record<string, unknown>);
}

export async function addCustomTask(
  projectId: string,
  phase: string,
  order: number
): Promise<string> {
  const ref = await addDoc(collection(db, "projects", projectId, "tasks"), {
    title: "New task",
    phase,
    dayTarget: 1,
    completed: false,
    completedAt: null,
    completedBy: null,
    status: "not_started",
    blockedReason: null,
    notes: null,
    order,
    isCustom: true,
  });
  return ref.id;
}

export async function deleteTask(projectId: string, taskId: string) {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "projects", projectId, "tasks", taskId));
}

export async function logActivity(
  projectId: string,
  entry: Omit<ActivityLog, "id" | "createdAt">
) {
  await addDoc(collection(db, "projects", projectId, "activity"), {
    ...entry,
    createdAt: serverTimestamp(),
  });
}

export async function getActivityLog(projectId: string): Promise<ActivityLog[]> {
  const snap = await getDocs(
    query(collection(db, "projects", projectId, "activity"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog));
}
