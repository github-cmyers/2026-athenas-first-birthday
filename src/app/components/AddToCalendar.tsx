"use client";

import { useState } from "react";

interface AddToCalendarProps {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

export default function AddToCalendar({
  title,
  description,
  location,
  startDate,
  endDate,
}: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // UTC stamp (YYYYMMDDTHHMMSSZ) understood by both Google Calendar and ICS.
  // The ICS half used to emit local wall-clock digits with no zone, which made
  // it a "floating" time that lands on the wrong hour for anyone whose
  // calendar is not in the event's timezone.
  function formatUtcStamp(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  // Google Calendar URL
  function getGoogleCalendarUrl(): string {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${formatUtcStamp(startDate)}/${formatUtcStamp(endDate)}`,
      details: description,
      location: location,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  // Outlook.com Calendar URL
  function getOutlookUrl(): string {
    const params = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: title,
      body: description,
      location: location,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  // Generate ICS file content for Apple Calendar / Outlook Desktop
  function generateICSContent(): string {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Athena's First Birthday//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `DTSTART:${formatUtcStamp(startDate)}`,
      `DTEND:${formatUtcStamp(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      `LOCATION:${location}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    return icsContent;
  }

  function downloadICS() {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "athenas-first-birthday.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="btn-chunky bg-ice"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Add to Calendar
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-60 bg-white rounded-2xl border-[3px] border-ink shadow-[5px_5px_0_0_var(--color-ink)] z-20 overflow-hidden text-left">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-ice/40 transition-colors text-ink font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google Calendar
            </a>

            <a
              href={getOutlookUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-ice/40 transition-colors text-ink font-semibold border-t-2 border-ink/10"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#0078D4"
                  d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.58.23h-8.547v-6.959l1.6 1.229c.102.086.225.129.37.129.146 0 .268-.043.37-.129l6.63-5.098c.09-.074.17-.11.24-.11.12 0 .18.074.18.22v-.566h-.025zm-.238-1.058c.158.152.238.346.238.576v.145l-7.203 5.531-2.16-1.652V4.67h8.547c.228 0 .42.077.578.23v.43zM14.637 4.67v6.16l-2.16 1.652-7.203-5.53v-.146c0-.23.08-.424.238-.576.159-.153.35-.23.578-.23h8.547zM5.512 6.93v.565c0 .147.059.22.176.22.07 0 .15.037.242.11l6.629 5.099c.102.086.225.129.37.129.146 0 .268-.043.37-.129l1.602-1.23v6.96H.818c-.228 0-.422-.077-.58-.23-.159-.152-.238-.346-.238-.576V7.37c0-.23.08-.424.238-.576.158-.153.352-.23.58-.23h4.455l.24.366z"
                />
              </svg>
              Outlook
            </a>

            <button
              onClick={downloadICS}
              className="flex items-center gap-3 px-4 py-3 hover:bg-ice/40 transition-colors text-ink font-semibold border-t-2 border-ink/10 w-full text-left"
            >
              <svg className="w-5 h-5 text-ink/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download .ics file
              <span className="text-xs font-normal text-ink/50 ml-auto">Apple / Other</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
