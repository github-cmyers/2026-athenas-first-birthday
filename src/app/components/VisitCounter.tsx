"use client";

import { useEffect } from "react";
import type { Lang } from "@/lib/i18n";

// Flags kept in the guest's own browser only; nothing identifying is sent.
// The session flag makes refreshing or switching language within one visit
// count once; the lasting flag marks the browser's first-ever visit.
const COUNTED_THIS_VISIT = "athena-birthday-visit-counted";
const SEEN_BEFORE = "athena-birthday-seen";

// Tells the server the invitation was opened, for the visit counts on the
// admin page (see src/lib/visits.ts). Renders nothing.
export default function VisitCounter({ lang }: { lang: Lang }) {
  useEffect(() => {
    let newDevice = false;
    try {
      if (sessionStorage.getItem(COUNTED_THIS_VISIT)) return;
      sessionStorage.setItem(COUNTED_THIS_VISIT, "1");
      newDevice = localStorage.getItem(SEEN_BEFORE) === null;
      localStorage.setItem(SEEN_BEFORE, "1");
    } catch {
      // Storage blocked (some private modes): still count the visit, just not
      // as a new device.
    }

    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang, newDevice }),
      keepalive: true,
    }).catch(() => {});
  }, [lang]);

  return null;
}
