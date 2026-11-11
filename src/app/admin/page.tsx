"use client";

import { useState, useEffect, useMemo } from "react";
import type { RsvpRow } from "@/lib/rsvp";
import { EVENT_TIME_ZONE, MAX_FAMILY_MEMBERS, telHref } from "@/lib/event";
import { downloadCsv } from "@/lib/csv";
import { countPicks, describeAnswer, PREDICTION_QUESTIONS, type PredictionAnswers } from "@/lib/predictions";

type Filter = "all" | "attending" | "declined";

const SESSION_EXPIRED = "Your session has expired. Please log in again.";

// Submission times are shown in the party's time zone, matching the rest of
// the site, and the CSV says so in its header.
const submittedFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: EVENT_TIME_ZONE,
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatSubmitted(value: string): string {
  return submittedFormat.format(new Date(value));
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

// Matches name and email case-insensitively, and phone numbers on digits
// alone so "4015" finds "(401) 555-...".
function matchesSearch(rsvp: RsvpRow, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  if (rsvp.name.toLowerCase().includes(needle)) return true;
  if (rsvp.email.toLowerCase().includes(needle)) return true;
  const digits = digitsOnly(needle);
  return digits.length > 0 && digitsOnly(rsvp.phone).includes(digits);
}

function headcount(rsvps: RsvpRow[]): number {
  return rsvps.reduce((sum, r) => (r.attending ? sum + r.familymembers : sum), 0);
}

function hasPredictions(predictions: PredictionAnswers | null): predictions is PredictionAnswers {
  return predictions !== null && countPicks(predictions) > 0;
}

// Hover text for the 🔮 next to a guest's name, one question per line.
function predictionSummary(predictions: PredictionAnswers): string {
  return PREDICTION_QUESTIONS.map((q) => `${q.short}: ${describeAnswer(predictions, q) || "—"}`).join("\n");
}

// Shared shell for the edit and delete dialogs: a dimmed backdrop that closes
// on click or Escape, unless the dialog is mid-request.
function Modal({
  labelledBy,
  role = "dialog",
  onClose,
  children,
}: {
  labelledBy: string;
  role?: "dialog" | "alertdialog";
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/50 px-4 py-10"
      onClick={onClose}
    >
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="sticker my-auto w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Confirmation shown before an RSVP is permanently removed. Named so the
// person deleting can see exactly whose row they are about to destroy.
function DeleteConfirmDialog({
  rsvp,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  rsvp: RsvpRow;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal labelledBy="delete-title" role="alertdialog" onClose={onCancel}>
      <h2 id="delete-title" className="mb-2 font-display text-xl font-bold text-ink">
        Remove this RSVP?
      </h2>
      <p className="mb-1 text-ink/80">
        <span className="font-semibold text-ink">{rsvp.name}</span>
        {rsvp.attending && rsvp.familymembers > 1 && ` (party of ${rsvp.familymembers})`} will
        be permanently removed from the guest list.
      </p>
      <p className="mb-5 text-sm text-ink/60">This cannot be undone.</p>

      {error && (
        <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={deleting}
          className="rounded-lg px-4 py-2 font-semibold text-ink transition-colors hover:bg-ink/10 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          autoFocus
          className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </Modal>
  );
}

const FIELD =
  "w-full rounded-xl border-[2.5px] border-ink/25 bg-white px-3 py-2 text-ink focus:border-ink focus:outline-none focus:ring-4 focus:ring-sky/40";
const LABEL = "mb-1 block text-sm font-semibold text-ink";

// Correct any field of an RSVP. The server applies the same validation as the
// public form, and its message is shown here if it refuses.
function EditDialog({
  rsvp,
  onCancel,
  onSaved,
  onSessionExpired,
}: {
  rsvp: RsvpRow;
  onCancel: () => void;
  onSaved: (updated: RsvpRow) => void;
  onSessionExpired: () => void;
}) {
  const [name, setName] = useState(rsvp.name);
  const [attending, setAttending] = useState(rsvp.attending);
  // A decline stores 0; if the host flips it to attending, start from 1.
  const [familyMembers, setFamilyMembers] = useState(String(Math.max(rsvp.familymembers, 1)));
  const [phone, setPhone] = useState(rsvp.phone);
  const [email, setEmail] = useState(rsvp.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/rsvp/${rsvp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          attending,
          familyMembers: attending ? Number(familyMembers) : 0,
          phone,
          email,
        }),
      });

      if (res.status === 401) {
        onSessionExpired();
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save changes");
        return;
      }

      onSaved(data as RsvpRow);
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  function close() {
    if (!saving) onCancel();
  }

  return (
    <Modal labelledBy="edit-title" onClose={close}>
      <h2 id="edit-title" className="mb-4 font-display text-xl font-bold text-ink">
        Edit RSVP
      </h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label htmlFor="edit-name" className={LABEL}>Name</label>
          <input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className={FIELD}
          />
        </div>

        <fieldset>
          <legend className={LABEL}>Response</legend>
          <div className="grid grid-cols-2 gap-2">
            {/* Selected colours written out in full so Tailwind emits them */}
            {[
              { value: true, label: "Attending", selected: "peer-checked:bg-green-200" },
              { value: false, label: "Declined", selected: "peer-checked:bg-blush/45" },
            ].map((option) => (
              <label key={option.label} className="cursor-pointer">
                <input
                  type="radio"
                  name="edit-attending"
                  checked={attending === option.value}
                  onChange={() => setAttending(option.value)}
                  className="peer sr-only"
                />
                <span
                  className={`block rounded-xl border-[2.5px] border-ink/25 px-3 py-2 text-center font-semibold text-ink peer-checked:border-ink peer-focus-visible:ring-4 peer-focus-visible:ring-sky/50 ${option.selected}`}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {attending && (
          <div>
            <label htmlFor="edit-family" className={LABEL}>
              Family members attending (including the guest)
            </label>
            <select
              id="edit-family"
              value={familyMembers}
              onChange={(e) => setFamilyMembers(e.target.value)}
              className={FIELD}
            >
              {Array.from({ length: MAX_FAMILY_MEMBERS }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="edit-phone" className={LABEL}>Phone</label>
          <input
            id="edit-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="edit-email" className={LABEL}>Email</label>
          <input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={FIELD}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="rounded-lg px-4 py-2 font-semibold text-ink transition-colors hover:bg-ink/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-chunky bg-blush py-2">
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function StatTile({ label, value, tint }: { label: string; value: number; tint: string }) {
  return (
    <div className={`rounded-2xl border-[3px] border-ink p-4 shadow-[4px_4px_0_0_var(--color-ink)] ${tint}`}>
      <div className="font-display text-4xl font-bold tabular-nums text-ink">{value}</div>
      <div className="mt-1 text-sm font-bold uppercase tracking-wider text-ink/70">{label}</div>
    </div>
  );
}

const ICON_BUTTON =
  "inline-flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingEdit, setPendingEdit] = useState<RsvpRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RsvpRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  // Any 401 from the API means the 12-hour session ran out mid-use. Drop back
  // to the login form with an explanation rather than showing an empty list.
  function handleSessionExpired() {
    setIsAuthenticated(false);
    setRsvps([]);
    setPendingEdit(null);
    setPendingDelete(null);
    setError(SESSION_EXPIRED);
  }

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/check");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchRSVPs();
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRSVPs() {
    setDataLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/rsvp");
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!res.ok) {
        setLoadError("Couldn't load RSVPs. Please try again.");
        return;
      }
      setRsvps(await res.json());
    } catch {
      setLoadError("Couldn't load RSVPs. Please try again.");
    } finally {
      setDataLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPassword("");
        fetchRSVPs();
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Login failed");
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setRsvps([]);
    } catch {
      console.error("Logout failed");
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/rsvp/${pendingDelete.id}`, {
        method: "DELETE",
      });

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to remove RSVP");
        return;
      }

      setRsvps((prev) => prev.filter((r) => r.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      setDeleteError("Failed to remove RSVP");
    } finally {
      setDeleting(false);
    }
  }

  function closeDeleteDialog() {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteError("");
  }

  function handleSaved(updated: RsvpRow) {
    setRsvps((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setPendingEdit(null);
  }

  const attendingRsvps = useMemo(() => rsvps.filter((r) => r.attending), [rsvps]);
  const declinedCount = rsvps.length - attendingRsvps.length;

  const visible = useMemo(
    () =>
      rsvps.filter(
        (r) =>
          (filter === "all" || r.attending === (filter === "attending")) &&
          matchesSearch(r, search)
      ),
    [rsvps, filter, search]
  );

  const predictionCount = useMemo(
    () => rsvps.filter((r) => hasPredictions(r.predictions)).length,
    [rsvps]
  );

  // Exports exactly what is on screen, so filtering to "Attending" first
  // gives the venue a ready-made guest list. Each guest's predictions follow,
  // one column per question, as a keepsake.
  function handleExport() {
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(`athena-birthday-rsvps-${today}.csv`, [
      [
        "Name",
        "Response",
        "Family members",
        "Phone",
        "Email",
        "Submitted (Eastern time)",
        ...PREDICTION_QUESTIONS.map((q) => `Prediction: ${q.short}`),
      ],
      ...visible.map((r) => [
        r.name,
        r.attending ? "Attending" : "Declined",
        r.attending ? r.familymembers : 0,
        r.phone,
        r.email,
        formatSubmitted(r.createdat),
        ...PREDICTION_QUESTIONS.map((q) => describeAnswer(r.predictions, q)),
      ]),
    ]);
  }

  if (isLoading) {
    return (
      <div className="snowy flex min-h-screen items-center justify-center">
        <div className="text-xl text-ink">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="snowy flex min-h-screen items-center justify-center px-4">
        <div className="sticker w-full max-w-md p-8">
          <h1 className="mb-6 text-center font-display text-3xl font-bold text-ink">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className={LABEL}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={FIELD}
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-center text-sm text-red-700">
                {error}
              </p>
            )}
            <button type="submit" className="btn-chunky w-full bg-blush">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "All", count: rsvps.length },
    { value: "attending", label: "Attending", count: attendingRsvps.length },
    { value: "declined", label: "Declined", count: declinedCount },
  ];

  return (
    <div className="snowy min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Guest list</h1>
            <p className="text-ink/70">Athena&apos;s First Birthday RSVPs</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/invite" target="_blank" rel="noopener" className="btn-chunky bg-ice py-2">
              Printable invite
            </a>
            {/* Guests only see the results from party day; this previews them. */}
            <a
              href="/?preview=party-day#predictions"
              target="_blank"
              rel="noopener"
              className="btn-chunky bg-periwinkle/60 py-2"
            >
              Prediction results
            </a>
            <button
              onClick={fetchRSVPs}
              disabled={dataLoading}
              className="btn-chunky bg-white py-2"
            >
              {dataLoading ? "Refreshing..." : "Refresh"}
            </button>
            <button onClick={handleLogout} className="btn-chunky bg-white py-2">
              Logout
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile label="Guests coming" value={headcount(rsvps)} tint="bg-glacier/40" />
          <StatTile label="Families coming" value={attendingRsvps.length} tint="bg-ice/60" />
          <StatTile label="Declined" value={declinedCount} tint="bg-blush/35" />
          <StatTile label="Total replies" value={rsvps.length} tint="bg-white" />
        </div>

        {loadError ? (
          <div className="sticker p-8 text-center">
            <p className="mb-4 text-red-800">{loadError}</p>
            <button onClick={fetchRSVPs} className="btn-chunky bg-white py-2">
              Try again
            </button>
          </div>
        ) : dataLoading && rsvps.length === 0 ? (
          <div className="text-center text-ink">Loading RSVPs...</div>
        ) : rsvps.length === 0 ? (
          <div className="sticker p-8 text-center">
            <p className="text-ink/70">No RSVPs yet.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <label htmlFor="search" className="sr-only">
                  Search by name, phone or email
                </label>
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <input
                  id="search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone or email"
                  className={`${FIELD} pl-10`}
                />
              </div>

              <div role="group" aria-label="Filter by response" className="flex gap-2">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFilter(f.value)}
                    aria-pressed={filter === f.value}
                    className={`rounded-full border-[2.5px] px-4 py-2 text-sm font-bold transition-colors ${
                      filter === f.value
                        ? "border-ink bg-ink text-snow"
                        : "border-ink/25 bg-white text-ink hover:border-ink"
                    }`}
                  >
                    {f.label} <span className="tabular-nums opacity-70">{f.count}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={visible.length === 0}
                className="btn-chunky bg-ice py-2"
              >
                Export CSV ({visible.length})
              </button>
            </div>

            <div className="sticker overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ice/50">
                    <tr>
                      {["Name", "Response", "Family", "Phone", "Email", "Submitted"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-sm font-bold text-ink">
                          {h}
                        </th>
                      ))}
                      <th className="px-5 py-3 text-right">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-ink/70">
                          No RSVPs match your search.{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setSearch("");
                              setFilter("all");
                            }}
                            className="font-semibold text-ink underline decoration-2 underline-offset-2"
                          >
                            Clear filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      visible.map((rsvp) => (
                        <tr key={rsvp.id} className="hover:bg-ice/20">
                          <td className="px-5 py-4 text-sm font-semibold text-ink">
                            {rsvp.name}
                            {hasPredictions(rsvp.predictions) && (
                              <span title={predictionSummary(rsvp.predictions)} className="ml-1.5 cursor-help">
                                <span aria-hidden="true">🔮</span>
                                <span className="sr-only"> (made predictions)</span>
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                rsvp.attending
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {rsvp.attending ? "Attending" : "Declined"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm tabular-nums text-ink">
                            {rsvp.attending ? rsvp.familymembers : "—"}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-ink">
                            <a href={telHref(rsvp.phone)} className="hover:underline">
                              {rsvp.phone}
                            </a>
                          </td>
                          <td className="px-5 py-4 text-sm text-ink">
                            <a href={`mailto:${rsvp.email}`} className="hover:underline">
                              {rsvp.email}
                            </a>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-ink/80">
                            {formatSubmitted(rsvp.createdat)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setPendingEdit(rsvp)}
                              aria-label={`Edit RSVP for ${rsvp.name}`}
                              title={`Edit RSVP for ${rsvp.name}`}
                              className={`${ICON_BUTTON} hover:bg-ice hover:text-ink focus-visible:outline-sky`}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 20h4L18.768 9.232a2.5 2.5 0 00-3.536-3.536L4.5 16.5 4 20z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError("");
                                setPendingDelete(rsvp);
                              }}
                              aria-label={`Remove RSVP for ${rsvp.name}`}
                              title={`Remove RSVP for ${rsvp.name}`}
                              className={`${ICON_BUTTON} hover:bg-red-100 hover:text-red-600 focus-visible:outline-red-500`}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t-2 border-ink/10 bg-lilac px-5 py-3 text-sm text-ink">
                Showing {visible.length} of {rsvps.length} RSVP{rsvps.length !== 1 ? "s" : ""}
                {visible.length !== rsvps.length && <> · {headcount(visible)} guests in this view</>}
                {" "}· {predictionCount} made predictions
              </div>
            </div>
          </>
        )}
      </div>

      {pendingEdit && (
        <EditDialog
          rsvp={pendingEdit}
          onCancel={() => setPendingEdit(null)}
          onSaved={handleSaved}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {pendingDelete && (
        <DeleteConfirmDialog
          rsvp={pendingDelete}
          deleting={deleting}
          error={deleteError}
          onCancel={closeDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
