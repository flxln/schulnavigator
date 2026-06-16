# MPZ Studio — UI-Brief für Claude Design

**Datum:** 2026-06-16  
**Modus:** SE 13 — UI-Design-Konzept (kein Implementierungscode)  
**Scope:** **v0 / Plan B** — siehe `02-v0-screens-und-user-stories.md`

---

## Produkt

**MPZ Studio** ist ein internes Content-Ingest-Tool für das Schulnavigator-Projekt (39. Grundschule Dresden). Nur **MPZ/Felix** nutzt es — **nicht** Lehrkräfte, **nicht** Besucher.

Es läuft **lokal** auf dem Laptop (`npm run dev`), schreibt `stations.json` und Dateien unter `app/public/` ins Git-Repo. Nach Validierung committet Felix manuell und deployed über Coolify.

**Ziel:** Am Projekttag (24./25.06.) Audio, Video, Foto und Text von Kindern schnell und fehlerfrei einpflegen — ohne Pfad-Tippfehler in JSON.

**Fallback:** Wenn das Studio nicht stabil ist, bleibt CLI + JSON (Plan A) der kritische Pfad.

---

## Plattform und Zielgeräte

- **Web**, Desktop-first (Laptop 13–15", 1280–1440 px Breite)
- Sekundär: Tablet im Querformat (optional)
- **Kein Dark Mode** — Papier-Look wie die Besucher-App
- **Responsive:** Studio-Shell mit Sidebar; auf schmalen Viewports Sidebar einklappbar

---

## Nutzerprofil

| | |
|---|---|
| **Wer** | Felix (MPZ), technisch versiert |
| **Kontext** | Projekttag in der Schule, Zeitdruck, parallel Handy zum Mobilfunk-Test |
| **Häufigkeit** | Intensiv 1–2 Tage, danach gelegentlich |
| **Vorkenntnis** | Kennt JSON-Schema und CLI; Studio soll schneller und visueller sein |

---

## Bestehendes Design-System

- **GS39** — 39. Grundschule Jubiläum 2026
- Tokens: `03-design-system-gs39-tokens.css`
- Kernfarben: Navy `#082a50`, Papier `#fcfbf7`, Grün `#4b9a23` (CTA), Rot `#ef3a37` (Fehler)
- Typo: Nunito, skaliert in Tokens
- Bestehende App-Komponenten: `Gs39Button`, `Gs39Card`, `TopBar` — siehe `09-ui-komponenten-referenz.md`

**Studio vs. Besucher-App:** Gleiche Farben und Typo, aber **dichteres Werkzeug-Layout** (mehr Tabellen, weniger Dekoration). Kein Schulhaus-Hub, keine Maskottchen-Deko auf jeder Seite.

---

## Barrierefreiheit

- Ziel: **WCAG 2.1 AA** wo praktikabel
- Touch-Targets ≥ 44×44 px
- Fehler: Farbe **und** Text (nicht nur rot umranden)
- Fokus-Reihenfolge in Formularen und Modals logisch

---

## Scope v0 — NUR diese Screens designen

1. **Studio-Shell** — Sidebar + Top-Bar, Badge „Nur lokal · development“
2. **Dashboard** — Validierungsstatus, Stationen mit Fehlern, Hinweis Plan A Fallback
3. **Stationen-Übersicht** — 12 Kacheln (siehe `10-hub-stationen-liste.json`)
4. **Station Detail** — Tabs: Stammdaten, Medien, Hotspots, Dialog-Audio (nur wenn `dialog` existiert)
5. **Medien-Upload-Modal** — Drag & Drop, Typwahl, generierter Pfad
6. **Hotspot Flat-Kalibrierung** — `/mpz/calib/flat/{slug}`
7. **Save & Validate** — Ergebnis-Panel, Rollback-Hinweis bei Fehler

Details und Zustände: `02-v0-screens-und-user-stories.md`

---

## Explizit NICHT in v0 (nur als ausgegraute Nav-Platzhalter optional)

Coach-Editor, Brand & Design, Hub-Karte, Embeds & Links (global), Deploy-Tab (QR/Token).

---

## Kern-User-Stories

1. **Audio ingestieren** — Kind-Aufnahme per AirDrop → Upload in Station `werken` → korrekter Pfad `/media/werken/audio/…` + `medien[]`-Eintrag → „Speichern & Validieren“ grün → Vorschau-Link testen.

2. **Hotspot setzen (Flat)** — Raumbild vorhanden → Kalibrierung öffnen → Klick auf Tafel → `x`/`y` übernehmen → Hotspot mit `mediumId` verknüpft → Validierung ok.

3. **Nächste Station** — Station `werken` fertig → zurück zur Übersicht (Ampel grün) → `musik` öffnen → weiterarbeiten ohne JSON-Editor.

4. **Fehlerfall** — Validierung schlägt fehl (fehlende Datei) → rotes Panel mit Fehlerliste → `stations.json` wurde zurückgerollt → Nutzer korrigiert Upload.

5. **Dialog-Audio (optional v0)** — Station `daz` → WAV `01-frieda.wav` hochladen → Segment `quelle` automatisch gesetzt.

---

## Medien-Typen in v0 (Formularfelder)

| typ | Upload | Zusatzfelder |
|-----|--------|--------------|
| `audio` | ja | `id`, `untertitel` |
| `video` | ja (upload) | `id`, `untertitel`, optional `poster` |
| `foto` | ja | `id`, `untertitel` |
| `text` | ja (.md/.txt) | `id`, `untertitel` |

`link` und `embed` sind **nicht v0** — nicht als Upload-Typ anbieten.

---

## Lieferformat (SE 13)

1. Informationsarchitektur (v0-Navigation)
2. Komponenteninventar mit Zuständen (Default, Hover, Disabled, Error, Loading, Success)
3. Interaktionsflüsse pro User-Story inkl. Fehlerpfade
4. Visuelle Systematik (Typo, Farbe, Spacing — an GS39-Tokens gebunden)
5. **High-Fidelity-Mockups** oder Wireframes für jeden v0-Screen in Empty / Filled / Error
6. Barrierefreiheit in mindestens drei konkreten Designentscheidungen

**Kein** React/Next.js-Code.

---

## Begleit-Prompt für Claude Design

```
Entwirf das UI-Konzept und High-Fidelity-Mockups für MPZ Studio v0 gemäß
00-claude-design-brief.md und 02-v0-screens-und-user-stories.md.

Nutze ausschließlich die Farben und Typo aus 03-design-system-gs39-tokens.css.
Formularfelder orientieren sich an 04-stations-schema.json und 05-typendefinitionen.md.
Mock-Daten: 06-referenz-station-klassenzimmer.json und 10-hub-stationen-liste.json.

Qualitätsregeln: 08-se13-ui-design-prompt.md.
Kein Implementierungscode. Alle v0-Screens mit Empty, Filled, Error und Loading.
```
