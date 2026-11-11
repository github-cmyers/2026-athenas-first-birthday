"use client";

import { getMessages, LANG_COOKIE, type Lang } from "@/lib/i18n";

// Switches between English and French. It is an ordinary link (so it works
// without JavaScript and the French URL can be shared), and clicking it also
// remembers the choice in a cookie for later visits.
export default function LanguageToggle({
  lang,
  href,
  className = "",
}: {
  lang: Lang;
  href: string;
  className?: string;
}) {
  const t = getMessages(lang).langToggle;
  const other: Lang = lang === "en" ? "fr" : "en";

  return (
    <a
      href={href}
      hrefLang={other}
      lang={other}
      aria-label={t.ariaLabel}
      onClick={() => {
        document.cookie = `${LANG_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={`chip bg-white text-xs transition-transform hover:-translate-y-0.5 ${className}`}
    >
      <span aria-hidden="true">🌐</span>
      {t.label}
    </a>
  );
}
