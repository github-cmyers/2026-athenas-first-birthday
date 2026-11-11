"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PREDICTION_ACCENTS } from "./decor";
import { getMessages, type Lang } from "@/lib/i18n";
import { countPicks, PREDICTION_QUESTIONS, type PredictionAnswers } from "@/lib/predictions";

// Long enough for the RSVP thank-you to play before the questions pop up.
const OPEN_DELAY_MS = 1600;

type Status = "idle" | "saving" | "saved";

// "Predictions for Athena", offered once an RSVP has gone through: a modal of
// four questions, each answered by picking as many options as you like.
// Opens by itself shortly after the reply; closing it leaves a button in the
// thank-you card to come back, with any picks still there.
//
// A native <dialog> opened with showModal() sits in the browser's top layer,
// so the page's animated sections (whose transforms would break an ordinary
// fixed overlay) can't affect it, and it brings Escape-to-close and keeps
// focus inside on its own.
export default function PredictionPrompt({ lang, token }: { lang: Lang; token: string }) {
  const t = getMessages(lang).predictions;
  const titleId = useId();
  const hintId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<PredictionAnswers>({});
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Mirrors `open` onto the dialog. Focus goes to the title, so screen readers
  // announce what popped up, and comes back to the thank-you card on close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      headingRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      returnRef.current?.focus();
    }
    // The page behind stays put while the dialog is up.
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (status === "saved") doneRef.current?.focus();
  }, [status]);

  const saving = status === "saving";

  function close() {
    if (!saving) setOpen(false);
  }

  function toggle(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      return {
        ...prev,
        [questionId]: current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      };
    });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (countPicks(answers) === 0) {
      setError(t.pickOne);
      return;
    }

    setStatus("saving");
    setError(null);
    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus("saved");
    } catch {
      setError(t.error);
      setStatus("idle");
    }
  }

  return (
    <>
      <div ref={returnRef} tabIndex={-1} className="outline-none">
        {status === "saved" ? (
          <p className="rounded-2xl bg-periwinkle/25 px-4 py-3 font-semibold text-ink">{t.saved}</p>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="btn-chunky bg-periwinkle/60">
            {t.open}
          </button>
        )}
      </div>

      {/* The dialog fills the screen and scrolls as a whole, so the card
          inside never has to clip - which would cut off the snow on its top
          edge. Clicking outside the card does nothing, so picks aren't lost to
          a stray tap; Escape, the × and "Maybe later" all close it. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClose={() => setOpen(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-transparent p-0 text-ink backdrop:bg-ink/55"
      >
        <div className="flex min-h-full items-center justify-center px-3 py-12 sm:px-4">
          <div className="sticker w-full max-w-xl p-5 text-left sm:p-8">
            {status === "saved" ? (
              <div className="py-4 text-center">
                <div aria-hidden="true" className="mb-3 text-6xl">
                  🔮
                </div>
                <h2 id={titleId} className="font-display text-3xl font-bold text-ink">
                  {t.savedTitle}
                </h2>
                <p className="mt-2 text-lg text-ink/80">{t.savedText}</p>
                <button ref={doneRef} type="button" onClick={close} className="btn-chunky mt-6 bg-blush">
                  {t.done}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <button
                  type="button"
                  onClick={close}
                  disabled={saving}
                  aria-label={t.close}
                  className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <span className="chip bg-periwinkle">{t.chip}</span>
                <h2
                  ref={headingRef}
                  id={titleId}
                  tabIndex={-1}
                  className="mt-3 pr-8 font-display text-3xl font-bold text-ink outline-none"
                >
                  {t.title}
                </h2>
                <p className="mt-2 text-ink/80">{t.intro}</p>
                <p id={hintId} className="mt-2 text-sm font-semibold text-ink/60">
                  {t.pickAny}
                </p>

                <div className="mt-6 space-y-6">
                  {PREDICTION_QUESTIONS.map((question, i) => {
                    const accent = PREDICTION_ACCENTS[i % PREDICTION_ACCENTS.length];
                    const picked = answers[question.id] ?? [];
                    return (
                      <fieldset key={question.id} disabled={saving} aria-describedby={hintId} className="border-0 p-0">
                        <legend className="mb-3 flex items-center gap-2.5 font-display text-lg font-semibold leading-snug text-ink">
                          <span
                            aria-hidden="true"
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink text-sm ${accent.badge}`}
                          >
                            {i + 1}
                          </span>
                          {question[lang]}
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option) => {
                            const checked = picked.includes(option.id);
                            return (
                              <label key={option.id} className="relative cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggle(question.id, option.id)}
                                  className="peer sr-only"
                                />
                                <span
                                  className={`flex items-center gap-2 rounded-full border-[2.5px] py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-ink transition-all peer-focus-visible:ring-4 peer-focus-visible:ring-sky/50 peer-disabled:opacity-60 ${
                                    checked
                                      ? `border-ink shadow-[2px_2px_0_0_var(--color-ink)] ${accent.picked}`
                                      : "border-ink/25 bg-white hover:border-ink/60"
                                  }`}
                                >
                                  {/* The bullet: an empty ring, filled with a
                                      tick once picked */}
                                  <span
                                    aria-hidden="true"
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                      checked ? "border-ink bg-ink text-white" : "border-ink/35 bg-white"
                                    }`}
                                  >
                                    {checked && (
                                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </span>
                                  <span aria-hidden="true">{option.icon}</span>
                                  {option[lang]}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    );
                  })}
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mt-6 rounded-2xl border-[2.5px] border-red-700 bg-red-100 p-3 text-center font-semibold text-red-800"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={close}
                    disabled={saving}
                    className="rounded-xl px-4 py-2 font-display font-semibold text-ink/70 transition-colors hover:bg-ink/10 hover:text-ink disabled:opacity-50"
                  >
                    {t.skip}
                  </button>
                  <button type="submit" disabled={saving} className="btn-chunky bg-blush text-lg">
                    {saving ? t.saving : t.submit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
