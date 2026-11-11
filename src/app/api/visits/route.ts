import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/adminSession";
import { isLang } from "@/lib/i18n";
import { deviceFromUserAgent, loadVisits, recordVisit } from "@/lib/visits";

// Link-preview fetchers, search crawlers and automated browsers. Most never
// run the page's script that sends this, but some do.
const NOT_A_GUEST =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|headless|lighthouse/i;

const NO_CONTENT = () => new NextResponse(null, { status: 204 });

// Counts one opening of the invitation (see src/lib/visits.ts). The hosts'
// own visits are skipped while they're logged in to the admin page.
export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!userAgent || NOT_A_GUEST.test(userAgent) || isAuthenticated(request)) {
    return NO_CONTENT();
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !isLang(body.lang)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await recordVisit(body.lang, deviceFromUserAgent(userAgent), body.newDevice === true);
    return NO_CONTENT();
  } catch (error) {
    console.error("Visit count error:", error);
    return NextResponse.json({ error: "Failed to count visit" }, { status: 500 });
  }
}

// The daily counts, for the admin page.
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await loadVisits());
  } catch (error) {
    console.error("Visit fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
  }
}
