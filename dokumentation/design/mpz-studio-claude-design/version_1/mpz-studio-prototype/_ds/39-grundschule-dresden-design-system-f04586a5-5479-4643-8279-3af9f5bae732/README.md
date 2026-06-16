# 39. Grundschule Dresden – Design System

A design system for the **39. Grundschule Dresden-Plauen**, a public primary school in Dresden, Saxony, Germany, built around the visual identity used for its **150-jähriges Jubiläum** (150-year anniversary) campaign in 2026.

## The school
- **Name:** 39. Grundschule Dresden ("39th Primary School Dresden"), located in the Plauen district.
- **Address:** Schleiermacherstraße 8, Dresden.
- **Size & character:** ~411 children, 14+ nationalities. Public *Grundschule* (grades 1–4).
- **Distinctive programs:** Französisch (French from year 1), DaZ (German as a second language), Schulfach Glück (a "Happiness" subject), Begabtenförderung (gifted enrichment), Hort (after-school), Ganztagsangebote (clubs), strong school sport tradition (annual OEM relay where they hold the *teilnehmerstärkste Schule* — most-participants — title).
- **Voice:** in German throughout; formal *Sie* address to parents, warm and welcoming, occasional French phrase ("Herzlich Willkommen et bienvenue…") nodding to the French program.

## The two surfaces this system covers

| Product | Today | What this system is for |
|---|---|---|
| **Anniversary 2026 campaign** | A custom-designed invitation flyer (watercolor + brush type + bunting + balloons). | The distinctive brand of the system — every color, font, motif here comes from this artifact. |
| **School website** | Hosted on the *Sächsischer Bildungsserver* (TYPO3) at `cms.sachsen.schule/gs39dd/`. Plain government template; no real visual identity. | A modernized "what if the school site adopted the Jubiläum brand" UI kit. The page structure follows the **Kubio "Pine Hills" school template** (hero with right-side photo · welcome + 3-feature row · admissions banner · mission quote · goals & stats counter · press · facilities list · alumni testimonials · blog grid · CTA · newsletter · multi-column footer), populated with real Grundschule content. |

## Sources provided
- **Anniversary invitation:** `uploads/image.jpeg` — single uploaded artwork for the *Einladung zum 150-jährigen Jubiläum*. This image is the source of truth for the entire color palette, typography choices, illustrative motifs (bunting, balloons, watercolor splashes, brush-painted highlight stroke), and the icon language (filled circles with white glyphs).
- **School website:** <https://cms.sachsen.schule/gs39dd/start.html> — used to extract content categories, navigation, real news copy, real announcements, and the school's tone of voice toward parents. The site itself is a generic *Sächsischer Bildungsserver* TYPO3 template (designer credited: Michael Rudolph) and is not used as a visual reference.
- **Layout reference:** <https://vero-dolores-6a0ee-space.wpkubio.com/sample-project-1/> — the Kubio "Pine Hills" school WordPress template. We borrowed only its **page composition** (which sections live in which order on a school homepage), not its colors, type, or content.

> No codebase, Figma, or font files were attached. **All fonts are Google Fonts substitutes** — see the "Type" section below and the caveats at the end of this README.

---

## CONTENT FUNDAMENTALS

**Language.** German throughout. Occasional French greeting ("*Herzlich Willkommen et bienvenue…*") and program names in French ("Französisch"). English is **not** used in body copy.

**Address & tone.** Polite formal *Sie* to parents and visitors ("Wir laden **Sie** herzlich ein…", "Liebe Eltern,"). Warm, slightly old-fashioned politeness — never marketing-speak. Children are referred to as *die Kinder* or *unsere Schüler*, never customers/users.

**Casing.**
- Body & headlines: normal German sentence case with capitalized nouns ("Neues aus der Schule").
- Brand display moments (anniversary, posters, section starters): SHOUTING CAPS in brush type ("EINLADUNG ZUM 150-JÄHRIGEN JUBILÄUM").
- Dates always numeric, dot-separated: `26.06.2026`, time as `ab 15 Uhr`.

**Voice rules.**
- We say "wir" / "unsere Schule" — first person plural, collective. Never "ich".
- Parents are "Sie". Children are "die Kinder".
- Sign-offs are simple ("Liebe Eltern,") not corporate ("Hello team!").
- Numbers are written numerically when factual ("411 Kinder aus über 14 Nationen", "Spende von 2000 Euro", "Platz 1").

**Punctuation & micro-copy.**
- German quotation marks „so" in long copy; straight quotes are tolerated in headings.
- Em-dashes used freely to chain a list of events ("Sportwoche – Spendenlauf - Spendenübergabe").
- Liberal use of *!* on celebratory news ("Wir haben es wieder geschafft!!!", "Ein riesengroßes Dankeschön…").
- "Weiterlesen" is the standard read-more link.
- Italics for soft asides ("*Wir wünschen Ihnen viel Spaß beim Durchstöbern…*").

**Emoji.** Not used in news or admin copy. The anniversary brand uses **drawn icon motifs** (a hand-drawn heart with sparkles, balloons, bunting flags) in place of emoji — never the Unicode ❤️ glyph.

**Vibe.** Welcoming, proud-of-the-children, community-focused. Big celebratory moments (anniversary, sports, fundraising) get loud festive treatment; everyday admin (lunch provider, after-school closures) is restrained and businesslike. Both live happily side by side.

**Example mini-passages (real, from the site):**
> "Wir laden Sie herzlich ein, unsere Schule näher kennenzulernen. Aktuell lernen an unserer Schule 411 Kinder aus über 14 Nationen."

> "Wir haben es wieder geschafft!!! Ein riesengroßes Dankeschön an alle Helfer und Unterstützer, die am Sonntag, dem 26.04.26 dabei waren."

> "Gemeinsam feiern. Erinnern. Zukunft gestalten." *(the Jubiläum tagline — three-word rhythm, infinitive verbs, no exclamation)*

---

## VISUAL FOUNDATIONS

The Jubiläum identity is **festive, hand-made, primary-school-honest**. It looks like a class made it together with paint and good supervision — never slick, never corporate, never childish in a patronizing way.

### Color
A **navy + green** anchor pair with a **playground primaries** triad (red, yellow, blue) used only as accents on bunting, balloons, hearts, and sparkles. Watercolor backgrounds bring in **sky blue** and **leaf green** as soft washes. White and warm paper for surfaces. See `colors_and_type.css` for the exact tokens.

### Typography
- **Display / brand moments:** a textured *brush* uppercase (Google Fonts substitute: **Caveat Brush**). Used for the big anniversary numbers, "JUBILÄUM" inside a green brush stroke, section starters.
- **Script tagline:** a flowing handwritten italic (Google Fonts substitute: **Caveat**). Used only for the tagline "Gemeinsam feiern. Erinnern. Zukunft gestalten." and short emotional lines.
- **UI & body:** a friendly rounded sans (Google Fonts: **Nunito**) — appropriate for a primary school, readable at small sizes for parents.
- Body always sentence case + capitalized German nouns; brush display always UPPERCASE.

### Backgrounds
- **Watercolor washes** (sky blue + leaf green) bleed off the edges of hero posters. They are *photographic* watercolor — never tiled, never repeated, never CSS-gradient-faked. We provide them as PNG assets in `assets/`.
- Plain UI uses warm-white (`--paper`) backgrounds, not pure #FFFFFF.
- The bottom of brand posters carries a **navy ribbon** containing the tagline — a fixed motif.

### Motifs
- **Bunting flags** in the corner (alternating red/yellow/blue triangles on a black string).
- **Helium balloons** clustered top-right.
- **A green "highlight brush"** stroke behind a single key word (e.g. JUBILÄUM).
- **A small hand-drawn heart with sparkles**, used as a sign-off mark.

### Animation
- The brand is print-first; animation is **restrained**. Default to **fades (200–250ms)** and gentle **rise (8px)** for entries.
- Easing: `cubic-bezier(.2, .8, .2, 1)` (a soft ease-out) — no overshoot, no bounce.
- A single allowed delight: the **balloon cluster** gently bobs (±4px, 4s ease-in-out, alternate). Reserved for the Jubiläum hero.

### Hover & press states
- **Buttons (filled):** hover = darken background by ~6%, no scale. Press = darken by ~12% + 1px down translation.
- **Buttons (outlined):** hover = fill with the border color at 8% alpha. Press = 16%.
- **Links:** hover = underline appears (no color change). Press = darker tone.
- **Cards:** hover = shadow elevates one step (sm → md) + 2px lift. No scale.

### Borders, radii, shadows
- **Radii.** `--r-sm 6px`, `--r-md 12px`, `--r-lg 20px`, `--r-pill 999px`. Icon chips are **perfect circles** (the calendar / map-pin chips in the flyer).
- **Borders.** Default 1px solid `--ink-20`. The Jubiläum brand also uses a **2px painted-edge** look on the green highlight stroke — implemented via SVG mask, not CSS border.
- **Shadows.** Three steps:
  - `--shadow-sm` 0 1px 2px rgba(20,38,75,.08)
  - `--shadow-md` 0 6px 20px rgba(20,38,75,.10)
  - `--shadow-lg` 0 18px 40px rgba(20,38,75,.14)
  Shadows are tinted with **navy**, never neutral gray.
- **Protection gradients** (over watercolor heros, when text needs guaranteed contrast): a soft white-to-transparent wash from the text side, 0 → 60% over ~40% of the width. We *prefer* this over a solid capsule — keeps the watercolor breathing.

### Layout rules
- The school's content is **left-aligned, ragged-right**, never justified.
- The Jubiläum brand uses a **center-anchored hero** with the watercolor on the left and a real photograph (the school building) on the right, joined by a soft edge — not a hard split.
- Max content width on web: **1120px**. Hero posters: **1280px** (16:9 print posters scale up via SVG).
- Generous vertical rhythm: section gaps are 64–96px on web, never <32.

### Transparency & blur
- Watercolor washes use **real alpha** (the PNG is already partially transparent at edges). We do not stack additional alpha.
- **No backdrop-blur.** No frosted glass. The brand is paper-and-paint, not screen-glass.

### Imagery vibe
- **Warm, real, daylight.** Photos of the school building, the children at sports day, the after-school spaces. Slightly sunny, never desaturated, never B&W, never with grain or filters.
- We do not stage photos. We accept the real angle and crop generously.

### Cards
- Warm-white surface, **1px `--ink-10` border**, `--r-md` radius, `--shadow-sm` default elevating to `--shadow-md` on hover. No left-stripe accents. No drop-shadow "AI cards".

### What we avoid
- Bluish-purple gradients.
- Emoji as decoration.
- Cards with a colored left border only.
- Drawn-by-LLM SVG illustrations — when imagery is missing we use the photograph or a placeholder, never a stylized vector face.
- Frosted glass / backdrop blur.
- Inter, Roboto, Arial.

---

## ICONOGRAPHY

The Jubiläum brand uses **filled-circle icon chips** with white glyphs inside. In the invitation flyer the calendar chip is navy and the map-pin chip is leaf-green; both glyphs are a clean solid-fill style. We adopt this as our icon system.

- **Icon style:** solid-fill (not stroked), single color (always white when on a colored chip; otherwise `--ink` navy).
- **Icon source:** [Lucide](https://lucide.dev/) via CDN as the primary set — Lucide's outlined icons are swapped to their solid counterparts where available, and for solid-only needs we use the [Solar](https://solar-icons.com/) Bold-Duotone CDN. Both are MIT-licensed and CDN-available, which lets the school's webmaster avoid hosting an icon font.
- **Substitution flagged:** the original flyer's calendar + pin glyphs were hand-set; the closest CDN matches (Lucide `calendar-days`, `map-pin`) are used. Stroke style and proportions are very close but not pixel-identical — flagged for the client.
- **Chip:** `width 56px; height 56px; border-radius: 999px; display: grid; place-items: center;` — filled with one of `--brand-navy`, `--brand-green`, or `--brand-sun` (yellow). Icon inside is **24px** white.
- **Decorative motif icons** — bunting, balloon cluster, heart-with-sparkles — live as bespoke **PNG/SVG assets** in `assets/motifs/`. They are not Lucide swaps; they are the brand's own marks and should never be substituted.
- **Emoji and Unicode glyphs are not used** as icons. ✱ ❤ ☆ etc. are forbidden in UI.
- **Logos and motifs in `assets/`** must always be referenced from `assets/…` — never inlined as SVG in copy.

---

## Index — what's in this project

```
/  (root)
├── README.md                  ← you are here
├── SKILL.md                   ← skill manifest (for Claude Code use)
├── colors_and_type.css        ← all CSS vars: color, type, spacing, radii, shadows
├── assets/
│   ├── logos/                 ← school + Jubiläum lockups
│   ├── motifs/                ← bunting, balloons, heart, brush stroke, watercolor
│   ├── photos/                ← school building photograph
│   └── (CDN icons used live)
├── fonts/                     ← README pointing at Google Fonts substitutes
├── preview/                   ← design-system review cards (one HTML per token group)
├── ui_kits/
│   └── school_website/        ← modernized website using the Jubiläum brand
│       ├── README.md
│       ├── index.html         ← click-thru prototype
│       └── *.jsx              ← Header, Nav, Hero, NewsCard, AnnouncementList, Footer
└── slides/                    ← Jubiläum poster + save-the-date + programme layouts
    ├── index.html
    ├── PosterSlide.jsx
    ├── SaveTheDateSlide.jsx
    └── ProgrammeSlide.jsx
```

---

## Caveats & known substitutions

- **Fonts.** The original flyer's brush display, handwritten script, and rounded UI sans are not provided. We use Google Fonts **Caveat Brush** (display brush), **Caveat** (script), and **Nunito** (UI). These read very close to the artwork but are not exact — please provide the real .ttf files if you have them.
- **Watercolor washes.** The original flyer's painted background is a photograph of real watercolor — we cannot redraw it. Our `assets/motifs/watercolor-*.svg` placeholders are restrained approximations; for production posters please supply the original PNG.
- **Photograph of the school building.** We cannot redistribute the original photo from the CMS. The UI kit uses a `<image-slot>` placeholder so a real photo can be dropped in.
- **Icons.** Substituted to Lucide/Solar from CDN — see "Iconography" above.
- **Website code.** The actual school site runs on a Sächsischer Bildungsserver TYPO3 template; we did not have access to the underlying TYPO3 templates, only the rendered HTML. The UI kit is a *redesign* of the school site, not a clone of the current one.

## ASK
Once you've reviewed, please send: (1) real font files for the brush, script, and UI sans, (2) the original watercolor PNG, (3) any photographic library you want represented in `assets/photos/`. We'll re-pour the system around the real materials.
