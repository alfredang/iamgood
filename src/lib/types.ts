export interface User {
  id: string;
  name: string;
  email: string;
  setupComplete: boolean;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

export type ScheduleFrequency = "daily" | "twice-daily" | "weekly" | "custom";
export type GracePeriod = 15 | 30 | 60 | 120;
export type HealthTag = "okay" | "unwell" | "need-talk";

export interface Schedule {
  frequency: ScheduleFrequency;
  times: string[]; // HH:MM format
  days: number[]; // 0-6 (Sun-Sat), used for weekly
  customIntervalHours: number; // for custom frequency
  gracePeriodMinutes: GracePeriod;
}

export interface CheckIn {
  id: string;
  timestamp: string;
  healthTag: HealthTag;
  note?: string;
}

export interface AppState {
  user: User | null;
  contacts: EmergencyContact[];
  schedule: Schedule;
  checkIns: CheckIn[];
  alertTriggered: boolean;
  lastAlertTime: string | null;
}

export const DEFAULT_SCHEDULE: Schedule = {
  frequency: "daily",
  times: ["09:00"],
  days: [0, 1, 2, 3, 4, 5, 6],
  customIntervalHours: 24,
  gracePeriodMinutes: 60,
};

export const HEALTH_TAG_LABELS: Record<HealthTag, string> = {
  okay: "I'm okay",
  unwell: "I feel unwell",
  "need-talk": "Need to talk",
};

export const HEALTH_TAG_COLORS: Record<HealthTag, string> = {
  okay: "bg-green-100 text-green-800 border-green-200",
  unwell: "bg-amber-100 text-amber-800 border-amber-200",
  "need-talk": "bg-blue-100 text-blue-800 border-blue-200",
};
