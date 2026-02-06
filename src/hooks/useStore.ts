"use client";

import { useCallback, useEffect, useState } from "react";
import { AppState } from "@/lib/types";
import { getState } from "@/lib/store";

export function useStore(): AppState {
  const [state, setState] = useState<AppState>(getState);

  const refresh = useCallback(() => {
    setState(getState());
  }, []);

  useEffect(() => {
    // Re-read on custom storage events
    window.addEventListener("safecheck-update", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("safecheck-update", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return state;
}
