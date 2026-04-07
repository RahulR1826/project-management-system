"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getSession, logout, getUsers, getTasks, createTask, updateTask,
  deleteTask, getMessages, createMessage, markMessageRead,
  Task, Message, User
} from "@/lib/api";
import {
  FolderKanban, Plus, Trash2, CheckCircle, Clock, AlertCircle,
  MessageSquare, Users, BarChart3, Send, Bell, Eye, X, RefreshCw, LogOut, Shield
} from "lucide-react";

type Tab = "overview" | "tasks" | "assign" | "messages";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};
const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  review: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};
const statusIcons: Record<string, React.ReactNode> = {
  pending: <AlertCircle className="h-4 w-4" />,
  "in-progress": <Clock className="h-4 w-4" />,
  review: <Eye className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
};

export default function AdminPortal() {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedToId: "", priority: "medium", dueDate: "" });
  const [broadcastMsg, setBroadcastMsg] = useState({ subject: "", body: "", toId: "" });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [t, m] = await Promise.all([getTasks(), getMessages()]);
    setTasks(t);
    setMessages(m);
  };

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") { router.replace("/login"); return; }
    setAdmin(session);
    Promise.all([getTasks(), getMessages(), getUsers()]).then(([t, m, u]) => {
      setTasks(t);
      setMessages(m);
      setUsers(u.filter((u) => u.role === "user"));
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleAssignTask = async () => {
    if (!newTask.title || !newTask.assignedToId || !newTask.dueDate || !admin) return;
    await createTask({ ...newTask, assignedById: admin.id });
    setNewTask({ title: "", description: "", assignedToId: "", priority: "medium", dueDate: "" });
    await refresh();
    showToast("Task assigned successfully!");
    setTab("tasks");
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateTask(id, { status });
    await refresh();
    showToast("Task status updated!");
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id);
    await refresh();
    showToast("Task deleted.");
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMsg.subject || !broadcastMsg.body || !admin) return;
    if (broadcastMsg.toId) {
      await createMessage({ subject: broadcastMsg.subject, body: broadcastMsg.body, fromId: admin.id, toId: broadcastMsg.toId });
    } else {
      await Promise.all(users.map((u) => createMessage({ subject: broadcastMsg.subject, body: broadcastMsg.body, fromId: admin.id, toId: u.id })));
    }
    setBroadcastMsg({ subject: "", body: "", toId: "" });
    await refresh();
    showToast("Message sent!");
  };

  const handleReply = async () => {
    if (!selectedMsg || !replyBody || !admin) return;
    await createMessage({ subject: `Re: ${selectedMsg.subject}`, body: replyBody, fromId: admin.id, toId: selectedMsg.from.id, taskId: selectedMsg.taskId || undefined });
    setReplyBody("");
    setSelectedMsg(null);
    await refresh();
    showToast("Reply sent!");
  };

  const openMessage = async (msg: Message) => {
    await markMessageRead(msg.id);
    setSelectedMsg(msg);
    await refresh();
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
      <div className="text-blue-300 text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Loading...</div>
    </div>
  );

  const unreadCount = messages.filter((m) => !m.read && m.from.id !== admin?.id).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const reviewCount = tasks.filter((t) => t.status === "review").length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "tasks", label: "All Tasks", icon: <FolderKanban className="h-4 w-4" /> },
    { id: "assign", label: "Assign Task", icon: <Plus className="h-4 w-4" /> },
    { id: "messages", label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ""}`, icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {toast && <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium">{toast}</div>}

      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-xl"><FolderKanban className="h-6 w-6 text-white" /></div>
              <div><h1 className="text-xl font-bold text-white">ProjectFlow</h1><p className="text-xs text-blue-300">Admin Portal</p></div>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-blue-300 hover:text-white text-sm transition-colors">Home</Link>
              <button onClick={refresh} className="text-blue-300 hover:text-white transition-colors"><RefreshCw className="h-4 w-4" /></button>
              {unreadCount > 0 && (
                <button onClick={() => setTab("messages")} className="relative">
                  <Bell className="h-5 w-5 text-yellow-400" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{unreadCount}</span>
                </button>
              )}
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center"><Shield className="h-3 w-3 text-white" /></div>
                <span className="text-white text-sm font-medium">Admin</span>
              </div>
              <button onClick={() => { logout(); router.push("/login"); }} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl w-fit">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-blue-600 text-white shadow-lg" : "text-blue-300 hover:text-white hover:bg-white/10"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Tasks", value: tasks.length, color: "from-blue-500 to-blue-600", icon: <FolderKanban className="h-6 w-6" /> },
                { label: "Completed", value: completedCount, color: "from-green-500 to-green-600", icon: <CheckCircle className="h-6 w-6" /> },
                { label: "Pending Review", value: reviewCount, color: "from-purple-500 to-purple-600", icon: <Eye className="h-6 w-6" /> },
                { label: "Pending", value: pendingCount, color: "from-orange-500 to-orange-600", icon: <Clock className="h-6 w-6" /> },
              ].map((s) => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white`}>
                  <div className="flex justify-between items-start">
                    <div><p className="text-3xl font-bold">{s.value}</p><p className="text-sm opacity-90 mt-1">{s.label}</p></div>
                    <div className="opacity-80">{s.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5" /> Team Progress</CardTitle>
                <CardDescription className="text-blue-300">Task completion per member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {users.map((user) => {
                  const ut = tasks.filter((t) => t.assignedTo.id === user.id);
                  const done = ut.filter((t) => t.status === "completed").length;
                  const pct = ut.length ? Math.round((done / ut.length) * 100) : 0;
                  return (
                    <div key={user.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{user.name[0]}</div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-white">{user.name}</span>
                          <span className="text-xs text-blue-300">{done}/{ut.length} · {pct}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full">
                          <div className="h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {tasks.filter((t) => t.status === "review").length > 0 && (
              <Card className="bg-purple-900/30 border-purple-500/30">
                <CardHeader><CardTitle className="text-purple-300 flex items-center gap-2"><Eye className="h-5 w-5" /> Awaiting Your Review</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {tasks.filter((t) => t.status === "review").map((task) => (
                    <div key={task.id} className="flex items-start justify-between bg-white/5 rounded-xl p-4">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <p className="text-sm text-blue-300">by {task.assignedTo.name}</p>
                        {task.userNote && <p className="text-sm text-purple-300 mt-1 italic">"{task.userNote}"</p>}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusChange(task.id, "completed")}><CheckCircle className="h-3 w-3 mr-1" /> Approve</Button>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => handleStatusChange(task.id, "in-progress")}>Revise</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ALL TASKS */}
        {tab === "tasks" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">All Tasks ({tasks.length})</h2>
              <Button onClick={() => setTab("assign")} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> Assign New Task</Button>
            </div>
            {tasks.length === 0 && <div className="text-center py-16 text-blue-300">No tasks yet.</div>}
            {tasks.map((task) => (
              <div key={task.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-semibold text-white text-lg">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${statusColors[task.status]}`}>{statusIcons[task.status]} {task.status}</span>
                    </div>
                    <p className="text-blue-300 text-sm mb-3">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-blue-400 flex-wrap">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {task.assignedTo.name}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due {task.dueDate}</span>
                      {task.completedAt && <span className="text-green-400">✓ Completed {new Date(task.completedAt).toLocaleDateString()}</span>}
                    </div>
                    {task.userNote && (
                      <div className="mt-3 bg-purple-900/30 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs text-purple-300 font-medium mb-1">User Update:</p>
                        <p className="text-sm text-white italic">"{task.userNote}"</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="text-xs bg-white/10 border border-white/20 text-white rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="pending" className="bg-slate-800">Pending</option>
                      <option value="in-progress" className="bg-slate-800">In Progress</option>
                      <option value="review" className="bg-slate-800">Review</option>
                      <option value="completed" className="bg-slate-800">Completed</option>
                    </select>
                    <button onClick={() => handleDeleteTask(task.id)} className="text-red-400 hover:text-red-300 transition-colors self-end"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ASSIGN TASK */}
        {tab === "assign" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Assign New Task</h2>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label className="text-blue-200 font-medium">Task Title *</Label>
                  <Input placeholder="e.g. Design landing page" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-blue-400" />
                </div>
                <div>
                  <Label className="text-blue-200 font-medium">Description</Label>
                  <Textarea placeholder="Describe what needs to be done..." rows={3} value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-blue-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-blue-200 font-medium">Assign To *</Label>
                    <select value={newTask.assignedToId} onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="" className="bg-slate-800">Select user...</option>
                      {users.map((u) => <option key={u.id} value={u.id} className="bg-slate-800">{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-blue-200 font-medium">Priority</Label>
                    <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="low" className="bg-slate-800">Low</option>
                      <option value="medium" className="bg-slate-800">Medium</option>
                      <option value="high" className="bg-slate-800">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-blue-200 font-medium">Due Date *</Label>
                  <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="mt-1 bg-white/10 border-white/20 text-white [color-scheme:dark]" />
                </div>
                <Button onClick={handleAssignTask} disabled={!newTask.title || !newTask.assignedToId || !newTask.dueDate} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                  <Plus className="h-4 w-4 mr-2" /> Assign Task
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Inbox</h2>
              <div className="space-y-3">
                {messages.length === 0 && <p className="text-blue-300 text-center py-8">No messages yet.</p>}
                {messages.map((msg) => (
                  <button key={msg.id} onClick={() => openMessage(msg)}
                    className={`w-full text-left rounded-2xl p-4 border transition-all ${selectedMsg?.id === msg.id ? "bg-blue-600/30 border-blue-500/50" : msg.read ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-blue-900/30 border-blue-500/30"}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {!msg.read && msg.from.id !== admin?.id && <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />}
                          <p className="font-medium text-white text-sm">{msg.subject}</p>
                        </div>
                        <p className="text-xs text-blue-300 mt-1">From: {msg.from.name} → {msg.to.name}</p>
                        <p className="text-xs text-blue-400 mt-1 line-clamp-1">{msg.body}</p>
                      </div>
                      <span className="text-xs text-blue-400 ml-2 flex-shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</span>
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
                  <CardContent className="space-y-4">
                    <p className="text-sm text-blue-100 bg-white/5 rounded-xl p-4">{selectedMsg.body}</p>
                    {selectedMsg.from.id !== admin?.id && (
                      <>
                        <Label className="text-blue-200 font-medium">Reply</Label>
                        <Textarea placeholder="Type your reply..." rows={3} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-blue-400" />
                        <Button onClick={handleReply} disabled={!replyBody} className="w-full bg-blue-600 hover:bg-blue-700"><Send className="h-4 w-4 mr-2" /> Send Reply</Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><Send className="h-5 w-5" /> Send Message</CardTitle>
                    <CardDescription className="text-blue-300">Send announcements to your team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-blue-200">Send To</Label>
                      <select value={broadcastMsg.toId} onChange={(e) => setBroadcastMsg({ ...broadcastMsg, toId: e.target.value })}
                        className="mt-1 w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="" className="bg-slate-800">All Users</option>
                        {users.map((u) => <option key={u.id} value={u.id} className="bg-slate-800">{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-blue-200">Subject</Label>
                      <Input placeholder="Message subject" value={broadcastMsg.subject} onChange={(e) => setBroadcastMsg({ ...broadcastMsg, subject: e.target.value })} className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-blue-400" />
                    </div>
                    <div>
                      <Label className="text-blue-200">Message</Label>
                      <Textarea placeholder="Write your message..." rows={4} value={broadcastMsg.body} onChange={(e) => setBroadcastMsg({ ...broadcastMsg, body: e.target.value })} className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-blue-400" />
                    </div>
                    <Button onClick={handleSendBroadcast} disabled={!broadcastMsg.subject || !broadcastMsg.body} className="w-full bg-blue-600 hover:bg-blue-700">
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
