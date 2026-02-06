"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStore";
import { HEALTH_TAG_LABELS, HEALTH_TAG_COLORS } from "@/lib/types";
import Navigation from "@/components/Navigation";

export default function History() {
  const router = useRouter();
  const { user, checkIns } = useStore();

  useEffect(() => {
    if (!user?.setupComplete) router.replace("/");
  }, [user, router]);

  if (!user?.setupComplete) return null;

  const grouped: Record<string, typeof checkIns> = {};
  for (const ci of checkIns) {
    const date = new Date(ci.timestamp).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(ci);
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      <header className="bg-white border-b border-stone-100 px-6 py-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-stone-800">Check-in History</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {checkIns.length} total check-in{checkIns.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {checkIns.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-stone-500 text-lg">No check-ins yet</p>
            <p className="text-stone-400 text-sm">Your check-in history will appear here.</p>
            <button onClick={() => router.push("/dashboard")} className="bg-[#5B8A72] hover:bg-[#4A7561] text-white font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer">
              Go to Dashboard
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">{date}</h2>
              <div className="space-y-2">
                {items.map((ci) => (
                  <div key={ci.id} className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#e8f5e3] flex items-center justify-center shrink-0">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#5B8A72" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="font-medium text-stone-700">
                        {new Date(ci.timestamp).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`${HEALTH_TAG_COLORS[ci.healthTag]} border px-3 py-1.5 rounded-full text-sm font-medium`}>
                      {HEALTH_TAG_LABELS[ci.healthTag]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      <Navigation />
    </div>
  );
}
