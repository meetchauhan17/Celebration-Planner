"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

export interface AnnounceContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const AnnounceContext = createContext<AnnounceContextType | null>(null);

export const AnnounceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (priority === "assertive") {
      setAssertiveMessage("");
      // Brief tick to ensure screen readers detect re-announcements
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage("");
      setTimeout(() => setPoliteMessage(message), 50);
    }

    timerRef.current = setTimeout(() => {
      setPoliteMessage("");
      setAssertiveMessage("");
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnnounceContext.Provider value={{ announce }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="np-announcer sr-only"
        data-testid="live-region-polite"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="np-announcer sr-only"
        data-testid="live-region-assertive"
      >
        {assertiveMessage}
      </div>
    </AnnounceContext.Provider>
  );
};

export function useAnnounce(): AnnounceContextType {
  const context = useContext(AnnounceContext);
  if (!context) {
    // Graceful fallback if called outside provider (e.g. in tests)
    return {
      announce: () => {},
    };
  }
  return context;
}

