# Claude Design — Kopier-Prompt (MPZ Studio v0)

Lade zuerst alle Dateien aus diesem Ordner hoch (mindestens `00`–`06`, `10`, `03`–`05`). Optional: Screenshots aus `assets/`. Dann den Block unten **vollständig** in Claude Design einfügen.

---

## Prompt (kopieren ab hier)

```
Du bist Interface-Architekt im Modus SE 13 (UI-Design-Konzept). Deine Leitplanken: Klarheit, Zurückhaltung, Tiefe (Apple HIG). Du lieferst ein vollständiges UI-Konzept und High-Fidelity-Mockups — **keinen** React-, HTML- oder CSS-Implementierungscode.

## Auftrag

Entwirf die Oberfläche für **MPZ Studio v0** — ein internes Content-Ingest-Tool für den Schulnavigator (39. Grundschule Dresden). Es läuft nur lokal auf dem Laptop des MPZ (Felix), schreibt `stations.json` und Medien ins Git-Repo, und ist **kein** CMS für Lehrkräfte.

Lies die hochgeladenen Dateien vollständig. Verbindlich für Scope und Screens:
- `02-v0-screens-und-user-stories.md` (Screen-Inventar S1–S12, Zustände)
- `00-claude-design-brief.md` (Produkt, Nutzer, Abgrenzung)

## Design-System (Pflicht)

- Farben, Typo, Spacing **ausschließlich** aus `03-design-system-gs39-tokens.css`
- Kein Dark Mode — warmer Papier-Look (`--paper`, `--brand-navy`, `--brand-green` für CTAs)
- Orientierung an bestehenden App-Mustern in `09-ui-komponenten-referenz.md` (Gs39Button, Gs39Card, TopBar)
- Studio = **Werkzeug-UI**: dichter als die Besucher-App, weniger Dekoration, keine Schulhaus-Grafik, keine Maskottchen auf jeder Seite

## Formular- und Datenmodell

- Felder und Enums aus `04-stations-schema.json` und `05-typendefinitionen.md`
- Mock-Daten für gefüllte Zustände: `06-referenz-station-klassenzimmer.json`, `10-hub-stationen-liste.json`
- Medien-Upload in v0 nur: audio, video (upload), foto, text — **kein** link/embed

## Screens — NUR v0 (jeden mit Empty, Filled, Error, Loading designen)

1. **Studio-Shell** (Sidebar + Top-Bar, Badge „Nur lokal · development“, dezenter Plan-A-Fallback-Hinweis)
2. **Dashboard** (Validierungsstatus, Stationen mit Fehlern, zuletzt bearbeitet)
3. **Stationen-Grid** (12 Kacheln mit Hub-Nr, Viewer-Badge flat/360°, Ampel)
4. **Station Detail → Stammdaten** (slug read-only, titel, beschreibung, viewer)
5. **Station Detail → Medien** (Tabelle + „Medien hinzufügen“)
6. **Medien-Upload-Modal** (Typwahl, Drag & Drop, id-Vorschlag, generierter quelle-Pfad)
7. **Station Detail → Hotspots** (Flat- und 360°-Tabellen, Kalibrier-Buttons)
8. **Flat-Kalibrierung** `/mpz/calib/flat/{slug}` (Panorama, Klick-Marker, x/y übernehmen)
9. **Dialog-Audio-Tab** (nur für Stationen mit dialog, z. B. daz — WAV-Liste + Upload)
10. **Save & Validate** (Erfolg grün / Fehler rot mit Rollback-Hinweis)

## Explizit NICHT designen (max. ausgegraute Sidebar-Platzhalter)

Coach-Editor, Brand & Design, Hub-Karte, globale Embeds & Links, Deploy-Tab (QR/Token/Env). Das ist v1/v2 — nicht mockuppen.

## Kern-User-Stories (jeweils als Interaktionsfluss mit Fehlerpfaden)

1. Audio vom Projekttag hochladen → korrekter Pfad + medien[]-Eintrag → Validierung grün → Vorschau-Link
2. Hotspot auf Flat-Panorama kalibrieren → Koordinaten in JSON übernehmen
3. Station fertig → Grid-Ampel grün → nächste Station ohne JSON-Editor
4. Validierung fehlgeschlagen → Fehlerliste → Hinweis „Änderungen zurückgerollt“

## Barrierefreiheit

WCAG 2.1 AA wo praktikabel: Touch-Targets ≥ 44 px, Fehler mit Text + Farbe, logische Fokus-Reihenfolge. Benenne mindestens drei konkrete A11y-Entscheidungen im Konzept.

## Lieferformat (in dieser Reihenfolge)

1. **Informationsarchitektur** — v0-Navigation, Benennung, Breadcrumbs
2. **Komponenteninventar** — alle UI-Bausteine mit Zuständen (Default, Hover, Disabled, Error, Loading, Success)
3. **Interaktionsflüsse** — pro User-Story Screen → Aktion → Feedback → nächster Screen
4. **Visuelle Systematik** — Typo-Hierarchie, Farben (mit Token-Namen), Spacing-Grid
5. **High-Fidelity-Mockups** — alle v0-Screens; Desktop 1280 px Breite primär
6. **Abweichungen von der Besucher-App** — kurz begründet

## Qualitätsregeln

- Kein generisches Admin-Dashboard-Template — GS39-Branding durchgängig
- Kein Scope Creep über v0 hinaus
- Kein Implementierungscode
- Jede Kern-Story hat einen vollständigen Fehlerpfad
- Wenn etwas in den Upload-Dateien unklar ist: als offene Frage listen (max. 3), nicht raten
```

---

## Optional: Kurz-Prompt (Folge-Iteration)

Wenn Mockups stehen und du einzelne Screens nachschärfen willst:

```
Überarbeite nur Screen [S5 Medien-Upload-Modal / S8 Flat-Kalibrierung / …] aus MPZ Studio v0.

Beibehalten: GS39-Tokens aus 03-design-system-gs39-tokens.css, v0-Scope aus 02-v0-screens-und-user-stories.md.

Fokus: [z. B. Fehlerzustand bei falscher Datei, mobile Sidebar, dichteres Tabellen-Layout]

Kein Code. High-Fidelity-Mockup + kurze Begründung der Änderungen.
```

---

## Nach dem Design

Ergebnis (Mockups + IA) für SE 03 (Feature-Implementierung v0) und Issues #145–#151 verwenden. Spec: `dokumentation/spezifikationen/mpz-studio.md`.
