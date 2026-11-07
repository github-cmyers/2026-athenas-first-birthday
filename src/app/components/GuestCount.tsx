"use client";

import { useState, useEffect, useCallback } from "react";

interface RSVPCount {
  families: number;
  guests: number;
}

const BADGE =
  "inline-block -rotate-2 rounded-2xl border-[3px] border-ink bg-white px-6 py-3 text-ink shadow-[4px_4px_0_0_var(--color-ink)]";

export default function GuestCount() {
  const [counts, setCounts] = useState<RSVPCount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGuestCount = useCallback(async () => {
    try {
      const res = await fetch("/api/rsvp/count");
      if (res.ok) {
        const data: RSVPCount = await res.json();
        setCounts(data);
      }
    } catch (error) {
      console.error("Failed to fetch guest count:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuestCount();

    // Listen for RSVP submissions and refresh the count
    const handleRSVPSubmitted = () => {
      fetchGuestCount();
    };

    window.addEventListener("rsvp-submitted", handleRSVPSubmitted);
    return () => {
      window.removeEventListener("rsvp-submitted", handleRSVPSubmitted);
    };
  }, [fetchGuestCount]);

  if (isLoading) {
    return (
      <div className="mb-12 text-center">
        <div className={`${BADGE} animate-pulse`}>
          <span className="invisible font-display text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!counts || counts.guests === 0) {
    return (
      <div className="mb-12 text-center">
        <div className={BADGE}>
          <span className="font-display text-lg font-semibold">
            ❄️ Be the first to RSVP!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 text-center">
      <div className={BADGE}>
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl" aria-hidden="true">🎉</span>
          <div className="font-display">
            <span className="text-3xl font-bold">{counts.guests}</span>
            <span className="ml-2 text-lg font-medium">
              {counts.guests === 1 ? "guest" : "guests"} coming
            </span>
          </div>
          <span className="text-3xl" aria-hidden="true">🎉</span>
        </div>
        <p className="mt-0.5 text-sm text-ink/70">
          {counts.families} {counts.families === 1 ? "family" : "families"} have RSVP&apos;d
        </p>
      </div>
    </div>
  );
}
