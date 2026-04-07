import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderKanban, CheckCircle, Users, MessageSquare, BarChart3, ArrowRight, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-xl">
                <FolderKanban className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ProjectFlow</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-blue-300 hover:text-white text-sm transition-colors">Dashboard</Link>
              <Link href="/login" className="text-blue-300 hover:text-white text-sm transition-colors">Login</Link>
              <Link href="/login">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 text-blue-300 text-sm mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live project tracking system
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Manage Tasks,<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Track Progress</span>
          </h1>
          <p className="text-xl text-blue-300 mb-10 max-w-2xl mx-auto">
            Admins assign tasks, users complete them and send updates. Real-time visibility for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-base font-semibold rounded-xl">
                <Shield className="h-5 w-5 mr-2" /> Sign In
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-base font-semibold rounded-xl">
                <Users className="h-5 w-5 mr-2" /> View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Admin Assigns Tasks",
                desc: "Admin creates tasks, sets priority and due dates, and assigns them to specific team members.",
                icon: <FolderKanban className="h-8 w-8 text-blue-400" />,
                color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
              },
              {
                step: "02",
                title: "Users Work & Update",
                desc: "Team members view their tasks, mark them in progress, and send completion updates to admin.",
                icon: <CheckCircle className="h-8 w-8 text-green-400" />,
                color: "from-green-500/20 to-green-600/10 border-green-500/30",
              },
              {
                step: "03",
                title: "Admin Reviews & Approves",
                desc: "Admin reviews submitted work, approves completion or requests revisions with full visibility.",
                icon: <BarChart3 className="h-8 w-8 text-purple-400" />,
                color: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
              },
            ].map((item) => (
              <div key={item.step} className={`bg-gradient-to-br ${item.color} border rounded-2xl p-6`}>
                <div className="flex items-start gap-4">
                  <span className="text-4xl font-black text-white/10">{item.step}</span>
                  <div>
                    <div className="mb-3">{item.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-blue-300 text-sm">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <FolderKanban className="h-6 w-6 text-blue-400" />, title: "Task Assignment", desc: "Assign tasks with priority levels and due dates" },
              { icon: <CheckCircle className="h-6 w-6 text-green-400" />, title: "Completion Tracking", desc: "Real-time status updates from pending to done" },
              { icon: <MessageSquare className="h-6 w-6 text-purple-400" />, title: "Two-way Messaging", desc: "Users update admin, admin replies and approves" },
              { icon: <BarChart3 className="h-6 w-6 text-orange-400" />, title: "Progress Analytics", desc: "Visual dashboards with team completion rates" },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all">
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-blue-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-blue-600/30 to-purple-600/20 border border-blue-500/30 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-blue-300 mb-8">Jump into the admin portal to assign tasks or the user portal to view your work.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl">
                Sign In <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 rounded-xl">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-blue-400" />
            <span className="text-white font-semibold">ProjectFlow</span>
          </div>
          <p className="text-blue-400 text-sm">© 2025 ProjectFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
