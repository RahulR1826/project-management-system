export type TaskStatus = "pending" | "in-progress" | "completed" | "review";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // user name
  assignedBy: string;
  priority: Priority;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  userNote?: string; // user's update message
}

export interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  taskId?: string;
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "user";
  email: string;
}

const TASKS_KEY = "pms_tasks";
const MESSAGES_KEY = "pms_messages";
const CURRENT_USER_KEY = "pms_current_user";
const SESSION_KEY = "pms_session";

export interface UserWithPassword extends User {
  password: string;
}

const defaultUsers: UserWithPassword[] = [
  { id: "1", name: "Admin", role: "admin", email: "admin@projectflow.com", password: "admin123" },
  { id: "2", name: "Alice Johnson", role: "user", email: "alice@projectflow.com", password: "alice123" },
  { id: "3", name: "Bob Smith", role: "user", email: "bob@projectflow.com", password: "bob123" },
  { id: "4", name: "Carol White", role: "user", email: "carol@projectflow.com", password: "carol123" },
  { id: "5", name: "David Lee", role: "user", email: "david@projectflow.com", password: "david123" },
];

const defaultTasks: Task[] = [
  {
    id: "t1",
    title: "Design Homepage Mockup",
    description: "Create wireframes and high-fidelity mockups for the new homepage redesign.",
    assignedTo: "Alice Johnson",
    assignedBy: "Admin",
    priority: "high",
    dueDate: "2025-08-10",
    status: "in-progress",
    createdAt: "2025-07-20T09:00:00Z",
  },
  {
    id: "t2",
    title: "Implement User Authentication",
    description: "Set up JWT-based authentication with login, register, and password reset flows.",
    assignedTo: "Bob Smith",
    assignedBy: "Admin",
    priority: "high",
    dueDate: "2025-08-05",
    status: "completed",
    createdAt: "2025-07-18T10:00:00Z",
    completedAt: "2025-08-01T14:30:00Z",
    userNote: "Authentication fully implemented with refresh tokens and email verification.",
  },
  {
    id: "t3",
    title: "Write API Documentation",
    description: "Document all REST API endpoints using OpenAPI/Swagger specification.",
    assignedTo: "Carol White",
    assignedBy: "Admin",
    priority: "medium",
    dueDate: "2025-08-15",
    status: "pending",
    createdAt: "2025-07-22T11:00:00Z",
  },
  {
    id: "t4",
    title: "Setup CI/CD Pipeline",
    description: "Configure GitHub Actions for automated testing and deployment to staging.",
    assignedTo: "David Lee",
    assignedBy: "Admin",
    priority: "medium",
    dueDate: "2025-08-12",
    status: "review",
    createdAt: "2025-07-19T08:00:00Z",
    userNote: "Pipeline is ready. Please review the workflow file and approve deployment.",
  },
  {
    id: "t5",
    title: "Mobile Responsive Testing",
    description: "Test all pages on various mobile devices and fix any layout issues.",
    assignedTo: "Alice Johnson",
    assignedBy: "Admin",
    priority: "low",
    dueDate: "2025-08-20",
    status: "pending",
    createdAt: "2025-07-25T13:00:00Z",
  },
];

const defaultMessages: Message[] = [
  {
    id: "m1",
    from: "Admin",
    to: "All Users",
    subject: "Sprint Planning Meeting",
    body: "We have a sprint planning meeting scheduled for Monday at 10 AM. Please review your current tasks and come prepared with updates.",
    timestamp: "2025-07-28T09:00:00Z",
    read: false,
  },
  {
    id: "m2",
    from: "Bob Smith",
    to: "Admin",
    subject: "Task Completed: User Authentication",
    body: "I have completed the user authentication implementation. All tests are passing. Please review and mark as done.",
    timestamp: "2025-08-01T14:35:00Z",
    read: true,
    taskId: "t2",
  },
];

function initStore() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(TASKS_KEY)) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(defaultTasks));
  }
  if (!localStorage.getItem(MESSAGES_KEY)) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(defaultMessages));
  }
}

export function getTasks(): Task[] {
  initStore();
  if (typeof window === "undefined") return defaultTasks;
  return JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getMessages(): Message[] {
  initStore();
  if (typeof window === "undefined") return defaultMessages;
  return JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
}

export function saveMessages(messages: Message[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function getUsers(): User[] {
  return defaultUsers.map(({ password: _p, ...u }) => u);
}

export function login(email: string, password: string): User | null {
  const found = defaultUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) return null;
  const { password: _p, ...user } = found;
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
  return user;
}

export function logout() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function getCurrentUser(): User {
  if (typeof window === "undefined") return defaultUsers[0];
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (stored) return JSON.parse(stored);
  return defaultUsers[0];
}

export function setCurrentUser(user: User) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function addTask(task: Omit<Task, "id" | "createdAt">): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: `t${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveTasks([...tasks, newTask]);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>) {
  const tasks = getTasks();
  const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
  saveTasks(updated);
}

export function deleteTask(id: string) {
  saveTasks(getTasks().filter((t) => t.id !== id));
}

export function addMessage(msg: Omit<Message, "id" | "timestamp" | "read">): Message {
  const messages = getMessages();
  const newMsg: Message = {
    ...msg,
    id: `m${Date.now()}`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  saveMessages([...messages, newMsg]);
  return newMsg;
}

export function markMessageRead(id: string) {
  const messages = getMessages();
  saveMessages(messages.map((m) => (m.id === id ? { ...m, read: true } : m)));
}
