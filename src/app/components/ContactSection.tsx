import { telHref } from "@/lib/event";

interface ContactSectionProps {
  name: string;
  phone: string;
  email?: string;
}

export default function ContactSection({ name, phone, email }: ContactSectionProps) {
  const phoneLink = telHref(phone);
  const emailLink = email ? `mailto:${email}` : null;

  return (
    <section className="mx-auto mb-16 max-w-3xl px-4 pt-6">
      <div className="sticker relative p-6 pt-10 text-center md:p-10">
        <span className="chip absolute -top-4 left-1/2 -translate-x-1/2 -rotate-2 bg-glacier">
          Questions?
        </span>
        <p className="mb-5 text-lg text-ink/80">
          Feel free to reach out to {name} if you have any questions:
        </p>
        <div className="space-y-3">
          <a href={phoneLink} className="btn-chunky bg-glacier text-lg">
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
                strokeWidth={2.5}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {phone}
          </a>
          {emailLink && (
            <div>
              <a
                href={emailLink}
                className="inline-flex items-center gap-2 font-semibold text-ink underline decoration-2 underline-offset-2"
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
