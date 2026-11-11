import { getMessages, type Lang } from "@/lib/i18n";

export default function RSVPClosed({ lang }: { lang: Lang }) {
  const t = getMessages(lang).closed;

  return (
    <div className="sticker p-6 text-center md:p-8">
      <div className="mb-4 text-5xl">💌</div>
      <h3 className="mb-3 font-display text-3xl font-semibold text-ink">{t.title}</h3>
      <p className="text-ink/80">{t.p1}</p>
      <p className="mt-3 text-ink/80">{t.p2}</p>
    </div>
  );
}
