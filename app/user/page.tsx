"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSession, logout, getTasks, getMessages, updateTask,
  createMessage, markMessageRead, getUsers, Task, Message, User
} from "@/lib/api";
import {
  FolderKanban, CheckCircle, Clock, AlertCircle, MessageSquare,
  Send, Eye, Bell, RefreshCw, X, ChevronRight, LogOut
} from "lucide-react";

type Tab = "tasks" | "update" | "messages";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};
const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: "bg-gray-100 text-gray-700", icon: <AlertCircle className="h-4 w-4" />, label: "Pending" },
  "in-progress": { color: "bg-blue-100 text-blue-700", icon: <Clock className="h-4 w-4" />, label: "In Progress" },
  review: { color: "bg-purple-100 text-purple-700", icon: <Eye className="h-4 w-4" />, label: "Under Review" },
  completed: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-4 w-4" />, label: "Completed" },
};

export default function UserPortal() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tab, setTab] = useState<Tab>("tasks");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [updateNote, setUpdateNote] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [newMsg, setNewMsg] = useState({ subject: "", body: "" });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async (user?: User) => {
    const u = user ?? currentUser;
    if (!u) return;
    const [t, m] = await Promise.all([getTasks(u.id), getMessages(u.id)]);
    setTasks(t);
    setMessages(m);
  };

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "user") { router.replace("/login"); return; }
    setCurrentUser(session);
    Promise.all([getTasks(session.id), getMessages(session.id), getUsers()]).then(([t, m, users]) => {
      setTasks(t);
      setMessages(m);
      const admin = users.find((u) => u.role === "admin") ?? null;
      setAdminUser(admin);
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleMarkInProgress = async (task: Task) => {
    await updateTask(task.id, { status: "in-progress" });
    await refresh();
    showToast("Task marked as In Progress!");
  };

  const handleSubmitUpdate = async () => {
    if (!selectedTask || !updateNote.trim() || !currentUser || !adminUser) return;
    const isComplete = updateNote.toLowerCase().includes("done") || updateNote.toLowerCase().includes("complete") || updateNote.toLowerCase().includes("finish");
    await updateTask(selectedTask.id, {
      status: "review",
      userNote: updateNote,
      ...(isComplete ? { completedAt: new Date().toISOString() } : {}),
    });
    await createMessage({ subject: `Update: ${selectedTask.title}`, body: updateNote, fromId: currentUser.id, toId: adminUser.id, taskId: selectedTask.id });
    setUpdateNote("");
    setSelectedTask(null);
    await refresh();
    showToast("Update sent to admin!");
    setTab("tasks");
  };

  const handleSendMessage = async () => {
    if (!newMsg.subject || !newMsg.body || !currentUser || !adminUser) return;
    await createMessage({ subject: newMsg.subject, body: newMsg.body, fromId: currentUser.id, toId: adminUser.id });
    setNewMsg({ subject: "", body: "" });
    await refresh();
    showToast("Message sent to admin!");
  };

  const openMsg = async (msg: Message) => {
    await markMessageRead(msg.id);
    setSelectedMsg(msg);
    await refresh();
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-blue-300 text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Loading...</div>
    </div>
  );

  const unreadCount = messages.filter((m) => !m.read && m.from.id !== currentUser?.id).length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in-progress").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium">{toast}</div>}

      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-xl"><FolderKanban className="h-6 w-6 text-white" /></div>
              <div><h1 className="text-xl font-bold text-white">ProjectFlow</h1><p className="text-xs text-blue-300">User Portal</p></div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-blue-300 hover:text-white text-sm transition-colors">Home</Link>
              <button onClick={() => refresh()} className="text-blue-300 hover:text-white transition-colors"><RefreshCw className="h-4 w-4" /></button>
              {unreadCount > 0 && (
                <button onClick={() => setTab("messages")} className="relative">
                  <Bell className="h-5 w-5 text-yellow-400" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{unreadCount}</span>
                </button>
              )}
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{currentUser?.name[0]}</div>
                <span className="text-white text-sm font-medium">{currentUser?.name}</span>
              </div>
              <button onClick={() => { logout(); router.push("/login"); }} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Tasks", value: tasks.length, color: "from-blue-500 to-blue-600" },
            { label: "In Progress", value: pendingTasks, color: "from-orange-500 to-orange-600" },
            { label: "Completed", value: completedTasks, color: "from-green-500 to-green-600" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm opacity-90">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl w-fit">
          {[
            { id: "tasks" as Tab, label: "My Tasks", icon: <FolderKanban className="h-4 w-4" /> },
            { id: "update" as Tab, label: "Send Update", icon: <Send className="h-4 w-4" /> },
            { id: "messages" as Tab, label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}`, icon: <MessageSquare className="h-4 w-4" /> },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-blue-600 text-white shadow-lg" : "text-blue-300 hover:text-white hover:bg-white/10"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* MY TASKS */}
        {tab === "tasks" && (
          <div className="space-y-4">
            {tasks.length === 0 && <div className="text-center py-16 text-blue-300">No tasks assigned to you yet.</div>}
            {tasks.map((task) => {
              const sc = statusConfig[task.status];
              return (
                <div key={task.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="font-semibold text-white text-lg">{task.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${sc.color}`}>{sc.icon} {sc.label}</span>
                      </div>
                      <p className="text-blue-300 text-sm mb-3">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-blue-400">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due {task.dueDate}</span>
                        <span>Assigned by {task.assignedBy.name}</span>
                      </div>
                      {task.userNote && (
                        <div className="mt-3 bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                          <p className="text-xs text-blue-300 font-medium mb-1">Your last update:</p>
                          <p className="text-sm text-white italic">"{task.userNote}"</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {task.status === "pending" && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleMarkInProgress(task)}><Clock className="h-3 w-3 mr-1" /> Start</Button>
                      )}
                      {(task.status === "pending" || task.status === "in-progress") && (
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => { setSelectedTask(task); setTab("update"); }}><Send className="h-3 w-3 mr-1" /> Update</Button>
                      )}
                      {task.status === "review" && <span className="text-xs text-purple-300 text-center px-2">Awaiting<br />review</span>}
                      {task.status === "completed" && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Done</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SEND UPDATE */}
        {tab === "update" && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-xl font-bold text-white">Send Update to Admin</h2>
            {!selectedTask ? (
              <div className="space-y-3">
                <p className="text-blue-300 text-sm">Select a task to send an update for:</p>
                {tasks.filter((t) => t.status !== "completed").map((task) => (
                  <button key={task.id} onClick={() => setSelectedTask(task)}
                    className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-2xl p-4 transition-all group">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="text-xs text-blue-300 mt-1">Due {task.dueDate} · {task.status}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-blue-400 group-hover:text-white" />
                    </div>
                  </button>
                ))}
                {tasks.filter((t) => t.status !== "completed").length === 0 && <p className="text-blue-300 text-center py-8">All tasks completed! 🎉</p>}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div><CardTitle className="text-white">{selectedTask.title}</CardTitle><CardDescription className="text-blue-300">Due {selectedTask.dueDate}</CardDescription></div>
                    <button onClick={() => setSelectedTask(null)} className="text-blue-400 hover:text-white"><X className="h-4 w-4" /></button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-3">
                    <p className="text-xs text-blue-300 font-medium mb-1">💡 Tip</p>
                    <p className="text-xs text-blue-200">Include "done", "complete", or "finish" to automatically mark this task for admin review.</p>
                  </div>
                  <div>
                    <Label className="text-blue-200 font-medium">Your Update *</Label>
                    <Textarea placeholder="e.g. I have completed the task. All tests are passing..." rows={5} value={updateNote} onChange={(e) => setUpdateNote(e.target.value)} className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-blue-400" />
                  </div>
                  <Button onClick={handleSubmitUpdate} disabled={!updateNote.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                    <Send className="h-4 w-4 mr-2" /> Send Update to Admin
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
              <div className="space-y-3">
                {messages.length === 0 && <p className="text-blue-300 text-center py-8">No messages yet.</p>}
                {messages.map((msg) => (
                  <button key={msg.id} onClick={() => openMsg(msg)}
                    className={`w-full text-left rounded-2xl p-4 border transition-all ${selectedMsg?.id === msg.id ? "bg-blue-600/30 border-blue-500/50" : msg.read ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-blue-900/30 border-blue-500/30"}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {!msg.read && msg.from.id !== currentUser?.id && <span className="w-2 h-2 bg-blue-400 rounded-full" />}
                          <p className="font-medium text-white text-sm">{msg.subject}</p>
                        </div>
                        <p className="text-xs text-blue-300 mt-1">From: {msg.from.name}</p>
                        <p className="text-xs text-blue-400 mt-1 line-clamp-1">{msg.body}</p>
                      </div>
                      <span className="text-xs text-blue-400 ml-2">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {selectedMsg ? (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white text-base">{selectedMsg.subject}</CardTitle>
                      <button onClick={() => setSelectedMsg(null)} className="text-blue-400 hover:text-white"><X className="h-4 w-4" /></button>
                    </div>
                    <p className="text-xs text-blue-300">From: {selectedMsg.from.name} · {new Date(selectedMsg.createdAt).toLocaleString()}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-100 bg-white/5 rounded-xl p-4">{selectedMsg.body}</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><Send className="h-5 w-5" /> Message Admin</CardTitle>
                    <CardDescription className="text-blue-300">Send a direct message to the admin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-blue-200">Subject</Label>
                      <Input placeholder="Message subject" value={newMsg.subject} onChange={(e) => setNewMsg({ ...newMsg, subject: e.target.value })} className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-blue-400" />
                    </div>
                    <div>
                      <Label className="text-blue-200">Message</Label>
                      <Textarea placeholder="Write your message..." rows={4} value={newMsg.body} onChange={(e) => setNewMsg({ ...newMsg, body: e.target.value })} className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-blue-400" />
                    </div>
                    <Button onClick={handleSendMessage} disabled={!newMsg.subject || !newMsg.body} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4 mr-2" /> Send Message
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
