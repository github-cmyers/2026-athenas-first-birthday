import { HOST, telHref } from "@/lib/event";
import { SectionHeading } from "./decor";

export default function AboutTheParty() {
  return (
    <section className="mx-auto mb-20 max-w-3xl px-4">
      <SectionHeading eyebrow="Hooray!" title="Athena is turning one!" chip="mint" squiggle="grape" />

      <div className="sticker space-y-4 p-6 text-lg leading-relaxed text-ink/85 md:p-10">
        <p>
          It&apos;s hard to believe a whole year has passed since we welcomed
          Athena into the world. Many of you celebrated with us at her naming
          ceremony, and we would love for you to join us again as we mark her
          very first birthday.
        </p>
        <p>
          Come share cake, laughter, and plenty of smiles as we celebrate our
          little girl and all of the family and friends who have loved and
          supported her through her first year.
        </p>
        <p className="font-semibold text-ink">
          🎁 Please do not feel obligated to bring a gift — your presence and
          love are the most cherished gifts as we celebrate Athena&apos;s first
          year.
        </p>
      </div>

      {/* The guest note is pinned to the card like a sticky note so it can't
          be skimmed past - it is the one thing every guest needs to read. */}
      <div className="relative mx-auto -mt-3 max-w-md rotate-[1.5deg] rounded-md border-[3px] border-ink bg-sunny p-5 pt-6 text-ink shadow-[5px_5px_0_0_var(--color-ink)] md:-mt-5 md:ml-auto md:mr-6">
        <span
          aria-hidden="true"
          className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 border border-ink/20 bg-white/70"
        />
        <h3 className="font-display text-xl font-semibold">📣 A note about guests</h3>
        <p className="mt-2 leading-relaxed">
          When you RSVP, please count only the members of your immediate family
          who will be attending. If you would like to bring anyone outside your
          immediate family, please reach out to {HOST.firstName} (
          <a
            href={telHref(HOST.phone)}
            className="font-semibold underline decoration-2 underline-offset-2"
          >
            {HOST.phone}
          </a>
          ) beforehand.
        </p>
      </div>
    </section>
  );
}
