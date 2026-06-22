# GS39 Design-System — Referenz für MPZ Studio

MPZ Studio soll **visuell zur Schulnavigator-App passen**, aber **funktional dichter** sein (Werkzeug-UI).

Quellcode: `app/components/ui/`.

---

## Gs39Button

| variant | Verwendung |
|---------|------------|
| `primary` | Haupt-CTA (Grün) — z. B. „Speichern & Validieren“ |
| `navy` | Sekundär auf hellem Grund |
| `outline` | Abbrechen, Zurück |

CSS: `sn-btn`, `sn-btn--primary`, `sn-btn--navy`, `sn-btn--outline`.

---

## Gs39Card

| Prop | Effekt |
|------|--------|
| `interactive` | Hover/Focus für Kacheln (Stationen-Grid) |
| `locked` | Ausgegraut |

CSS: `sn-card`, `sn-card--interactive`, `sn-card--locked`.

---

## TopBar

Dunkle Navy-Leiste — Besucher-App `/raum/[slug]`.

Studio: vereinfachte TopBar mit Titel, Save-Button (Ist: helle Top-Bar mit Border).

---

## Gs39Chip

Kleine Labels (Viewer `flat` / `360°`, Hub-Nr).

---

## Semantische Farben

Aus `03-design-system-gs39-tokens.css`:

- Seitenhintergrund: `--bg-1` (paper)
- Karten: `--bg-2` (white)
- Primärtext: `--fg-1` (navy)
- CTA: `--accent` / `--brand-green`
- Fehler: `--error` / `--brand-red`
- Warnung: `--warn` / `--brand-sun`
- Sidebar: `--bg-dark`, `--fg-on-dark`

---

## Was Studio NICHT übernehmen soll

- Schulhaus-Hub-Grafik
- Maskottchen-Coach-Layer (Besucher-App)
- Festive Decor / Sparkle
- Vollbild-Scanner-Chrome

---

## Studio-spezifische Bausteine (Ist — zu vereinheitlichen)

| Baustein | Verwendung |
|----------|------------|
| Sidebar-Nav | 9 Einträge, Navy-Hintergrund |
| Tab-Leiste | Station Detail |
| Daten-Tabelle | Medien, Hotspots, Coach |
| Upload-Modal | Medien ingest |
| Status-Badges | Dialog-Audio, Coach-Audio |
| Save-Validate-Panel | Grün/rot, dismissible |
| Plan-A-Banner | Gelb/dezent oben |

Redesign: diese Bausteine in ein **einheitliches Komponenten-Set** überführen.


---

## GS39 Design Tokens (vollständig)

```css
/*
 * GS39 Design Tokens — 39. Grundschule Dresden (Jubiläum 2026)
 * source: auftraggeber/material/UI-Vorschläge/colors_and_type.css (:root)
 *         auftraggeber/Virtueller Schulrundgang/assets/colors_and_type.css (gleicher :root)
 * synced: 2026-05-27 — npm run validate:tokens (Phase 0 GS39 UI)
 * Abweichung zur Quelle: --font-ui (next/font), --font-display und --font-script
 * (Druckschrift Nunito statt Caveat Brush / Caveat — bessere Lesbarkeit in der App)
 */

:root {
  /* ---------- BRAND CORE ---------- */
  --brand-navy: #082a50; /* display titles, ribbon, body ink */
  --brand-navy-700: #0b3565; /* darker navy for press states */
  --brand-navy-300: #6b89b4; /* muted navy for support text */
  --brand-green: #4b9a23; /* JUBILÄUM brush, map-pin chip */
  --brand-green-700: #3d7e1b;
  --brand-green-300: #a6d08a;

  /* ---------- PLAYGROUND ACCENTS (bunting, balloons, hearts) --- */
  --brand-red: #ef3a37;
  --brand-sun: #fbbb24; /* yellow */
  --brand-blue: #1f6abb; /* bunting + calendar chip */
  --brand-sky: #9edafe; /* watercolor wash */
  --brand-sky-50: #e4f3fc; /* tint surface */

  /* ---------- SURFACES ---------- */
  --paper: #fcfbf7; /* warm white — default page */
  --paper-50: #f5f2ea; /* second-step warm surface */
  --white: #ffffff;

  /* ---------- INK (text / hairline scale) ---------- */
  --ink: #082a50; /* alias of brand-navy for body */
  --ink-80: rgba(8, 42, 80, 0.8);
  --ink-60: rgba(8, 42, 80, 0.6);
  --ink-40: rgba(8, 42, 80, 0.4);
  --ink-20: rgba(8, 42, 80, 0.2);
  --ink-10: rgba(8, 42, 80, 0.1);
  --ink-05: rgba(8, 42, 80, 0.05);

  /* ---------- SEMANTIC ROLES ---------- */
  --fg-1: var(--brand-navy); /* primary text */
  --fg-2: var(--ink-80); /* secondary text */
  --fg-3: var(--ink-60); /* tertiary / captions */
  --fg-on-dark: var(--white);

  --bg-1: var(--paper); /* page */
  --bg-2: var(--white); /* surface (card) */
  --bg-3: var(--paper-50); /* recessed */
  --bg-dark: var(--brand-navy); /* ribbon / footer */

  --border-1: var(--ink-10);
  --border-2: var(--ink-20);

  --accent: var(--brand-green); /* primary call-to-action */
  --accent-alt: var(--brand-blue); /* secondary actions */
  --warn: var(--brand-sun);
  --error: var(--brand-red);

  /* ---------- TYPE — FAMILIES ---------- */
  --font-display: var(--font-ui);
  --font-script: var(--font-ui);
  --font-ui:
    var(--font-nunito-ui), 'Nunito', system-ui, -apple-system, 'Segoe UI',
    sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;

  /* ---------- TYPE — SIZE / LINE / WEIGHT SCALE ---------- */
  --t-display-xl: 96px; /* the "150-JÄHRIGEN" wall */
  --t-display-l: 72px;
  --t-display-m: 56px;
  --t-h1: 40px;
  --t-h2: 30px;
  --t-h3: 22px;
  --t-h4: 18px;
  --t-body: 16px;
  --t-small: 14px;
  --t-tiny: 12px;

  --lh-tight: 1.05;
  --lh-snug: 1.2;
  --lh-normal: 1.45;
  --lh-loose: 1.65;

  --w-regular: 400;
  --w-medium: 500;
  --w-semibold: 600;
  --w-bold: 700;
  --w-black: 900;

  /* ---------- SPACING ---------- */
  --s-0: 0;
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 24px;
  --s-6: 32px;
  --s-7: 48px;
  --s-8: 64px;
  --s-9: 96px;
  --s-10: 128px;

  /* ---------- RADII ---------- */
  --r-sm: 6px;
  --r-md: 12px;
  --r-lg: 20px;
  --r-xl: 28px;
  --r-pill: 999px;

  /* ---------- SHADOWS (tinted navy) ---------- */
  --shadow-sm: 0 1px 2px rgba(8, 42, 80, 0.08);
  --shadow-md: 0 6px 20px rgba(8, 42, 80, 0.1);
  --shadow-lg: 0 18px 40px rgba(8, 42, 80, 0.14);
  --shadow-inset-line: inset 0 -1px 0 var(--ink-10);

  /* ---------- ELEVATION CHIPS (icon chip dimensions) ---------- */
  --chip-sm: 40px;
  --chip-md: 56px;
  --chip-lg: 80px;

  /* ---------- LAYOUT ---------- */
  --max-content: 1120px;
  --max-hero: 1280px;
  --gutter: 24px;

  /* ---------- MOTION ---------- */
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --t-fast: 120ms;
  --t-base: 220ms;
  --t-slow: 400ms;
}
```
