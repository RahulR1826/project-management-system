"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTasks, getMessages, getUsers, Task } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderKanban, CheckCircle, Clock, AlertCircle, Users,
  MessageSquare, Eye, BarChart3, RefreshCw, ArrowRight
} from "lucide-react";

const priorityColors: Record<string, string> = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-green-400",
};

const statusColors: Record<string, string> = {
  pending: "bg-gray-500/20 text-gray-300",
  "in-progress": "bg-blue-500/20 text-blue-300",
  review: "bg-purple-500/20 text-purple-300",
  completed: "bg-green-500/20 text-green-300",
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const users = getUsers().filter((u) => u.role === "user");

  const refresh = () => {
    const allTasks = getTasks();
    setTasks(allTasks);
    setUnreadMessages(getMessages().filter((m) => !m.read && m.from !== "Admin").length);
  };

  useEffect(() => { refresh(); }, []);

  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-xl">
                <FolderKanban className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ProjectFlow</h1>
                <p className="text-xs text-blue-300">Dashboard</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-blue-300 hover:text-white text-sm transition-colors">Home</Link>
              <Link href="/user" className="text-blue-300 hover:text-white text-sm transition-colors">User Portal</Link>
              <Link href="/admin" className="text-blue-300 hover:text-white text-sm transition-colors">Admin Portal</Link>
              <button onClick={refresh} className="text-blue-300 hover:text-white transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Project Overview</h2>
          <p className="text-blue-300 mt-1">Real-time status across all tasks and team members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Tasks", value: tasks.length, color: "from-blue-500 to-blue-600", icon: <FolderKanban className="h-5 w-5" /> },
            { label: "Completed", value: completed, color: "from-green-500 to-green-600", icon: <CheckCircle className="h-5 w-5" /> },
            { label: "In Progress", value: inProgress, color: "from-blue-400 to-cyan-500", icon: <Clock className="h-5 w-5" /> },
            { label: "Under Review", value: review, color: "from-purple-500 to-purple-600", icon: <Eye className="h-5 w-5" /> },
            { label: "Pending", value: pending, color: "from-orange-500 to-orange-600", icon: <AlertCircle className="h-5 w-5" /> },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs opacity-90 mt-1">{s.label}</p>
                </div>
                <div className="opacity-80">{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Completion Rate */}
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                    <circle
                      cx="60" cy="60" r="50" fill="none"
                      stroke="url(#grad)" strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionRate / 100)}`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{completionRate}%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-blue-300 text-sm">{completed} of {tasks.length} tasks completed</p>
            </CardContent>
          </Card>

          {/* Team Progress */}
          <Card className="bg-white/5 border-white/10 text-white lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5" /> Team Progress</CardTitle>
              <CardDescription className="text-blue-300">Per-member task completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {users.map((user) => {
                const ut = tasks.filter((t) => t.assignedTo === user.name);
                const done = ut.filter((t) => t.status === "completed").length;
                const pct = ut.length ? Math.round((done / ut.length) * 100) : 0;
                return (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {user.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white">{user.name}</span>
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
        </div>

        {/* Recent Tasks */}
        <Card className="bg-white/5 border-white/10 text-white mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Tasks</CardTitle>
              <CardDescription className="text-blue-300">Latest task activity</CardDescription>
            </div>
            <Link href="/admin">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Manage <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.slice(0, 6).map((task) => (
                <div key={task.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-white font-bold text-sm">
                      {task.assignedTo[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{task.title}</p>
                      <p className="text-xs text-blue-300">{task.assignedTo} · Due {task.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link href="/admin">
            <div className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-2xl p-5 transition-all cursor-pointer group">
              <FolderKanban className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="font-semibold text-white">Assign Tasks</h3>
              <p className="text-sm text-blue-300 mt-1">Create and assign tasks to team members</p>
              <ArrowRight className="h-4 w-4 text-blue-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link href="/user">
            <div className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-2xl p-5 transition-all cursor-pointer group">
              <CheckCircle className="h-8 w-8 text-green-400 mb-3" />
              <h3 className="font-semibold text-white">User Portal</h3>
              <p className="text-sm text-blue-300 mt-1">View and update your assigned tasks</p>
              <ArrowRight className="h-4 w-4 text-green-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          <Link href="/admin">
            <div className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-2xl p-5 transition-all cursor-pointer group">
              <MessageSquare className="h-8 w-8 text-purple-400 mb-3" />
              <h3 className="font-semibold text-white">Messages</h3>
              <p className="text-sm text-blue-300 mt-1">{unreadMessages > 0 ? `${unreadMessages} unread messages` : "No new messages"}</p>
              <ArrowRight className="h-4 w-4 text-purple-400 mt-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
