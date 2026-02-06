"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/useStore";
import { updateSchedule, setUser } from "@/lib/store";
import { GracePeriod, ScheduleFrequency } from "@/lib/types";
import Navigation from "@/components/Navigation";

const FREQUENCIES: { value: ScheduleFrequency; label: string; desc: string }[] = [
  { value: "daily", label: "Once daily", desc: "Check in once per day" },
  { value: "twice-daily", label: "Twice daily", desc: "Morning and evening" },
  { value: "weekly", label: "Weekly", desc: "Check in once per week" },
  { value: "custom", label: "Custom", desc: "Set your own interval" },
];

const GRACE_PERIODS: { value: GracePeriod; label: string }[] = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Settings() {
  const router = useRouter();
  const { user, schedule } = useStore();

  const [frequency, setFrequency] = useState<ScheduleFrequency>(schedule.frequency);
  const [time1, setTime1] = useState(schedule.times[0] || "09:00");
  const [time2, setTime2] = useState(schedule.times[1] || "18:00");
  const [days, setDays] = useState<number[]>(schedule.days);
  const [customHours, setCustomHours] = useState(schedule.customIntervalHours);
  const [grace, setGrace] = useState<GracePeriod>(schedule.gracePeriodMinutes);
  const [saved, setSaved] = useState(false);
  const [userName, setUserName] = useState(user?.name || "");

  useEffect(() => {
    if (!user?.setupComplete) router.replace("/");
  }, [user, router]);

  if (!user?.setupComplete) return null;

  function toggleDay(day: number) {
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
  }

  function handleSave() {
    const times = frequency === "twice-daily" ? [time1, time2] : [time1];
    updateSchedule({ frequency, times, days, customIntervalHours: customHours, gracePeriodMinutes: grace });
    if (user && userName.trim() && userName.trim() !== user.name) {
      setUser({ ...user, name: userName.trim() });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass = "w-full px-4 py-3.5 text-base border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5B8A72]/30 focus:border-[#5B8A72] transition-all text-stone-800";

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      <header className="bg-white border-b border-stone-100 px-6 py-5">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Profile */}
        <section className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">Profile</h2>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Your name</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className={inputClass} />
          </div>
        </section>

        {/* Schedule */}
        <section className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-stone-800">Check-in Schedule</h2>

          <div className="space-y-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all cursor-pointer ${
                  frequency === f.value ? "border-[#5B8A72] bg-[#5B8A72]/5 ring-1 ring-[#5B8A72]/20" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <p className={`font-medium ${frequency === f.value ? "text-[#5B8A72]" : "text-stone-700"}`}>{f.label}</p>
                <p className="text-sm text-stone-400">{f.desc}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-stone-600">
              {frequency === "twice-daily" ? "Check-in times" : "Check-in time"}
            </label>
            <input type="time" value={time1} onChange={(e) => setTime1(e.target.value)} className={inputClass + " cursor-pointer"} />
            {frequency === "twice-daily" && (
              <input type="time" value={time2} onChange={(e) => setTime2(e.target.value)} className={inputClass + " cursor-pointer"} />
            )}
          </div>

          {frequency === "weekly" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-600">Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(i)}
                    className={`w-12 h-12 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                      days.includes(i) ? "bg-[#5B8A72] text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {frequency === "custom" && (
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Check in every (hours)</label>
              <input type="number" min={1} max={168} value={customHours} onChange={(e) => setCustomHours(Number(e.target.value))} className={inputClass} />
            </div>
          )}
        </section>

        {/* Grace Period */}
        <section className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Grace Period</h2>
            <p className="text-sm text-stone-400 mt-0.5">How long to wait after a missed check-in before alerting contacts</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {GRACE_PERIODS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGrace(g.value)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  grace === g.value ? "border-[#5B8A72] bg-[#5B8A72]/5 text-[#5B8A72] ring-1 ring-[#5B8A72]/20" : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleSave}
          className={`w-full font-semibold py-4 rounded-2xl transition-all text-lg cursor-pointer ${
            saved ? "bg-[#A7C4A0] text-white" : "bg-[#5B8A72] hover:bg-[#4A7561] text-white shadow-md"
          }`}
        >
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </main>

      <Navigation />
    </div>
  );
}
