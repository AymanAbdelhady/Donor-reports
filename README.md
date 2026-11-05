# Donor Report Studio (generic edition)

An AI assistant that turns a conversation into a **branded 4–8 page donor impact report (PDF)**, with a personal thank-you letter from the CEO. Any non-profit can make it their own from the admin dashboard in a few minutes: name, colours, logo, CEO, photos, questions and wording.

This is the **generic edition**: it contains no third-party branding, photos or licensed fonts, so it can be shown to and deployed for any organisation.

## What it does

**For staff (the Studio):**
1. **Talk or type** about the donor and the project. The assistant asks one friendly question at a time and fills in a live report card.
2. **Add photos**, or let it use the organisation's photo library or illustrations.
3. **Pick a style and a page count**, then press **Create my report**. Missing details are filled with honest, general writing, never invented numbers, names or quotes.
4. **Review:** edit the wording, choose the cover and story photos, or ask for an AI rewrite. Then download or share the PDF.

**For administrators (the dashboard):**
- **Branding:** name, tagline, contact details, currency, "about us", colours (or one of six **quick looks**), logos and a **photo library**.
- **Sign-in page:** a headline and up to 8 online photo links that fade behind the sign-in box (Branding page). If a link can’t load, the photo library or illustrations are shown instead.
- **CEO & letter:** who signs, their photo and signature, and points to include in every letter.
- **Assistant & questions:** the assistant's name and greeting, the questions it asks and their order, **giving types**, extra rules and tone of voice.
- **Report styles:** which of the nine designs staff can use, page counts, an optional **blessing line** (any language), **closing quotes** and the AI rewrite limit.
- **Users, usage and reports:** unique sign-ins for each person, activity and AI cost per person, and every report.
- **AI connection:** paste a Claude API key, choose the model, test the connection.

**Made to look like the organisation from minute one:** until real assets are uploaded, the logo, a placeholder CEO portrait and eight illustrations are drawn automatically in the organisation's colours, and redrawn whenever the name or colours change.

## English and Arabic

- **Studio:** an **English / عربي** button switches the whole interface; Arabic is fully right-to-left. Staff can type or speak in either language, and the assistant replies in the language they use.
- **Reports:** staff choose the **report language** for each report before creating it. It is then fixed, like the style and page count. An Arabic report has:
  - Arabic copy written by the AI, translated from an English conversation when needed
  - every one of the nine layouts mirrored right-to-left
  - Arabic fonts (Cairo, Tajawal, and Aref Ruqaa for the handwritten touches and the CEO signature)
  - Arabic labels, and the donor's name, place, period and budget lines in Arabic
- **Without AI:** a built-in Arabic template writer and Arabic questions keep everything working.
- **Dashboard → Languages:**
  - which languages are offered, and the defaults for reports and the Studio
  - the organisation, CEO and assistant names in Arabic, and the Arabic closing line
  - the Arabic greeting and the assistant's questions in Arabic
  - the Arabic writing style (warm, formal, light Gulf, light Levantine) and Arabic tone-of-voice rules
  - Arabic giving types and Arabic closing quotes

## The nine report styles

| Style | Look |
|---|---|
| **Signature** | Bold primary colour, textured arcs, marker highlights |
| **Photo Frame** | Photography-led with outline frames and colour-coded sections |
| **Colour Pop** | Warm and colourful, heart and circle photo crops |
| **Editorial** | Magazine-style: giant outlined numbers and full-bleed photos |
| **Celebration** | Arched photo windows, sunbursts and sparkles, for festive appeals |
| **Impact Numbers** | Infographic: big figures, timeline, spending donut, cost per person |
| **Poster** | Stacked capitals on two solid colour blocks |
| **Mosaic** | A wall of tiles: photos, colours and a geometric pattern |
| **Journey** | Follows the gift from donor to community: route, stops, postcard, ticket |

Every report (English or Arabic) contains a cover, the CEO letter, the project, its impact, a story of change, a gallery, how the money was used, looking ahead and a thank-you page. 4–5 page reports combine these into fewer pages. Examples are in `samples/` (`*-ar.pdf` are the Arabic versions).

## Run it

```bash
npm ci
npm run demo     # demo mode: sign-in details shown on the sign-in page
# or: npm start  # normal mode
```

Open http://localhost:3000.

## Deploy on Render (as its own service)

1. **New → Web Service** from this repository. Leave **Root Directory** empty, set **Runtime** to Docker, and choose the **Standard** instance (2 GB).
2. **Disks:** add a disk with mount path `/data` (1–5 GB).
3. **Environment variables:**

   | Variable | Value |
   |---|---|
   | `DATA_DIR` | `/data` |
   | `DEMO_MODE` | `1` for a demo site; leave it out for a real organisation |
   | `ANTHROPIC_API_KEY` | your Claude API key (or paste it later in the dashboard) |
   | `BASE_PATH` | optional, e.g. `/demo` to serve it at `yourdomain/demo` |

4. **Sign in:**
   - In demo mode the sign-in page shows the details (`demo` / `Demo-Report-2026`; change them with `DEMO_USERNAME` and `DEMO_PASSWORD`).
   - Otherwise sign in as `admin` / `Welcome-Report-2026!` and choose a new password.

**One service per organisation** keeps each organisation's users, settings and reports completely separate. Give each one its own disk and, if you like, its own `BASE_PATH` or subdomain.

## Demo mode

`DEMO_MODE=1` is made for presentations:
- the demo sign-in details are shown on the sign-in page, with a **Fill in for me** button and no forced password change;
- the dashboard overview has a **Getting started** checklist and a **Reset demo** button, which puts back the fictional "Horizon Community Foundation", deletes demo reports and uploads, and keeps users.

See [PRESENTER-GUIDE.md](PRESENTER-GUIDE.md) for a 10-minute demo script.

## Locked-down rules (to control AI cost)

- Style and page count are fixed once a report is created.
- After that, staff can edit the wording and photos freely; AI rewrites are capped per report (3 by default).
- Uploaded photos keep print quality: up to 3600 px, location data removed, and cropped exactly to their frames in the PDF.

## Fonts and images

- **Fonts:** only open-licence fonts are used (Barlow Semi Condensed, Lato, Caveat Brush, Cairo, Amiri, Mrs Saint Delafield).
- **Illustrations:** generated by the app, so there are no stock-photo licences to manage.
- **Organisations' own material:** each organisation uploads its own logo, photos and signature through the dashboard.

## Project map

| Path | What |
|---|---|
| `src/brand.js` | Default demo brand (fictional organisation) |
| `src/settings.js` | Everything editable in the dashboard, applied live |
| `src/generate.js` | Brand-coloured logo, CEO placeholder and illustrations |
| `src/ai.js`, `src/fallbackCopy.js` | The assistant and the writer (Claude, with a template fallback) |
| `src/render/` | Report engine and the nine styles |
| `public/` | Studio, sign-in and admin dashboard |
| `scripts/render-samples.js` | Renders `samples/` and the style thumbnails |
| `scripts/build-assets.js` | Redraws the bundled default artwork in `brand/` |
