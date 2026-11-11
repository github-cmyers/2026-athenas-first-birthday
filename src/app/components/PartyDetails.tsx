import AddToCalendar from "./AddToCalendar";
import { SectionHeading } from "./decor";
import {
  PARTY_DURATION_HOURS,
  formatEventDate,
  formatEventTime,
} from "@/lib/event";
import { getMessages, type Lang } from "@/lib/i18n";

interface PartyDetailsProps {
  lang: Lang;
  address: string;
  startDate: Date;
  durationHours?: number;
  // The weather tile, passed in so it can load on its own without holding up
  // the rest of the card.
  forecast?: React.ReactNode;
}

function InfoTile({
  icon,
  label,
  tint,
  children,
  className = "",
}: {
  icon: string;
  label: string;
  tint: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-4 rounded-2xl border-[2.5px] border-ink p-4 text-left ${tint} ${className}`}>
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-white text-2xl"
      >
        {icon}
      </span>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-ink/60">{label}</div>
        <div className="font-display text-xl font-medium text-ink">{children}</div>
      </div>
    </div>
  );
}

export default function PartyDetails({
  lang,
  address,
  startDate,
  durationHours = PARTY_DURATION_HOURS,
  forecast,
}: PartyDetailsProps) {
  const t = getMessages(lang).details;

  // Derived from startDate rather than passed in, so the text shown to guests
  // and the time in the calendar invite can never drift apart.
  const date = formatEventDate(startDate, lang);
  const time = formatEventTime(startDate, lang);

  // "Venue, street, town" reads better with the venue on its own line.
  const [venue, ...rest] = address.split(",");
  const street = rest.join(",").trim();

  const mapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(address)}`;

  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  return (
    <section id="details" className="mx-auto mb-20 max-w-3xl scroll-mt-6 px-4">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} chip="sky" squiggle="periwinkle" />

      <div className="sticker p-5 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile icon="📅" label={t.date} tint="bg-blush/25">
            {date}
          </InfoTile>
          <InfoTile icon="⏰" label={t.time} tint="bg-ice/45">
            {time}
          </InfoTile>
          <InfoTile icon="📍" label={t.location} tint="bg-glacier/25" className="sm:col-span-2">
            {venue}
            {street && (
              <span className="block font-sans text-base text-ink/75">{street}</span>
            )}
          </InfoTile>
          {forecast}
        </div>

        <div className="mt-6 text-center">
          <AddToCalendar
            lang={lang}
            title={t.calendarTitle}
            description={t.calendarDescription}
            location={address}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border-[3px] border-ink">
          <iframe
            src={mapsEmbedUrl}
            width="100%"
            height="300"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={t.mapTitle}
          />
        </div>
      </div>
    </section>
  );
}
