"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { PlannedEvent } from "@/lib/domain";
import { useEvents } from "@/lib/storage";
import { SectionLabel } from "../ui/SectionLabel";
import { Rule } from "../ui/Rule";

export interface EventContextState {
  event: PlannedEvent | null;
  isLoading: boolean;
  isNotFound: boolean;
  error: string | null;
}

const EventContext = createContext<EventContextState | null>(null);

/**
 * Friendly Not-Found component rendering a helpful message with a link to /plan.
 */
export const EventNotFound: React.FC<{ message?: string }> = ({
  message = "The requested celebration plan could not be located in your local storage. It may have been deleted or the link is invalid.",
}) => {
  return (
    <div className="np-event-state-container" role="alert" data-testid="event-not-found">
      <SectionLabel>Notice</SectionLabel>
      <h2 className="np-event-state-heading">Celebration Plan Not Located</h2>
      <p className="np-event-state-desc">{message}</p>
      <div style={{ marginTop: "16px" }}>
        <Link href="/plan" className="np-button np-button-default">
          Plan an event
        </Link>
      </div>
      <Rule variant="hairline" style={{ marginTop: "24px" }} />
    </div>
  );
};

/**
 * Hook to retrieve an event by ID with automatic loading, not-found, and error states.
 */
export function useEvent(id: string): EventContextState {
  const events = useEvents();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return {
      event: null,
      isLoading: true,
      isNotFound: false,
      error: null,
    };
  }

  if (!id || id.trim().length === 0) {
    return {
      event: null,
      isLoading: false,
      isNotFound: true,
      error: null,
    };
  }

  const found = events.find((e) => e.brief.id === id);

  return {
    event: found ?? null,
    isLoading: false,
    isNotFound: !found,
    error: null,
  };
}

export interface EventProviderProps {
  eventId: string;
  children: React.ReactNode;
  fallbackMessage?: string;
}

/**
 * Context provider that wraps event pages, automatically intercepting
 * loading, not-found, and error states so individual pages don't repeat logic.
 */
export const EventProvider: React.FC<EventProviderProps> = ({
  eventId,
  children,
  fallbackMessage,
}) => {
  const state = useEvent(eventId);

  if (state.isLoading) {
    return (
      <div className="np-event-state-container" role="status" data-testid="event-loading">
        <SectionLabel>Status</SectionLabel>
        <p className="np-event-state-desc">Loading celebration plan...</p>
      </div>
    );
  }

  if (state.isNotFound || !state.event) {
    return <EventNotFound message={fallbackMessage} />;
  }

  return (
    <EventContext.Provider value={state}>
      {children}
    </EventContext.Provider>
  );
};

export function useCurrentEvent(): EventContextState {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error("useCurrentEvent must be used within an EventProvider");
  }
  return ctx;
}

