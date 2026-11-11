import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const TITLE = "Athena's First Birthday";
const DESCRIPTION =
  "Look whooo's turning ONE! You're invited to Athena's Winter ONEderland first birthday party.";

// Link previews need the image's full URL, so Next must know the site's
// public address; see siteUrl().
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: await siteUrl(),
    title: TITLE,
    description: DESCRIPTION,
    // The preview image itself comes from app/opengraph-image.tsx.
    openGraph: {
      type: "website",
      title: TITLE,
      description: DESCRIPTION,
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The font variables go on <html>, not <body>: Tailwind declares
    // --font-display and --font-sans on :root in terms of these, and a custom
    // property is resolved where it is declared - on <body> they would be
    // undefined at :root and every var(--font-display) would fall back.
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
