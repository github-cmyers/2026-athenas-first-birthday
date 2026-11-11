"use client";

import { useState } from "react";
import { MAX_FAMILY_MEMBERS } from "@/lib/event";
import { BG, PARTY_COLORS } from "./decor";
import RSVPClosed from "./RSVPClosed";
import PredictionPrompt from "./PredictionPrompt";
import { getMessages, type Lang, type Messages } from "@/lib/i18n";

// Shared look for the text inputs and the select: a soft outline at rest that
// firms up to full ink with a sky glow when focused.
const FIELD_CLASSES =
  "peer w-full rounded-2xl border-[2.5px] border-ink/25 bg-white px-4 py-4 pt-6 text-ink transition-all focus:border-ink focus:outline-none focus:ring-4 focus:ring-sky/40 disabled:opacity-50";

// Floating label input component
function FloatingInput({
  id,
  name,
  type,
  label,
  value,
  onChange,
  disabled,
  required,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  required?: boolean;
}) {
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder=" "
        className={FIELD_CLASSES}
      />
      {/* At rest the label is centred against the input's full height rather
          than pinned near the top; the input is taller than its text because
          `pt-6` reserves room for the label to float up into on focus. */}
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 transition-all duration-200 ${
          hasValue
            ? "top-2 translate-y-0 text-xs font-semibold text-ink/70"
            : "top-1/2 -translate-y-1/2 text-base text-ink/50"
        } peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-ink/70`}
      >
        {label}
      </label>
    </div>
  );
}

// Floating label select component
function FloatingSelect({
  id,
  name,
  label,
  value,
  onChange,
  disabled,
  options,
  describedBy,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
  options: { value: string; label: string }[];
  describedBy?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-describedby={describedBy}
        className={`${FIELD_CLASSES} cursor-pointer appearance-none`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-xs font-semibold text-ink/70"
      >
        {label}
      </label>
      {/* Dropdown arrow */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <svg className="h-5 w-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

// Accept / decline choice, rendered as a real radio group so it is reachable
// with the keyboard and announced correctly by screen readers.
function AttendanceChoice({
  t,
  attending,
  onChange,
  disabled,
}: {
  t: Messages["rsvpForm"];
  attending: boolean;
  onChange: (value: boolean) => void;
  disabled: boolean;
}) {
  // Each option carries its own selected colour as a complete class string -
  // Tailwind only emits utilities it can see written out literally, so these
  // cannot be built by interpolating a colour name. Accept stays green.
  const options = [
    {
      value: true,
      icon: "🎉",
      label: t.accept,
      highlight: "peer-checked:bg-green-200",
    },
    {
      value: false,
      icon: "💌",
      label: t.decline,
      highlight: "peer-checked:bg-blush/45",
    },
  ];

  // The fieldset carries no margin utility on purpose: the parent form's
  // `space-y-5` is defined inside `:where(...)`, which has zero specificity, so
  // even `m-0` would beat it and collapse the gap below this group.
  return (
    <fieldset disabled={disabled} className="border-0 p-0">
      <legend className="mb-3 px-1 font-display text-lg font-semibold text-ink">
        {t.question}
      </legend>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <label key={String(option.value)} className="relative cursor-pointer">
            <input
              type="radio"
              name="attending"
              value={String(option.value)}
              checked={attending === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <div
              className={`rounded-2xl border-[2.5px] border-ink/25 px-3 py-4 text-center transition-all peer-checked:border-ink peer-checked:shadow-[3px_3px_0_0_var(--color-ink)] peer-focus-visible:ring-4 peer-focus-visible:ring-sky/50 peer-disabled:opacity-50 ${option.highlight}`}
            >
              <div className="mb-1 text-2xl">{option.icon}</div>
              <div className="font-display text-base font-semibold text-ink">
                {option.label}
              </div>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Positions for the confetti that rains down on an acceptance.
const CONFETTI_PIECES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 41 + 5) % 100,
  delay: (i % 8) * 0.12,
  duration: 2.2 + (i % 5) * 0.25,
  color: BG[PARTY_COLORS[i % PARTY_COLORS.length]],
  shape: i % 2 === 0 ? "h-2 w-3.5 rounded-sm" : "h-2.5 w-2.5 rounded-full",
}));

// Animated success component. `children` appear last, under the guest's name.
function SuccessMessage({
  t,
  name,
  attending,
  children,
}: {
  t: Messages["success"];
  name: string;
  attending: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="success-container sticker relative overflow-hidden p-8 text-center">
      {/* Confetti shower in the winter palette - celebratory only for
          acceptances */}
      {attending && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {CONFETTI_PIECES.map((piece, i) => (
            <span
              key={i}
              className={`confetti-piece absolute top-0 ${piece.color} ${piece.shape}`}
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main content with staggered animations */}
      <div className="relative z-10">
        <div className="icon-pop mb-4 text-6xl">{attending ? "☃️" : "💌"}</div>
        <h3 className="title-slide mb-3 font-display text-4xl font-bold text-ink">
          {t.title}
        </h3>
        <p className="message-fade text-lg text-ink/80">
          {attending
            ? t.accepted
            : t.declined}
        </p>
        <p className="name-pop mt-1 font-display text-2xl font-semibold text-ink">
          {name}! {attending ? "🎉" : "💗"}
        </p>
        {children && <div className="extra-fade mt-6">{children}</div>}
      </div>

      <style>{`
        .success-container {
          animation: container-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes container-pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .icon-pop {
          animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
        }

        @keyframes icon-bounce {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .title-slide {
          animation: title-in 0.5s ease-out 0.4s both;
        }

        @keyframes title-in {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .message-fade {
          animation: fade-up 0.5s ease-out 0.6s both;
        }

        .name-pop {
          animation: name-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s both;
        }

        .extra-fade {
          animation: fade-up 0.4s ease-out 1.1s both;
        }

        @keyframes fade-up {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes name-bounce {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        .confetti-piece {
          opacity: 0;
          animation-name: confetti-fall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }

        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(420px) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function RSVPForm({ lang }: { lang: Lang }) {
  const t = getMessages(lang).rsvpForm;
  const [formData, setFormData] = useState({
    name: "",
    familyMembers: "1",
    phone: "",
    email: "",
  });
  const [attending, setAttending] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  // The key for adding predictions to this RSVP, from the server's reply.
  const [predictionToken, setPredictionToken] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          familyMembers: attending ? Number(formData.familyMembers) : 0,
          // Not asked of guests who decline - drop anything typed before
          // they switched to declining.
          phone: attending ? formData.phone : "",
          email: attending ? formData.email : "",
          attending,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // The deadline passed while this page was open.
        if (data.closed) {
          setClosed(true);
          return;
        }
        // The server's validation messages are written for guests, but in
        // English only; French guests get a general French prompt instead.
        setError(
          response.status === 400
            ? lang === "en" && data.error
              ? data.error
              : t.checkDetails
            : t.genericError
        );
        return;
      }

      setPredictionToken(typeof data.predictionToken === "string" ? data.predictionToken : null);
      setSubmitted(true);

      // Notify other components that an RSVP was submitted
      window.dispatchEvent(new CustomEvent("rsvp-submitted"));
    } catch {
      setError(t.genericError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (submitted) {
    return (
      <SuccessMessage t={getMessages(lang).success} name={formData.name} attending={attending}>
        {predictionToken && <PredictionPrompt lang={lang} token={predictionToken} />}
      </SuccessMessage>
    );
  }

  if (closed) {
    return <RSVPClosed lang={lang} />;
  }

  return (
    <form onSubmit={handleSubmit} className="sticker space-y-5 p-6 md:p-8">
      {error && (
        <div className="rounded-2xl border-[2.5px] border-red-700 bg-red-100 p-4 text-center font-semibold text-red-800">
          {error}
        </div>
      )}

      <FloatingInput
        id="name"
        name="name"
        type="text"
        label={t.name}
        value={formData.name}
        onChange={handleChange}
        disabled={loading}
        required
      />

      <AttendanceChoice
        t={t}
        attending={attending}
        onChange={setAttending}
        disabled={loading}
      />

      {/* Only meaningful for acceptances - someone who declines brings no one.
          The count includes the guest themselves, so the smallest answer is 1
          and nobody has to work out whether to count themselves. */}
      {attending && (
        <div>
          <FloatingSelect
            id="familyMembers"
            name="familyMembers"
            label={t.familyMembers}
            value={formData.familyMembers}
            onChange={handleChange}
            disabled={loading}
            describedBy="familyMembers-hint"
            options={Array.from({ length: MAX_FAMILY_MEMBERS }, (_, i) => {
              const num = i + 1;
              return {
                value: String(num),
                label: num === 1 ? t.justMe : String(num),
              };
            })}
          />
          <p id="familyMembers-hint" className="mt-1.5 px-1 text-sm text-ink/60">
            {t.includeYourself}
          </p>
        </div>
      )}

      {/* Contact details only matter for guests who are coming; someone
          declining just gives their name. */}
      {attending && (
        <>
          <FloatingInput
            id="phone"
            name="phone"
            type="tel"
            label={t.phone}
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <FloatingInput
            id="email"
            name="email"
            type="email"
            label={t.email}
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-chunky w-full bg-blush py-4 text-xl"
      >
        {loading
          ? t.submitting
          : attending
            ? t.submitAccept
            : t.submitDecline}
      </button>
    </form>
  );
}
