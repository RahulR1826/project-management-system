"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { FolderKanban, Mail, Lock, Eye, EyeOff, Shield, User, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@projectflow.com", password: "admin123", color: "from-blue-500 to-blue-600", isAdmin: true },
  { role: "Alice Johnson", email: "alice@projectflow.com", password: "alice123", color: "from-purple-500 to-purple-600", isAdmin: false },
  { role: "Bob Smith", email: "bob@projectflow.com", password: "bob123", color: "from-green-500 to-green-600", isAdmin: false },
  { role: "Carol White", email: "carol@projectflow.com", password: "carol123", color: "from-orange-500 to-orange-600", isAdmin: false },
  { role: "David Lee", email: "david@projectflow.com", password: "david123", color: "from-pink-500 to-pink-600", isAdmin: false },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const user = await login(email.trim(), password);
    setLoading(false);
    if (!user) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    router.push(user.role === "admin" ? "/admin" : "/user");
  };

  const handleQuickLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setQuickLoading(acc.email);
    setError("");
    const user = await login(acc.email, acc.password);
    if (user) {
      router.push(user.role === "admin" ? "/admin" : "/user");
    } else {
      setError("Login failed. Please try again.");
    }
    setQuickLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-xl">
                <FolderKanban className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ProjectFlow</span>
            </Link>
            <Link href="/" className="text-blue-300 hover:text-white text-sm transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Login Form */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-2xl">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                  <p className="text-blue-300 text-sm">Sign in to your account</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs px-3 py-1.5 rounded-full">
                  <Shield className="h-3 w-3" /> Admin
                </span>
                <span className="flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs px-3 py-1.5 rounded-full">
                  <User className="h-3 w-3" /> Team Member
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@projectflow.com"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder:text-blue-400/60 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter your password"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder:text-blue-400/60 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign In"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-blue-400 text-center">
                Admin accounts → Admin Portal &nbsp;·&nbsp; User accounts → User Portal
              </p>
            </div>
          </div>

          {/* Demo Accounts Panel */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Quick Login</h2>
              <p className="text-blue-300 text-sm">Click any account to sign in instantly</p>
            </div>

            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleQuickLogin(acc)}
                  disabled={quickLoading === acc.email}
                  className="w-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all disabled:opacity-70"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {quickLoading === acc.email
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : acc.role[0]
                      }
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white text-sm">{acc.role}</p>
                        {acc.isAdmin && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">Admin</span>
                        )}
                      </div>
                      <p className="text-xs text-blue-300 truncate">{acc.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="text-xs text-blue-400 font-mono bg-white/5 px-2 py-1 rounded-lg">{acc.password}</p>
                      <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-4">
              <p className="text-xs text-blue-300 leading-relaxed">
                <span className="text-blue-200 font-medium">How it works:</span> Admin can assign tasks, track progress, and message users. Team members can view their tasks, mark them in progress, and send completion updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
