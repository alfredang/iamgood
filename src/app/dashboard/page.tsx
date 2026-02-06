"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStore";
import { useCheckIn } from "@/hooks/useCheckIn";
import Navigation from "@/components/Navigation";
import CheckInButton from "@/components/CheckInButton";
import StatusBanner from "@/components/StatusBanner";
import HealthTags from "@/components/HealthTags";

export default function Dashboard() {
  const router = useRouter();
  const { user, contacts } = useStore();
  const { status, timeRemaining, lastCheckIn, performCheckIn, showSuccess } = useCheckIn();

  useEffect(() => {
    if (!user?.setupComplete) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user?.setupComplete) return null;

  const lastCheckInTime = lastCheckIn
    ? new Date(lastCheckIn.timestamp).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "No check-ins yet";

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      <header className="bg-white border-b border-stone-100 px-6 py-5">
        <div className="max-w-lg mx-auto">
          <p className="text-stone-400 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-stone-800">{user.name}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-6 space-y-8">
        <StatusBanner status={status} timeRemaining={timeRemaining} />

        <div className="flex flex-col items-center py-6">
          <CheckInButton
            status={status}
            onCheckIn={() => performCheckIn("okay")}
            showSuccess={showSuccess}
          />
        </div>

        {!showSuccess && (
          <div className="space-y-3">
            <p className="text-center text-stone-400 text-sm">Or let us know how you feel:</p>
            <HealthTags onSelect={performCheckIn} />
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-400">Last check-in</p>
              <p className="text-base font-medium text-stone-700">{lastCheckInTime}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-stone-400">Emergency contacts</p>
              <p className="text-base font-medium text-stone-700">
                {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
              </p>
            </div>
          </div>
        </div>

        {contacts.length === 0 && (
          <button
            onClick={() => router.push("/contacts")}
            className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left transition-all hover:bg-amber-100 cursor-pointer"
          >
            <p className="font-semibold text-amber-800">Add emergency contacts</p>
            <p className="text-sm text-amber-600 mt-1">
              Set up contacts who will be notified if you miss a check-in.
            </p>
          </button>
        )}
      </main>

      <Navigation />
    </div>
  );
}
