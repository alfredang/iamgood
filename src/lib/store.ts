"use client";

import { AppState, CheckIn, EmergencyContact, Schedule, User, DEFAULT_SCHEDULE } from "./types";

const STORAGE_KEY = "safecheck_state";

const DEFAULT_STATE: AppState = {
  user: null,
  contacts: [],
  schedule: DEFAULT_SCHEDULE,
  checkIns: [],
  alertTriggered: false,
  lastAlertTime: null,
};

export function getState(): AppState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("safecheck-update"));
}

export function setUser(user: User): void {
  const state = getState();
  state.user = user;
  saveState(state);
}

export function addContact(contact: EmergencyContact): void {
  const state = getState();
  state.contacts.push(contact);
  saveState(state);
}

export function updateContact(contact: EmergencyContact): void {
  const state = getState();
  state.contacts = state.contacts.map((c) => (c.id === contact.id ? contact : c));
  saveState(state);
}

export function removeContact(id: string): void {
  const state = getState();
  state.contacts = state.contacts.filter((c) => c.id !== id);
  saveState(state);
}

export function updateSchedule(schedule: Schedule): void {
  const state = getState();
  state.schedule = schedule;
  saveState(state);
}

export function addCheckIn(checkIn: CheckIn): void {
  const state = getState();
  state.checkIns.unshift(checkIn);
  state.alertTriggered = false;
  saveState(state);
}

export function setAlertTriggered(triggered: boolean): void {
  const state = getState();
  state.alertTriggered = triggered;
  if (triggered) {
    state.lastAlertTime = new Date().toISOString();
  }
  saveState(state);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
