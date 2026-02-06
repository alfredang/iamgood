"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "./useStore";
import { CheckInStatus, getCheckInStatus, getTimeUntilDeadline, formatTimeRemaining } from "@/lib/scheduler";
import { addCheckIn, generateId } from "@/lib/store";
import { HealthTag } from "@/lib/types";

export function useCheckIn() {
  const { schedule, checkIns } = useStore();
  const lastCheckIn = checkIns[0] || null;

  const [status, setStatus] = useState<CheckInStatus>("good");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    function update() {
      setStatus(getCheckInStatus(schedule, lastCheckIn));
      const ms = getTimeUntilDeadline(schedule, lastCheckIn);
      setTimeRemaining(formatTimeRemaining(ms));
    }
    update();
    const interval = setInterval(update, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [schedule, lastCheckIn]);

  const performCheckIn = useCallback(
    (healthTag: HealthTag = "okay") => {
      addCheckIn({
        id: generateId(),
        timestamp: new Date().toISOString(),
        healthTag,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    []
  );

  return {
    status,
    timeRemaining,
    lastCheckIn,
    performCheckIn,
    showSuccess,
  };
}
