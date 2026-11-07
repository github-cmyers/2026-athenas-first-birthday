import { telHref } from "@/lib/event";

interface PromoProps {
  name: string;
  phone: string;
  email?: string;
}

export default function Promo({ phone, email }: PromoProps) {
  const phoneLink = telHref(phone);
  const emailLink = email ? `mailto:${email}` : null;

  return (
    <section className="mx-auto mb-16 max-w-3xl px-4">
      <div className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-ink bg-ink shadow-[6px_6px_0_0_var(--color-periwinkle)]">
        {/* Decorative elements */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-periwinkle/25" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blush/20" />
          <div className="absolute left-5 top-5 text-4xl opacity-30">💻</div>
          <div className="absolute bottom-5 right-5 text-4xl opacity-30">✨</div>
        </div>

        {/* Content */}
        <div className="relative p-8 text-center md:p-10">
          <span className="chip mb-5 rotate-2 border-snow bg-ice shadow-none">
            Colin&apos;s Side Hustle
          </span>

          <h2 className="mb-6 font-display text-xl font-medium leading-snug text-snow md:text-2xl">
            This website was built by Ethan &amp; Athena&apos;s Dad. If
            you&apos;re interested in me building you one of your own tailored
            exactly to your needs at a fair price, feel free to reach out.
          </h2>

          {/* CTA Button */}
          <a
            href={phoneLink}
            className="btn-chunky group border-snow bg-white text-lg shadow-[4px_4px_0_0_var(--color-ice)] hover:shadow-[6px_6px_0_0_var(--color-ice)]"
          >
            <svg
              className="h-6 w-6 group-hover:animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {phone}
          </a>

          {emailLink && (
            <div className="mt-4">
              <a
                href={emailLink}
                className="inline-flex items-center gap-2 text-lilac transition-colors hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {email}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
