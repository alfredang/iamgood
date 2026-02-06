"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStore";
import { setUser, generateId } from "@/lib/store";

export default function Onboarding() {
  const router = useRouter();
  const { user } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (user?.setupComplete) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  function handleGetStarted() {
    setStep(1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setUser({
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      setupComplete: true,
      createdAt: new Date().toISOString(),
    });

    router.push("/dashboard");
  }

  if (user?.setupComplete) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {step === 0 ? (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-[#5B8A72]/10 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5B8A72" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-stone-800">SafeCheck</h1>
              <p className="text-lg text-stone-500 leading-relaxed">
                Your quiet safety companion. A simple way to let loved ones know you&apos;re okay.
              </p>
            </div>

            <div className="space-y-4 text-left bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e3] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#5B8A72" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-stone-700">One-tap check-in</p>
                  <p className="text-stone-500 text-sm">Confirm you&apos;re safe with a single tap</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e3] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#5B8A72" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-stone-700">Automatic alerts</p>
                  <p className="text-stone-500 text-sm">Your contacts are notified if you miss a check-in</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e3] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#5B8A72" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-stone-700">Private &amp; secure</p>
                  <p className="text-stone-500 text-sm">Your data stays on your device</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              className="w-full bg-[#5B8A72] hover:bg-[#4A7561] text-white text-lg font-semibold py-4 px-8 rounded-2xl transition-all active:scale-[0.98] shadow-md cursor-pointer"
            >
              Get Started
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-stone-800">Welcome!</h2>
              <p className="text-stone-500">Let&apos;s set up your safety companion.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-base font-medium text-stone-700 mb-2">
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-5 py-4 text-lg border border-stone-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5B8A72]/30 focus:border-[#5B8A72] transition-all text-stone-800 placeholder:text-stone-300"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-base font-medium text-stone-700 mb-2">
                  Your email <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-5 py-4 text-lg border border-stone-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5B8A72]/30 focus:border-[#5B8A72] transition-all text-stone-800 placeholder:text-stone-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-[#5B8A72] hover:bg-[#4A7561] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-lg font-semibold py-4 px-8 rounded-2xl transition-all active:scale-[0.98] shadow-md cursor-pointer"
            >
              Continue
            </button>

            <button
              type="button"
              onClick={() => setStep(0)}
              className="w-full text-stone-400 hover:text-stone-600 text-base py-2 transition-colors cursor-pointer"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
