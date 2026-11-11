import { frenchSpacing } from "./i18n";

// "Predictions for Athena": after replying, guests are asked four fun
// questions about her future, picking as many answers as they like for each.
// Everyone's picks are revealed on the page on party day.
//
// Answers are stored by id, not by text, so English and French picks count
// together and a label can be reworded without losing earlier votes. Removing
// an option, or a whole question, simply stops it being counted.
//
// Client and server both import this file; it has no server-only
// dependencies.

export interface PredictionOption {
  id: string;
  icon: string;
  en: string;
  fr: string;
}

export interface PredictionQuestion {
  id: string;
  // Column heading in the admin CSV export.
  short: string;
  en: string;
  fr: string;
  options: PredictionOption[];
}

// Question id -> the option ids picked, in the order the options are listed.
export type PredictionAnswers = Record<string, string[]>;

// French strings are typeset once here, like the rest of the French copy.
function question(q: PredictionQuestion): PredictionQuestion {
  return {
    ...q,
    fr: frenchSpacing(q.fr),
    options: q.options.map((o) => ({ ...o, fr: frenchSpacing(o.fr) })),
  };
}

export const PREDICTION_QUESTIONS: PredictionQuestion[] = [
  question({
    id: "grow-up",
    short: "When she grows up",
    en: "When she grows up, Athena will be…",
    fr: "Quand elle sera grande, Athena sera…",
    options: [
      { id: "doctor", icon: "🩺", en: "A doctor", fr: "Médecin" },
      { id: "teacher", icon: "🍎", en: "A teacher", fr: "Enseignante" },
      { id: "artist", icon: "🎨", en: "An artist", fr: "Artiste" },
      { id: "scientist", icon: "🔬", en: "A scientist", fr: "Scientifique" },
      { id: "astronaut", icon: "🚀", en: "An astronaut", fr: "Astronaute" },
      { id: "athlete", icon: "🏅", en: "An athlete", fr: "Athlète" },
      { id: "musician", icon: "🎵", en: "A musician", fr: "Musicienne" },
      { id: "boss", icon: "👑", en: "The boss of everyone", fr: "La cheffe de tout le monde" },
    ],
  }),
  question({
    id: "favorites",
    short: "Favorite things",
    en: "Her favorite things will be…",
    fr: "Ses passions seront…",
    options: [
      { id: "books", icon: "📚", en: "Books", fr: "Les livres" },
      { id: "music", icon: "💃", en: "Music & dancing", fr: "La musique et la danse" },
      { id: "animals", icon: "🐾", en: "Animals", fr: "Les animaux" },
      { id: "outdoors", icon: "🌳", en: "Playing outside", fr: "Jouer dehors" },
      { id: "art", icon: "🖍️", en: "Arts & crafts", fr: "Le dessin et le bricolage" },
      { id: "snow", icon: "⛄", en: "Snow days", fr: "Les jours de neige" },
      { id: "snacks", icon: "🍪", en: "Snacks!", fr: "Le goûter !" },
    ],
  }),
  question({
    id: "superpower",
    short: "Superpower",
    en: "Her superpower will be…",
    fr: "Son super-pouvoir sera…",
    options: [
      { id: "laughs", icon: "😂", en: "Making everyone laugh", fr: "Faire rire tout le monde" },
      { id: "charm", icon: "😍", en: "Charming everyone she meets", fr: "Charmer tous ceux qu'elle rencontre" },
      { id: "energy", icon: "⚡", en: "Never sitting still", fr: "Ne jamais tenir en place" },
      { id: "naps", icon: "😴", en: "Napping anywhere", fr: "Faire la sieste n'importe où" },
      { id: "her-way", icon: "💪", en: "Always getting her way", fr: "Toujours obtenir ce qu'elle veut" },
      { id: "kindness", icon: "💗", en: "Kindness", fr: "La gentillesse" },
      { id: "wisdom", icon: "🦉", en: "Wisdom, just like her name", fr: "La sagesse, comme son prénom" },
    ],
  }),
  question({
    id: "by-two",
    short: "By her second birthday",
    en: "By her second birthday, she'll…",
    fr: "D'ici ses deux ans, elle va…",
    options: [
      { id: "run", icon: "🏃‍♀️", en: "Run everywhere", fr: "Courir partout" },
      { id: "crib", icon: "🧗‍♀️", en: "Climb out of her crib", fr: "Sortir toute seule de son lit" },
      { id: "sing", icon: "🎤", en: "Sing her favorite song", fr: "Chanter sa chanson préférée" },
      { id: "count", icon: "🔢", en: "Count to three", fr: "Compter jusqu'à trois" },
      { id: "love-you", icon: "💌", en: "Say “I love you”", fr: "Dire « je t'aime »" },
      { id: "snowman", icon: "☃️", en: "Help build a snowman", fr: "Aider à faire un bonhomme de neige" },
    ],
  }),
];

// Keeps only picks of questions and options that exist, de-duplicated and in
// listed order. Anything else - including picks of an option removed since -
// is dropped quietly rather than failing the whole submission.
export function normalizeAnswers(raw: unknown): PredictionAnswers {
  const answers: PredictionAnswers = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return answers;
  const data = raw as Record<string, unknown>;

  for (const q of PREDICTION_QUESTIONS) {
    const picked = data[q.id];
    if (!Array.isArray(picked)) continue;
    const ids = q.options.map((o) => o.id).filter((id) => picked.includes(id));
    if (ids.length > 0) answers[q.id] = ids;
  }
  return answers;
}

export function countPicks(answers: PredictionAnswers): number {
  return Object.values(answers).reduce((sum, ids) => sum + ids.length, 0);
}

// Tokens are UUIDs handed out by POST /api/rsvp.
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SubmissionResult =
  | { ok: true; value: { token: string; answers: PredictionAnswers } }
  | { ok: false; error: string };

export function parsePredictionSubmission(body: unknown): SubmissionResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request" };
  }
  const data = body as Record<string, unknown>;

  if (typeof data.token !== "string" || !TOKEN.test(data.token)) {
    return { ok: false, error: "Invalid request" };
  }

  const answers = normalizeAnswers(data.answers);
  if (countPicks(answers) === 0) {
    return { ok: false, error: "Pick at least one answer" };
  }

  return { ok: true, value: { token: data.token.toLowerCase(), answers } };
}

export interface PredictionTally {
  // How many guests sent predictions. Each option's votes are out of this.
  responses: number;
  questions: {
    question: PredictionQuestion;
    // Most votes first; ties keep the listed order.
    options: { option: PredictionOption; votes: number }[];
    topVotes: number;
  }[];
}

export function tallyPredictions(all: PredictionAnswers[]): PredictionTally {
  return {
    responses: all.length,
    questions: PREDICTION_QUESTIONS.map((question) => {
      const options = question.options
        .map((option) => ({
          option,
          votes: all.filter((answers) => answers[question.id]?.includes(option.id)).length,
        }))
        .sort((a, b) => b.votes - a.votes);
      return { question, options, topVotes: options[0]?.votes ?? 0 };
    }),
  };
}

// e.g. "A doctor; An artist" - for the admin CSV export.
export function describeAnswer(answers: PredictionAnswers | null, question: PredictionQuestion): string {
  const picked = answers?.[question.id] ?? [];
  return question.options
    .filter((o) => picked.includes(o.id))
    .map((o) => o.en)
    .join("; ");
}
