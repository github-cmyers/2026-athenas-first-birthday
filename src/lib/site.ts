import { headers } from "next/headers";

// The site's public address, for anything that must be an absolute URL: the
// link-preview image tags and the QR code on the printable invitation.
// SITE_URL (e.g. https://athena.example.com) is the reliable way to set it in
// production. Without it, the address the request came in on is used, which
// is right behind most hosts and reverse proxies.
export async function siteUrl(): Promise<URL> {
  if (process.env.SITE_URL) return new URL(process.env.SITE_URL);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return new URL(`${proto}://${host}`);
}
