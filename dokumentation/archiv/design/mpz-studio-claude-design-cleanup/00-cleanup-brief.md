# MPZ Studio — Cleanup-Brief für Claude Design

**Datum:** 2026-06-22  
**Modus:** SE 13 — UI-Design-Konzept (kein Implementierungscode)  
**Scope:** **Vollversion v2.1** — alle umgesetzten Studio-Module neu strukturieren

---

## Auftrag

Das MPZ Studio **funktioniert** (Epic v0–v2.1 abgeschlossen), wirkt aber **unübersichtlich**: flache Navigation mit 9 Punkten, doppelte Einstiege, vermischte Domänen, überladene Station-Tabs. Claude Design soll eine **klare Informationsarchitektur**, **gruppierte Navigation** und **High-Fidelity-Mockups** liefern — ohne die GS39-Marke zu verlieren.

**Nicht:** React/Next.js-Code. **Ja:** IA, Komponenteninventar, Interaktionsflüsse, Mockups (Desktop 1280 px).

---

## Produkt

**MPZ Studio** ist ein internes Content-Ingest-Tool für den Schulnavigator (39. Grundschule Dresden). Nur **MPZ/Felix** nutzt es — **nicht** Lehrkräfte, **nicht** Besucher.

- Läuft **lokal** (`npm run dev`), schreibt `stations.json` und Dateien unter `app/public/` ins Git-Repo
- Nach Validierung: manueller `git commit` → Coolify-Deploy
- **Plan A** (CLI + JSON) bleibt Fallback — Studio darf Plan A nicht ersetzen müssen

---

## Plattform und Zielgeräte

- **Web**, Desktop-first (Laptop 13–15", 1280–1440 px)
- Sekundär: Tablet Querformat
- **Kein Dark Mode** — warmer Papier-Look wie die Besucher-App
- Sidebar auf schmalen Viewports einklappbar

---

## Nutzerprofil

| | |
|---|---|
| **Wer** | Felix (MPZ), technisch versiert |
| **Kontext** | Content-Pflege vor/nach Schulfest, gelegentlich Projekttage |
| **Häufigkeit** | Phasenweise intensiv, sonst sporadisch |
| **Vorkenntnis** | Kennt JSON-Schema und CLI; Studio soll schneller und visueller sein |

---

## Bestehendes Design-System

- **GS39** — 39. Grundschule Jubiläum 2026
- Tokens: `03-design-system-gs39-tokens.css`
- Kernfarben: Navy `#082a50`, Papier `#fcfbf7`, Grün `#4b9a23` (CTA), Rot `#ef3a37` (Fehler)
- Typo: Nunito
- App-Komponenten: `Gs39Button`, `Gs39Card`, `TopBar` — siehe `09-ui-komponenten-referenz.md`

**Studio vs. Besucher-App:** Gleiche Farben und Typo, aber **dichteres Werkzeug-Layout** (Tabellen, Formulare, weniger Dekoration). Kein Schulhaus-Hub, keine Maskottchen-Deko auf jeder Seite.

---

## Was heute existiert (v2.1)

Alle folgenden Bereiche sind **implementiert** und sollen im Redesign **berücksichtigt** werden:

### Global (Sidebar)

1. Dashboard — Validierung, Stationen mit Fehlern
2. Stationen — 12 Kacheln (Hub-Nr, Viewer, Ampel)
3. Medien hochladen — Modal (globaler Einstieg)
4. Coach — `coach-messages.json`
5. Embeds & Links — globale Allowlist
6. Hub-Karte — Slug ↔ Slot, Akzente, Icons
7. Brand & Design — Logos, Maskottchen
8. Deploy — Env, QR, Token, validate-all

**Nicht global:** Dialog-Audio — fest an Dialog-Segmente gekoppelt (siehe `15-dialog-segment-zeilenmodell.md`).

### Pro Station (`/mpz/studio/stationen/[slug]`)

- Tabs: Stammdaten, Medien, Hotspots, **Dialog** (immer sichtbar — mit oder ohne `dialog` in JSON)
- Im Tab **Dialog:** ohne Dialog → „Dialog hinzufügen“; mit Dialog → Segment-Zeile (Text + Audio: Upload, Abspielen, Löschen)
- Vorschau als externer Link `↗ /raum/{slug}`

### Sonderseiten

- `/mpz/calib/flat/[slug]` — Flat-Hotspot-Kalibrierung
- `/mpz/studio/ingest` — Deep-Link öffnet Medien-Modal

Details: `02-screens-v2.1-und-user-stories.md`, Probleme: `08-bekannte-ui-probleme.md`

---

## Design-Ziele (Cleanup)

1. **Gruppierung** — Domänen statt 9 flacher Nav-Punkte (z. B. Inhalt / Station / Global / Betrieb)
2. **Redundanzen auflösen** — Dialog-Audio in Segment-Zeilen integrieren (kein globaler Nav-Punkt, kein eigener Tab); Medien-Upload Modal vs. Route
3. **Station Detail entlasten** — Dialog-Editor ist komplex; klare Unterstruktur oder Sub-Navigation
4. **Konsistente Muster** — Tabellen, Formulare, Upload-Flows, Fehlerzustände einheitlich
5. **Save & Validate** — globaler CTA bleibt, aber visuell klar im Workflow verankert
6. **Plan-A-Banner** — dezent, nicht aufdringlich

---

## Kern-User-Stories

1. **Medien ingestieren** — Audio/Video/Foto/Text/link/embed → korrekte Pfade → Validierung grün → Vorschau
2. **Hotspot kalibrieren** — Flat: `/mpz/calib/flat/{slug}`; Sphere: **`/mpz/calib/sphere/{slug}`** (geplant, symmetrisch zu Flat — siehe `16-sphere-calib-screen.md`)
3. **Dialog pflegen** — Segmente, Gruppen, Bubble, WAV-Clips — ohne JSON-Editor
4. **Coach-Nachricht** — Trigger-Typ wählen, Text, Speichern
5. **Deploy vorbereiten** — validate-all, QR, Token, Env prüfen
6. **Fehlerfall** — Validierung rot → Fehlerliste → Rollback-Hinweis → Korrektur

---

## Medien-Typen (alle 6)

| typ | Upload / Eingabe |
|-----|------------------|
| `audio` | Datei |
| `video` | MP4-Upload oder YouTube-ID |
| `foto` | Datei |
| `text` | .md/.txt |
| `link` | HTTPS-URL |
| `embed` | iframe-URL + Allowlist-Checkboxen |

Zusatz: Datei ersetzen, Thumbnail/Poster-Upload (v2.1).

---

## Lieferformat (SE 13)

1. **Informationsarchitektur** — neue Navigation, Gruppierung, Benennung
2. **Lösungsvorschläge** für die Probleme in `08-bekannte-ui-probleme.md` (mit Begründung)
3. **Komponenteninventar** mit Zuständen (Default, Hover, Disabled, Error, Loading, Success)
4. **Interaktionsflüsse** pro Kern-User-Story inkl. Fehlerpfade
5. **Visuelle Systematik** — an GS39-Tokens gebunden
6. **High-Fidelity-Mockups** — alle Screens aus `02-screens-v2.1-und-user-stories.md` in Empty / Filled / Error
7. **Barrierefreiheit** — mindestens drei konkrete Designentscheidungen (WCAG 2.1 AA wo praktikabel)

**Kein** React/Next.js-Code.

---

## Explizit außerhalb des Scopes

- Lehrkräfte-Admin / Directus
- Production-Studio auf Coolify
- Besucher-App (Hub, Raum-Viewer, Scanner) — nur visuelle Referenz
- Dark Mode
