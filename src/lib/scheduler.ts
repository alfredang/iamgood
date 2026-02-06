import { Schedule, CheckIn } from "./types";

export function getNextCheckInTime(schedule: Schedule, fromDate: Date = new Date()): Date {
  const now = fromDate;

  if (schedule.frequency === "custom") {
    return new Date(now.getTime() + schedule.customIntervalHours * 60 * 60 * 1000);
  }

  const times = [...schedule.times].sort();

  if (schedule.frequency === "daily" || schedule.frequency === "twice-daily") {
    // Find the next scheduled time today or tomorrow
    for (const time of times) {
      const [hours, minutes] = time.split(":").map(Number);
      const candidate = new Date(now);
      candidate.setHours(hours, minutes, 0, 0);
      if (candidate > now) return candidate;
    }
    // All times today have passed, use first time tomorrow
    const [hours, minutes] = times[0].split(":").map(Number);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(hours, minutes, 0, 0);
    return tomorrow;
  }

  if (schedule.frequency === "weekly") {
    const sortedDays = [...schedule.days].sort((a, b) => a - b);
    const currentDay = now.getDay();

    for (const day of sortedDays) {
      if (day > currentDay || (day === currentDay)) {
        for (const time of times) {
          const [hours, minutes] = time.split(":").map(Number);
          const candidate = new Date(now);
          const daysAhead = (day - currentDay + 7) % 7;
          candidate.setDate(candidate.getDate() + daysAhead);
          candidate.setHours(hours, minutes, 0, 0);
          if (candidate > now) return candidate;
        }
      }
    }
    // Wrap to next week
    const [hours, minutes] = times[0].split(":").map(Number);
    const daysAhead = (sortedDays[0] - currentDay + 7) % 7 || 7;
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + daysAhead);
    nextWeek.setHours(hours, minutes, 0, 0);
    return nextWeek;
  }

  // Fallback: tomorrow at first scheduled time
  const [hours, minutes] = (times[0] || "09:00").split(":").map(Number);
  const fallback = new Date(now);
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(hours, minutes, 0, 0);
  return fallback;
}

export function getCheckInDeadline(schedule: Schedule, lastCheckIn: CheckIn | null): Date {
  if (!lastCheckIn) {
    // No check-ins yet — deadline is now (they should check in ASAP)
    return new Date();
  }

  const lastTime = new Date(lastCheckIn.timestamp);
  const nextTime = getNextCheckInTime(schedule, lastTime);
  // Add grace period
  return new Date(nextTime.getTime() + schedule.gracePeriodMinutes * 60 * 1000);
}

export function isCheckInOverdue(schedule: Schedule, lastCheckIn: CheckIn | null): boolean {
  const deadline = getCheckInDeadline(schedule, lastCheckIn);
  return new Date() > deadline;
}

export function getTimeUntilDeadline(schedule: Schedule, lastCheckIn: CheckIn | null): number {
  const deadline = getCheckInDeadline(schedule, lastCheckIn);
  return deadline.getTime() - Date.now();
}

export type CheckInStatus = "good" | "due-soon" | "overdue";

export function getCheckInStatus(schedule: Schedule, lastCheckIn: CheckIn | null): CheckInStatus {
  const timeUntil = getTimeUntilDeadline(schedule, lastCheckIn);
  if (timeUntil < 0) return "overdue";
  if (timeUntil < 30 * 60 * 1000) return "due-soon"; // within 30 minutes
  return "good";
}

export function formatTimeRemaining(ms: number): string {
  if (ms < 0) return "Overdue";
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
