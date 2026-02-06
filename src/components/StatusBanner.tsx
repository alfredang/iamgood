"use client";

import { CheckInStatus } from "@/lib/scheduler";

interface StatusBannerProps {
  status: CheckInStatus;
  timeRemaining: string;
}

export default function StatusBanner({ status, timeRemaining }: StatusBannerProps) {
  const config = {
    good: {
      bg: "bg-[#e8f5e3]",
      border: "border-[#A7C4A0]",
      text: "text-[#3d6b4f]",
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "All is well",
      subtitle: `Next check-in in ${timeRemaining}`,
    },
    "due-soon": {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Check-in due soon",
      subtitle: `${timeRemaining} remaining`,
    },
    overdue: {
      bg: "bg-red-50",
      border: "border-[#E07A5F]/30",
      text: "text-[#c0513a]",
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      title: "Check-in overdue",
      subtitle: "Please check in to let your contacts know you're safe",
    },
  }[status];

  return (
    <div className={`${config.bg} ${config.border} ${config.text} border rounded-2xl p-5 flex items-start gap-4`}>
      <div className="mt-0.5 shrink-0">{config.icon}</div>
      <div>
        <p className="font-semibold text-lg">{config.title}</p>
        <p className="text-sm opacity-80 mt-0.5">{config.subtitle}</p>
      </div>
    </div>
  );
}
