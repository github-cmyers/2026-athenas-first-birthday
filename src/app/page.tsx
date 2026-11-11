import { Suspense } from "react";
import { connection } from "next/server";
import Hero from "./components/Hero";
import GuestCount from "./components/GuestCount";
import AboutTheParty from "./components/AboutTheParty";
import ThankYou from "./components/ThankYou";
import PartySchedule from "./components/PartySchedule";
import CountdownTimer from "./components/CountdownTimer";
import PartyDetails from "./components/PartyDetails";
import PartyForecast from "./components/PartyForecast";
import PredictionResults from "./components/PredictionResults";
import AboutTheName from "./components/AboutTheName";
import ImageGallery from "./components/ImageGallery";
import RSVPForm from "./components/RSVPForm";
import RSVPClosed from "./components/RSVPClosed";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import AnimatedSection from "./components/AnimatedSection";
import Promo from "./components/Promo";
import { SectionHeading, SnowDrift, Snowfall } from "./components/decor";
import { HOST, isPartyPhase, isRsvpOpen, partyDate, partyPhase, VENUE } from "@/lib/event";
import { getMessages } from "@/lib/i18n";
import { firstParam, hrefWithLang, resolveLang, type SearchParams } from "@/lib/lang";

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  // Render per request rather than once at build time; otherwise whether the
  // RSVP form is open, and which phase the page is in, would be frozen at the
  // moment the site was built.
  await connection();

  const params = await searchParams;
  const lang = await resolveLang(firstParam(params.lang));
  const t = getMessages(lang);
  const now = new Date();

  // ?preview=party-day or ?preview=after shows how the page will look on and
  // after the day. It only changes what is displayed: RSVPs still open and
  // close by the real clock, here and in the API.
  const preview = firstParam(params.preview);
  const phase = isPartyPhase(preview) ? preview : partyPhase(now);
  const rsvpOpen = isRsvpOpen(now);
  const toggleHref = hrefWithLang("/", params, lang === "en" ? "fr" : "en");

  const schedule = phase === "party-day" && (
    <AnimatedSection animation="fade-up" delay={0}>
      <PartySchedule lang={lang} startIso={partyDate.toISOString()} nowIso={now.toISOString()} />
    </AnimatedSection>
  );

  return (
    // overflow-x-clip keeps the tilted cards and offset shadows from ever
    // causing a sideways scroll on narrow phones. `lang` here (rather than on
    // <html>, which the layout renders) tells browsers and screen readers
    // which language the page is in.
    <div lang={lang} className="snowy min-h-screen overflow-x-clip">
      <Hero lang={lang} phase={phase} toggleHref={toggleHref} />

      {/* On the day, the plan comes first */}
      {schedule}

      <AnimatedSection animation="fade-up" delay={0}>
        {phase === "after" ? <ThankYou lang={lang} /> : <AboutTheParty lang={lang} />}
      </AnimatedSection>

      {phase !== "after" && (
        <>
          {/* Countdown on a snowy night band to break up the run of cards.
              It settles into a drift of snow along the bottom that runs into
              the page background. */}
          <AnimatedSection animation="zoom" delay={0}>
            <section className="mb-20">
              <SnowDrift className="text-ink" />
              <div className="relative overflow-hidden bg-ink">
                <Snowfall count={22} tone="dark" />
                <div className="relative px-4 py-12 md:py-16">
                  <SectionHeading eyebrow={t.countdown.eyebrow} title={t.countdown.title} chip="ice" squiggle="ice" light />
                  <CountdownTimer lang={lang} targetDate={partyDate} />
                </div>
                <SnowDrift className="relative text-snow" />
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={0}>
            <PartyDetails
              lang={lang}
              address={VENUE.address}
              startDate={partyDate}
              forecast={
                // Streams in separately so a slow weather service never holds
                // up the page.
                <Suspense fallback={null}>
                  <PartyForecast lang={lang} />
                </Suspense>
              }
            />
          </AnimatedSection>
        </>
      )}

      {/* Everyone's predictions for Athena are revealed on the day. Streams
          in separately, like the forecast, and is simply left out if there
          are none yet. */}
      {phase !== "upcoming" && (
        <Suspense fallback={null}>
          <PredictionResults lang={lang} />
        </Suspense>
      )}

      <AnimatedSection animation="fade-up" delay={0}>
        <AboutTheName lang={lang} />
      </AnimatedSection>

      <AnimatedSection animation="zoom" delay={0}>
        <section id="gallery" className="mx-auto mb-20 max-w-4xl scroll-mt-6 px-4">
          <SectionHeading eyebrow={t.gallery.eyebrow} title={t.gallery.title} chip="blush" squiggle="sky" />
          <ImageGallery lang={lang} />
        </section>
      </AnimatedSection>

      {/* RSVP on an icy band with falling snow so it is the most
          eye-catching thing below the fold. Gone once the party is over. */}
      {phase !== "after" && (
        <section id="rsvp" className="mb-16 scroll-mt-2">
          <SnowDrift className="text-ice" />
          <div className="relative overflow-hidden bg-ice text-ink">
            <Snowfall count={18} tone="dark" />
            <div className="relative px-4 py-12 md:py-16">
              <AnimatedSection animation="fade-up" delay={0}>
                <SectionHeading eyebrow={t.rsvpSection.eyebrow} title={t.rsvpSection.title} chip="white" squiggle="berry" />
                <GuestCount lang={lang} />
                <div className="mx-auto max-w-md">
                  {rsvpOpen ? <RSVPForm lang={lang} /> : <RSVPClosed lang={lang} />}
                </div>
              </AnimatedSection>
            </div>
            <SnowDrift className="relative text-snow" />
          </div>
        </section>
      )}

      <AnimatedSection animation="fade-up" delay={0}>
        <ContactSection lang={lang} name={HOST.fullName} phone={HOST.phone} />
      </AnimatedSection>

      <AnimatedSection animation="fade-up" delay={0}>
        <Promo lang={lang} name="Rama Myers" phone="802-825-0788" />
      </AnimatedSection>

      <Footer lang={lang} phase={phase} />
    </div>
  );
}
