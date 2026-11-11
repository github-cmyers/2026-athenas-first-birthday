# Athena's First Birthday

The invitation and RSVP site for Athena's "Winter ONEderland" first birthday party on **Saturday, December 19, 2026**. Guests read the invitation, RSVP and get directions; the hosts manage the guest list from an admin page.

Built with Next.js (App Router), React, Tailwind CSS and PostgreSQL. It started as a copy of the naming-ceremony site and keeps its own database table, so the two guest lists never mix.

## Before the party

These still need real details or a final check:

- [ ] **Start time.** 4:00 PM is a placeholder. Set it in `partyDate` in [src/lib/event.ts](src/lib/event.ts).
- [ ] **Venue.** Still the naming ceremony's venue. Set `VENUE` in [src/lib/event.ts](src/lib/event.ts), including the town's coordinates, which drive the weather forecast.
- [ ] **Day-of schedule.** `PARTY_SCHEDULE` in [src/lib/event.ts](src/lib/event.ts) is a draft. Replace it with the real plan, in English and French.
- [ ] **Prediction questions.** The four questions and their answers in [src/lib/predictions.ts](src/lib/predictions.ts) are a first draft. Settle them before RSVPs start coming in (see [Predictions for Athena](#predictions-for-athena)).
- [ ] **French wording.** Have a fluent speaker read the French in [src/lib/i18n.ts](src/lib/i18n.ts) and [src/lib/predictions.ts](src/lib/predictions.ts).
- [x] **Production settings.** `SITE_URL` and `ADMIN_PASSWORD` are set on Railway (see [Production](#production-railway)).
- [ ] **Printed invitations.** Print them from the live site, so the QR code points at the real address.

## Features

### For guests

- **Invitation.** A winter-themed page: falling snow, bunting, balloons, and Athena's owl in a party hat and scarf under "Look whooo's turning ONE!". It respects the device's "reduce motion" setting.
- **Tap the owl.** Tapping the owl in the header makes it hop, flap, blink and puff out snowflakes, with a soft "hoo-hoo" and a speech bubble. The bubble's line changes with each tap. With "reduce motion" on, only the bubble appears. The lines are `hero.hoots` in [src/lib/i18n.ts](src/lib/i18n.ts).
- **RSVP.** Guests accept or decline and give the number of attending family members, themselves included (1 to 8). A live badge shows how many guests and families are coming.
- **Predictions for Athena.** Right after replying, guests are asked four fun questions about Athena's future, picking as many answers as they like. Everyone's predictions are revealed on party day (see [Predictions for Athena](#predictions-for-athena)).
- **Countdown** to the start of the party.
- **Where & when.** Date, time and venue, a map, and "Add to Calendar" for Google Calendar, Outlook or an `.ics` file (Apple and others).
- **Weather.** Until 2 weeks before the party, a "Snow Prediction" gives the odds of snow from 30 years of weather history. After that, a live party-day forecast shows conditions, temperatures, the chance of rain or snow, and a tip when it's snowy or cold (see [Weather](#weather)).
- **Party-day and thank-you modes.** The page changes on its own on the day and after the party (see [How the page changes](#how-the-page-changes-around-the-party)).
- **English and French.** A toggle in the corner switches languages (see [Languages](#languages)).
- **Photo gallery** of polaroids, opening into a full-screen viewer.
- **Link preview.** Sharing the link in iMessage, WhatsApp or Facebook shows a card with the owl, the title and the date.

### For hosts

- **Admin page** at `/admin` to see, search, filter, edit, remove and export RSVPs, and to see how often the invitation has been opened (see [Admin page](#admin-page)).
- **Printable invitation** at `/invite`: a 5×7 card with a QR code that opens the site (see [Printable invitation](#printable-invitation)).
- **Private guest list.** Names, phone numbers and emails are only ever sent to a logged-in admin. The public page only sees totals.

## Changing the event details

Almost everything about the party lives in one file, [src/lib/event.ts](src/lib/event.ts):

| What | Where | Notes |
| --- | --- | --- |
| Date and start time | `partyDate` | Write the time with its UTC offset: `-05:00` in winter (EST), `-04:00` from mid-March to early November (EDT). Everything else, including the countdown, the calendar invite, the preview image and RSVP closing, follows from this. |
| Party length | `PARTY_DURATION_HOURS` | Sets the calendar event's end and when the thank-you mode begins. |
| Venue | `VENUE` | The address is shown on the page, the map, the calendar invite and the printed card. `latitude`/`longitude` only feed the weather, so the town's coordinates are enough. If the town changes, also recompute the snow prediction (see [Weather](#weather)). |
| Host contact | `HOST` | Shown in the "Questions?" section. |
| RSVPs open/closed | `RSVP_OPEN` | RSVPs close by themselves when the party starts. Set this to `false` to close them early. |
| Most people per RSVP | `MAX_FAMILY_MEMBERS` | Used by both the form and the server. |
| Day-of schedule | `PARTY_SCHEDULE` | Each item gives minutes after the start, plus English and French text, so the times move with `partyDate`. |

Other things you might change:

- **Wording:** [src/lib/i18n.ts](src/lib/i18n.ts) holds every guest-facing sentence, in English and French.
- **Prediction questions:** [src/lib/predictions.ts](src/lib/predictions.ts), in English and French.
- **Photos:** put them in `public/photos/` and list them in [src/app/components/ImageGallery.tsx](src/app/components/ImageGallery.tsx).
- **Colours:** the palette is in [src/app/globals.css](src/app/globals.css) under `@theme`. The owl's colours are repeated in `OWL_COLORS` in [src/app/components/decor.tsx](src/app/components/decor.tsx), because the preview image can't read CSS, so change both together.
- **A note for guests:** [src/app/components/StickyNote.tsx](src/app/components/StickyNote.tsx) is a taped-on note, ready to drop under the intro card. It isn't shown at the moment. It also keeps the earlier "check with Rama before bringing anyone outside your immediate family" note as `<GuestNote />`.

## How the page changes around the party

The phase comes from the clock in Eastern time:

| Phase | When | What guests see |
| --- | --- | --- |
| Upcoming | Until the day of the party | The invitation, countdown, details with the weather, and the RSVP form. |
| Party day | From midnight on December 19 until the party ends | "Today's the day!" and the day's schedule at the top, with the current item highlighted. Everyone's predictions are revealed. RSVPs close at the start time. |
| After | Once the party is over | A thank-you note replaces the invitation, and the predictions stay up. The countdown, details and RSVP section are hidden. |

To see a phase early, add `?preview=party-day` or `?preview=after` to the address, e.g. `/?preview=after&lang=fr`. Previews only change what's displayed: RSVPs still open and close by the real clock.

## Languages

Guests can read the site in English or French. The language is chosen, in order:

1. A `?lang=fr` (or `?lang=en`) link. Share `/?lang=fr` with French-speaking relatives.
2. The toggle in the hero's top-right corner. Its choice is remembered on that device.
3. The browser's first-choice language.

Two things stay in English on purpose: the "Look whooo's turning ONE!" header (the pun doesn't translate), and the admin page. Dates, times, temperatures (°C in French) and French punctuation spacing are handled automatically.

To add or change wording, edit both languages in [src/lib/i18n.ts](src/lib/i18n.ts). TypeScript reports an error if the French version is missing anything the English one has.

## Predictions for Athena

When an RSVP goes through, a pop-up asks four questions, such as "When she grows up, Athena will be…" and "By her second birthday, she'll…". Guests tick as many answers as they like for each question. It's offered to guests who decline too.

- **It's optional.** "Maybe later", the × or Escape closes it. The thank-you card then shows a button to come back, with any answers already ticked still there. Clicking outside the pop-up doesn't close it, so a stray tap can't lose someone's picks.
- **The reveal.** From party day, the page shows a "Predictions for Athena" section. For each question, answers are sorted by votes, with the most popular marked "Top pick". The section only appears once at least one guest has made predictions. To see it before then, use `/?preview=party-day#predictions`, or **Prediction results** on the admin page.
- **Changing the questions.** Edit `PREDICTION_QUESTIONS` in [src/lib/predictions.ts](src/lib/predictions.ts). Each question and answer has English and French text, an icon, and an `id`. Votes are stored by `id`, so you can reword an answer freely. Changing or removing an `id` drops the votes already cast for it, so settle the list before guests start answering.
- **Only the guest can add them.** Each RSVP reply gives the guest's browser a one-time key, and predictions can only be attached to the RSVP that key came with. Guests who replied before this feature existed weren't asked.

## Weather

The weather tile in "Where & when" is always shown until the party is over. Its data comes from [Open-Meteo](https://open-meteo.com/), which is free and needs no account. The site credits it under the tile, as its licence requires.

- **More than 2 weeks out: "Snow Prediction".** The odds of snow and the typical high and low, from 30 years of weather history around the date in the venue's town. For December 19 in North Providence, that's about a 1 in 7 chance of snow, with a typical high of 40°F and low of 27°F.
- **The last 2 weeks: "Party-day forecast".** The live forecast. Results are reused for an hour, so guests' visits don't each call the service. If the service is slow (over 4 seconds) or down, the tile shows the snow prediction instead. The rest of the page never waits for it.

The snow prediction's numbers are stored in `SNOW_HISTORY` in [src/lib/forecast.ts](src/lib/forecast.ts), because Open-Meteo's history service takes a minute or more to answer. If the party date or the venue's town changes, recompute them and paste the output over the old values:

```bash
node scripts/snow-history.mjs 41.85 -71.47 12-19   # latitude, longitude, month-day
```

## Printable invitation

Open `/invite` (or `/invite?lang=fr` for French), or use **Printable invite** on the admin page. Click **Print / Save as PDF**. The card prints as a single 5×7 in page with its colours. To make a PDF, choose "Save as PDF" as the printer.

The QR code opens the site's home page (the French home page on the French card). It uses the site's public address, so **print from the live site or set `SITE_URL` first**. Printed from your own computer, the code would point at `localhost`. The address is also written under the code so you can check it before printing.

## Link previews

[src/app/opengraph-image.tsx](src/app/opengraph-image.tsx) draws the 1200×630 preview card when the site is built, pulling the date and time from [src/lib/event.ts](src/lib/event.ts). Apps like iMessage and Facebook cache previews, so a link shared before a change may keep its old card for a while.

Previews need the site's full address. Set `SITE_URL` in production. Without it, the address is guessed from each request, which works behind most hosts.

## Admin page

Go to `/admin` and log in with `ADMIN_PASSWORD`. A login lasts 12 hours. Changing the password logs everyone out.

- **Totals:** guests coming (everyone counted), families coming, declined, and total replies.
- **Invitation visits:** how many times the invitation has been opened (in total, today and in the last 7 days), from how many different devices, and the split by English/French and phone/computer. See [Visit counts](#visit-counts).
- **Search** by name, email or phone. Phone search ignores punctuation, so `0199` finds `(802) 555-0199`.
- **Filter** to all, attending or declined.
- **Edit** any RSVP, including switching a decline to attending. Edits follow the same rules as the public form, and work even after RSVPs have closed.
- **Remove** an RSVP, after a confirmation.
- **Export CSV** of exactly what's on screen. Filter to "Attending" first for a list to give the venue. Each guest's predictions follow in one column per question, as a keepsake. The file opens correctly in Excel and Google Sheets, keeps accented names intact, and neutralises anything a guest typed that looks like a spreadsheet formula.
- **Predictions:** a 🔮 next to a name means that guest made predictions. Hover over it to see them. The line under the table counts how many guests made predictions.
- **Printable invite** opens `/invite`.
- **Prediction results** opens the party-day results early.

If the login expires while the page is open, the next refresh, edit or removal returns you to the login screen with a message.

### Visit counts

The home page tells the server once per visit that it was opened. Refreshing or switching language in the same visit doesn't count again. The server keeps only daily totals, per language and per phone/computer. It stores no IP addresses, names or identifiers.

- **"Different devices"** counts each browser's first-ever visit, using a flag kept in that browser. It's roughly the number of people. Someone who opens the link on both their phone and computer counts twice, and so does someone browsing privately.
- **Not counted:** your own visits while logged in to the admin page, `?preview=` links, link-preview fetchers (iMessage, WhatsApp, Facebook), search crawlers and automated browsers.
- Days follow Eastern time.

## Configuration

Settings come from environment variables. For local development, put them in `.env.local`. That file is never committed (all `.env*` files are git-ignored) and is never copied into the Docker image.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `DATABASE_SSL` | No | `true` connects over SSL without verifying the certificate, as some hosted databases need. |
| `ADMIN_PASSWORD` | For `/admin` | The admin password. It also signs admin logins, so changing it logs everyone out. Without it, admin login reports a server configuration error. |
| `SITE_URL` | Recommended in production | The public address, e.g. `https://athena.example.com`. Used for link previews and the invitation's QR code. |

Example `.env.local` for the Postgres container from `docker-compose.yml`:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/first_birthday
ADMIN_PASSWORD=choose-a-password
```

## Running locally

Requires Node.js 20 or later.

```bash
npm install
docker compose up -d postgres   # or point DATABASE_URL at any PostgreSQL
npm run dev
```

Open <http://localhost:3000>. The RSVP table is created automatically on first use.

## Running with Docker

```bash
docker compose up --build
```

The site runs on <http://localhost:3002>, with PostgreSQL in its own container and a named volume for the data.

`docker-compose.yml` only passes `DATABASE_URL` to the app. Add the other settings under `app` → `environment`, reading the values from the server's environment or a git-ignored `.env` file next to the compose file, so they never end up in git:

```yaml
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/first_birthday
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - SITE_URL=${SITE_URL}
```

## Production (Railway)

The live site is <https://2026-athenas-first-birthday-production.up.railway.app>. It's set up the same way as the naming-ceremony site:

- **Railway project `2026-athenas-first-birthday`** has one service, also named `2026-athenas-first-birthday`. It builds the `Dockerfile` from this repo's `main` branch, so **every push to `main` deploys automatically**.
- **The database is shared with the naming ceremony.** It's the PostgreSQL service in the Railway project `selfless-passion`, reached through its public address with SSL. Each site has its own table, so the guest lists stay separate.
- **Variables** on the service: `DATABASE_URL` (the shared database's public URL), `DATABASE_SSL=true`, `ADMIN_PASSWORD` and `SITE_URL`. Change them in the Railway dashboard under the service's **Variables** tab, or with `railway variables --set "NAME=value"`. Railway redeploys after each change.

If you add a custom domain, update `SITE_URL` to match, so link previews and the printed invitation's QR code use it.

## Data

RSVPs are stored in the `RSVP_First_Birthday` table, created automatically:

| Column | Meaning |
| --- | --- |
| `Name`, `Phone`, `Email` | As entered by the guest. |
| `Attending` | `true` for accepts, `false` for declines. |
| `FamilyMembers` | Everyone the RSVP covers, the guest included (1 for someone coming alone). `0` for declines. |
| `CreatedAt` | When the RSVP was submitted. |
| `Predictions` | The guest's prediction picks as JSON (question `id` → answer `id`s), or empty if they skipped them. |
| `PredictionToken` | The one-time key that lets the guest add predictions to this RSVP. Never shown, not even to admins. |

`Predictions` and `PredictionToken` are added automatically to a table created before predictions existed. Existing RSVPs are kept.

Visit counts are kept in the `Visits_First_Birthday` table, also created automatically. It has one row per day, language (`en`/`fr`) and device (`phone`/`computer`), with that day's `Opens` and `NewDevices`.

The naming ceremony's `RSVP_Naming_Ceremony` table is left untouched, even if both sites share a database.

## API

| Route | Access | Purpose |
| --- | --- | --- |
| `POST /api/rsvp` | Public | Submit an RSVP. Returns the guest's `predictionToken`. Returns `403` once RSVPs have closed, and `400` with a message for invalid input. |
| `POST /api/predictions` | Holder of a `predictionToken` | Save (or replace) the predictions for that RSVP. Unknown answers are ignored. Returns `400` if nothing valid was picked, and `404` for an unknown token. |
| `GET /api/rsvp/count` | Public | Totals only: families, guests, declined. |
| `GET /api/rsvp` | Admin | The full guest list. |
| `POST /api/visits` | Public | Count one opening of the invitation (sent by the home page). Skips bots and logged-in admins. |
| `GET /api/visits` | Admin | The daily visit counts. |
| `PATCH /api/rsvp/[id]` | Admin | Edit an RSVP. |
| `DELETE /api/rsvp/[id]` | Admin | Remove an RSVP. |
| `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/check` | — | Admin session. |

## Project layout

```
src/
  app/
    page.tsx               the invitation; picks phase and language per visit
    admin/page.tsx         guest-list admin
    invite/                printable 5x7 invitation
    opengraph-image.tsx    link-preview card
    api/                   RSVP and admin routes
    components/            page sections, plus decor.tsx (owl, snow, bunting)
    globals.css            palette, fonts, card and button styles
  lib/
    event.ts               party date, venue, host, schedule, phases
    i18n.ts                all guest-facing text, English and French
    lang.ts                works out each visitor's language
    rsvp.ts                RSVP table and validation
    predictions.ts         prediction questions, validation and vote counts
    visits.ts              invitation visit counts
    forecast.ts            live forecast and the stored snow prediction
    csv.ts                 CSV export
    site.ts                the site's public address
    adminSession.ts        signed admin logins
    db.ts                  PostgreSQL connection
scripts/
  snow-history.mjs         recomputes the snow prediction from weather history
```

## Checking changes

```bash
npx tsc --noEmit   # type check
npm run lint
npm run build
```
