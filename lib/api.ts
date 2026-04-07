// All data operations go through the API (database-backed)

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  userNote?: string | null;
  completedAt?: string | null;
  createdAt: string;
  assignedTo: { id: string; name: string; email: string };
  assignedBy: { id: string; name: string };
}

export interface Message {
  id: string;
  subject: string;
  body: string;
  read: boolean;
  taskId?: string | null;
  createdAt: string;
  from: { id: string; name: string };
  to: { id: string; name: string };
}

// ─── Session (sessionStorage) ────────────────────────────────────────────────

const SESSION_KEY = "pms_session";

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const s = sessionStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}

export function setSession(user: User) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function logout() {
  if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_KEY);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<User | null> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const { user } = await res.json();
  setSession(user);
  return user;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  if (!res.ok) return [];
  return res.json();
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasks(userId?: string): Promise<Task[]> {
  const url = userId ? `/api/tasks?userId=${userId}` : "/api/tasks";
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function createTask(data: {
  title: string;
  description: string;
  assignedToId: string;
  assignedById: string;
  priority: string;
  dueDate: string;
}): Promise<Task | null> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateTask(
  id: string,
  data: { status?: string; userNote?: string; completedAt?: string | null }
): Promise<Task | null> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteTask(id: string): Promise<boolean> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  return res.ok;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getMessages(userId?: string): Promise<Message[]> {
  const url = userId ? `/api/messages?userId=${userId}` : "/api/messages";
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function createMessage(data: {
  subject: string;
  body: string;
  fromId: string;
  toId: string;
  taskId?: string;
}): Promise<Message | null> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function markMessageRead(id: string): Promise<void> {
  await fetch(`/api/messages/${id}`, { method: "PATCH" });
}
