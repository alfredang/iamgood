"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-stone-800 flex items-center justify-center mb-4">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Admin Login</h1>
          <p className="text-stone-400 text-sm mt-1">SafeCheck Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@safecheck.app"
              className="w-full px-4 py-3.5 text-base border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 transition-all text-stone-800 placeholder:text-stone-300"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3.5 text-base border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 transition-all text-stone-800 placeholder:text-stone-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-800 hover:bg-stone-900 disabled:bg-stone-400 text-white font-semibold py-3.5 rounded-xl transition-all cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-stone-400 hover:text-stone-600 text-sm transition-colors">
            Back to App
          </a>
        </div>
      </div>
    </div>
  );
}
