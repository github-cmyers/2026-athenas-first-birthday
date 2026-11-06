import Hero from "./components/Hero";
import GuestCount from "./components/GuestCount";
import AboutTheParty from "./components/AboutTheParty";
import CountdownTimer from "./components/CountdownTimer";
import PartyDetails from "./components/PartyDetails";
import AboutTheName from "./components/AboutTheName";
import ImageGallery from "./components/ImageGallery";
import RSVPForm from "./components/RSVPForm";
import RSVPClosed from "./components/RSVPClosed";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import AnimatedSection from "./components/AnimatedSection";
import Promo from "./components/Promo";
import { SectionHeading, Wave } from "./components/decor";
import { HOST, partyDate, RSVP_OPEN } from "@/lib/event";

export default function Home() {
  return (
    // overflow-x-clip keeps the tilted cards and offset shadows from ever
    // causing a sideways scroll on narrow phones.
    <div className="sprinkles min-h-screen overflow-x-clip">
      <Hero />

      <AnimatedSection animation="fade-up" delay={0}>
        <AboutTheParty />
      </AnimatedSection>

      {/* Countdown on a dark band to break up the run of cards */}
      <AnimatedSection animation="zoom" delay={0}>
        <section className="mb-20 text-ink">
          <Wave />
          <div className="bg-ink px-4 py-12 md:py-16">
            <SectionHeading eyebrow="Get ready" title="The party starts in" chip="sunny" squiggle="sunny" light />
            <CountdownTimer targetDate={partyDate} />
          </div>
          <Wave flip />
        </section>
      </AnimatedSection>

      <AnimatedSection animation="fade-up" delay={0}>
        {/* TODO: confirm the party venue - this is still the naming ceremony's. */}
        <PartyDetails
          address="Jacky's Galaxie and Sushi Bar, 1488 Mineral Spring Ave, North Providence, RI 02904"
          startDate={partyDate}
        />
      </AnimatedSection>

      <AnimatedSection animation="fade-up" delay={0}>
        <AboutTheName
          name="Athena"
          origin="Greek"
          meaning="Athena is the ancient Greek goddess of wisdom, courage, inspiration, civilization, law and justice, strategic warfare, mathematics, strength, strategy, the arts, crafts, and skill."
          reason="We hope our daughter will grow to embody the qualities of her namesake — wisdom, strength, and creativity. Athena represents the perfect balance of intelligence and courage, and we believe this name will inspire her to be a thoughtful leader and a fierce protector of those she loves."
        />
      </AnimatedSection>

      <AnimatedSection animation="zoom" delay={0}>
        <section className="mx-auto mb-20 max-w-4xl px-4">
          <SectionHeading eyebrow="Snapshots" title="Sweet moments" chip="bubblegum" squiggle="sky" />
          <ImageGallery />
        </section>
      </AnimatedSection>

      {/* RSVP on a sunny band so it is the most eye-catching thing below
          the fold */}
      <section id="rsvp" className="mb-16 scroll-mt-2 text-sunny">
        <Wave />
        <div className="bg-sunny px-4 py-12 text-ink md:py-16">
          <AnimatedSection animation="fade-up" delay={0}>
            <SectionHeading eyebrow="Save your spot" title="RSVP" chip="white" squiggle="coral" />
            <GuestCount />
            <div className="mx-auto max-w-md">
              {RSVP_OPEN ? <RSVPForm /> : <RSVPClosed />}
            </div>
          </AnimatedSection>
        </div>
        <Wave flip />
      </section>

      <AnimatedSection animation="fade-up" delay={0}>
        <ContactSection
          name={HOST.fullName}
          phone={HOST.phone}
        />
      </AnimatedSection>

      <AnimatedSection animation="fade-up" delay={0}>
        <Promo
          name="Rama Myers"
          phone="802-825-0788"
        />
      </AnimatedSection>

      <Footer />
    </div>
  );
}
