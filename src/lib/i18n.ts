// Every guest-facing string on the site, in English and French.
//
// Client and server components both import this; it has no server-only
// dependencies. Components take a `lang` prop and call getMessages(lang).
//
// The "Look whooo's turning ONE!" header deliberately stays in English in
// both languages - it is a design element, and the pun doesn't translate.

export type Lang = "en" | "fr";

export const LANG_COOKIE = "lang";

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "fr";
}

const en = {
  langToggle: {
    // The toggle offers the *other* language, in that language.
    label: "Français",
    ariaLabel: "Voir cette page en français",
  },
  hero: {
    chip: {
      upcoming: "You're invited! ❄️",
      "party-day": "Today's the day! 🎉",
      after: "Thank you! 💙",
    },
    title: "Athena's First Birthday",
    subtitle: {
      upcoming: "Join us for a Winter ONEderland celebration as our baby girl turns one!",
      "party-day": "Today our baby girl turns one — we can't wait to celebrate with you!",
      after: "Thank you for helping us celebrate our baby girl's first birthday!",
    },
    today: "Today",
    rsvp: "RSVP now 💌",
    details: "Party details",
    schedule: "Today's schedule",
    photos: "See the photos",
  },
  about: {
    eyebrow: "Hooray!",
    title: "Athena is turning one!",
    p1: "It's hard to believe a whole year has passed since we welcomed Athena into the world. Many of you celebrated with us at her naming ceremony, and we would love for you to join us again as we mark her very first birthday.",
    p2: "Come share cake, laughter, and plenty of smiles as we celebrate our little girl and all of the family and friends who have loved and supported her through her first year.",
    gift: "🎁 Please do not feel obligated to bring a gift — your presence and love are the most cherished gifts as we celebrate Athena's first year.",
  },
  thankYou: {
    eyebrow: "Thank you",
    title: "What a celebration!",
    p1: "Athena's first birthday was so special because you were part of it. Thank you for the love, the laughter and the warm wishes you brought with you.",
    p2: "We'll treasure these memories, and we hope you will too.",
    signoff: "With love, Athena's family",
  },
  countdown: {
    eyebrow: "Get ready",
    title: "The party starts in",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    started: "The party has begun! 🎉",
  },
  schedule: {
    eyebrow: "Today",
    title: "Party schedule",
    now: "Happening now",
  },
  details: {
    eyebrow: "The details",
    title: "Where & when",
    date: "Date",
    time: "Time",
    location: "Location",
    mapTitle: "Venue location",
    calendarTitle: "Athena's First Birthday Party",
    calendarDescription: "Join us as we celebrate our baby girl Athena turning one!",
  },
  calendar: {
    button: "Add to Calendar",
    google: "Google Calendar",
    outlook: "Outlook",
    ics: "Download .ics file",
    icsHint: "Apple / Other",
  },
  forecast: {
    label: "Party-day forecast",
    temp: (fahrenheit: number) => `${Math.round(fahrenheit)}°F`,
    atStart: (temp: string, time: string) => `${temp} at ${time}`,
    range: (high: string, low: string) => `High ${high} · Low ${low}`,
    chance: (percent: number) => `${percent}% chance of rain or snow`,
    snow: (inches: number) => `About ${Math.max(0.5, Math.round(inches * 2) / 2)}" of snow expected`,
    tipSnow: "Snow is in the forecast — allow a little extra travel time.",
    tipCold: "Bundle up — it'll be a chilly one!",
    source: "Weather data by Open-Meteo.com",
    conditions: {
      clear: "Clear skies",
      partlyCloudy: "Partly cloudy",
      cloudy: "Cloudy",
      fog: "Foggy",
      drizzle: "Drizzle",
      rain: "Rain",
      freezingRain: "Freezing rain",
      snow: "Snow",
      showers: "Rain showers",
      snowShowers: "Snow showers",
      storm: "Thunderstorms",
    },
  },
  name: {
    eyebrow: "Her name",
    title: "Why Athena?",
    origin: "Greek origin",
    owl: "The owl, symbol of Athena, represents wisdom and knowledge",
    meaningLabel: "Meaning",
    meaning:
      "Athena is the ancient Greek goddess of wisdom, courage, inspiration, civilization, law and justice, strategic warfare, mathematics, strength, strategy, the arts, crafts, and skill.",
    reasonLabel: "Why we chose it",
    reason:
      "We hope our daughter will grow to embody the qualities of her namesake — wisdom, strength, and creativity. Athena represents the perfect balance of intelligence and courage, and we believe this name will inspire her to be a thoughtful leader and a fierce protector of those she loves.",
  },
  gallery: {
    eyebrow: "Snapshots",
    title: "Sweet moments",
    photo: (n: number) => `Photo ${n}`,
    open: (alt: string) => `Open ${alt}`,
    previous: "Previous image",
    next: "Next image",
    close: "Close",
  },
  rsvpSection: {
    eyebrow: "Save your spot",
    title: "RSVP",
  },
  guestCount: {
    loading: "Loading...",
    first: "❄️ Be the first to RSVP!",
    coming: (n: number): string => (n === 1 ? "guest coming" : "guests coming"),
    families: (n: number) => `${n} ${n === 1 ? "family has" : "families have"} RSVP'd`,
  },
  rsvpForm: {
    name: "Your Name",
    question: "Will you be joining us?",
    accept: "Joyfully accepts",
    decline: "Regretfully declines",
    familyMembers: "Number of your attending family members",
    justMe: "1 (just me)",
    includeYourself: "Please include yourself in this number.",
    phone: "Phone Number",
    email: "Email Address",
    submitAccept: "RSVP Now! 💌",
    submitDecline: "Send Your Reply 💌",
    submitting: "Submitting...",
    genericError: "Something went wrong. Please try again.",
    checkDetails: "Please check your details and try again.",
  },
  success: {
    title: "Thank You!",
    accepted: "We can't wait to celebrate with you,",
    declined: "We're sorry you can't make it, but thank you for letting us know,",
  },
  predictions: {
    chip: "Crystal ball 🔮",
    title: "Predictions for Athena",
    intro: "One more thing! Help us guess what's ahead for our little owl. We'll reveal everyone's predictions on party day.",
    pickAny: "Pick as many answers as you like.",
    submit: "Seal my predictions 🔮",
    saving: "Saving...",
    skip: "Maybe later",
    close: "Close",
    pickOne: "Pick at least one answer to send your predictions.",
    error: "We couldn't save your predictions. Please try again.",
    savedTitle: "Your predictions are in!",
    savedText: "Check back on party day to see what everyone guessed.",
    done: "Done",
    open: "🔮 Make your predictions for Athena",
    saved: "🔮 Your predictions are in! See everyone's on party day.",
    // The results, shown on and after party day.
    eyebrow: "Crystal ball",
    summary: (n: number) =>
      `${n} ${n === 1 ? "guest" : "guests"} shared ${n === 1 ? "a prediction" : "predictions"}. Here's what everyone thinks!`,
    votes: (n: number) => `${n} ${n === 1 ? "vote" : "votes"}`,
    topPick: "Top pick",
  },
  closed: {
    title: "The RSVP window has closed",
    p1: "Thank you to everyone who sent us their reply - we can't wait to celebrate with you!",
    p2: "If you have any questions, please reach out using the contact details below.",
  },
  contact: {
    chip: "Questions?",
    text: (name: string) => `Feel free to reach out to ${name} if you have any questions:`,
  },
  promo: {
    badge: "Colin's Side Hustle",
    text: "This website was built by Ethan & Athena's Dad. If you're interested in me building you one of your own tailored exactly to your needs at a fair price, feel free to reach out.",
  },
  footer: {
    upcoming: "We can't wait to celebrate with you!",
    after: "Thank you for celebrating with us!",
  },
  invite: {
    pageTitle: "Printable invitation",
    print: "Print / Save as PDF",
    back: "Back to the site",
    tip: "Sized for 5×7 in paper. To make a PDF, choose “Save as PDF” as the printer.",
    scan: "Scan to RSVP",
    orVisit: "or visit",
  },
};

export type Messages = typeof en;

// French typography puts a no-break space before ! ? : ; % ° and » and after
// «, so the punctuation can never wrap onto a line of its own. Applied to
// every French string (and the output of every French message function) so
// the dictionary below can be written with ordinary spaces. Exported for the
// prediction questions, which keep their French next to their English.
export function frenchSpacing(text: string): string {
  return text.replace(/ ([!?:;%»°])/g, " $1").replace(/« /g, "« ");
}

function typesetFrench<T>(value: T): T {
  if (typeof value === "string") return frenchSpacing(value) as T;
  if (typeof value === "function") {
    const fn = value as (...args: never[]) => string;
    return ((...args: never[]) => frenchSpacing(fn(...args))) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, typesetFrench(inner)])
    ) as T;
  }
  return value;
}

const fr: Messages = typesetFrench({
  langToggle: {
    label: "English",
    ariaLabel: "View this page in English",
  },
  hero: {
    chip: {
      upcoming: "Vous êtes invités ! ❄️",
      "party-day": "C'est aujourd'hui ! 🎉",
      after: "Merci ! 💙",
    },
    title: "Le premier anniversaire d'Athena",
    subtitle: {
      upcoming: "Rejoignez-nous pour une fête féerique sous la neige : notre petite fille va avoir un an !",
      "party-day": "Aujourd'hui, notre petite fille a un an — nous avons hâte de fêter ça avec vous !",
      after: "Merci d'avoir fêté avec nous le premier anniversaire de notre petite fille !",
    },
    today: "Aujourd'hui",
    rsvp: "Répondre 💌",
    details: "Infos pratiques",
    schedule: "Programme du jour",
    photos: "Voir les photos",
  },
  about: {
    eyebrow: "Hourra !",
    title: "Athena va avoir un an !",
    p1: "Difficile de croire qu'une année entière s'est écoulée depuis que nous avons accueilli Athena. Beaucoup d'entre vous étaient à nos côtés pour son baptême, et nous serions ravis de vous retrouver pour fêter son tout premier anniversaire.",
    p2: "Venez partager le gâteau, les rires et plein de sourires pour célébrer notre petite fille, ainsi que toute la famille et les amis qui l'ont entourée d'amour tout au long de sa première année.",
    gift: "🎁 Ne vous sentez surtout pas obligés d'apporter un cadeau : votre présence et votre affection sont les plus beaux cadeaux pour célébrer la première année d'Athena.",
  },
  thankYou: {
    eyebrow: "Merci",
    title: "Quelle belle fête !",
    p1: "Le premier anniversaire d'Athena était si spécial parce que vous étiez là. Merci pour l'amour, les rires et les vœux chaleureux que vous nous avez apportés.",
    p2: "Nous garderons précieusement ces souvenirs, et nous espérons que vous aussi.",
    signoff: "Avec tout notre amour, la famille d'Athena",
  },
  countdown: {
    eyebrow: "Préparez-vous",
    title: "La fête commence dans",
    days: "Jours",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
    started: "La fête a commencé ! 🎉",
  },
  schedule: {
    eyebrow: "Aujourd'hui",
    title: "Programme de la fête",
    now: "En ce moment",
  },
  details: {
    eyebrow: "Les détails",
    title: "Où et quand",
    date: "Date",
    time: "Heure",
    location: "Lieu",
    mapTitle: "Emplacement du lieu",
    calendarTitle: "Premier anniversaire d'Athena",
    calendarDescription: "Venez fêter avec nous le premier anniversaire de notre petite Athena !",
  },
  calendar: {
    button: "Ajouter au calendrier",
    google: "Google Agenda",
    outlook: "Outlook",
    ics: "Télécharger le fichier .ics",
    icsHint: "Apple / Autre",
  },
  forecast: {
    label: "Météo du jour J",
    // French readers get Celsius and centimetres.
    temp: (fahrenheit: number) => `${Math.round(((fahrenheit - 32) * 5) / 9)} °C`,
    atStart: (temp: string, time: string) => `${temp} à ${time}`,
    range: (high: string, low: string) => `Max ${high} · Min ${low}`,
    chance: (percent: number) => `${percent} % de risque de pluie ou de neige`,
    snow: (inches: number) => `Environ ${Math.max(1, Math.round(inches * 2.54))} cm de neige attendus`,
    tipSnow: "De la neige est prévue : prévoyez un peu plus de temps pour le trajet.",
    tipCold: "Couvrez-vous bien, il va faire froid !",
    source: "Données météo : Open-Meteo.com",
    conditions: {
      clear: "Ciel dégagé",
      partlyCloudy: "Partiellement nuageux",
      cloudy: "Nuageux",
      fog: "Brouillard",
      drizzle: "Bruine",
      rain: "Pluie",
      freezingRain: "Pluie verglaçante",
      snow: "Neige",
      showers: "Averses",
      snowShowers: "Averses de neige",
      storm: "Orages",
    },
  },
  name: {
    eyebrow: "Son prénom",
    title: "Pourquoi Athena ?",
    origin: "Origine grecque",
    owl: "La chouette, symbole d'Athéna, représente la sagesse et la connaissance",
    meaningLabel: "Signification",
    meaning:
      "Athéna est la déesse grecque de la sagesse, du courage, de l'inspiration, de la civilisation, du droit et de la justice, de la stratégie militaire, des mathématiques, de la force, des arts et de l'artisanat.",
    reasonLabel: "Pourquoi ce prénom",
    reason:
      "Nous espérons que notre fille incarnera les qualités de celle dont elle porte le nom : la sagesse, la force et la créativité. Athéna représente l'équilibre parfait entre l'intelligence et le courage, et nous croyons que ce prénom l'inspirera à devenir une meneuse réfléchie et une protectrice farouche de ceux qu'elle aime.",
  },
  gallery: {
    eyebrow: "Instantanés",
    title: "Doux souvenirs",
    photo: (n: number) => `Photo ${n}`,
    open: (alt: string) => `Ouvrir ${alt}`,
    previous: "Image précédente",
    next: "Image suivante",
    close: "Fermer",
  },
  rsvpSection: {
    eyebrow: "Réservez votre place",
    title: "RSVP",
  },
  guestCount: {
    loading: "Chargement...",
    first: "❄️ Soyez les premiers à répondre !",
    coming: (n: number) => (n === 1 ? "invité confirmé" : "invités confirmés"),
    families: (n: number) => `${n} ${n === 1 ? "famille a répondu" : "familles ont répondu"}`,
  },
  rsvpForm: {
    name: "Votre nom",
    question: "Serez-vous des nôtres ?",
    accept: "Avec plaisir !",
    decline: "À regret, non",
    familyMembers: "Nombre de membres de votre famille présents",
    justMe: "1 (juste moi)",
    includeYourself: "Comptez-vous dans ce nombre.",
    phone: "Numéro de téléphone",
    email: "Adresse e-mail",
    submitAccept: "Je confirme ! 💌",
    submitDecline: "Envoyer ma réponse 💌",
    submitting: "Envoi en cours...",
    genericError: "Une erreur s'est produite. Veuillez réessayer.",
    checkDetails: "Veuillez vérifier vos informations et réessayer.",
  },
  success: {
    title: "Merci !",
    accepted: "Nous avons hâte de fêter ça avec vous,",
    declined: "Nous sommes désolés que vous ne puissiez pas venir, merci de nous avoir prévenus,",
  },
  predictions: {
    chip: "Boule de cristal 🔮",
    title: "Prédictions pour Athena",
    intro: "Encore une chose ! Aidez-nous à deviner ce que l'avenir réserve à notre petite chouette. Nous dévoilerons toutes les prédictions le jour de la fête.",
    pickAny: "Choisissez autant de réponses que vous voulez.",
    submit: "Valider mes prédictions 🔮",
    saving: "Enregistrement...",
    skip: "Plus tard",
    close: "Fermer",
    pickOne: "Choisissez au moins une réponse pour envoyer vos prédictions.",
    error: "Impossible d'enregistrer vos prédictions. Veuillez réessayer.",
    savedTitle: "Vos prédictions sont enregistrées !",
    savedText: "Revenez le jour de la fête pour découvrir les prédictions de tout le monde.",
    done: "Terminé",
    open: "🔮 Faites vos prédictions pour Athena",
    saved: "🔮 Vos prédictions sont enregistrées ! Découvrez celles de tout le monde le jour de la fête.",
    eyebrow: "Boule de cristal",
    summary: (n: number) =>
      `${n} ${n === 1 ? "invité a" : "invités ont"} fait ${n === 1 ? "une prédiction" : "des prédictions"}. Voici ce qu'ils en pensent !`,
    votes: (n: number) => `${n} ${n === 1 ? "vote" : "votes"}`,
    topPick: "Favori",
  },
  closed: {
    title: "Les réponses sont closes",
    p1: "Merci à toutes celles et ceux qui nous ont répondu, nous avons hâte de fêter ça avec vous !",
    p2: "Pour toute question, n'hésitez pas à nous contacter grâce aux coordonnées ci-dessous.",
  },
  contact: {
    chip: "Des questions ?",
    text: (name: string) => `N'hésitez pas à contacter ${name} pour toute question :`,
  },
  promo: {
    badge: "L'activité parallèle de Colin",
    text: "Ce site a été créé par le papa d'Ethan et d'Athena. Si vous aimeriez avoir votre propre site, conçu sur mesure selon vos besoins et à un prix juste, n'hésitez pas à me contacter.",
  },
  footer: {
    upcoming: "Nous avons hâte de fêter ça avec vous !",
    after: "Merci d'avoir fait la fête avec nous !",
  },
  invite: {
    pageTitle: "Invitation à imprimer",
    print: "Imprimer / Enregistrer en PDF",
    back: "Retour au site",
    tip: "Format 5×7 pouces (13×18 cm). Pour un PDF, choisissez « Enregistrer au format PDF » comme imprimante.",
    scan: "Scannez pour répondre",
    orVisit: "ou rendez-vous sur",
  },
});

const MESSAGES: Record<Lang, Messages> = { en, fr };

export function getMessages(lang: Lang): Messages {
  return MESSAGES[lang];
}
