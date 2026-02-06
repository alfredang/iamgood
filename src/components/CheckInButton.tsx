"use client";

import { CheckInStatus } from "@/lib/scheduler";

interface CheckInButtonProps {
  status: CheckInStatus;
  onCheckIn: () => void;
  showSuccess: boolean;
}

export default function CheckInButton({ status, onCheckIn, showSuccess }: CheckInButtonProps) {
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          disabled
          className="w-48 h-48 rounded-full bg-[#A7C4A0] text-white text-2xl font-bold shadow-lg flex items-center justify-center transition-all duration-500 scale-105"
        >
          <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <p className="text-xl font-semibold text-[#5B8A72]">You&apos;re all checked in!</p>
        <p className="text-stone-500">Your contacts know you&apos;re safe.</p>
      </div>
    );
  }

  const ringColor = {
    good: "ring-[#A7C4A0]/30",
    "due-soon": "ring-amber-300/40",
    overdue: "ring-[#E07A5F]/30",
  }[status];

  const bgColor = {
    good: "bg-[#5B8A72] hover:bg-[#4A7561]",
    "due-soon": "bg-amber-500 hover:bg-amber-600",
    overdue: "bg-[#E07A5F] hover:bg-[#D06A4F]",
  }[status];

  const label = {
    good: "I'm OK",
    "due-soon": "Check In Now",
    overdue: "I'm Here!",
  }[status];

  return (
    <button
      onClick={onCheckIn}
      className={`w-48 h-48 rounded-full ${bgColor} text-white text-2xl font-bold shadow-xl ring-8 ${ringColor} flex items-center justify-center transition-all duration-300 active:scale-95 hover:scale-105 cursor-pointer`}
      aria-label="Check in to confirm safety"
    >
      {label}
    </button>
  );
}
